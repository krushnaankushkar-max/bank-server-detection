import { CANONICAL_DPI_SCHEMA, EXPECTED_CANONICAL_KEYS } from './canonical';

export interface SchemaDiffItem {
  canonicalKey: string;
  receivedKey: string | null;
  typeExpected: string;
  typeReceived: string | null;
  sampleExpected: string;
  sampleReceived: any;
  status: 'MATCH' | 'RENAMED' | 'MISSING' | 'EXTRA' | 'TYPE_MISMATCH';
  confidence: number;
}

export interface SchemaDiffReport {
  timestamp: string;
  participant: string;
  overallMatchPercentage: number;
  items: SchemaDiffItem[];
  extraFieldsReceived: { key: string; value: any; type: string }[];
  suggestedMappings: Record<string, string>; // receivedKey -> canonicalKey
  humanExplanation: string;
}

// Known semantic equivalence dictionary for DPI / payments switches
const SEMANTIC_EQUIVALENCES: Record<string, string[]> = {
  payer_vpa: ['vpa_id', 'payer_id', 'vpa', 'sender_vpa', 'upi_id', 'account_vpa'],
  amount: ['txn_amount', 'transaction_amount', 'value', 'payment_amount', 'amt'],
  currency: ['currency_code', 'curr', 'txn_currency'],
  auth_ref: ['reference_no', 'ref_no', 'transaction_ref', 'auth_id', 'approval_ref', 'rrn'],
  timestamp: ['txn_time', 'time_stamp', 'created_at', 'date_time', 'req_timestamp'],
};

export function computeSchemaDiff(
  receivedPayload: Record<string, any>,
  participant: string = 'RuralBank-X'
): SchemaDiffReport {
  const items: SchemaDiffItem[] = [];
  const receivedKeys = Object.keys(receivedPayload);
  const matchedReceivedKeys = new Set<string>();
  const suggestedMappings: Record<string, string> = {};

  let matchedCount = 0;

  for (const cKey of EXPECTED_CANONICAL_KEYS) {
    const fieldDef = CANONICAL_DPI_SCHEMA[cKey];

    // Case 1: Exact key match
    if (cKey in receivedPayload) {
      matchedReceivedKeys.add(cKey);
      matchedCount++;
      items.push({
        canonicalKey: cKey,
        receivedKey: cKey,
        typeExpected: fieldDef.type,
        typeReceived: typeof receivedPayload[cKey],
        sampleExpected: fieldDef.example,
        sampleReceived: receivedPayload[cKey],
        status: 'MATCH',
        confidence: 1.0,
      });
      continue;
    }

    // Case 2: Semantic candidate from known aliases
    const aliases = SEMANTIC_EQUIVALENCES[cKey] || [];
    let foundAlias: string | null = null;

    for (const alias of aliases) {
      if (alias in receivedPayload && !matchedReceivedKeys.has(alias)) {
        foundAlias = alias;
        break;
      }
    }

    // Fallback: substring / Levenshtein fuzzy match
    if (!foundAlias) {
      for (const rk of receivedKeys) {
        if (!matchedReceivedKeys.has(rk)) {
          const cleanCanonical = cKey.replace(/_/g, '').toLowerCase();
          const cleanReceived = rk.replace(/_/g, '').toLowerCase();
          if (cleanCanonical.includes(cleanReceived) || cleanReceived.includes(cleanCanonical)) {
            foundAlias = rk;
            break;
          }
        }
      }
    }

    if (foundAlias) {
      matchedReceivedKeys.add(foundAlias);
      suggestedMappings[foundAlias] = cKey;
      items.push({
        canonicalKey: cKey,
        receivedKey: foundAlias,
        typeExpected: fieldDef.type,
        typeReceived: typeof receivedPayload[foundAlias],
        sampleExpected: fieldDef.example,
        sampleReceived: receivedPayload[foundAlias],
        status: 'RENAMED',
        confidence: 0.95,
      });
    } else {
      // Missing field
      items.push({
        canonicalKey: cKey,
        receivedKey: null,
        typeExpected: fieldDef.type,
        typeReceived: null,
        sampleExpected: fieldDef.example,
        sampleReceived: null,
        status: 'MISSING',
        confidence: 1.0,
      });
    }
  }

  // Find extra unmapped fields received
  const extraFieldsReceived: { key: string; value: any; type: string }[] = [];
  for (const rk of receivedKeys) {
    if (!matchedReceivedKeys.has(rk)) {
      extraFieldsReceived.push({
        key: rk,
        value: receivedPayload[rk],
        type: typeof receivedPayload[rk],
      });
    }
  }

  const overallMatchPercentage = Math.round((matchedCount / EXPECTED_CANONICAL_KEYS.length) * 100);

  // Generate clear human-readable explanation
  const renames = items.filter((i) => i.status === 'RENAMED');
  const missing = items.filter((i) => i.status === 'MISSING');
  let explanation = '';

  if (renames.length > 0) {
    explanation += `Upstream participant '${participant}' is submitting payloads with ${renames.length} renamed field(s): ${renames
      .map((r) => `'${r.receivedKey}' instead of expected '${r.canonicalKey}'`)
      .join(', ')}. `;
  }
  if (missing.length > 0) {
    explanation += `Crucial mandatory field(s) ${missing.map((m) => `'${m.canonicalKey}'`).join(', ')} are completely missing from the request. `;
  }
  if (extraFieldsReceived.length > 0) {
    explanation += `Detected ${extraFieldsReceived.length} unrecognized field(s): ${extraFieldsReceived.map((e) => `'${e.key}'`).join(', ')}.`;
  }
  if (!explanation) {
    explanation = `Payload conforms exactly to canonical DPI schema v1.0. All fields match.`;
  }

  return {
    timestamp: new Date().toISOString(),
    participant,
    overallMatchPercentage,
    items,
    extraFieldsReceived,
    suggestedMappings,
    humanExplanation: explanation,
  };
}
