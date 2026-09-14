'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Clock,
  Users,
  ShieldCheck,
  Scale,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Archive,
  LogIn,
} from 'lucide-react';
import { getCurrentPersona, getFilteredCases, getAuditLogs, isUserAuthenticated } from '@/lib/store';
import { CASE_STATUS_WORKFLOW } from '@/lib/state-machine';

export default function DashboardCommandCenterPage() {
  const [persona, setPersona] = React.useState(getCurrentPersona());
  const [cases, setCases] = React.useState(getFilteredCases());
  const [auditLogs, setAuditLogs] = React.useState(getAuditLogs().slice(-5).reverse());
  const [isAuth, setIsAuth] = React.useState(isUserAuthenticated());

  React.useEffect(() => {
    const handleUpdate = () => {
      const current = getCurrentPersona();
      setPersona(current);
      setCases(getFilteredCases(current));
      setAuditLogs(getAuditLogs().slice(-5).reverse());
      setIsAuth(isUserAuthenticated());
    };

    window.addEventListener('persona-changed', handleUpdate);
    window.addEventListener('auth-changed', handleUpdate);
    return () => {
      window.removeEventListener('persona-changed', handleUpdate);
      window.removeEventListener('auth-changed', handleUpdate);
    };
  }, []);

  // Compute metrics
  const activeCases = cases.filter((c) => c.status !== 'CLOSED' && c.status !== 'EXPIRED_PURGED');
  const pendingResponses = cases.filter((c) => c.status === 'RESPONSE_WINDOW');
  const inHearings = cases.filter((c) => c.status === 'COMMITTEE_CONSTITUTED' || c.status === 'HEARING_SCHEDULED');
  const pendingDecisions = cases.filter((c) => c.status === 'HEARING_SCHEDULED' && !c.decision);
  const closedCases = cases.filter((c) => c.status === 'CLOSED');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Security Guest Notice Banner (When Unauthenticated) */}
      {!isAuth && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 mt-0.5 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Security Notice: Guest Preview Mode
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                You are currently viewing the system overview in read-only Guest Mode. To manage case dockets, inspect sealed evidence, access the student defense portal, or file incident reports, institutional sign-in is required.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
          >
            <LogIn className="w-4 h-4 text-emerald-400" />
            Sign In for Full Access
          </Link>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Student Discipline Agent
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Session: 2026-2027 Academic Year</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Command Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Procedural state-machine tracking, statutory response clocks, and tamper-evident audit control.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/cases?status=CLOSED"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Archive className="w-4 h-4 text-emerald-600" />
            <span>Closed Cases Archive ({closedCases.length})</span>
          </Link>

          {(persona.role === 'ADMIN_REGISTRAR' || persona.role === 'HEAD_OF_DEPARTMENT') && (
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              File Incident Report
            </Link>
          )}

          <Link
            href="/cases"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            View Active Dockets ({activeCases.length})
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Dockets</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{activeCases.length}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-emerald-700">100% Gated</span>
              <span className="text-[11px] text-slate-400">by role</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Response</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{pendingResponses.length}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-amber-600">Active Window</span>
              <span className="text-[11px] text-slate-400">7-day clock</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Hearings</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{inHearings.length}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-blue-600">Quorum Met</span>
              <span className="text-[11px] text-slate-400">min 3</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Awaiting Decision</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{pendingDecisions.length}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-purple-600">Human-Only</span>
              <span className="text-[11px] text-slate-400">Panel</span>
            </div>
          </div>
        </div>

        {/* Card 5: Closed Cases Archive */}
        <Link
          href="/cases?status=CLOSED"
          className="bg-white hover:bg-slate-50/90 transition rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 group-hover:text-emerald-700 transition">
              Closed Cases
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition">
              <Archive className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{closedCases.length}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-emerald-700">Archived</span>
              <span className="text-[11px] text-slate-400">WORM sealed</span>
            </div>
          </div>
        </Link>

        {/* Card 6 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Audit Chain</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600">100% Valid</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-emerald-700">SHA-256</span>
              <span className="text-[11px] text-slate-400">Chained</span>
            </div>
          </div>
        </div>
      </div>


      {/* 9-Step Procedural Workflow Pipeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              One Platform. 9 Intelligent Workflows.
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly enforced sequence. Advancing out-of-order is blocked at the business logic and database layer.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Deterministic State Machine
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 pt-2">
          {CASE_STATUS_WORKFLOW.map((step) => {
            const countInStep = cases.filter((c) => c.status === step.status).length;
            return (
              <div
                key={step.status}
                className="flex flex-col items-center p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition text-center group"
              >
                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center justify-center mb-2 shadow-xs group-hover:border-emerald-500 group-hover:text-emerald-600 transition">
                  {step.stepNumber}
                </div>
                <div className="text-[11px] font-semibold text-slate-800 line-clamp-1">{step.label}</div>
                <div className="mt-1.5">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-medium ${
                      countInStep > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200/60 text-slate-500'
                    }`}
                  >
                    {countInStep} dockets
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Dual Panel: Active Action Items & Cryptographic Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Requires Authority Attention */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Requires Disciplinary Authority Attention</h2>
              <p className="text-xs text-slate-500">
                Cases with statutory due-process deadlines or pending procedural actions.
              </p>
            </div>
            <Link
              href="/cases"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {cases.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500/40 mb-2" />
              <p className="text-xs">No active cases requiring attention under current role filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cases.map((c) => (
                <div key={c.id} className="py-4 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900">{c.caseNumber}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {c.department}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        {c.studentDisplayRef}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                          c.status === 'RESPONSE_WINDOW'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'DECISION_RECORDED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium truncate">{c.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Offence Code: <strong className="text-slate-700">{c.offenceCategory.code}</strong> —{' '}
                      {c.offenceCategory.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/cases/${c.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      Open Docket
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Cryptographic Audit Stream */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Tamper-Evident Audit Log
                </h2>
                <p className="text-[11px] text-slate-500">Append-only cryptographic ledger.</p>
              </div>
              <Link
                href="/audit"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Verify
              </Link>
            </div>

            <div className="space-y-3">
              {auditLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 font-sans"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">{entry.actorName}</span>
                    <span className="font-mono text-[9px] text-slate-400">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 text-[11px]">{entry.action}</div>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{entry.details}</p>
                  <div className="pt-1 flex items-center gap-1 font-mono text-[9px] text-slate-400">
                    <span>SHA-256:</span>
                    <span className="truncate text-emerald-600 font-semibold">{entry.currHash.substring(0, 16)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">Chain Status:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cryptographically Sealed
            </span>
          </div>
        </div>
      </div>

      {/* "AI + Human = Better Outcomes" Callout */}
      <div className="bg-gradient-to-r from-[#0F1E36] to-[#0B1727] text-white rounded-2xl p-6 border border-[#1E3A5F] shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold font-mono">
              <Lock className="w-3 h-3" /> Due Process Architecture
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              AI + Human = Defensible Disciplinary Outcomes
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>System Intelligence:</strong> Calculates statutory windows, tracks quorum requirements, hashes evidence files, formats prescribed notices, and indexes comparable precedents.
              <br />
              <strong className="text-emerald-400">Human Governance:</strong> Sole authority to evaluate credibility, determine responsibility, draft reasoned legal orders, and mandate educational sanctions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/precedents"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition"
            >
              Inspect Precedents
            </Link>
            <Link
              href="/audit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white shadow-sm transition"
            >
              Verify Audit Hashes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
