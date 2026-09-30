import React from 'react';
import { useDpi } from '../context/DpiContext';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Bot, 
  GitCompare, 
  CheckCircle2, 
  Layers, 
  FlaskConical, 
  Clock, 
  Terminal,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export type ViewTab = 
  | 'overview'
  | 'testing-dashboard'
  | 'simulation-lab'
  | 'transactions'
  | 'incidents'
  | 'agents'
  | 'schema-diff'
  | 'verification'
  | 'adapters'
  | 'mttr'
  | 'logs';

interface TopNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenAiDrawer: () => void;
  onReturnToLanding: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAiDrawer,
  onReturnToLanding,
}) => {
  const { stats, simulationState, runJudgeDemo, activeIncident, restoreUpstreamSchema } = useDpi();

  const navItems: { id: ViewTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'testing-dashboard', label: 'Testing Dashboard', icon: <FlaskConical className="w-4 h-4 text-emerald-400" /> },
    { id: 'simulation-lab', label: 'Simulation Lab', icon: <FlaskConical className="w-4 h-4 text-cyan-400" /> },
    { id: 'transactions', label: 'Live Transactions', icon: <Layers className="w-4 h-4" /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" />, badge: stats.activeIncidents },
    { id: 'agents', label: 'AI Agents', icon: <Bot className="w-4 h-4" /> },
    { id: 'schema-diff', label: 'Schema Diff', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'verification', label: 'Safety Verifier', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'adapters', label: 'Adapters', icon: <Layers className="w-4 h-4" />, badge: stats.activeAdapters },
    { id: 'mttr', label: 'MTTR Metrics', icon: <Clock className="w-4 h-4" /> },
    { id: 'logs', label: 'System Logs', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner if Active Incident or Safety Block */}
      {simulationState.isBlockedBySafety && (
        <div className="bg-red-950/80 border-b border-red-800/80 px-4 py-2 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-red-400">🚫 INVARIANT VIOLATION BLOCKED:</span>
            <span>{simulationState.blockedReason || 'Adapter deployment halted by Safety Verifier. Central ledger protected.'}</span>
          </div>
          <button
            onClick={() => onSelectTab('verification')}
            className="text-red-300 underline hover:text-white font-medium ml-4 cursor-pointer"
          >
            Inspect Formal Invariants →
          </button>
        </div>
      )}

      {activeIncident && activeIncident.status === 'MITIGATED' && (
        <div className="bg-emerald-950/70 border-b border-emerald-800/60 px-4 py-1.5 text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Incident <strong>{activeIncident.id}</strong> mitigated via hot-patch adapter. Zero downtime active.
            </span>
          </div>
          <button
            onClick={() => restoreUpstreamSchema(activeIncident.participant)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-800/80 hover:bg-emerald-700 text-white font-medium text-xs cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Simulate Upstream Fix & Retire Adapter
          </button>
        </div>
      )}

      {/* Main Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onReturnToLanding}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            title="Return to Landing Page"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Self-Healing DPI Swarm</span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  DPI Gateway
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Zero-Downtime Schema Recovery</div>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    item.id === 'incidents' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => runJudgeDemo()}
            disabled={simulationState.judgeDemoActive}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
            title="Run complete 30-second automated judge demonstration"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${simulationState.judgeDemoActive ? 'animate-spin' : ''}`} />
            <span>{simulationState.judgeDemoActive ? 'Running Demo...' : 'Start Judge Demo'}</span>
          </button>

          <button
            onClick={onOpenAiDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-700/80 text-cyan-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Explainer</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-900 bg-slate-950/80">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              currentTab === item.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
