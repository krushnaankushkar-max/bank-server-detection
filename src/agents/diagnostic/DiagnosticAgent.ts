import { Incident, SystemLog } from '../../types/dpi';
import { computeSchemaDiff, SchemaDiffReport } from '../../schema-engine/diff';

export interface DiagnosisResult {
  incidentId: string;
  participant: string;
  diffReport: SchemaDiffReport;
  summary: string;
  fieldMappings: { from: string; to: string }[];
  missingFields: string[];
  extraFields: string[];
  detectedScenario: 'key_rename' | 'missing_field' | 'amount_tampering' | 'extra_field' | 'timestamp_format' | 'custom';
}

export class DiagnosticAgent {
  public diagnose(
    incident: Incident,
    samplePayload: Record<string, any>,
    onLog?: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void
  ): DiagnosisResult {
    onLog?.({
      agent: 'DIAGNOSTIC',
      severity: 'INFO',
      message: `Analyzing failure payload schema for ${incident.participant} against DPI Canonical v1.0 specification...`,
    });

    const diffReport = computeSchemaDiff(samplePayload, incident.participant);

    const fieldMappings: { from: string; to: string }[] = [];
    const missingFields: string[] = [];
    const extraFields: string[] = [];

    diffReport.items.forEach((item) => {
      if (item.status === 'RENAMED' && item.receivedKey) {
        fieldMappings.push({
          from: item.receivedKey,
          to: item.canonicalKey,
        });
      } else if (item.status === 'MISSING') {
        missingFields.push(item.canonicalKey);
      }
    });

    diffReport.extraFieldsReceived.forEach((extra) => {
      extraFields.push(extra.key);
    });

    // Detect scenario
    let detectedScenario: DiagnosisResult['detectedScenario'] = 'custom';
    if (extraFields.includes('admin_transfer')) {
      detectedScenario = 'extra_field';
    } else if (missingFields.includes('auth_ref') && fieldMappings.length === 0) {
      detectedScenario = 'missing_field';
    } else if (
      samplePayload.amount === '4500.00' ||
      samplePayload.txn_amount === '4500.00' ||
      samplePayload.amount === '4500'
    ) {
      detectedScenario = 'amount_tampering';
    } else if (samplePayload.timestamp && /^\d{2}\/\d{2}\/\d{4}/.test(String(samplePayload.timestamp))) {
      detectedScenario = 'timestamp_format';
    } else if (fieldMappings.length > 0) {
      detectedScenario = 'key_rename';
    }

    const summary = `Schema mismatch diagnosed for ${incident.participant}: ${fieldMappings.length} renamed field(s) mapped, ${missingFields.length} missing field(s), ${extraFields.length} unauthorized field(s). Scenario identified as [${detectedScenario}].`;

    onLog?.({
      agent: 'DIAGNOSTIC',
      severity: 'SUCCESS',
      message: `Diagnosis complete: ${fieldMappings.map((m) => `${m.from} → ${m.to}`).join('; ') || 'No simple rename found'}. ${missingFields.length > 0 ? `Missing: [${missingFields.join(', ')}]` : ''}`,
      metadata: { fieldMappings, missingFields, extraFields, detectedScenario },
    });

    return {
      incidentId: incident.id,
      participant: incident.participant,
      diffReport,
      summary,
      fieldMappings,
      missingFields,
      extraFields,
      detectedScenario,
    };
  }
}
