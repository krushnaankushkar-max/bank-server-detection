import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Cpu, 
  GitCompare, 
  CheckCircle2, 
  Zap, 
  Lock, 
  Layers,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onEnterControlCenter: () => void;
  onRunLiveSimulation: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterControlCenter,
  onRunLiveSimulation,
}) => {
  const pipelineSteps = [
    {
      step: '01',
      title: 'Scout Detect',
      desc: 'Edge stream monitoring detects sudden HTTP 422 failure spikes and groups anomaly clusters by participant.',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
    },
    {
      step: '02',
      title: 'Diagnose Diff',
      desc: 'Semantic diffing isolates field renames, type shifts, or omitted contract keys in real-time.',
      icon: <GitCompare className="w-5 h-5 text-blue-400" />,
    },
    {
      step: '03',
      title: 'Synthesize Adapter',
      desc: 'Deterministic translation mappings are synthesized to bind unexpected payload schemas back to canonical DPI v1.0.',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
    },
    {
      step: '04',
      title: 'Safety Invariants',
      desc: 'SMT-style verification engine verifies financial value conservation, currency locks, and audit retention.',
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
    },
    {
      step: '05',
      title: 'Zero-Downtime Hot-Patch',
      desc: 'Verified adapters are hot-injected into gateway filters without stopping traffic or restarting nodes.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      step: '06',
      title: 'Auto-Retire & Rollback',
      desc: 'When upstream bank fixes its schema, the temporary adapter safely retires and closes the incident.',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Self-Healing DPI Swarm</span>
              <div className="text-xs text-slate-400">Autonomous API Schema Recovery for Digital Public Infrastructure</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRunLiveSimulation}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              Quick Demo
            </button>
            <button
              onClick={onEnterControlCenter}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer"
            >
              Enter Control Center →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex-1">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Zero-Downtime Middleware</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Simulated DPI Switch Environment</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 text-balance">
            Digital Infrastructure That <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Heals Itself.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed text-balance max-w-3xl mx-auto">
            An autonomous, safety-verified middleware swarm that detects API contract failures, 
            generates temporary adapters, and restores transaction continuity without downtime.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterControlCenter}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Control Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onRunLiveSimulation}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Live Simulation</span>
            </button>
          </div>

          <div className="mt-8 text-xs text-slate-500">
            Simulated environment for technical proof of concept. Not connected to production live financial systems.
          </div>
        </div>

        {/* Closed-Loop Autonomous Pipeline Architecture */}
        <div className="mt-8 pt-12 border-t border-slate-900">
          <div className="text-center mb-10">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold mb-2">
              Autonomous Pipeline Architecture
            </h2>
            <p className="text-2xl font-bold text-white">Closed-Loop Detect-to-Retire Lifecycle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelineSteps.map((s) => (
              <div
                key={s.step}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/60">
                    {s.icon}
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-500 group-hover:text-cyan-400 transition-colors">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Formal Invariants Badge Section */}
        <div className="mt-16 p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                Zero-Trust Verification Engine
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Never Blindly Execute AI Transformations
              </h3>
              <p className="text-sm text-slate-400 max-w-2xl">
                Every generated adapter is evaluated by an SMT-style deterministic rule engine against 6 strict mathematical invariants before deployment. If amount, currency, or audit references deviate, deployment is immediately blocked.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                ✓ Value Conservation
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                ✓ Currency Lock
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                ✓ Audit Preservation
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                ✓ Zero Injection
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                ✓ Completeness
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                ✓ Bijective Determinism
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>Self-Healing DPI Swarm · Autonomous Middleware for Digital Public Infrastructure</div>
          <div className="flex items-center gap-6">
            <span>Deterministic SMT Invariant Checking</span>
            <span>·</span>
            <span>Gemini 3.8 Flash Explainer</span>
            <span>·</span>
            <span>Zero-Downtime Edge Hot-Patching</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
