import React from 'react';
import { useDpi } from '../context/DpiContext';
import { 
  Bot, 
  Cpu, 
  GitCompare, 
  Layers, 
  CheckCircle2, 
  Zap, 
  Activity, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const AgentsView: React.FC = () => {
  const { agents, logs, simulationState } = useDpi();

  const agentCards = [
    {
      agent: agents.SCOUT,
      role: 'Continuous API Traffic Anomaly Monitor',
      description: 'Ingests real-time transaction telemetry, identifies HTTP 422 failure clusters, groups anomalies by participant, and triggers incident triage.',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/30',
    },
    {
      agent: agents.DIAGNOSTIC,
      role: 'Contract Difference & Semantic Diff Reasoner',
      description: 'Compares failing inbound payloads against canonical DPI specifications. Discovers field renames, type shifts, and missing settlement keys.',
      icon: <GitCompare className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/30',
    },
    {
      agent: agents.SYNTHESIZER,
      role: 'Deterministic Translation Adapter Generator',
      description: 'Generates bijective schema mapping specifications and TypeScript/JavaScript transform code to adapt drifted payloads to canonical DPI format.',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/30',
    },
    {
      agent: agents.VERIFIER,
      role: 'Zero-Trust Safety & Formal Invariant Engine',
      description: 'Evaluates all proposed adapters against 6 formal mathematical safety invariants. Halts deployment if monetary amounts, currencies, or audits deviate.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30',
    },
    {
      agent: agents.EDGE,
      role: 'Zero-Downtime Hot-Patch Edge Injector',
      description: 'Compiles and injects verified translation filters into the live API gateway request pipeline with zero restart and 0ms downtime.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Title */}
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">AI Agent Swarm Architecture</h2>
        <p className="text-xs text-slate-400">
          Decoupled, specialized autonomous agents cooperating to achieve zero-downtime DPI self-healing.
        </p>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentCards.map(({ agent, role, description, icon, color }) => {
          const isWorking = agent.status === 'ANALYZING' || agent.status === 'SYNTHESIZING' || agent.status === 'VERIFYING';
          return (
            <div
              key={agent.type}
              className={`p-6 rounded-2xl bg-slate-900/80 border ${color} shadow-sm flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
                    {icon}
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    agent.status === 'ACTIVE'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : isWorking
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 animate-pulse'
                      : agent.status === 'BLOCKED'
                      ? 'bg-red-950/80 text-red-400 border border-red-800/60'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{agent.name}</h3>
                <div className="text-xs font-medium text-cyan-400 mb-2">{role}</div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Last Activity:</span>
                  <span className="font-mono text-slate-300">{agent.lastTimestamp}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 truncate">
                  {agent.lastAction}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Event Stream Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Swarm Coordination Timeline</h3>
          </div>
          <span className="text-xs text-slate-400">Live Telemetry Feed</span>
        </div>

        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {logs.slice(0, 8).map((log, index) => {
            const isError = log.severity === 'ERROR';
            const isWarn = log.severity === 'WARN';
            const isSuccess = log.severity === 'SUCCESS';

            return (
              <div key={log.id} className="relative group">
                {/* Node dot */}
                <span className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  isError ? 'bg-red-500' : isWarn ? 'bg-amber-400' : isSuccess ? 'bg-emerald-400' : 'bg-cyan-400'
                }`} />

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 group-hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {log.agent}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${
                        isError ? 'text-red-400' : isWarn ? 'text-amber-400' : isSuccess ? 'text-emerald-400' : 'text-cyan-400'
                      }`}>
                        [{log.severity}]
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">{log.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
