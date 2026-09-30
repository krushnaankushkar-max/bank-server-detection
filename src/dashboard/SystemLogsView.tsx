import React, { useState } from 'react';
import { useDpi } from '../context/DpiContext';
import { AgentType } from '../types/dpi';
import { 
  Terminal, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Filter 
} from 'lucide-react';

export const SystemLogsView: React.FC = () => {
  const { logs, clearLogs } = useDpi();
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<'ALL' | AgentType>('ALL');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((l) => {
    if (selectedAgent !== 'ALL' && l.agent !== selectedAgent) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.message.toLowerCase().includes(q) ||
        l.agent.toLowerCase().includes(q) ||
        l.severity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.agent}] [${l.severity}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.agent}] [${l.severity}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dpi-swarm-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const agentPillColors: Record<AgentType, string> = {
    SCOUT: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
    DIAGNOSTIC: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
    SYNTHESIZER: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60',
    VERIFIER: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    EDGE: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    GATEWAY: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    SYSTEM: 'text-slate-300 bg-slate-800/60 border-slate-700/60',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>System Telemetry & Gateway Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time event stream from Scout, Diagnostic, Synthesizer, Verifier, and Edge Injector swarms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleExportLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Agent Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
          {(['ALL', 'SCOUT', 'DIAGNOSTIC', 'SYNTHESIZER', 'VERIFIER', 'EDGE', 'GATEWAY', 'SYSTEM'] as const).map((agentKey) => (
            <button
              key={agentKey}
              onClick={() => setSelectedAgent(agentKey)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedAgent === agentKey
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {agentKey}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search log messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-56"
          />
        </div>
      </div>

      {/* Terminal Display */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs shadow-2xl overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-850 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 font-semibold text-slate-300">dpi-swarm-kernel.log — bash stream</span>
          </div>
          <span className="text-[10px] text-slate-500 tabular-nums">
            Showing {filteredLogs.length} events
          </span>
        </div>

        {/* Log Entries Stream */}
        <div className="h-[520px] overflow-y-auto space-y-2 pr-2">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              Zero matching logs for this filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isError = log.severity === 'ERROR';
              const isWarn = log.severity === 'WARN';
              const isSuccess = log.severity === 'SUCCESS';

              return (
                <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/50 p-1.5 rounded leading-relaxed">
                  <span className="text-slate-500 tabular-nums shrink-0 text-[11px]">
                    [{log.timestamp}]
                  </span>

                  <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold shrink-0 ${agentPillColors[log.agent] || 'text-slate-400'}`}>
                    {log.agent}
                  </span>

                  <span className={`text-[11px] font-semibold shrink-0 ${
                    isError ? 'text-red-400' : isWarn ? 'text-amber-400' : isSuccess ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    [{log.severity}]
                  </span>

                  <span className={`text-xs ${
                    isError ? 'text-red-200' : isWarn ? 'text-amber-200' : isSuccess ? 'text-emerald-100' : 'text-slate-200'
                  }`}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
