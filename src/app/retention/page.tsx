'use client';

import React from 'react';
import {
  CheckCircle2,
  Play,
  History,
  ShieldCheck,
} from 'lucide-react';
import { OFFENCE_CATEGORIES } from '@/lib/mock-data';
import { executeRetentionPurge, getCurrentPersona } from '@/lib/store';

export default function RetentionEnginePage() {
  const [isPurging, setIsPurging] = React.useState(false);
  const [purgeCompleted, setPurgeCompleted] = React.useState(false);
  const [purgedCount, setPurgedCount] = React.useState(0);

  const mockRetentionSchedule = [
    {
      caseRef: 'DISC-2023-00012',
      category: 'COND-01 (Campus Disorder)',
      retentionYears: 2,
      closedDate: '2023-09-01',
      expiryDate: '2025-09-01',
      status: 'EXPIRED — PENDING ANONYMIZED PURGE',
      isExpired: true,
    },
    {
      caseRef: 'DISC-2023-00045',
      category: 'ACAD-01 (Assessment Irregularity)',
      retentionYears: 3,
      closedDate: '2023-11-15',
      expiryDate: '2026-11-15',
      status: 'Active Retention (62 days remaining)',
      isExpired: false,
    },
    {
      caseRef: 'DISC-2026-00038',
      category: 'COND-01 (Disorderly Conduct)',
      retentionYears: 2,
      closedDate: '2026-09-02',
      expiryDate: '2028-09-02',
      status: 'Active Retention (720 days remaining)',
      isExpired: false,
    },
  ];

  const handleRunRetentionCron = async () => {
    setIsPurging(true);
    try {
      const res = await executeRetentionPurge(getCurrentPersona());
      setPurgedCount(res.purgedCount);
      setPurgeCompleted(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error executing retention purge');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Automated Lifecycle Engine
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Nightly Cron Purge Simulation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Retention &amp; Anonymization Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated hard-deletion of expired disciplinary files and migration to redacted, anonymized precedent indices.
          </p>
        </div>

        <button
          onClick={handleRunRetentionCron}
          disabled={isPurging}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Play className={`w-3.5 h-3.5 text-emerald-400 ${isPurging ? 'animate-spin' : ''}`} />
          {isPurging ? 'Executing Retention Purge...' : 'Trigger Daily Retention Cron'}
        </button>
      </div>

      {purgeCompleted && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm">Automated Retention Purge Completed Successfully</h3>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                1 expired case file was hard-deleted from storage. PII and student identifiers were permanently destroyed,
                generalized conduct facts were indexed to <strong>PrecedentIndex</strong>, and a tamper-evident audit record was logged.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
            {purgedCount} Docket Purged
          </span>
        </div>
      )}

      {/* Retention Schedule Policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {OFFENCE_CATEGORIES.slice(0, 3).map((cat) => (
          <div key={cat.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {cat.code}
              </span>
              <span className="font-bold text-emerald-700">{cat.retentionYears} Years Purge Clock</span>
            </div>
            <h4 className="font-bold text-slate-800 text-xs">{cat.name}</h4>
            <p className="text-[11px] text-slate-500 line-clamp-2">{cat.description}</p>
          </div>
        ))}
      </div>

      {/* Cases in Retention Clock */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Case Docket &amp; Categorical Retention Policy</span>
          <span>Expiry Date &amp; Purge Status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {mockRetentionSchedule.map((item, idx) => (
            <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {item.caseRef}
                  </span>
                  <span className="font-semibold text-slate-700">{item.category}</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Closed Date: {item.closedDate} · Retention Policy: {item.retentionYears} Years
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-mono">
                  Expiry: {item.expiryDate}
                </span>
                <span
                  className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase mt-1 ${
                    item.isExpired
                      ? 'bg-red-100 text-red-800 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
