import React, { useState } from 'react';
import { useDpi } from '../context/DpiContext';
import { Transaction, TransactionStatus } from '../types/dpi';
import { 
  Search, 
  RotateCcw, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  Layers
} from 'lucide-react';

export const LiveTransactionsView: React.FC = () => {
  const { transactions, retryTransaction, toggleAutoTraffic, simulationState } = useDpi();
  const [filter, setFilter] = useState<'ALL' | TransactionStatus>('ALL');
  const [search, setSearch] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    if (filter !== 'ALL' && t.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.participant.toLowerCase().includes(q) ||
        t.amount.includes(q) ||
        (t.errorReason && t.errorReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Segmented Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          {(['ALL', 'SUCCESS', 'FAILED', 'HEALING', 'RETRIED'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search & Auto-traffic Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search txn ID, bank, amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          <button
            onClick={toggleAutoTraffic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
              simulationState.autoTrafficEnabled
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Traffic Stream: {simulationState.autoTrafficEnabled ? 'LIVE' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3 px-4">TRANSACTION ID</th>
                <th className="py-3 px-4">PARTICIPANT</th>
                <th className="py-3 px-4 text-right">AMOUNT (INR)</th>
                <th className="py-3 px-4">CONTRACT SCHEMA</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">LATENCY</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-cyan-300">
                      {t.id}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {t.participant}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-100 font-semibold">
                      ₹{t.amount}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {t.schemaVersion}
                      {t.adapterUsed && (
                        <span className="ml-1.5 px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[10px]">
                          {t.adapterUsed}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        t.status === 'SUCCESS'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : t.status === 'RETRIED'
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                          : t.status === 'HEALING'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-red-950/80 text-red-400 border border-red-800/60'
                      }`}>
                        {t.status} ({t.httpStatus})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-400">
                      {t.latencyMs}ms
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] tabular-nums">
                      {new Date(t.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTxn(t)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Inspect raw and transformed payloads"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {t.status === 'FAILED' && (
                          <button
                            onClick={() => retryTransaction(t.id)}
                            className="p-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                            title="Retry transaction through active adapter"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Inspector Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  selectedTxn.status === 'SUCCESS' || selectedTxn.status === 'RETRIED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  HTTP {selectedTxn.httpStatus}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">{selectedTxn.id}</h3>
                  <div className="text-xs text-slate-400">
                    Participant: <strong className="text-slate-200">{selectedTxn.participant}</strong> · Amount: ₹{selectedTxn.amount}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {selectedTxn.errorReason && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-red-300">Schema Validation Error (HTTP 422):</strong>
                    <span>{selectedTxn.errorReason}</span>
                  </div>
                </div>
              )}

              {selectedTxn.adapterUsed && (
                <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-xs text-cyan-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Successfully adapted via Zero-Downtime Edge Hot-Patch <strong>{selectedTxn.adapterUsed}</strong>.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Received Payload */}
                <div>
                  <div className="text-xs font-mono font-semibold text-slate-300 mb-2 flex items-center justify-between">
                    <span>ORIGINAL RECEIVED PAYLOAD</span>
                    <span className="text-[10px] text-slate-400">Source Format</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
                    {JSON.stringify(selectedTxn.rawPayload, null, 2)}
                  </pre>
                </div>

                {/* Transformed Output Payload */}
                <div>
                  <div className="text-xs font-mono font-semibold text-slate-300 mb-2 flex items-center justify-between">
                    <span>CANONICAL DPI PAYLOAD</span>
                    <span className="text-[10px] text-slate-400">Gateway Target Format</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                    {selectedTxn.transformedPayload
                      ? JSON.stringify(selectedTxn.transformedPayload, null, 2)
                      : JSON.stringify(selectedTxn.rawPayload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Transaction Execution Metadata */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Processing Time</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedTxn.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Timestamp</span>
                  <span className="font-mono text-slate-200">{new Date(selectedTxn.timestamp).toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gateway Settlement</span>
                  <span className="font-mono text-slate-200 font-semibold">
                    {selectedTxn.httpStatus === 200 ? 'CLEARED' : 'REJECTED'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Currency</span>
                  <span className="font-mono text-slate-200">INR</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Idempotency Auth: {selectedTxn.rawPayload.auth_ref || selectedTxn.rawPayload.reference_no || 'N/A'}
              </span>
              <div className="flex items-center gap-2">
                {selectedTxn.status === 'FAILED' && (
                  <button
                    onClick={() => {
                      retryTransaction(selectedTxn.id);
                      setSelectedTxn(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Transaction</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
