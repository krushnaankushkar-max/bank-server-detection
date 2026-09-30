import React from 'react';
import { useDpi } from '../context/DpiContext';
import { 
  GitCompare, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CANONICAL_DPI_SCHEMA, EXPECTED_CANONICAL_KEYS } from '../schema-engine/canonical';

export const SchemaDiffView: React.FC = () => {
  const { currentDiffReport, activeIncident, simulationState } = useDpi();

  // If no diff report is cached yet, provide a baseline representative diff for demonstration
  const diffItems = currentDiffReport?.items || [
    {
      canonicalKey: 'payer_vpa',
      receivedKey: 'vpa_id',
      typeExpected: 'string',
      typeReceived: 'string',
      sampleExpected: 'farmer@bank',
      sampleReceived: 'farmer@ruralbank',
      status: 'RENAMED',
      confidence: 0.98,
    },
    {
      canonicalKey: 'amount',
      receivedKey: 'txn_amount',
      typeExpected: 'decimal_string',
      typeReceived: 'string',
      sampleExpected: '450.00',
      sampleReceived: '450.00',
      status: 'RENAMED',
      confidence: 0.99,
    },
    {
      canonicalKey: 'currency',
      receivedKey: 'currency',
      typeExpected: 'string',
      typeReceived: 'string',
      sampleExpected: 'INR',
      sampleReceived: 'INR',
      status: 'MATCH',
      confidence: 1.0,
    },
    {
      canonicalKey: 'auth_ref',
      receivedKey: 'reference_no',
      typeExpected: 'alphanumeric',
      typeReceived: 'string',
      sampleExpected: 'TXN_991823',
      sampleReceived: 'TXN_991823',
      status: 'RENAMED',
      confidence: 0.95,
    },
    {
      canonicalKey: 'timestamp',
      receivedKey: 'timestamp',
      typeExpected: 'iso_timestamp',
      typeReceived: 'string',
      sampleExpected: '2026-10-01T12:30:00Z',
      sampleReceived: '2026-10-01T12:30:00Z',
      status: 'MATCH',
      confidence: 1.0,
    },
  ];

  const participant = activeIncident?.participant || simulationState.activeParticipant || 'RuralBank-X';
  const humanExplanation = currentDiffReport?.humanExplanation || 
    `Participant '${participant}' modified its outbound payment payload format. Key names deviate from the Central Switch schema contract: 'payer_vpa' was received as 'vpa_id', 'amount' as 'txn_amount', and 'auth_ref' as 'reference_no'.`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Schema Difference & Contract Analysis</h2>
          <p className="text-xs text-slate-400">
            Semantic key alignment between DPI Canonical Contract v1.0 and inbound participant payloads.
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400 px-3 py-1 rounded bg-slate-900 border border-slate-800">
          Target: {participant}
        </div>
      </div>

      {/* Human-Readable Diagnostic Summary */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="block text-white font-semibold mb-1">Diagnostic Agent Analysis:</strong>
          {humanExplanation}
        </div>
      </div>

      {/* Visual Developer-Tool Side-by-Side Schema Diff Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm overflow-hidden">
        <div className="text-xs font-mono text-slate-400 mb-4 flex items-center justify-between">
          <span className="font-semibold text-slate-200">CANONICAL DPI v1.0 CONTRACT</span>
          <span className="text-cyan-400">← INCOMING PARTICIPANT PAYLOAD</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3 px-4">EXPECTED CANONICAL KEY</th>
                <th className="py-3 px-4 text-center">MAPPING DIRECTION</th>
                <th className="py-3 px-4">RECEIVED PAYLOAD KEY</th>
                <th className="py-3 px-4">TYPE CHECK</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {diffItems.map((item) => {
                const isMatch = item.status === 'MATCH';
                const isRenamed = item.status === 'RENAMED';
                const isMissing = item.status === 'MISSING';

                return (
                  <tr key={item.canonicalKey} className="hover:bg-slate-850/50 transition-colors">
                    {/* Expected Canonical Key */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-emerald-400">{item.canonicalKey}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({CANONICAL_DPI_SCHEMA[item.canonicalKey as keyof typeof CANONICAL_DPI_SCHEMA]?.type || item.typeExpected})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                        Ex: {item.sampleExpected}
                      </div>
                    </td>

                    {/* Mapping Arrow */}
                    <td className="py-3 px-4 text-center">
                      {isRenamed ? (
                        <div className="inline-flex items-center gap-1 text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span className="text-[10px]">maps to</span>
                        </div>
                      ) : isMatch ? (
                        <span className="text-slate-500 text-xs">≡ match</span>
                      ) : (
                        <span className="text-red-400 text-xs font-bold">∅ missing</span>
                      )}
                    </td>

                    {/* Received Payload Key */}
                    <td className="py-3 px-4">
                      {item.receivedKey ? (
                        <div>
                          <span className={`font-bold ${isRenamed ? 'text-amber-300' : 'text-slate-300'}`}>
                            {item.receivedKey}
                          </span>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            Val: {String(item.sampleReceived)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-400 font-semibold italic">Not Provided</span>
                      )}
                    </td>

                    {/* Type Check */}
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      <span>{item.typeExpected}</span>
                      {item.typeReceived && item.typeReceived !== item.typeExpected && (
                        <span className="text-amber-400 ml-1">≠ {item.typeReceived}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        isMatch
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isRenamed
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {Math.round(item.confidence * 100)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthesizer Proposed Mapping Preview */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Synthesizer Bijective Field Bindings</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          The synthesized adapter binds incoming fields to target canonical contract keys deterministically:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {diffItems
            .filter((i) => i.status === 'RENAMED' && i.receivedKey)
            .map((i) => (
              <div
                key={i.canonicalKey}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <span className="text-amber-300">{i.receivedKey}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-emerald-400">{i.canonicalKey}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
