import React, { useState } from 'react';
import { useDpi } from '../context/DpiContext';
import { Adapter } from '../types/dpi';
import { 
  Layers, 
  Code, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Terminal,
  Activity
} from 'lucide-react';

export const ActiveAdaptersView: React.FC = () => {
  const { adapters, rollbackAdapter } = useDpi();
  const [selectedAdapter, setSelectedAdapter] = useState<Adapter | null>(null);
  const [testPayload, setTestPayload] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);

  const handleOpenCode = (adapter: Adapter) => {
    setSelectedAdapter(adapter);
    setTestPayload(JSON.stringify({
      vpa_id: 'farmer.demo@ruralbank',
      txn_amount: '450.00',
      currency: 'INR',
      reference_no: 'TXN_TEST_1029',
      timestamp: new Date().toISOString(),
    }, null, 2));
    setTestResult(null);
  };

  const handleRunTest = () => {
    if (!selectedAdapter) return;
    try {
      const parsed = JSON.parse(testPayload);
      const output: Record<string, any> = {};
      for (const [fromKey, toKey] of Object.entries(selectedAdapter.mappings)) {
        if (fromKey in parsed) output[toKey] = parsed[fromKey];
      }
      ['payer_vpa', 'amount', 'currency', 'auth_ref', 'timestamp'].forEach((k) => {
        if (k in parsed && !(k in output)) output[k] = parsed[k];
      });
      setTestResult(output);
    } catch (e: any) {
      setTestResult({ error: `Invalid JSON syntax: ${e.message}` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Edge Adapter Registry</h2>
          <p className="text-xs text-slate-400">
            Ephemeral translation filters mounted at the API Gateway edge. Zero downtime, zero gateway restarts.
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400 px-3 py-1 rounded bg-slate-900 border border-slate-800">
          Total Mounted: {adapters.filter((a) => a.status === 'ACTIVE').length} Active
        </div>
      </div>

      {/* Registry Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3 px-4">ADAPTER ID</th>
                <th className="py-3 px-4">PARTICIPANT</th>
                <th className="py-3 px-4">SCHEMA VERSION</th>
                <th className="py-3 px-4">CREATED</th>
                <th className="py-3 px-4">GATEWAY STATUS</th>
                <th className="py-3 px-4">VERIFICATION</th>
                <th className="py-3 px-4">LIFECYCLE</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {adapters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No edge adapters currently deployed. When schema drift occurs, adapters are synthesized and mounted autonomously.
                  </td>
                </tr>
              ) : (
                adapters.map((adp) => {
                  const isActive = adp.status === 'ACTIVE';
                  const isRetiring = adp.status === 'RETIRING';

                  return (
                    <tr key={adp.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                        {adp.id}
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-medium">
                        {adp.participant}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {adp.schemaVersion} → {adp.targetVersion}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                        {new Date(adp.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : isRetiring
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {adp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          adp.verificationStatus === 'PASSED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-red-950/60 text-red-400 border border-red-800/60'
                        }`}>
                          {adp.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {adp.isTemporary ? 'Temporary (Auto-Retire)' : 'Permanent'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenCode(adp)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Inspect & Test</span>
                          </button>
                          {isActive && (
                            <button
                              onClick={() => rollbackAdapter(adp.participant)}
                              className="p-1 rounded bg-red-950 hover:bg-red-900 text-red-300 hover:text-white cursor-pointer"
                              title="Manual Rollback"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Inspector & Test Runner Modal */}
      {selectedAdapter && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center">
                  <Code className="w-4 h-4 text-cyan-400" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">{selectedAdapter.id} Specification</h3>
                  <div className="text-xs text-slate-400">
                    Participant: <strong>{selectedAdapter.participant}</strong> · Status: {selectedAdapter.status}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdapter(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Generated Adapter Code */}
              <div>
                <div className="text-xs font-mono font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span>AUTONOMOUSLY GENERATED EDGE TRANSFORMATION HOOK</span>
                  <span className="text-[10px] text-emerald-400">Verified Deterministic</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                  {selectedAdapter.transformFnCode}
                </pre>
              </div>

              {/* Interactive Test Sandbox */}
              <div className="pt-4 border-t border-slate-800">
                <div className="text-xs font-mono font-semibold text-white mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Adapter Sandbox (Test Live Transformation)</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Edit the input test payload and execute transformation against the compiled adapter:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">Inbound Test Payload (JSON)</span>
                    <textarea
                      rows={7}
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={handleRunTest}
                      className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Test Transformation</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">Transformed Output Result</span>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 h-[178px] overflow-auto">
                      {testResult ? JSON.stringify(testResult, null, 2) : '// Click "Run Test Transformation" to view output'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
              <button
                onClick={() => setSelectedAdapter(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
