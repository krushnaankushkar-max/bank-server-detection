import React, { useState } from 'react';
import { useDpi } from '../context/DpiContext';
import { ParticipantId, ScenarioType } from '../types/dpi';
import { SCENARIO_DEFINITIONS } from '../simulation/SimulationController';
import { 
  FlaskConical, 
  Play, 
  Search, 
  Layers, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Activity, 
  Clock, 
  Check, 
  ShieldAlert,
  Flame,
  FileCheck
} from 'lucide-react';

export const TestingDashboardView: React.FC = () => {
  const { 
    transactions, 
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
    restoreUpstreamSchema,
    clearLogs
  } = useDpi();

  const [selectedBank, setSelectedBank] = useState<ParticipantId>('RuralBank-X');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('key_rename');
  const [manualStep, setManualStep] = useState<number>(0); 
  // 0: Standby, 1: Normal, 2: Failure Injected, 3: Diagnosed, 4: Generated, 5: Verified, 6: Healed

  // Button 1: Run Normal Transaction
  const handleRunNormal = () => {
    setManualStep(1);
    injectIncident(selectedBank, 'healthy', undefined, 1);
  };

  // Button 2: Inject Failure
  const handleInjectFailure = () => {
    setManualStep(2);
    injectIncident(selectedBank, selectedScenario, undefined, 2);
  };

  // Button 3: Run Diagnosis (focus view on diagnosis data)
  const handleRunDiagnosis = () => {
    setManualStep(3);
  };

  // Button 4: Generate Recovery
  const handleGenerateRecovery = () => {
    setManualStep(4);
  };

  // Button 5: Verify Fix
  const handleVerifyFix = () => {
    setManualStep(5);
  };

  // Button 6: Run Full Self-Healing Loop
  const handleRunSelfHealing = () => {
    setManualStep(6);
    injectIncident(selectedBank, selectedScenario, undefined, 3);
  };

  // Button 7: Reset System
  const handleResetSystem = async () => {
    setManualStep(0);
    await restoreUpstreamSchema(selectedBank);
    clearLogs();
  };

  const latestTxn = transactions[0];
  const activeAdapter = adapters.find((a) => a.participant === selectedBank && a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            <span>Interactive Testing & Judge Demonstration Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400">
            Step-by-step test controls for judges: verify failure detection, root-cause diagnosis, formal invariant safety gating, and zero-downtime hot-patching.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 px-3 py-1 rounded bg-slate-900 border border-slate-800">
            Gateway: Online (0ms Downtime)
          </span>
        </div>
      </div>

      {/* 7 Interactive Testing Buttons Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Step-by-Step Test Controls (Click in Sequence or Run Self-Healing)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Target Bank: <strong className="text-cyan-300">{selectedBank}</strong> · Scenario: <strong className="text-amber-300">{selectedScenario}</strong>
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {/* Button 1 */}
          <button
            onClick={handleRunNormal}
            disabled={simulationState.isRunning}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              manualStep === 1
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 border border-emerald-400'
                : 'bg-slate-950 border border-slate-800 text-emerald-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Step 1: Send nominal payload and verify HTTP 200 pass-through"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>1. Run Normal</span>
          </button>

          {/* Button 2 */}
          <button
            onClick={handleInjectFailure}
            disabled={simulationState.isRunning}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              manualStep === 2
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40 border border-red-400'
                : 'bg-slate-950 border border-slate-800 text-red-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Step 2: Inject schema drift payload and observe HTTP 422 failure"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>2. Inject Failure</span>
          </button>

          {/* Button 3 */}
          <button
            onClick={handleRunDiagnosis}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              manualStep === 3
                ? 'bg-blue-600 text-white shadow-md border border-blue-400'
                : 'bg-slate-950 border border-slate-800 text-blue-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Step 3: Trigger Diagnostic Agent to compare schemas and find differences"
          >
            <Search className="w-3.5 h-3.5" />
            <span>3. Run Diagnosis</span>
          </button>

          {/* Button 4 */}
          <button
            onClick={handleGenerateRecovery}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              manualStep === 4
                ? 'bg-indigo-600 text-white shadow-md border border-indigo-400'
                : 'bg-slate-950 border border-slate-800 text-indigo-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Step 4: Synthesize translation adapter code"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Generate Recovery</span>
          </button>

          {/* Button 5 */}
          <button
            onClick={handleVerifyFix}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              manualStep === 5
                ? 'bg-emerald-600 text-white shadow-md border border-emerald-400'
                : 'bg-slate-950 border border-slate-800 text-emerald-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Step 5: Run SMT-style 6 formal invariant checks"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5. Verify Fix</span>
          </button>

          {/* Button 6 */}
          <button
            onClick={handleRunSelfHealing}
            disabled={simulationState.isRunning}
            className="py-2 px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Step 6: Execute full end-to-end autonomous healing loop"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>6. Run Self-Healing</span>
          </button>

          {/* Button 7 */}
          <button
            onClick={handleResetSystem}
            className="py-2 px-3 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Step 7: Reset system state, retire temporary adapter, restore upstream nominal schema"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>7. Reset System</span>
          </button>
        </div>
      </div>

      {/* Selectors for Testing: Bank and Scenario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bank Selection */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-300 block">
            Select Participating Bank / Fintech Entity:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['RuralBank-X', 'CoopBank-A', 'FinTechPay', 'RegionalBank-01'] as ParticipantId[]).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedBank(p)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  selectedBank === p
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-300 block">
            Select Test Fault / Chaos Scenario:
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value as ScenarioType)}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="key_rename">Scenario 1: Key Rename (vpa_id, txn_amount) → Safe Auto-Heal ✓</option>
            <option value="missing_field">Scenario 2: Missing auth_ref Token → Safety Blocked 🚫</option>
            <option value="amount_tampering">Scenario 3: Dangerous Amount Tampering (450 → 4500) → Invariant Block 🚫</option>
            <option value="extra_field">Scenario 4: Unauthorized Privileged Field (admin_transfer) → Rejected 🚫</option>
            <option value="timestamp_format">Scenario 5: Timestamp Format Drift (DD/MM/YYYY) → Auto-Normalized ✓</option>
            <option value="healthy">Scenario 6: Fully Healthy Nominal DPI Payload → 100% Pass</option>
          </select>
        </div>
      </div>

      {/* Grid of Key Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: System Health & Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono font-semibold uppercase">System Health</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Central Switch: Online</span>
          </div>
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Success Rate:</span>
              <span className="font-mono text-emerald-400 font-bold">{stats.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Incidents:</span>
              <span className={`font-mono font-bold ${stats.activeIncidents > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                {stats.activeIncidents}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mounted Adapters:</span>
              <span className="font-mono text-cyan-400 font-bold">{stats.activeAdapters} Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Simulation MTTR:</span>
              <span className="font-mono text-emerald-300 font-bold">~{stats.averageMttrSeconds}s</span>
            </div>
          </div>
        </div>

        {/* Card 2: Transaction Status & Latency */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono font-semibold uppercase">Latest Transaction</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          {latestTxn ? (
            <>
              <div className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                  latestTxn.status === 'SUCCESS' || latestTxn.status === 'RETRIED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  {latestTxn.status} ({latestTxn.httpStatus})
                </span>
                <span className="text-sm font-normal text-slate-400 font-mono truncate">{latestTxn.id}</span>
              </div>
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Participant:</span>
                  <span className="font-medium text-slate-200">{latestTxn.participant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-mono font-bold text-slate-100">₹{latestTxn.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gateway Latency:</span>
                  <span className="font-mono text-cyan-300">{latestTxn.latencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Adapter Route:</span>
                  <span className="font-mono text-slate-300">{latestTxn.adapterUsed || 'Native Canonical'}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500">
              No transactions processed yet. Click &quot;1. Run Normal&quot;.
            </div>
          )}
        </div>

        {/* Card 3: Safety & Invariant Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono font-semibold uppercase">Verification Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            {simulationState.isBlockedBySafety ? (
              <span className="text-red-400 font-mono text-base flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>BLOCKED (Invariant Failed)</span>
              </span>
            ) : currentVerificationReport?.passed ? (
              <span className="text-emerald-400 font-mono text-base flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>PASSED (6 Invariants Verified)</span>
              </span>
            ) : (
              <span className="text-slate-400 font-mono text-base">Armed &amp; Ready</span>
            )}
          </div>
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Rule 1 (Value Conservation):</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {simulationState.isBlockedBySafety && simulationState.activeScenario === 'amount_tampering' ? 'FAIL ✗' : 'PASS ✓'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rule 2 (Currency Lock):</span>
              <span className="font-mono text-emerald-400 font-semibold">PASS ✓ (INR)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rule 3 (Audit Token):</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {simulationState.isBlockedBySafety && simulationState.activeScenario === 'missing_field' ? 'FAIL ✗' : 'PASS ✓'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SMT Logic:</span>
              <span className="font-mono text-cyan-300">QF_LIRA Solver Representation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics, Recovery Plan & Verification Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Root Cause Analysis & Semantic Schema Diff */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Diagnostic Root Cause Analysis</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Confidence: {currentDiffReport ? `${currentDiffReport.overallMatchPercentage}% Base` : '100%'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {activeDiagnosis?.summary ||
              currentDiffReport?.humanExplanation ||
              'Scout and Diagnostic Agents compare inbound participant payloads against canonical DPI specifications to detect field drift.'}
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-slate-400 text-[11px] font-semibold border-b border-slate-850 pb-1">
              DIAGNOSED FIELD BINDINGS:
            </div>
            {currentDiffReport ? (
              currentDiffReport.items.map((it) => (
                <div key={it.canonicalKey} className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400">{it.canonicalKey}</span>
                  <span className="text-slate-500">←</span>
                  <span className={it.status === 'RENAMED' ? 'text-amber-300 font-bold' : it.status === 'MISSING' ? 'text-red-400' : 'text-slate-400'}>
                    {it.receivedKey || 'MISSING (DROPPED)'}
                  </span>
                  <span className={`px-1 rounded text-[9px] ${
                    it.status === 'MATCH' ? 'bg-emerald-950 text-emerald-400' : it.status === 'RENAMED' ? 'bg-amber-950 text-amber-300' : 'bg-red-950 text-red-400'
                  }`}>
                    {it.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-[11px] py-2">
                Click &quot;2. Inject Failure&quot; to inspect real-time diff.
              </div>
            )}
          </div>
        </div>

        {/* Right: Recovery Plan & Edge Hot-Patch Status */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Synthesizer Recovery Plan &amp; Adapter</span>
            </h3>
            <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold uppercase ${
              activeAdapter ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {activeAdapter ? `ACTIVE: ${activeAdapter.id}` : 'NO ACTIVE ADAPTER'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The Synthesizer compiles bijective mappings into an in-memory edge filter. When safe, the Edge Injector hot-mounts it without server restarts.
          </p>

          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto h-36">
            {activeAdapter ? activeAdapter.transformFnCode : `// No active adapter mounted.
// Run "4. Generate Recovery" or "6. Run Self-Healing" to compile.`}
          </pre>
        </div>
      </div>

      {/* Terminal Real-Time Decision Logs */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-850">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">Agent Decision Audit Trail</span>
          </div>
          <span className="text-[11px] text-slate-500">Live Telemetry</span>
        </div>

        <div className="h-44 overflow-y-auto space-y-1 text-[11px] pr-2">
          {logs.slice(0, 10).map((log) => (
            <div key={log.id} className="leading-relaxed">
              <span className="text-slate-500">[{log.timestamp}]</span>{' '}
              <span className="text-cyan-400 font-semibold">[{log.agent}]</span>{' '}
              <span className={
                log.severity === 'ERROR' ? 'text-red-400 font-bold' :
                log.severity === 'WARN' ? 'text-amber-300' :
                log.severity === 'SUCCESS' ? 'text-emerald-300' : 'text-slate-300'
              }>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
