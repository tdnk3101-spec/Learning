'use client';

import React from 'react';
import {
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function GovernanceDashboardPage() {
  const categoryStats = [
    { code: 'ACAD-01', name: 'Academic Dishonesty & Plagiarism', count: 18, pct: 45, avgDays: 12.4 },
    { code: 'ACAD-02', name: 'Exam Irregularity & Devices', count: 7, pct: 17.5, avgDays: 14.1 },
    { code: 'COND-01', name: 'Disruptive Campus Conduct', count: 9, pct: 22.5, avgDays: 8.2 },
    { code: 'COND-02', name: 'Property & Lab Damage', count: 4, pct: 10, avgDays: 16.5 },
    { code: 'COND-03', name: 'Harassment & Safety', count: 2, pct: 5, avgDays: 18.0 },
  ];

  const totalDockets = categoryStats.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Governance &amp; Oversight
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">Aggregated Anonymized Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Due-Process Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Purely anonymized metrics for university senate, accreditation auditors, and dean oversight.
        </p>
      </div>

      {/* Privacy Segregation Notice */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Strict PII Redaction Guaranteed at Database Query Layer</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero student names, registration numbers, or individual case files are exposed to this endpoint.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
          FERPA &amp; Privacy Compliant
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Dockets (2026)</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalDockets}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Across 8 Academic Departments</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Avg. Turnaround Time</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">11.8 Days</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Well within statutory 21-day cap</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Quorum Adherence</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">100.0%</div>
          <p className="text-[11px] text-slate-500 mt-1">Zero proceedings without quorum</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Appeal Lodgment Rate</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">7.5%</div>
          <p className="text-[11px] text-slate-500 mt-1">3 of 40 orders appealed</p>
        </div>
      </div>

      {/* Offence Category Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Case Distribution by Institutional Category</h2>
            <p className="text-xs text-slate-500">Categorical incident volumes and average resolution timelines.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Academic Year 2026</span>
        </div>

        <div className="space-y-4">
          {categoryStats.map((cat) => (
            <div key={cat.code} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {cat.code}
                  </span>
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 font-medium text-[11px]">
                  <span>{cat.count} dockets ({cat.pct}%)</span>
                  <span>Avg. {cat.avgDays} days</span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${cat.pct * 1.8}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Procedural Rigor Compliance Standards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Notice of Charge Compliance
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            100% of respondents received formal notice with explicit 7-day representation windows prior to hearing scheduling.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Evidence Cryptographic Integrity
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Every evidentiary item sealed with SHA-256 upon intake. Audit ledger verified daily by automated cron engine.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Human Decision Exclusivity
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            System architectural guardrail confirmed: Zero decisions or sanction recommendations generated by automated models.
          </p>
        </div>
      </div>
    </div>
  );
}
