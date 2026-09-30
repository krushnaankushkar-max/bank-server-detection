import React, { useState } from 'react';
import { useDpi } from '../context/DpiContext';
import { ParticipantId, ScenarioType } from '../types/dpi';
import { SCENARIO_DEFINITIONS } from '../simulation/SimulationController';
import { 
  Flame, 
  FlaskConical, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  AlertTriangle,
  Layers,
  Cpu,
  GitCompare,
  Lock,
  Zap,
  CheckCircle
} from 'lucide-react';

export const SimulationLabView: React.FC = () => {
  const { 
    injectIncident, 
    simulationState, 
    logs, 
    activeIncident, 
    restoreUpstreamSchema,
    runJudgeDemo
  } = useDpi();

  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantId>('RuralBank-X');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('key_rename');
  const [amount, setAmount] = useState<string>('450.00');
  const [batchCount, setBatchCount] = useState<number>(5);
  const [customPayloadJson, setCustomPayloadJson] = useState<string>(
    JSON.stringify(
      {
        vpa_id: 'farmer.custom@bank',
        txn_amount: '450.00',
        currency: 'INR',
        reference_no: 'TXN_CUSTOM_9981',
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );

  const scenarioKeys: ScenarioType[] = [
    'key_rename',
    'missing_field',
    'amount_tampering',
    'extra_field',
    'timestamp_format',
    'healthy',
    'custom',
  ];

  const handleExecuteInjection = () => {
    let customPayload: Record<string, any> | undefined = undefined;
    if (selectedScenario === 'custom') {
      try {
        customPayload = JSON.parse(customPayloadJson);
      } catch (e: any) {
        alert('Invalid JSON in custom payload editor: ' + e.message);
        return;
      }
    }
    injectIncident(selectedParticipant, selectedScenario, customPayload, batchCount);
  };

  const pipelineStages = [
    { id: 'scout', name: 'Scout Detect', threshold: 10, icon: <Cpu className="w-4 h-4" /> },
    { id: 'diagnostic', name: 'Diagnostic Diff', threshold: 30, icon: <GitCompare className="w-4 h-4" /> },
    { id: 'synthesizer', name: 'Synthesizer', threshold: 50, icon: <Layers className="w-4 h-4" /> },
    { id: 'verifier', name: 'Safety Invariants', threshold: 70, icon: <Lock className="w-4 h-4" /> },
    { id: 'edge', name: 'Edge Injector', threshold: 85, icon: <Zap className="w-4 h-4" /> },
    { id: 'retry', name: 'Retry & Recover', threshold: 95, icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            <span>Autonomous Failure Simulation Lab</span>
          </h2>
          <p className="text-xs text-slate-400">
            Interactive chaos testbench to validate autonomous swarm remediation and safety invariant gating.
          </p>
        </div>

        <button
          onClick={runJudgeDemo}
          disabled={simulationState.judgeDemoActive || simulationState.isRunning}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Automated 30s Judge Demo</span>
        </button>
      </div>

      {/* Main Simulation Panel & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulation Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-cyan-400" />
              <span>Configure Chaos Incident</span>
            </h3>

            {/* Participant Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                1. Select Banking / Fintech Participant
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['RuralBank-X', 'CoopBank-A', 'FinTechPay', 'RegionalBank-01'] as ParticipantId[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedParticipant(p)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                      selectedParticipant === p
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Failure Scenario Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                2. Select Schema Failure Scenario
              </label>
              <div className="space-y-2">
                {scenarioKeys.map((key) => {
                  const def = SCENARIO_DEFINITIONS[key];
                  const isSelected = selectedScenario === key;
                  const isDanger = def.expectedOutcome === 'SAFETY_BLOCKED';

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedScenario(key)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? isDanger
                            ? 'bg-red-950/50 border-red-500 shadow-sm'
                            : 'bg-cyan-950/50 border-cyan-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {def.name}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          def.expectedOutcome === 'AUTO_HEALED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : def.expectedOutcome === 'SAFETY_BLOCKED'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {def.expectedOutcome === 'AUTO_HEALED'
                            ? 'Auto-Heals ✓'
                            : def.expectedOutcome === 'SAFETY_BLOCKED'
                            ? 'Safety Blocks 🚫'
                            : 'Nominal Pass'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{def.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Payload Editor if Custom selected */}
            {selectedScenario === 'custom' && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-mono text-cyan-300 block mb-1.5 font-semibold">
                  Custom Payload JSON (Test Arbitrary Schema Drift)
                </span>
                <textarea
                  rows={6}
                  value={customPayloadJson}
                  onChange={(e) => setCustomPayloadJson(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Transaction Parameters */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Transaction Amount</label>
                <div className="flex items-center">
                  <span className="px-3 py-1.5 rounded-l-lg bg-slate-950 border border-r-0 border-slate-800 text-xs text-slate-400 font-mono">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full py-1.5 px-3 rounded-r-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Number of Requests</label>
                <select
                  value={batchCount}
                  onChange={(e) => setBatchCount(parseInt(e.target.value, 10))}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value={1}>1 transaction (Single test)</option>
                  <option value={3}>3 transactions (Cluster)</option>
                  <option value={10}>10 transactions (Spike)</option>
                  <option value={50}>50 transactions (Flood)</option>
                </select>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2">
              <button
                onClick={handleExecuteInjection}
                disabled={simulationState.isRunning}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>🚨 INJECT INCIDENT AT API GATEWAY</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Animated Execution Pipeline & Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Animated Pipeline Stage Tracker */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Autonomous Remediation Pipeline</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {simulationState.stepProgress}%
              </span>
            </h3>

            {/* Stage Steps */}
            <div className="space-y-2.5">
              {pipelineStages.map((stg) => {
                const isPassed = simulationState.stepProgress >= stg.threshold;
                const isCurrent =
                  simulationState.isRunning &&
                  simulationState.stepProgress >= stg.threshold - 15 &&
                  simulationState.stepProgress < stg.threshold + 15;

                return (
                  <div
                    key={stg.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 animate-pulse'
                        : isPassed
                        ? 'bg-slate-950 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/40 border-slate-850 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isPassed ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {stg.icon}
                      </div>
                      <span className="font-semibold">{stg.name}</span>
                    </div>

                    <span className="font-mono text-[10px] font-bold">
                      {isCurrent ? 'RUNNING...' : isPassed ? 'COMPLETE ✓' : 'STANDBY'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current Pipeline Status */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                Current Pipeline Status
              </span>
              <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                {simulationState.currentStep}
              </p>
            </div>
          </div>

          {/* Upstream Schema Restoration Card if Mitigated */}
          {activeIncident && activeIncident.status === 'MITIGATED' && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Hot-Patch Currently Active at Edge</span>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                The temporary adapter is safely translating requests with zero downtime. Simulate the upstream participant deploying their permanent bugfix:
              </p>
              <button
                onClick={() => restoreUpstreamSchema(activeIncident.participant)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Deploy Upstream Fix & Retire Adapter</span>
              </button>
            </div>
          )}

          {/* Live Mini Terminal Logs */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-mono font-semibold text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulated Pipeline Terminal</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Live 100ms</span>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 font-mono text-[10px] text-slate-300">
              {logs.slice(0, 10).map((l) => (
                <div key={l.id} className="leading-tight">
                  <span className="text-slate-500">[{l.timestamp}]</span>{' '}
                  <span className={`font-bold ${
                    l.agent === 'SCOUT' ? 'text-cyan-400' :
                    l.agent === 'DIAGNOSTIC' ? 'text-blue-400' :
                    l.agent === 'SYNTHESIZER' ? 'text-indigo-400' :
                    l.agent === 'VERIFIER' ? 'text-emerald-400' :
                    l.agent === 'EDGE' ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {l.agent}
                  </span>{' '}
                  <span className={
                    l.severity === 'ERROR' ? 'text-red-400 font-semibold' :
                    l.severity === 'WARN' ? 'text-amber-300' :
                    l.severity === 'SUCCESS' ? 'text-emerald-300' : 'text-slate-300'
                  }>
                    {l.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
