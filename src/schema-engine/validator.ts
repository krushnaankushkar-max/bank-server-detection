import { CANONICAL_DPI_SCHEMA, EXPECTED_CANONICAL_KEYS } from './canonical';

export interface SchemaValidationResult {
  valid: boolean;
  httpStatus: number;
  errors: string[];
  missingKeys: string[];
  unrecognizedKeys: string[];
  typeMismatches: { field: string; expected: string; actual: string }[];
}

export function validateAgainstCanonicalDpiSchema(payload: Record<string, any>): SchemaValidationResult {
  const errors: string[] = [];
  const missingKeys: string[] = [];
  const unrecognizedKeys: string[] = [];
  const typeMismatches: { field: string; expected: string; actual: string }[] = [];

  // Check required keys
  for (const key of EXPECTED_CANONICAL_KEYS) {
    const fieldDef = CANONICAL_DPI_SCHEMA[key];
    if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
      if (fieldDef.required) {
        missingKeys.push(key);
        errors.push(`Missing mandatory canonical contract field: '${key}'`);
      }
    } else {
      const val = String(payload[key]);
      if (fieldDef.validationRegex && !fieldDef.validationRegex.test(val)) {
        typeMismatches.push({
          field: key,
          expected: fieldDef.type,
          actual: typeof payload[key] === 'object' ? 'object' : val,
        });
        errors.push(`Field '${key}' failed validation format: expected ${fieldDef.type} matching ${fieldDef.validationRegex}`);
      }
    }
  }

  // Check unauthorized / unrecognized keys
  const payloadKeys = Object.keys(payload);
  for (const k of payloadKeys) {
    if (!EXPECTED_CANONICAL_KEYS.includes(k as any)) {
      unrecognizedKeys.push(k);
      // If it looks like a security flag or unknown payload, flag it
      if (k.toLowerCase().includes('admin') || k.toLowerCase().includes('bypass')) {
        errors.push(`Security violation: unauthorized privileged attribute '${k}' injected into transaction payload`);
      }
    }
  }

  const valid = errors.length === 0;

  return {
    valid,
    httpStatus: valid ? 200 : 422,
    errors,
    missingKeys,
    unrecognizedKeys,
    typeMismatches,
  };
}
