export type ParticipantId = 'RuralBank-X' | 'CoopBank-A' | 'FinTechPay' | 'RegionalBank-01';

export interface CanonicalDpiPayload {
  payer_vpa: string;
  amount: string;
  currency: string;
  auth_ref: string;
  timestamp: string;
}

export type ScenarioType = 
  | 'key_rename'
  | 'missing_field'
  | 'amount_tampering'
  | 'extra_field'
  | 'timestamp_format'
  | 'healthy'
  | 'custom';

export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'HEALING' | 'RETRIED';

export interface Transaction {
  id: string;
  participant: ParticipantId;
  amount: string;
  currency: string;
  schemaVersion: string;
  status: TransactionStatus;
  httpStatus: number;
  latencyMs: number;
  timestamp: string;
  rawPayload: Record<string, any>;
  transformedPayload?: Record<string, any>;
  errorReason?: string;
  adapterUsed?: string;
}

export type AgentType = 'SCOUT' | 'DIAGNOSTIC' | 'SYNTHESIZER' | 'VERIFIER' | 'EDGE' | 'GATEWAY' | 'SYSTEM';

export type AgentStatus = 'IDLE' | 'ACTIVE' | 'ANALYZING' | 'SYNTHESIZING' | 'VERIFYING' | 'DEPLOYED' | 'BLOCKED';

export interface AgentState {
  type: AgentType;
  name: string;
  status: AgentStatus;
  lastAction: string;
  lastTimestamp: string;
  metrics: {
    invocations: number;
    successCount: number;
    failureCount: number;
  };
}

export interface InvariantCheckResult {
  ruleId: string;
  name: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  formalInvariant: string;
  severity: 'FATAL' | 'WARNING';
}

export interface VerificationReport {
  passed: boolean;
  timestamp: string;
  adapterId: string;
  invariants: InvariantCheckResult[];
  summary: string;
  smtProofRepresentation: string;
}

export type AdapterStatus = 'PREPARING' | 'VERIFYING' | 'DEPLOYING' | 'ACTIVE' | 'RETIRING' | 'REMOVED';

export interface Adapter {
  id: string;
  participant: ParticipantId;
  schemaVersion: string;
  targetVersion: string;
  mappings: Record<string, string>; // receivedKey -> canonicalKey
  transformFnCode: string;
  createdAt: string;
  status: AdapterStatus;
  verificationStatus: 'PASSED' | 'FAILED' | 'PENDING';
  verificationReport?: VerificationReport;
  transactionsProcessed: number;
  isTemporary: boolean;
  expiresAt?: string;
}

export type IncidentStatus = 'OPEN' | 'AUTO-HEALING' | 'MITIGATED' | 'RESOLVED';

export interface Incident {
  id: string;
  participant: ParticipantId;
  title: string;
  scenario: ScenarioType;
  severity: 'CRITICAL' | 'WARNING' | 'RESOLVED';
  status: IncidentStatus;
  failureRate: number; // percentage
  affectedTransactions: number;
  detectedAt: string;
  mitigatedAt?: string;
  resolvedAt?: string;
  mttrSeconds?: number;
  adapterId?: string;
  diagnosis?: {
    summary: string;
    diffs: {
      canonicalKey: string;
      receivedKey: string | null;
      typeExpected: string;
      typeReceived: string | null;
      status: 'MATCH' | 'RENAMED' | 'MISSING' | 'EXTRA' | 'TYPE_MISMATCH';
    }[];
  };
  samplePayload?: Record<string, any>;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  agent: AgentType;
  severity: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  metadata?: any;
}

export interface DpiStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  retriedTransactions: number;
  successRate: number;
  activeIncidents: number;
  autoHealedIncidents: number;
  activeAdapters: number;
  averageMttrSeconds: number;
  transactionsRecovered: number;
}
