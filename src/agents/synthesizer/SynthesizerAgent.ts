import { Adapter, ParticipantId, SystemLog } from '../../types/dpi';
import { DiagnosisResult } from '../diagnostic/DiagnosticAgent';

export class SynthesizerAgent {
  public synthesizeAdapter(
    diagnosis: DiagnosisResult,
    samplePayload: Record<string, any>,
    onLog?: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void
  ): Adapter {
    const adapterId = `ADP-${Math.floor(100 + Math.random() * 900)}`;
    const mappings: Record<string, string> = {};

    onLog?.({
      agent: 'SYNTHESIZER',
      severity: 'INFO',
      message: `Synthesizing deterministic translation adapter [${adapterId}] for ${diagnosis.participant}...`,
    });

    diagnosis.fieldMappings.forEach((m) => {
      mappings[m.from] = m.to;
    });

    // Generate readable TypeScript / JavaScript adapter code
    const isTimestampFix = diagnosis.detectedScenario === 'timestamp_format';
    const codeLines = [
      `// Auto-Generated DPI Translation Hot-Patch [${adapterId}]`,
      `// Source Participant: ${diagnosis.participant}`,
      `// Target DPI Contract: Canonical v1.0`,
      `export function transformPayload(input: Record<string, any>) {`,
      `  const output: Record<string, any> = {};`,
    ];

    if (Object.keys(mappings).length > 0) {
      codeLines.push(`  // Field Alias Transformations`);
      for (const [fromKey, toKey] of Object.entries(mappings)) {
        codeLines.push(`  if ('${fromKey}' in input) output['${toKey}'] = input['${fromKey}'];`);
      }
    }

    codeLines.push(`  // Copy untouched canonical keys`);
    codeLines.push(`  ['payer_vpa', 'amount', 'currency', 'auth_ref', 'timestamp'].forEach(k => {`);
    codeLines.push(`    if (k in input && !(k in output)) output[k] = input[k];`);
    codeLines.push(`  });`);

    if (isTimestampFix) {
      codeLines.push(`  // Normalize Non-Standard Timestamp`);
      codeLines.push(`  if (typeof output.timestamp === 'string' && output.timestamp.includes('/')) {`);
      codeLines.push(`    const [datePart, timePart] = output.timestamp.split(' ');`);
      codeLines.push(`    const [d, m, y] = datePart.split('/');`);
      codeLines.push(`    output.timestamp = \`\${y}-\${m.padStart(2, '0')}-\${d.padStart(2, '0')}T\${timePart || '12:00:00'}Z\`;`);
      codeLines.push(`  }`);
    }

    codeLines.push(`  return output;`);
    codeLines.push(`}`);

    const transformFnCode = codeLines.join('\n');

    onLog?.({
      agent: 'SYNTHESIZER',
      severity: 'SUCCESS',
      message: `Synthesized Adapter [${adapterId}] with ${Object.keys(mappings).length} bijective field bindings. Ready for formal invariant safety verification.`,
      metadata: { adapterId, mappings },
    });

    const newAdapter: Adapter = {
      id: adapterId,
      participant: diagnosis.participant as ParticipantId,
      schemaVersion: 'v2-drift',
      targetVersion: 'v1.0-canonical',
      mappings,
      transformFnCode,
      createdAt: new Date().toISOString(),
      status: 'PREPARING',
      verificationStatus: 'PENDING',
      transactionsProcessed: 0,
      isTemporary: true,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    return newAdapter;
  }

  public executeTransform(
    adapter: Adapter,
    inputPayload: Record<string, any>
  ): Record<string, any> {
    const output: Record<string, any> = {};

    // Apply mappings
    for (const [fromKey, toKey] of Object.entries(adapter.mappings)) {
      if (fromKey in inputPayload) {
        output[toKey] = inputPayload[fromKey];
      }
    }

    // Preserve any existing canonical keys not remapped
    const canonicalKeys = ['payer_vpa', 'amount', 'currency', 'auth_ref', 'timestamp'];
    for (const k of canonicalKeys) {
      if (k in inputPayload && !(k in output)) {
        output[k] = inputPayload[k];
      }
    }

    // Handle timestamp format transformation if present
    if (output.timestamp && typeof output.timestamp === 'string' && output.timestamp.includes('/')) {
      const parts = output.timestamp.split(' ');
      const dateParts = parts[0]?.split('/');
      if (dateParts && dateParts.length === 3) {
        const [day, month, year] = dateParts;
        const timePart = parts[1] || '12:00:00';
        output.timestamp = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}Z`;
      }
    }

    return output;
  }
}
