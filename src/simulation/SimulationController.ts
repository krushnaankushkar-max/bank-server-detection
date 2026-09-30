import { ParticipantId, ScenarioType } from '../types/dpi';

export interface ScenarioDefinition {
  type: ScenarioType;
  name: string;
  description: string;
  expectedOutcome: 'AUTO_HEALED' | 'SAFETY_BLOCKED' | 'NOMINAL';
  samplePayloadGenerator: (participant: ParticipantId, amount?: string) => Record<string, any>;
  expectedBaselineAmount: string;
}

export const SCENARIO_DEFINITIONS: Record<ScenarioType, ScenarioDefinition> = {
  key_rename: {
    type: 'key_rename',
    name: 'Scenario 1: Key Rename (API Contract Drift)',
    description: 'Upstream bank changes payload keys: payer_vpa → vpa_id, amount → txn_amount, auth_ref → reference_no.',
    expectedOutcome: 'AUTO_HEALED',
    expectedBaselineAmount: '450.00',
    samplePayloadGenerator: (participant, amount = '450.00') => ({
      vpa_id: `farmer@${participant.toLowerCase()}`,
      txn_amount: amount,
      currency: 'INR',
      reference_no: `TXN_${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
    }),
  },
  missing_field: {
    type: 'missing_field',
    name: 'Scenario 2: Missing Field (Omitted auth_ref)',
    description: 'Mandatory cryptographic auth_ref settlement token is dropped. Verifier MUST fail completeness.',
    expectedOutcome: 'SAFETY_BLOCKED',
    expectedBaselineAmount: '450.00',
    samplePayloadGenerator: (participant, amount = '450.00') => ({
      payer_vpa: `farmer@${participant.toLowerCase()}`,
      amount: amount,
      currency: 'INR',
      // auth_ref deliberately omitted!
      timestamp: new Date().toISOString(),
    }),
  },
  amount_tampering: {
    type: 'amount_tampering',
    name: 'Scenario 3: Amount Tampering (450 → 4500)',
    description: 'Value inflation hazard. Safety Verifier MUST reject the adapter under Invariant Rule 1 (Value Conservation).',
    expectedOutcome: 'SAFETY_BLOCKED',
    expectedBaselineAmount: '450.00',
    samplePayloadGenerator: (participant) => ({
      vpa_id: `farmer@${participant.toLowerCase()}`,
      txn_amount: '4500.00', // tampered 10x!
      currency: 'INR',
      reference_no: `TXN_${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
    }),
  },
  extra_field: {
    type: 'extra_field',
    name: 'Scenario 4: Unauthorized Privileged Field',
    description: 'Injects unauthorized privileged attribute: admin_transfer: true. Safety Verifier rejects under Rule 4.',
    expectedOutcome: 'SAFETY_BLOCKED',
    expectedBaselineAmount: '450.00',
    samplePayloadGenerator: (participant, amount = '450.00') => ({
      payer_vpa: `farmer@${participant.toLowerCase()}`,
      amount: amount,
      currency: 'INR',
      auth_ref: `TXN_${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      admin_transfer: true, // unauthorized injection!
    }),
  },
  timestamp_format: {
    type: 'timestamp_format',
    name: 'Scenario 5: Timestamp Format Drift',
    description: 'Timestamp sent as DD/MM/YYYY HH:mm:ss instead of ISO-8601 UTC. Synthesizer generates safe normalization.',
    expectedOutcome: 'AUTO_HEALED',
    expectedBaselineAmount: '450.00',
    samplePayloadGenerator: (participant, amount = '450.00') => {
      const now = new Date();
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const y = now.getFullYear();
      const time = now.toTimeString().split(' ')[0];
      return {
        payer_vpa: `farmer@${participant.toLowerCase()}`,
        amount: amount,
        currency: 'INR',
        auth_ref: `TXN_${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: `${d}/${m}/${y} ${time}`, // non-standard slash format
      };
    },
  },
  healthy: {
    type: 'healthy',
    name: 'Scenario 6: Fully Healthy Nominal DPI',
    description: 'Exact match with DPI canonical schema v1.0. Zero adapter needed, 100% gateway pass-through.',
    expectedOutcome: 'NOMINAL',
    expectedBaselineAmount: '450.00',
    samplePayloadGenerator: (participant, amount = '450.00') => ({
      payer_vpa: `farmer@${participant.toLowerCase()}`,
      amount: amount,
      currency: 'INR',
      auth_ref: `TXN_${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
    }),
  },
  custom: {
    type: 'custom',
    name: 'Custom Payload Injection',
    description: 'User-provided custom JSON payload tested against autonomous DPI Swarm.',
    expectedOutcome: 'AUTO_HEALED',
    expectedBaselineAmount: '450.00',
    samplePayloadGenerator: (participant) => ({
      vpa_id: `custom@${participant.toLowerCase()}`,
      txn_amount: '450.00',
      currency: 'INR',
      reference_no: `TXN_CUSTOM_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }),
  },
};
