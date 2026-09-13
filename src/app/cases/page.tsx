'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  PlusCircle,
  Search,
  ChevronRight,
} from 'lucide-react';
import { getCurrentPersona, getFilteredCases } from '@/lib/store';

export default function CasesDocketPage() {
  const [persona, setPersona] = React.useState(getCurrentPersona());
  const [cases, setCases] = React.useState(getFilteredCases());
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('search');
      if (s) setSearchQuery(s);
    }

    const handleUpdate = () => {
      const current = getCurrentPersona();
      setPersona(current);
      setCases(getFilteredCases(current));
    };

    window.addEventListener('persona-changed', handleUpdate);
    return () => window.removeEventListener('persona-changed', handleUpdate);
  }, []);

  const filteredCases = cases.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.studentDisplayRef.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.offenceCategory.code.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Case Management
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">RBAC Gated: {persona.role}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Disciplinary Dockets</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional case files, evidence registries, and due-process verification timelines.
          </p>
        </div>

        {(persona.role === 'ADMIN_REGISTRAR' || persona.role === 'HEAD_OF_DEPARTMENT') && (
          <Link
            href="/cases/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            File New Incident Report
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'ALL', label: 'All Dockets' },
            { id: 'INTAKE', label: 'Intake' },
            { id: 'NOTICE_ISSUED', label: 'Notice Issued' },
            { id: 'RESPONSE_WINDOW', label: 'Response Window' },
            { id: 'COMMITTEE_CONSTITUTED', label: 'In Committee' },
            { id: 'DECISION_RECORDED', label: 'Decided' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter docket, respondent, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Cases Table/Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCases.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No Dockets Matching Filter</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No disciplinary cases match the selected status or authority scope under your active login persona.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCases.map((c) => {
              const completedSteps = c.checklistItems.filter((i) => i.status === 'COMPLETED').length;
              const totalSteps = c.checklistItems.length || 8;
              const progressPct = Math.round((completedSteps / totalSteps) * 100);

              return (
                <div
                  key={c.id}
                  className="p-5 hover:bg-slate-50/80 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Top Row: Case Number + Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {c.caseNumber}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-semibold text-slate-700">{c.department}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        {c.studentDisplayRef}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          c.offenceCategory.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : c.offenceCategory.severity === 'MAJOR'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.offenceCategory.severity}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                          c.status === 'RESPONSE_WINDOW'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'DECISION_RECORDED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'HEARING_SCHEDULED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-sm font-bold text-slate-900 truncate">{c.title}</h2>

                    {/* Offence Reference & Evidence Count */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span>
                        Policy: <strong className="text-slate-700">{c.offenceCategory.code}</strong> (
                        {c.offenceCategory.name})
                      </span>
                      <span>·</span>
                      <span>
                        Evidence: <strong className="text-slate-700">{c.incidentReport?.evidenceItems.length || 0}</strong> hashed files
                      </span>
                      <span>·</span>
                      <span>
                        Opened: <strong className="text-slate-700">{new Date(c.createdAt).toLocaleDateString()}</strong>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2 max-w-md">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Procedural Due Process Progress</span>
                        <span className="font-semibold text-slate-700">
                          {completedSteps} of {totalSteps} milestones ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                    <Link
                      href={`/cases/${c.id}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      Open Case File
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
