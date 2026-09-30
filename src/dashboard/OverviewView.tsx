import React from 'react';
import { useDpi } from '../context/DpiContext';
import { ViewTab } from './TopNav';
import { 
  TrendingUp, 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle, 
  Layers, 
  Clock, 
  Play, 
  Flame, 
  Activity, 
  ArrowUpRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface OverviewViewProps {
  onNavigate: (tab: ViewTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const { 
    stats, 
    activeIncident, 
    simulationState, 
    injectIncident, 
    runDangerousDemo,
    restoreUpstreamSchema,
    transactions,
    adapters,
    agents
  } = useDpi();

  const kpis = [
    {
      title: 'TOTAL TRANSACTIONS',
      value: stats.totalTransactions.toLocaleString(),
      sub: 'Simulated DPI central switch',
      change: '+1,420/min',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      color: 'border-slate-800',
    },
    {
      title: 'SUCCESS RATE',
      value: `${stats.successRate}%`,
      sub: 'Zero-downtime SLA maintained',
      change: 'Nominal',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/20',
    },
    {
      title: 'ACTIVE INCIDENTS',
      value: stats.activeIncidents,
      sub: activeIncident ? `${activeIncident.participant} (${activeIncident.status})` : 'All participants nominal',
      change: stats.activeIncidents > 0 ? 'CRITICAL' : '0 active',
      icon: <AlertOctagon className={`w-4 h-4 ${stats.activeIncidents > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />,
      color: stats.activeIncidents > 0 ? 'border-red-500/40 bg-red-950/20' : 'border-slate-800',
    },
    {
      title: 'FAILED TRANSACTIONS',
      value: stats.failedTransactions.toLocaleString(),
      sub: 'Pre-adaptation schema 422s',
      change: 'Contained',
      icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
      color: 'border-slate-800',
    },
    {
      title: 'AUTO-HEALED INCIDENTS',
      value: stats.autoHealedIncidents,
      sub: 'Autonomous swarm resolutions',
      change: '100% verified safe',
      icon: <CheckCircle className="w-4 h-4 text-cyan-400" />,
      color: 'border-cyan-500/20',
    },
    {
      title: 'ACTIVE ADAPTERS',
      value: stats.activeAdapters,
      sub: 'Zero-downtime gateway hot-patches',
      change: `${adapters.length} total history`,
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      color: 'border-slate-800',
    },
    {
      title: 'AVERAGE MTTR',
      value: `${stats.averageMttrSeconds}s`,
      sub: 'vs 2–6 hours traditional resolution',
      change: 'Simulation Result',
      icon: <Clock className="w-4 h-4 text-teal-400" />,
      color: 'border-slate-800',
    },
    {
      title: 'TRANSACTIONS RECOVERED',
      value: stats.transactionsRecovered.toLocaleString(),
      sub: 'Zero revenue loss across banks',
      change: '+100% rescued',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Pipeline Execution Banner if active */}
      {simulationState.isRunning && (
        <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/40 relative overflow-hidden animate-pulse-glow">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="font-semibold text-sm text-cyan-200">
                Autonomous Self-Healing Swarm in Action:
              </span>
              <span className="text-xs font-mono text-cyan-300">
                {simulationState.currentStep}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {simulationState.stepProgress}%
            </span>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${simulationState.stepProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Quick Action Simulator Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Live Incident Simulator Quick Actions</div>
            <div className="text-xs text-slate-400">Trigger simulated API contract drift or dangerous value tampering</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => injectIncident('RuralBank-X', 'key_rename')}
            disabled={simulationState.isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Scenario 1: Key Rename (Auto-Heals)</span>
          </button>

          <button
            onClick={() => runDangerousDemo()}
            disabled={simulationState.isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Scenario 3: Tamper Amount (Safety Blocks)</span>
          </button>

          <button
            onClick={() => onNavigate('simulation-lab')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Full Simulation Lab</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className={`p-5 rounded-xl bg-slate-900/60 border ${kpi.color} backdrop-blur-sm transition-all`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider">{kpi.title}</span>
              {kpi.icon}
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1 tabular-nums">
              {kpi.value}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate mr-2">{kpi.sub}</span>
              <span className="font-mono text-[10px] text-cyan-400 shrink-0">{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Incident Showcase Card if present */}
      {activeIncident && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-red-500/40 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                activeIncident.status === 'MITIGATED' 
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400' 
                  : 'bg-red-950/80 border border-red-500/40 text-red-400 animate-pulse'
              }`}>
                {activeIncident.status}
              </span>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activeIncident.title}</span>
                  <span className="text-xs font-mono text-slate-400">({activeIncident.id})</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Participant: <span className="text-slate-200 font-semibold">{activeIncident.participant}</span> · Detected: <span className="font-mono text-slate-300">{new Date(activeIncident.detectedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('schema-diff')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                View Schema Diff
              </button>
              <button
                onClick={() => onNavigate('verification')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                Inspect Verifier
              </button>
              {activeIncident.status === 'MITIGATED' && (
                <button
                  onClick={() => restoreUpstreamSchema(activeIncident.participant)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Upstream & Retire Adapter</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Failure Rate at Edge</span>
              <span className="font-mono text-lg font-bold text-red-400 tabular-nums">
                {activeIncident.failureRate}% HTTP 422
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Autonomous Remediation</span>
              <span className="font-mono text-lg font-bold text-cyan-400 tabular-nums">
                {activeIncident.adapterId ? `Adapter ${activeIncident.adapterId}` : 'Synthesizing...'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Time to Mitigation (MTTR)</span>
              <span className="font-mono text-lg font-bold text-emerald-400 tabular-nums">
                ~{activeIncident.mttrSeconds || 4}s Zero-Downtime
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Split: Agents Status + Live Transactions Mini Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Swarm Agents */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Swarm Agents</h3>
            </div>
            <button
              onClick={() => onNavigate('agents')}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              View Agent Logs →
            </button>
          </div>

          <div className="space-y-3">
            {(['SCOUT', 'DIAGNOSTIC', 'SYNTHESIZER', 'VERIFIER', 'EDGE'] as const).map((agentKey) => {
              const a = agents[agentKey];
              const isWorking = a.status === 'ANALYZING' || a.status === 'SYNTHESIZING' || a.status === 'VERIFYING';
              return (
                <div
                  key={agentKey}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>{a.name}</span>
                      {isWorking && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {a.lastAction}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                    a.status === 'ACTIVE' 
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                      : isWorking
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 animate-pulse'
                      : a.status === 'BLOCKED'
                      ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Transactions Stream Preview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Traffic Stream</h3>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              Full Transaction Table →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <th className="py-2 px-3">TXN ID</th>
                  <th className="py-2 px-3">PARTICIPANT</th>
                  <th className="py-2 px-3 text-right">AMOUNT</th>
                  <th className="py-2 px-3">SCHEMA</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3 text-right">LATENCY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {transactions.slice(0, 6).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-cyan-300 font-medium">{t.id}</td>
                    <td className="py-2.5 px-3 text-slate-200">{t.participant}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-100">
                      ₹{t.amount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] truncate max-w-[120px]">
                      {t.schemaVersion}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        t.status === 'SUCCESS' 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                          : t.status === 'RETRIED'
                          ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                          : t.status === 'HEALING'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                          : 'bg-red-950/60 text-red-400 border border-red-800/40'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-400">
                      {t.latencyMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
