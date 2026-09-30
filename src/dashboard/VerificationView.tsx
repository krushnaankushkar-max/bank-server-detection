import React from 'react';
import { useDpi } from '../context/DpiContext';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Terminal, 
  Scale, 
  Coins, 
  FileKey, 
  KeyRound, 
  FileCheck,
  AlertOctagon
} from 'lucide-react';

export const VerificationView: React.FC = () => {
  const { currentVerificationReport, simulationState, activeIncident } = useDpi();

  const report = currentVerificationReport;
  const isBlocked = simulationState.isBlockedBySafety || (report && !report.passed);

  const ruleIcons: Record<string, React.ReactNode> = {
    'RULE-1': <Scale className="w-5 h-5 text-amber-400" />,
    'RULE-2': <Coins className="w-5 h-5 text-yellow-400" />,
    'RULE-3': <FileKey className="w-5 h-5 text-blue-400" />,
    'RULE-4': <Lock className="w-5 h-5 text-red-400" />,
    'RULE-5': <FileCheck className="w-5 h-5 text-emerald-400" />,
    'RULE-6': <KeyRound className="w-5 h-5 text-indigo-400" />,
  };

  // Fallback default rules if no run yet
  const displayedInvariants = report?.invariants || [
    {
      ruleId: 'RULE-1',
      name: 'Financial Value Conservation',
      description: 'Monetary amount value must remain invariant under transformation (450.00 → 450.00).',
      passed: true,
      expected: '₹450.00',
      actual: '₹450.00',
      formalInvariant: '∀p ∈ Payloads: Val(p.src_amount) = Val(p.dst_amount)',
      severity: 'FATAL',
    },
    {
      ruleId: 'RULE-2',
      name: 'Currency Conservation',
      description: 'Transaction currency cannot be modified or converted (strictly INR domestic switch).',
      passed: true,
      expected: 'INR',
      actual: 'INR',
      formalInvariant: '∀p ∈ Payloads: IsoCode(p.dst_currency) ≡ "INR"',
      severity: 'FATAL',
    },
    {
      ruleId: 'RULE-3',
      name: 'Sensitive Data & Audit Preservation',
      description: 'Cryptographic authorization tokens (auth_ref) must never be dropped or cleared.',
      passed: true,
      expected: 'TXN_* settlement token',
      actual: 'TXN_991823',
      formalInvariant: '∀p ∈ Payloads: NonEmpty(p.auth_ref) ∧ Defined(p.idempotency_key)',
      severity: 'FATAL',
    },
    {
      ruleId: 'RULE-4',
      name: 'No Unauthorized Field Injection',
      description: 'Synthesizer is strictly barred from injecting unverified privileged attributes.',
      passed: true,
      expected: 'Zero privileged fields',
      actual: 'CLEAN',
      formalInvariant: '∀k ∈ Keys(p.dst): k ∉ PrivilegedAdministrativeAttributes',
      severity: 'FATAL',
    },
    {
      ruleId: 'RULE-5',
      name: 'Schema Completeness & Contract Validity',
      description: 'All 5 mandatory DPI canonical contract fields must be fully populated.',
      passed: true,
      expected: 'payer_vpa, amount, currency, auth_ref, timestamp',
      actual: 'ALL KEYS SATISFIED',
      formalInvariant: '∀k ∈ CanonicalRequiredKeys: Defined(p.dst[k]) ∧ TypeValid(p.dst[k])',
      severity: 'FATAL',
    },
    {
      ruleId: 'RULE-6',
      name: 'Deterministic Mapping (Bijection)',
      description: 'Key bindings must be injective and deterministic without duplicate targets.',
      passed: true,
      expected: 'Bijective 1:1 mapping',
      actual: 'BIJECTIVE',
      formalInvariant: '∀k1, k2 ∈ Dom(Adapter): Adapter(k1) = Adapter(k2) ⟹ k1 = k2',
      severity: 'FATAL',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Formal Safety Verification Engine</h2>
          <p className="text-xs text-slate-400">
            SMT-style deterministic invariant checker ensuring zero AI-generated logic is executed blindly.
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
          Status: {isBlocked ? (
            <span className="text-red-400 font-bold">VERIFICATION BLOCKED</span>
          ) : (
            <span className="text-emerald-400 font-bold">ALL INVARIANTS PASS</span>
          )}
        </div>
      </div>

      {/* Prominent Safety Block Alert Banner if Invariants Failed */}
      {isBlocked && (
        <div className="p-6 rounded-2xl bg-red-950/80 border-2 border-red-500 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-900/60 border border-red-700 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-7 h-7 text-red-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                🚫 SELF-HEALING BLOCKED BY SAFETY VERIFIER
              </h3>
              <p className="text-sm text-red-200 mb-3">
                {simulationState.blockedReason ||
                  'Critical Invariant Breach: Financial value conservation was violated. Deployment of translation adapter to live API Gateway has been strictly halted to prevent ledger corruption.'}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-900/80 border border-red-600 text-xs font-mono text-white">
                <ShieldAlert className="w-4 h-4 text-red-300" />
                <span>Zero financial transactions processed with altered amounts. Swarm protected central switch.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Summary Banner if Passed */}
      {!isBlocked && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Verification Engine Verdict: ALL 6 INVARIANTS PASSED</h3>
              <p className="text-xs text-emerald-300/80">
                Mathematical proof satisfied. Adapter is certified safe for zero-downtime hot-patching.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-600">
            PASSED ✓
          </span>
        </div>
      )}

      {/* 6 Formal Rules Invariant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedInvariants.map((rule) => {
          const icon = ruleIcons[rule.ruleId] || <CheckCircle2 className="w-5 h-5 text-cyan-400" />;

          return (
            <div
              key={rule.ruleId}
              className={`p-6 rounded-2xl bg-slate-900/80 border transition-all ${
                rule.passed
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-red-500 bg-red-950/30 shadow-lg shadow-red-950/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                    {icon}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">{rule.ruleId}</span>
                    <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                  rule.passed
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                }`}>
                  {rule.passed ? 'PASS ✓' : 'FAIL ✗'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">{rule.description}</p>

              {/* Invariant Formula & Evidence */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Formal Invariant</span>
                  <code className="text-[11px] font-mono text-cyan-300 font-semibold">{rule.formalInvariant}</code>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Expected Baseline</span>
                    <span className="font-mono text-slate-300 font-semibold">{rule.expected}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Evaluated Value</span>
                    <span className={`font-mono font-semibold ${rule.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                      {rule.actual}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SMT-LIB2 Symbolic Proof Representation */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              SMT-LIB2 Solver Invariant Specification
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Logic: QF_LIRA</span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          The safety engine formulates the adapter transformation as an SMT problem. An invariant holds when the negated constraint delta is <strong className="text-cyan-300">UNSAT</strong> (no counter-example exists).
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
          {report?.smtProofRepresentation || `(set-logic QF_LIRA)
; Formal Verification SMT-LIB2 Representation
(declare-const src_amount Real)
(declare-const dst_amount Real)
(declare-const delta Real)
(assert (= src_amount 450.0))
(assert (= dst_amount 450.0))
(assert (= delta (- dst_amount src_amount)))
; Invariant 1: Delta must be exactly zero
(assert (not (= delta 0.0)))
(check-sat)
; Result: UNSAT (No counter-example exists. Safety Invariants Hold.)`}
        </pre>
      </div>
    </div>
  );
};
