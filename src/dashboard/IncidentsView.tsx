import React, { useState } from 'react';
import { useDpi } from '../context/DpiContext';
import { ViewTab } from './TopNav';
import { Incident } from '../types/dpi';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  GitCompare,
  Eye,
  Clock,
  Sparkles
} from 'lucide-react';

interface IncidentsViewProps {
  onNavigate: (tab: ViewTab) => void;
  onOpenAiDrawer: () => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ onNavigate, onOpenAiDrawer }) => {
  const { incidents, rollbackAdapter, restoreUpstreamSchema } = useDpi();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Incident Response Center</h2>
          <p className="text-xs text-slate-400">
            Autonomous schema contract violation detection, triage, and zero-downtime hot-patch history.
          </p>
        </div>
        <button
          onClick={onOpenAiDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 hover:text-white text-xs font-semibold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI About Incidents</span>
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Zero Active Incidents</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            All banking and fintech participants are operating within canonical DPI contract schemas. Use the Simulation Lab to inject simulated API contract drift.
          </p>
          <button
            onClick={() => onNavigate('simulation-lab')}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold cursor-pointer"
          >
            Open Simulation Lab →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {incidents.map((incident) => {
            const isMitigated = incident.status === 'MITIGATED';
            const isResolved = incident.status === 'RESOLVED';
            const isCritical = incident.status === 'OPEN' || incident.status === 'AUTO-HEALING';

            return (
              <div
                key={incident.id}
                className={`p-6 rounded-2xl bg-slate-900/80 border transition-all ${
                  isCritical
                    ? 'border-red-500/50 shadow-lg shadow-red-950/30'
                    : isMitigated
                    ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'border-slate-800 opacity-90'
                }`}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                      isCritical
                        ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                        : isMitigated
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {incident.status}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-semibold">{incident.id}</span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(incident.detectedAt).toLocaleTimeString()}</span>
                  </span>
                </div>

                {/* Title & Participant */}
                <h3 className="text-lg font-bold text-white mb-1">{incident.participant}</h3>
                <div className="text-xs text-slate-400 mb-4">{incident.title}</div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Failure Rate</span>
                    <span className="font-mono text-sm font-bold text-red-400 tabular-nums">
                      {incident.failureRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Affected Txns</span>
                    <span className="font-mono text-sm font-bold text-slate-200 tabular-nums">
                      {incident.affectedTransactions}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">MTTR</span>
                    <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                      {incident.mttrSeconds ? `~${incident.mttrSeconds}s` : 'Analyzing'}
                    </span>
                  </div>
                </div>

                {/* Diagnosis Summary if available */}
                {incident.diagnosis && (
                  <div className="mb-5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300">
                    <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                      <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Diagnosed Key Mappings:</span>
                    </div>
                    <div className="font-mono text-[11px] text-cyan-300">
                      {incident.diagnosis.diffs
                        .filter((d) => d.status === 'RENAMED')
                        .map((d) => `${d.receivedKey} → ${d.canonicalKey}`)
                        .join(' · ') || 'Exact field bindings verified'}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => onNavigate('schema-diff')}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer text-center"
                  >
                    Schema Diff
                  </button>
                  <button
                    onClick={() => onNavigate('verification')}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer text-center"
                  >
                    Run Verifier
                  </button>
                  <button
                    onClick={() => onNavigate('adapters')}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer text-center"
                  >
                    View Adapter
                  </button>

                  {isMitigated && (
                    <button
                      onClick={() => restoreUpstreamSchema(incident.participant)}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Simulate Upstream Fix & Retire Adapter</span>
                    </button>
                  )}

                  {!isResolved && (
                    <button
                      onClick={() => rollbackAdapter(incident.participant)}
                      className="w-full py-1.5 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 font-medium flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>Manual Rollback Adapter</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
