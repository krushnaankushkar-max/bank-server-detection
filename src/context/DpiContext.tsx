import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  Adapter,
  AgentState,
  AgentType,
  DpiStats,
  Incident,
  ParticipantId,
  ScenarioType,
  SystemLog,
  Transaction,
  VerificationReport,
} from '../types/dpi';
import { ScoutAgent } from '../agents/scout/ScoutAgent';
import { DiagnosticAgent, DiagnosisResult } from '../agents/diagnostic/DiagnosticAgent';
import { SynthesizerAgent } from '../agents/synthesizer/SynthesizerAgent';
import { SafetyVerifier } from '../agents/verifier/SafetyVerifier';
import { EdgeInjector } from '../agents/edge-injector/EdgeInjector';
import { TransactionEngine } from '../transaction-engine/TransactionEngine';
import { IncidentManager } from '../incident-engine/IncidentManager';
import { LogManager } from '../logging/LogManager';
import { SCENARIO_DEFINITIONS } from '../simulation/SimulationController';
import { SchemaDiffReport } from '../schema-engine/diff';

export interface DpiContextType {
  transactions: Transaction[];
  incidents: Incident[];
  activeIncident: Incident | null;
  adapters: Adapter[];
  agents: Record<AgentType, AgentState>;
  logs: SystemLog[];
  stats: DpiStats;
  currentDiffReport: SchemaDiffReport | null;
  currentVerificationReport: VerificationReport | null;
  activeDiagnosis: DiagnosisResult | null;
  simulationState: {
    isRunning: boolean;
    currentStep: string;
    stepProgress: number;
    activeScenario: ScenarioType;
    activeParticipant: ParticipantId;
    isBlockedBySafety: boolean;
    blockedReason: string | null;
    judgeDemoActive: boolean;
    autoTrafficEnabled: boolean;
  };
  injectIncident: (
    participant: ParticipantId,
    scenario: ScenarioType,
    customPayload?: Record<string, any>,
    batchCount?: number
  ) => Promise<void>;
  runJudgeDemo: () => Promise<void>;
  runDangerousDemo: () => Promise<void>;
  retryTransaction: (txnId: string) => void;
  rollbackAdapter: (participant: ParticipantId) => Promise<void>;
  restoreUpstreamSchema: (participant: ParticipantId) => Promise<void>;
  clearLogs: () => void;
  toggleAutoTraffic: () => void;
  askAiExplanation: (question: string) => Promise<{ answer: string; source: string }>;
}

const DpiContext = createContext<DpiContextType | null>(null);

export const DpiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Engines and agents refs
  const logManagerRef = useRef<LogManager>(new LogManager());
  const edgeInjectorRef = useRef<EdgeInjector>(new EdgeInjector());
  const scoutRef = useRef<ScoutAgent>(new ScoutAgent());
  const diagnosticRef = useRef<DiagnosticAgent>(new DiagnosticAgent());
  const synthesizerRef = useRef<SynthesizerAgent>(new SynthesizerAgent());
  const verifierRef = useRef<SafetyVerifier>(new SafetyVerifier());
  const transactionEngineRef = useRef<TransactionEngine>(
    new TransactionEngine(edgeInjectorRef.current)
  );
  const incidentManagerRef = useRef<IncidentManager>(new IncidentManager());

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [adapters, setAdapters] = useState<Adapter[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [currentDiffReport, setCurrentDiffReport] = useState<SchemaDiffReport | null>(null);
  const [currentVerificationReport, setCurrentVerificationReport] = useState<VerificationReport | null>(null);
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiagnosisResult | null>(null);

  const [stats, setStats] = useState<DpiStats>({
    totalTransactions: 1284392,
    successfulTransactions: 1284010,
    failedTransactions: 382,
    retriedTransactions: 240,
    successRate: 99.97,
    activeIncidents: 0,
    autoHealedIncidents: 27,
    activeAdapters: 0,
    averageMttrSeconds: 4.2,
    transactionsRecovered: 14820,
  });

  const [agents, setAgents] = useState<Record<AgentType, AgentState>>({
    SCOUT: {
      type: 'SCOUT',
      name: 'Scout Agent',
      status: 'ACTIVE',
      lastAction: 'Monitoring DPI traffic streams for 422 schema contract violations',
      lastTimestamp: 'Just now',
      metrics: { invocations: 1420, successCount: 1420, failureCount: 0 },
    },
    DIAGNOSTIC: {
      type: 'DIAGNOSTIC',
      name: 'Diagnostic Agent',
      status: 'IDLE',
      lastAction: 'Ready to compare expected vs received contract diffs',
      lastTimestamp: 'Idle',
      metrics: { invocations: 312, successCount: 312, failureCount: 0 },
    },
    SYNTHESIZER: {
      type: 'SYNTHESIZER',
      name: 'Synthesizer Agent',
      status: 'IDLE',
      lastAction: 'Ready to generate translation adapters',
      lastTimestamp: 'Idle',
      metrics: { invocations: 289, successCount: 289, failureCount: 0 },
    },
    VERIFIER: {
      type: 'VERIFIER',
      name: 'Safety Verifier',
      status: 'IDLE',
      lastAction: 'SMT-style 6-rule formal invariant engine armed',
      lastTimestamp: 'Idle',
      metrics: { invocations: 289, successCount: 271, failureCount: 18 },
    },
    EDGE: {
      type: 'EDGE',
      name: 'Edge Injector',
      status: 'ACTIVE',
      lastAction: 'API Gateway filter pipeline nominal, zero-downtime routing active',
      lastTimestamp: 'Just now',
      metrics: { invocations: 268, successCount: 268, failureCount: 0 },
    },
    GATEWAY: {
      type: 'GATEWAY',
      name: 'DPI API Gateway',
      status: 'ACTIVE',
      lastAction: 'Serving requests at port 443 with 0ms downtime',
      lastTimestamp: 'Just now',
      metrics: { invocations: 1284392, successCount: 1284010, failureCount: 382 },
    },
    SYSTEM: {
      type: 'SYSTEM',
      name: 'Swarm Orchestrator',
      status: 'ACTIVE',
      lastAction: 'System self-healing supervisor running',
      lastTimestamp: 'Just now',
      metrics: { invocations: 45, successCount: 45, failureCount: 0 },
    },
  });

  const [simulationState, setSimulationState] = useState<{
    isRunning: boolean;
    currentStep: string;
    stepProgress: number;
    activeScenario: ScenarioType;
    activeParticipant: ParticipantId;
    isBlockedBySafety: boolean;
    blockedReason: string | null;
    judgeDemoActive: boolean;
    autoTrafficEnabled: boolean;
  }>({
    isRunning: false,
    currentStep: 'Nominal traffic monitoring',
    stepProgress: 0,
    activeScenario: 'key_rename',
    activeParticipant: 'RuralBank-X',
    isBlockedBySafety: false,
    blockedReason: null,
    judgeDemoActive: false,
    autoTrafficEnabled: true,
  });

  const updateAgentState = useCallback((agentType: AgentType, partial: Partial<AgentState>) => {
    setAgents((prev) => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        ...partial,
        lastTimestamp: new Date().toLocaleTimeString(),
      },
    }));
  }, []);

  const addLog = useCallback((entry: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog = logManagerRef.current.addLog(entry);
    setLogs((prev) => [newLog, ...prev.slice(0, 200)]);
  }, []);

  // Update stats helper
  const recordTransactionStats = useCallback((txn: Transaction) => {
    setStats((prev) => {
      const isSuccess = txn.status === 'SUCCESS' || txn.status === 'RETRIED';
      const total = prev.totalTransactions + 1;
      const succ = prev.successfulTransactions + (isSuccess ? 1 : 0);
      const fail = prev.failedTransactions + (!isSuccess ? 1 : 0);
      const retried = prev.retriedTransactions + (txn.status === 'RETRIED' ? 1 : 0);
      const recovered = prev.transactionsRecovered + (txn.status === 'RETRIED' ? 1 : 0);
      const rate = parseFloat(((succ / total) * 100).toFixed(2));

      return {
        ...prev,
        totalTransactions: total,
        successfulTransactions: succ,
        failedTransactions: fail,
        retriedTransactions: retried,
        transactionsRecovered: recovered,
        successRate: rate,
      };
    });
  }, []);

  // Subscribe to log updates
  useEffect(() => {
    // Initial welcome logs
    addLog({
      agent: 'SYSTEM',
      severity: 'INFO',
      message: 'Self-Healing DPI Swarm initialized. All 5 agent swarms active.',
    });
    addLog({
      agent: 'GATEWAY',
      severity: 'SUCCESS',
      message: 'Simulated DPI Central Switch online. Zero-downtime edge injection hook engaged.',
    });
    addLog({
      agent: 'VERIFIER',
      severity: 'INFO',
      message: 'Formal verification engine active: 6 safety invariants armed (SMT-style deterministic checking).',
    });

    // Seed some initial healthy transactions
    const initialParticipants: ParticipantId[] = ['RuralBank-X', 'CoopBank-A', 'FinTechPay', 'RegionalBank-01'];
    const initialTxns: Transaction[] = [];
    for (let i = 0; i < 8; i++) {
      const p = initialParticipants[i % initialParticipants.length];
      const payload = transactionEngineRef.current.generateHealthyPayload(p, (100 + i * 50).toFixed(2));
      const t = transactionEngineRef.current.processIncomingRequest(p, payload);
      initialTxns.push(t);
    }
    setTransactions(initialTxns);
  }, [addLog]);

  // Periodic simulated background traffic if enabled
  useEffect(() => {
    if (!simulationState.autoTrafficEnabled) return;

    const interval = setInterval(() => {
      // Don't overwhelm if simulation pipeline is in tight execution
      if (simulationState.isRunning && simulationState.stepProgress > 0 && simulationState.stepProgress < 90) {
        return;
      }

      const participants: ParticipantId[] = ['CoopBank-A', 'FinTechPay', 'RegionalBank-01'];
      const p = participants[Math.floor(Math.random() * participants.length)];
      const payload = transactionEngineRef.current.generateHealthyPayload(p, (Math.floor(Math.random() * 800) + 100).toFixed(2));
      const txn = transactionEngineRef.current.processIncomingRequest(p, payload);

      setTransactions((prev) => [txn, ...prev.slice(0, 60)]);
      recordTransactionStats(txn);
    }, 2500);

    return () => clearInterval(interval);
  }, [simulationState.autoTrafficEnabled, simulationState.isRunning, simulationState.stepProgress, recordTransactionStats]);

  // Core Autonomous Self-Healing Pipeline
  const runSelfHealingLoop = useCallback(async (
    incident: Incident,
    samplePayload: Record<string, any>,
    expectedBaselineAmount: string = '450.00'
  ) => {
    const participant = incident.participant;

    // STEP 1: Diagnostic Agent
    setSimulationState((prev) => ({
      ...prev,
      currentStep: `[DIAGNOSTIC AGENT] Comparing expected vs received schemas for ${participant}...`,
      stepProgress: 30,
    }));
    updateAgentState('DIAGNOSTIC', { status: 'ANALYZING' });

    await new Promise((r) => setTimeout(r, 650));

    const diagnosis = diagnosticRef.current.diagnose(incident, samplePayload, addLog);
    setActiveDiagnosis(diagnosis);
    setCurrentDiffReport(diagnosis.diffReport);

    incident.diagnosis = {
      summary: diagnosis.summary,
      diffs: diagnosis.diffReport.items,
    };
    incident.scenario = diagnosis.detectedScenario;

    updateAgentState('DIAGNOSTIC', { status: 'IDLE', lastAction: diagnosis.summary });

    // STEP 2: Synthesizer Agent
    setSimulationState((prev) => ({
      ...prev,
      currentStep: `[SYNTHESIZER AGENT] Generating deterministic translation adapter...`,
      stepProgress: 50,
    }));
    updateAgentState('SYNTHESIZER', { status: 'SYNTHESIZING' });

    await new Promise((r) => setTimeout(r, 600));

    const adapter = synthesizerRef.current.synthesizeAdapter(diagnosis, samplePayload, addLog);
    updateAgentState('SYNTHESIZER', { status: 'IDLE', lastAction: `Synthesized ${adapter.id}` });

    // STEP 3: Safety Verifier
    setSimulationState((prev) => ({
      ...prev,
      currentStep: `[SAFETY VERIFIER] Evaluating 6 formal safety invariants against adapter [${adapter.id}]...`,
      stepProgress: 70,
    }));
    updateAgentState('VERIFIER', { status: 'VERIFYING' });

    await new Promise((r) => setTimeout(r, 750));

    const verificationReport = verifierRef.current.verifyAdapter(
      adapter,
      samplePayload,
      expectedBaselineAmount,
      addLog
    );
    setCurrentVerificationReport(verificationReport);
    adapter.verificationStatus = verificationReport.passed ? 'PASSED' : 'FAILED';
    adapter.verificationReport = verificationReport;

    if (!verificationReport.passed) {
      // CRITICAL: BLOCKED BY SAFETY VERIFIER!
      updateAgentState('VERIFIER', { status: 'BLOCKED', lastAction: `Blocked: ${verificationReport.summary}` });
      updateAgentState('EDGE', { status: 'IDLE', lastAction: `Deployment halted: Safety invariants violated` });

      setSimulationState((prev) => ({
        ...prev,
        isRunning: false,
        isBlockedBySafety: true,
        blockedReason: verificationReport.summary,
        currentStep: `🚫 SELF-HEALING BLOCKED: Invariant check failed. Deployment rejected by Safety Verifier.`,
        stepProgress: 100,
      }));

      addLog({
        agent: 'SYSTEM',
        severity: 'ERROR',
        message: `🚫 DEPLOYMENT BLOCKED by Safety Verifier: Adapter [${adapter.id}] does not conserve invariants. Central ledger protected.`,
      });

      setAdapters((prev) => [adapter, ...prev.filter((a) => a.id !== adapter.id)]);
      return;
    }

    // VERIFICATION PASSED: Proceed to Edge Injection
    updateAgentState('VERIFIER', { status: 'IDLE', lastAction: `Passed all 6 invariants` });
    setSimulationState((prev) => ({
      ...prev,
      isBlockedBySafety: false,
      blockedReason: null,
      currentStep: `[EDGE INJECTOR] Deploying verified adapter [${adapter.id}] at API Gateway edge filter...`,
      stepProgress: 85,
    }));
    updateAgentState('EDGE', { status: 'ACTIVE' });

    await edgeInjectorRef.current.deployAdapter(
      adapter,
      (updatedAdapter) => {
        setAdapters((prev) => {
          const idx = prev.findIndex((a) => a.id === updatedAdapter.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedAdapter;
            return next;
          }
          return [updatedAdapter, ...prev];
        });
      },
      addLog
    );

    // Update incident to MITIGATED
    incidentManagerRef.current.updateIncidentStatus(incident.id, 'MITIGATED', adapter.id, addLog);
    setActiveIncident({ ...incident });
    setIncidents([...incidentManagerRef.current.getIncidents()]);

    setStats((prev) => ({
      ...prev,
      activeAdapters: edgeInjectorRef.current.getAllAdapters().length,
      autoHealedIncidents: prev.autoHealedIncidents + 1,
      averageMttrSeconds: incidentManagerRef.current.calculateAverageMttr(),
    }));

    // STEP 4: Retry Transactions
    setSimulationState((prev) => ({
      ...prev,
      currentStep: `[TRANSACTION RETRY] Retrying failed transactions through active adapter [${adapter.id}]...`,
      stepProgress: 95,
    }));

    await new Promise((r) => setTimeout(r, 500));

    // Execute retried transaction through gateway
    const retriedTxn = transactionEngineRef.current.processIncomingRequest(participant, samplePayload, true);
    setTransactions((prev) => [retriedTxn, ...prev.slice(0, 60)]);
    recordTransactionStats(retriedTxn);

    addLog({
      agent: 'GATEWAY',
      severity: 'SUCCESS',
      message: `HTTP 200 OK — Transaction [${retriedTxn.id}] successfully recovered and cleared! Latency: ${retriedTxn.latencyMs}ms.`,
      metadata: { txnId: retriedTxn.id, latencyMs: retriedTxn.latencyMs },
    });

    setSimulationState((prev) => ({
      ...prev,
      isRunning: false,
      currentStep: `Transaction recovered. Incident mitigated in ~${incident.mttrSeconds || 4}s. Zero downtime achieved.`,
      stepProgress: 100,
    }));
  }, [addLog, updateAgentState, recordTransactionStats]);

  // Inject Chaos Incident handler
  const injectIncident = useCallback(async (
    participant: ParticipantId,
    scenario: ScenarioType,
    customPayload?: Record<string, any>,
    batchCount: number = 3
  ) => {
    setSimulationState((prev) => ({
      ...prev,
      isRunning: true,
      currentStep: `Injecting ${scenario} failure into ${participant}...`,
      stepProgress: 10,
      activeScenario: scenario,
      activeParticipant: participant,
      isBlockedBySafety: false,
      blockedReason: null,
    }));

    updateAgentState('SCOUT', { status: 'ACTIVE' });

    const scenarioDef = SCENARIO_DEFINITIONS[scenario];
    const rawPayload = customPayload || scenarioDef.samplePayloadGenerator(participant);

    // Step A: Send malformed transactions to trigger HTTP 422 errors
    addLog({
      agent: 'GATEWAY',
      severity: 'WARN',
      message: `Receiving incoming traffic from participant [${participant}]...`,
    });

    let detectedIncident: Incident | null = null;

    for (let i = 0; i < batchCount; i++) {
      const txn = transactionEngineRef.current.processIncomingRequest(participant, rawPayload);
      setTransactions((prev) => [txn, ...prev.slice(0, 60)]);
      recordTransactionStats(txn);

      // Scout Agent evaluates
      const inc = scoutRef.current.processTransaction(
        txn,
        (newInc) => {
          detectedIncident = incidentManagerRef.current.createIncident(newInc, addLog);
          setActiveIncident({ ...detectedIncident });
          setIncidents([...incidentManagerRef.current.getIncidents()]);
          setStats((prev) => ({ ...prev, activeIncidents: prev.activeIncidents + 1 }));
        },
        addLog
      );

      if (inc && !detectedIncident) {
        detectedIncident = inc;
      }

      await new Promise((r) => setTimeout(r, 150));
    }

    // If scenario is healthy, no incident should be created
    if (scenario === 'healthy') {
      setSimulationState((prev) => ({
        ...prev,
        isRunning: false,
        currentStep: 'Nominal traffic pass-through verified. Schema matches 100%.',
        stepProgress: 100,
      }));
      addLog({
        agent: 'SCOUT',
        severity: 'INFO',
        message: `Traffic for ${participant} is nominal. Zero contract drift detected.`,
      });
      return;
    }

    // Ensure we have an incident object even if single txn
    if (!detectedIncident) {
      const manualInc: Incident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        participant,
        title: `Schema Contract Violation — ${participant}`,
        scenario,
        severity: 'CRITICAL',
        status: 'OPEN',
        failureRate: 100,
        affectedTransactions: batchCount,
        detectedAt: new Date().toISOString(),
        samplePayload: rawPayload,
      };
      detectedIncident = incidentManagerRef.current.createIncident(manualInc, addLog);
      setActiveIncident({ ...detectedIncident });
      setIncidents([...incidentManagerRef.current.getIncidents()]);
    }

    // Trigger the self-healing loop
    await runSelfHealingLoop(detectedIncident, rawPayload, scenarioDef.expectedBaselineAmount);
  }, [addLog, updateAgentState, recordTransactionStats, runSelfHealingLoop]);

  // Restore Upstream Schema & Auto-Retire Adapter
  const restoreUpstreamSchema = useCallback(async (participant: ParticipantId) => {
    addLog({
      agent: 'SYSTEM',
      severity: 'INFO',
      message: `Upstream participant [${participant}] deployed contract fix: Restoring canonical v1.0 schema...`,
    });

    const activeInc = incidentManagerRef.current.getActiveIncident();

    // 1. Mark adapter as retiring and remove from edge
    await edgeInjectorRef.current.retireAdapter(
      participant,
      (updatedAdapter) => {
        setAdapters((prev) => {
          const idx = prev.findIndex((a) => a.id === updatedAdapter.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedAdapter;
            return next;
          }
          return prev;
        });
      },
      addLog
    );

    scoutRef.current.resetCluster(participant);

    // 2. Verify normal traffic passes through natively
    const healthyPayload = transactionEngineRef.current.generateHealthyPayload(participant, '450.00');
    const healthyTxn = transactionEngineRef.current.processIncomingRequest(participant, healthyPayload);
    setTransactions((prev) => [healthyTxn, ...prev.slice(0, 60)]);
    recordTransactionStats(healthyTxn);

    // 3. Close incident
    if (activeInc) {
      incidentManagerRef.current.updateIncidentStatus(activeInc.id, 'RESOLVED', undefined, addLog);
      setActiveIncident(null);
      setIncidents([...incidentManagerRef.current.getIncidents()]);
    }

    setStats((prev) => ({
      ...prev,
      activeAdapters: edgeInjectorRef.current.getAllAdapters().length,
      activeIncidents: Math.max(0, prev.activeIncidents - 1),
    }));

    addLog({
      agent: 'SCOUT',
      severity: 'SUCCESS',
      message: `UPSTREAM SCHEMA RESTORED: Verified native HTTP 200 pass-through for [${participant}]. Incident closed.`,
    });
  }, [addLog, recordTransactionStats]);

  // Rollback adapter manually
  const rollbackAdapter = useCallback(async (participant: ParticipantId) => {
    addLog({
      agent: 'SYSTEM',
      severity: 'WARN',
      message: `Manual operator rollback requested for participant [${participant}]...`,
    });
    await edgeInjectorRef.current.retireAdapter(participant, undefined, addLog);
    setAdapters((prev) => prev.filter((a) => a.participant !== participant));
    setStats((prev) => ({
      ...prev,
      activeAdapters: edgeInjectorRef.current.getAllAdapters().length,
    }));
  }, [addLog]);

  // 30-60 second Guided Judge Demonstration
  const runJudgeDemo = useCallback(async () => {
    setSimulationState((prev) => ({ ...prev, judgeDemoActive: true }));

    addLog({
      agent: 'SYSTEM',
      severity: 'INFO',
      message: '🎬 STARTING 30-SECOND JUDGE GUIDED DEMONSTRATION...',
    });

    // Step 1: Normal transactions
    addLog({
      agent: 'GATEWAY',
      severity: 'SUCCESS',
      message: 'Step 1/6: Baseline healthy traffic running through DPI Central Switch.',
    });
    for (let i = 0; i < 3; i++) {
      const p: ParticipantId = 'RuralBank-X';
      const pl = transactionEngineRef.current.generateHealthyPayload(p, '450.00');
      const t = transactionEngineRef.current.processIncomingRequest(p, pl);
      setTransactions((prev) => [t, ...prev.slice(0, 60)]);
      await new Promise((r) => setTimeout(r, 400));
    }

    // Step 2: Inject schema key rename failure
    addLog({
      agent: 'GATEWAY',
      severity: 'WARN',
      message: 'Step 2/6: RuralBank-X deploys sudden API contract update (Field Rename Drift).',
    });
    await injectIncident('RuralBank-X', 'key_rename');

    // Wait 4 seconds to observe healed state
    await new Promise((r) => setTimeout(r, 4000));

    // Step 3: Upstream restores schema and auto-retires
    addLog({
      agent: 'SYSTEM',
      severity: 'INFO',
      message: 'Step 3/6: RuralBank-X completes upstream patch. Testing auto-retirement of temporary adapter...',
    });
    await restoreUpstreamSchema('RuralBank-X');

    addLog({
      agent: 'SYSTEM',
      severity: 'SUCCESS',
      message: '🎉 Judge Demonstration complete: Full autonomous detect → diagnose → synthesize → verify → deploy → recover → retire loop executed with zero downtime!',
    });

    setSimulationState((prev) => ({ ...prev, judgeDemoActive: false }));
  }, [addLog, injectIncident, restoreUpstreamSchema]);

  // Dangerous Incident Demo (Amount Tampering)
  const runDangerousDemo = useCallback(async () => {
    addLog({
      agent: 'SYSTEM',
      severity: 'WARN',
      message: '⚠️ EXECUTING DANGEROUS INCIDENT DEMO: Simulating Value Mutation (450 → 4500)...',
    });
    await injectIncident('RuralBank-X', 'amount_tampering');
  }, [addLog, injectIncident]);

  const retryTransaction = useCallback((txnId: string) => {
    const txn = transactions.find((t) => t.id === txnId);
    if (!txn) return;
    addLog({
      agent: 'GATEWAY',
      severity: 'INFO',
      message: `Manual retry requested for Transaction [${txnId}]...`,
    });
    const retried = transactionEngineRef.current.processIncomingRequest(
      txn.participant,
      txn.rawPayload,
      true
    );
    setTransactions((prev) => [retried, ...prev.slice(0, 60)]);
    recordTransactionStats(retried);
  }, [transactions, addLog, recordTransactionStats]);

  const clearLogs = useCallback(() => {
    logManagerRef.current.clearLogs();
    setLogs([]);
  }, []);

  const toggleAutoTraffic = useCallback(() => {
    setSimulationState((prev) => ({
      ...prev,
      autoTrafficEnabled: !prev.autoTrafficEnabled,
    }));
  }, []);

  // Ask AI Explanation via server-side Gemini API with deterministic fallback
  const askAiExplanation = useCallback(async (question: string) => {
    const incidentContext = {
      activeIncident,
      participant: simulationState.activeParticipant,
      scenario: simulationState.activeScenario,
      status: activeIncident?.status || 'MITIGATED',
      diffReport: currentDiffReport,
      verifierReport: currentVerificationReport,
      isBlocked: simulationState.isBlockedBySafety,
      blockedReason: simulationState.blockedReason,
      activeAdaptersCount: edgeInjectorRef.current.getAllAdapters().length,
    };

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, incidentContext }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        answer: data.answer,
        source: data.source || 'gemini-3.8-flash',
      };
    } catch (err: any) {
      // Client-side fallback if server endpoint unreachable
      return {
        answer: `The system detected schema contract drift for participant **${simulationState.activeParticipant}**. The Safety Verifier enforces 6 formal mathematical invariants before any adapter enters the API gateway hot-path. If an amount or currency changes, deployment is strictly blocked. When verified safe, zero-downtime execution proceeds.`,
        source: 'local-fallback',
      };
    }
  }, [
    activeIncident,
    simulationState.activeParticipant,
    simulationState.activeScenario,
    simulationState.isBlockedBySafety,
    simulationState.blockedReason,
    currentDiffReport,
    currentVerificationReport,
  ]);

  return (
    <DpiContext.Provider
      value={{
        transactions,
        incidents,
        activeIncident,
        adapters,
        agents,
        logs,
        stats,
        currentDiffReport,
        currentVerificationReport,
        activeDiagnosis,
        simulationState,
        injectIncident,
        runJudgeDemo,
        runDangerousDemo,
        retryTransaction,
        rollbackAdapter,
        restoreUpstreamSchema,
        clearLogs,
        toggleAutoTraffic,
        askAiExplanation,
      }}
    >
      {children}
    </DpiContext.Provider>
  );
};

export const useDpi = () => {
  const context = useContext(DpiContext);
  if (!context) {
    throw new Error('useDpi must be used within a DpiProvider');
  }
  return context;
};
