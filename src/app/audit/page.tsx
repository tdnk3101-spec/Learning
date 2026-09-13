'use client';

import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { getAuditLogs, simulateAuditTamper, restoreAuditLedger } from '@/lib/store';
import { verifyAuditChain, VerificationResult } from '@/lib/audit';

export default function AuditLogPage() {
  const [logs, setLogs] = React.useState(getAuditLogs());
  const [verificationResult, setVerificationResult] = React.useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    verifyAuditChain(logs).then((res) => {
      if (isMounted) {
        setVerificationResult(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [logs]);

  const handleManualReverify = async () => {
    setIsVerifying(true);
    const result = await verifyAuditChain(logs);
    setVerificationResult(result);
    setIsVerifying(false);
  };

  const handleSimulateTamper = () => {
    if (logs.length > 1) {
      simulateAuditTamper(1);
      setLogs([...getAuditLogs()]);
    }
  };

  const handleRestoreLedger = async () => {
    setIsVerifying(true);
    const restored = await restoreAuditLedger();
    setLogs(restored);
    const result = await verifyAuditChain(restored);
    setVerificationResult(result);
    setIsVerifying(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Tamper-Evident Architecture
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Append-Only SHA-256 Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cryptographic Audit Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every case mutation, notice dispatch, and decision is cryptographically chained to guarantee procedural integrity.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {verificationResult && !verificationResult.isValid && (
            <button
              onClick={handleRestoreLedger}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 animate-bounce"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Restore &amp; Seal Ledger
            </button>
          )}

          <button
            onClick={handleSimulateTamper}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
            title="Simulates an attacker trying to alter a database row directly"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            Simulate DB Tamper Demo
          </button>

          <button
            onClick={handleManualReverify}
            disabled={isVerifying}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            Re-verify Full Chain
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationResult && (
        <div
          className={`p-5 rounded-2xl border shadow-xs flex items-start justify-between gap-4 transition-all ${
            verificationResult.isValid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950 animate-pulse'
          }`}
        >
          <div className="flex items-start gap-3">
            {verificationResult.isValid ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1 text-xs">
              <h3 className="text-sm font-bold">
                {verificationResult.isValid
                  ? 'Cryptographic Chain Valid & Verified'
                  : 'INTEGRITY BREACH DETECTED: TAMPERED AUDIT BLOCK'}
              </h3>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {verificationResult.isValid
                  ? `All ${verificationResult.totalEntries} sequential audit entries have been recalculated from Genesis to Head. Every SHA-256 digest links mathematically without alteration.`
                  : verificationResult.failureReason}
              </p>
            </div>
          </div>

          <span
            className={`font-mono text-xs font-bold px-3 py-1 rounded-full uppercase shrink-0 ${
              verificationResult.isValid
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-200 text-red-900'
            }`}
          >
            {verificationResult.isValid ? 'Chain 100% Intact' : 'Tamper Alarm Active'}
          </span>
        </div>
      )}

      {/* Audit Log Entries List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Sequential Block Index &amp; Timestamp</span>
          <span>Cryptographic Hash Linkage (prevHash &rarr; currHash)</span>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.map((entry, idx) => (
            <div key={entry.id} className="p-5 space-y-3 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Block #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{entry.action}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 font-medium">Actor: {entry.actorName}</span>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {entry.actorRole}
                  </span>
                  {entry.caseId && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Ref: {entry.caseId}
                    </span>
                  )}
                </div>

                <span className="font-mono text-[10px] text-slate-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {entry.details}
              </p>

              {/* Cryptographic Link Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[10px] font-mono">
                <div className="p-2 rounded-lg bg-slate-100/70 border border-slate-200 truncate">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Previous Block Hash:</span>
                  <span className="text-slate-600">{entry.prevHash}</span>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 truncate">
                  <span className="text-emerald-700 block text-[9px] uppercase font-bold">Current Sealed Digest:</span>
                  <span className="text-emerald-900 font-semibold">{entry.currHash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
