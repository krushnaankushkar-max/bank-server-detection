import React from 'react';
import { useDpi } from '../context/DpiContext';
import { 
  Clock, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  AlertTriangle,
  Info
} from 'lucide-react';

export const MttrComparisonView: React.FC = () => {
  const { stats } = useDpi();

  const stages = [
    {
      stage: '1. Anomaly Detection',
      traditional: '15 – 45 mins',
      traditionalDesc: 'Customer complaints, monitoring alerts trigger P1 on-call pager.',
      swarm: '1.2 sec',
      swarmDesc: 'Scout Agent aggregates 422 error clusters at edge in real time.',
      reduction: '99.9%',
    },
    {
      stage: '2. Triage & Schema Diff',
      traditional: '30 – 90 mins',
      traditionalDesc: 'Engineers inspect logs, compare documentation, call bank partner.',
      swarm: '0.7 sec',
      swarmDesc: 'Diagnostic Agent executes semantic key diffing and alias resolution.',
      reduction: '99.9%',
    },
    {
      stage: '3. Adapter Engineering',
      traditional: '45 – 120 mins',
      traditionalDesc: 'Developer writes middleware patch or hotfix release branch.',
      swarm: '0.6 sec',
      swarmDesc: 'Synthesizer Agent generates bijective mapping specification & code.',
      reduction: '99.9%',
    },
    {
      stage: '4. Safety & Invariant Checks',
      traditional: '30 – 60 mins',
      traditionalDesc: 'Peer code reviews, manual staging test, QA approval delays.',
      swarm: '0.8 sec',
      swarmDesc: 'Safety Verifier proves 6 formal mathematical invariants (SMT-style).',
      reduction: '99.9%',
    },
    {
      stage: '5. Gateway Deployment',
      traditional: '20 – 45 mins',
      traditionalDesc: 'CI/CD pipeline rollout, canary deployment, restart interruptions.',
      swarm: '0.4 sec',
      swarmDesc: 'Edge Injector hooks filter into live pipeline with ZERO downtime.',
      reduction: '99.9%',
    },
    {
      stage: '6. Transaction Remediation',
      traditional: 'Hours / Next Day',
      traditionalDesc: 'Manual database reconciliation or customer re-attempts.',
      swarm: '0.5 sec',
      swarmDesc: 'Automatic transaction replay through active edge hot-patch.',
      reduction: '100%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Mean Time to Remediation (MTTR) Comparison</h2>
          <p className="text-xs text-slate-400">
            Benchmarking traditional manual incident response against the Autonomous Self-Healing DPI Swarm.
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400 px-3 py-1 rounded bg-slate-900 border border-slate-800">
          Simulation Result: ~{stats.averageMttrSeconds}s MTTR
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <strong className="block text-white mb-0.5">Simulation Result Disclosure:</strong>
          These performance metrics are calculated within this simulated DPI sandbox environment for technical demonstration. Real-world physical networks include upstream bank approvals and cross-datacenter propagation latencies.
        </div>
      </div>

      {/* Top Level Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-red-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
              Traditional Incident Response
            </span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-white tracking-tight tabular-nums">
            2 – 6 Hours
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-stage manual cycle: On-call pages, war room coordination, reverse-engineering bank payloads, drafting emergency hotfixes, and scheduling gateway restart maintenance windows.
          </p>
          <div className="pt-3 border-t border-slate-800 text-xs text-red-300 font-mono">
            Downside: Failed transactions during outage, consumer distrust, manual settlements.
          </div>
        </div>

        {/* Autonomous Swarm */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-emerald-500/40 space-y-4 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Self-Healing DPI Swarm
            </span>
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-cyan-400 tracking-tight tabular-nums">
            ~{stats.averageMttrSeconds} Seconds
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Autonomous closed-loop: Scout anomaly detection → Semantic diagnosis → Deterministic synthesis → Formal safety verification → Edge hot-patch injection → Automated transaction retry.
          </p>
          <div className="pt-3 border-t border-slate-800 text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Gateway Restarts · Zero Invariant Compromise · Zero Downtime</span>
          </div>
        </div>
      </div>

      {/* Stage-by-Stage Breakdown Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Lifecycle Breakdown by Incident Stage
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3 px-4">INCIDENT STAGE</th>
                <th className="py-3 px-4 text-red-400 font-semibold">TRADITIONAL (MANUAL)</th>
                <th className="py-3 px-4 text-cyan-400 font-semibold">SELF-HEALING SWARM</th>
                <th className="py-3 px-4 text-right">REDUCTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {stages.map((stg) => (
                <tr key={stg.stage} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {stg.stage}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-red-300 font-bold block">{stg.traditional}</span>
                    <span className="text-[11px] text-slate-400">{stg.traditionalDesc}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-cyan-300 font-bold block">{stg.swarm}</span>
                    <span className="text-[11px] text-slate-300">{stg.swarmDesc}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold tabular-nums">
                    {stg.reduction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
