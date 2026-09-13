'use client';

import React from 'react';
import {
  CheckCircle2,
  Lock,
  BarChart3,
  Calendar,
  Building,
  Clock,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  PieChart,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export default function GovernanceDashboardPage() {
  const [selectedYear, setSelectedYear] = React.useState<'2026' | '2025' | '2024'>('2026');
  const [selectedDeptFilter, setSelectedDeptFilter] = React.useState<string>('ALL');

  // 1 & 2. Types of incidents data
  const categoryStats = [
    { code: 'ACAD-01', name: 'Academic Dishonesty & Plagiarism', count: 18, pct: 45, avgDays: 12.4, severity: 'MODERATE' },
    { code: 'ACAD-02', name: 'Examination Compromise & Devices', count: 7, pct: 17.5, avgDays: 14.1, severity: 'MAJOR' },
    { code: 'COND-01', name: 'Disruptive Campus Conduct', count: 9, pct: 22.5, avgDays: 8.2, severity: 'MINOR' },
    { code: 'COND-02', name: 'Property & Lab Damage', count: 4, pct: 10, avgDays: 16.5, severity: 'MODERATE' },
    { code: 'COND-03', name: 'Harassment & Safety Violation', count: 2, pct: 5, avgDays: 18.0, severity: 'CRITICAL' },
  ];

  // 3. Cases by department & year
  const departmentData: Record<string, { dept: string; count: number; active: number; closed: number; avgDays: number }[]> = {
    '2026': [
      { dept: 'Computer Science & Engineering', count: 14, active: 4, closed: 10, avgDays: 11.2 },
      { dept: 'Office of Student Affairs', count: 9, active: 2, closed: 7, avgDays: 8.5 },
      { dept: 'Electrical & Electronics', count: 6, active: 2, closed: 4, avgDays: 13.1 },
      { dept: 'Mechanical Engineering', count: 5, active: 1, closed: 4, avgDays: 10.4 },
      { dept: 'Biotechnology & Sciences', count: 4, active: 1, closed: 3, avgDays: 14.0 },
      { dept: 'Civil & Environmental', count: 2, active: 0, closed: 2, avgDays: 12.0 },
    ],
    '2025': [
      { dept: 'Computer Science & Engineering', count: 12, active: 0, closed: 12, avgDays: 12.0 },
      { dept: 'Office of Student Affairs', count: 11, active: 0, closed: 11, avgDays: 9.0 },
      { dept: 'Electrical & Electronics', count: 7, active: 0, closed: 7, avgDays: 14.2 },
      { dept: 'Mechanical Engineering', count: 6, active: 0, closed: 6, avgDays: 11.1 },
      { dept: 'Biotechnology & Sciences', count: 3, active: 0, closed: 3, avgDays: 15.0 },
      { dept: 'Civil & Environmental', count: 3, active: 0, closed: 3, avgDays: 13.0 },
    ],
    '2024': [
      { dept: 'Computer Science & Engineering', count: 10, active: 0, closed: 10, avgDays: 13.4 },
      { dept: 'Office of Student Affairs', count: 8, active: 0, closed: 8, avgDays: 9.5 },
      { dept: 'Electrical & Electronics', count: 5, active: 0, closed: 5, avgDays: 15.0 },
      { dept: 'Mechanical Engineering', count: 4, active: 0, closed: 4, avgDays: 12.0 },
      { dept: 'Biotechnology & Sciences', count: 2, active: 0, closed: 2, avgDays: 14.5 },
      { dept: 'Civil & Environmental', count: 2, active: 0, closed: 2, avgDays: 11.0 },
    ],
  };

  const currentDepts = departmentData[selectedYear] || departmentData['2026'];
  const filteredDepts = selectedDeptFilter === 'ALL'
    ? currentDepts
    : currentDepts.filter((d) => d.dept === selectedDeptFilter);

  // 5. Pending cases by workflow stage
  const pendingByStage = [
    { stage: '1. Intake & Evidence Sealing', count: 2, color: 'bg-blue-500' },
    { stage: '2. Show-Cause Notice Dispatched', count: 3, color: 'bg-emerald-500' },
    { stage: '3. Response Window Active', count: 4, color: 'bg-amber-500' },
    { stage: '4. Committee Quorum Verification', count: 2, color: 'bg-purple-500' },
    { stage: '5. Oral Hearing Scheduled', count: 3, color: 'bg-indigo-500' },
    { stage: '6. Reasoned Order Deliberation', count: 1, color: 'bg-rose-500' },
  ];

  const totalPendingCases = pendingByStage.reduce((acc, s) => acc + s.count, 0);

  // 6. Trends over time (monthly)
  const monthlyTrends = [
    { month: 'Jan', reported: 3, resolved: 2 },
    { month: 'Feb', reported: 5, resolved: 4 },
    { month: 'Mar', reported: 6, resolved: 5 },
    { month: 'Apr', reported: 4, resolved: 6 },
    { month: 'May', reported: 2, resolved: 3 },
    { month: 'Jun', reported: 1, resolved: 2 },
    { month: 'Jul', reported: 2, resolved: 1 },
    { month: 'Aug', reported: 8, resolved: 6 },
    { month: 'Sep', reported: 9, resolved: 5 },
  ];

  const totalDockets = currentDepts.reduce((sum, item) => sum + item.count, 0);
  const totalClosed = currentDepts.reduce((sum, item) => sum + item.closed, 0);
  const totalActive = currentDepts.reduce((sum, item) => sum + item.active, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              EDUguard · Step 9: Anonymous Analytics
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Aggregated Institutional Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Due-Process Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time dashboards for University Senate, Dean Oversight, and Accreditation Auditors without PII.
          </p>
        </div>

        {/* Year Filter Switcher */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <span className="text-xs font-semibold text-slate-500 mr-1">Academic Year:</span>
          {(['2026', '2025', '2024'] as const).map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedYear === yr
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Privacy & PII Redaction Guarantee Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Strict Privacy Segregation: Zero Personally Identifiable Information (PII)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              In accordance with Step 9 guidelines: No student names, roll numbers, or individual case records appear in governance dashboards.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold shrink-0">
          FERPA &amp; Senate Audit Certified
        </span>
      </div>

      {/* Dashboard 1: Number of Disciplinary Cases (Core KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">1. Total Disciplinary Cases</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalDockets}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {totalClosed} Closed · {totalActive} Active across {currentDepts.length} Depts
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">4. Avg. Processing Time</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">11.8 Days</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Statutory ceiling cap: 21.0 days (43.8% under cap)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">5. Pending Cases in Flight</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{totalPendingCases}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            All within statutory response and hearing windows
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Procedural Rigor Rate</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">100.0%</div>
          <p className="text-[11px] text-slate-500 mt-1">Zero proceedings convened without quorum</p>
        </div>
      </div>

      {/* Dashboards 2 & 5: Types of Incidents & Pending Cases by Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dashboard 2: Types of Incidents */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                2. Types of Disciplinary Incidents
              </h2>
              <p className="text-xs text-slate-500">Breakdown by institutional offence classification.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Academic Year {selectedYear}</span>
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
                  <div className="flex items-center gap-3 text-slate-500 font-medium text-[11px]">
                    <span className="font-bold text-slate-900">{cat.count} dockets ({cat.pct}%)</span>
                    <span>Avg. {cat.avgDays} days</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.pct * 1.8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard 5: Pending Cases by Stage */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                5. Pending Cases by Due-Process Stage
              </h2>
              <p className="text-xs text-slate-500">Active dockets grouped by current procedural checkpoint.</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {totalPendingCases} Active Dockets
            </span>
          </div>

          <div className="space-y-3">
            {pendingByStage.map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="font-semibold text-slate-800">{s.stage}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                  {s.count} {s.count === 1 ? 'case' : 'cases'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard 3: Cases by Department & Year */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              3. Cases by Department &amp; Academic Year ({selectedYear})
            </h2>
            <p className="text-xs text-slate-500">Institutional jurisdiction distribution and resolution ratios.</p>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Departments ({currentDepts.length})</option>
              {currentDepts.map((d) => (
                <option key={d.dept} value={d.dept}>
                  {d.dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-2">Department Name</th>
                <th className="pb-2">Total Dockets</th>
                <th className="pb-2">Active Inquest</th>
                <th className="pb-2">Resolved &amp; Closed</th>
                <th className="pb-2">Avg. Processing Time</th>
                <th className="pb-2 text-right">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDepts.map((d, idx) => {
                const resolutionRate = Math.round((d.closed / d.count) * 100);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-900">{d.dept}</td>
                    <td className="py-3 font-bold">{d.count}</td>
                    <td className="py-3 text-amber-600 font-semibold">{d.active}</td>
                    <td className="py-3 text-emerald-600 font-semibold">{d.closed}</td>
                    <td className="py-3 font-mono text-slate-600">{d.avgDays} days</td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {resolutionRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dashboard 6: Trends Over Time */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              6. Disciplinary Incident &amp; Resolution Trends Over Time
            </h2>
            <p className="text-xs text-slate-500">Monthly incident intake vs formal case resolutions for {selectedYear}.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Incidents Reported
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Dockets Closed
            </span>
          </div>
        </div>

        {/* Interactive Visual Bar Chart */}
        <div className="grid grid-cols-9 gap-2 pt-4 items-end h-48 border-b border-slate-200 pb-2">
          {monthlyTrends.map((m) => {
            const reportedHeight = Math.max(m.reported * 18, 12);
            const resolvedHeight = Math.max(m.resolved * 18, 12);
            return (
              <div key={m.month} className="flex flex-col items-center gap-1 h-full justify-end group">
                <div className="flex items-end gap-1.5 w-full justify-center">
                  {/* Reported Bar */}
                  <div
                    style={{ height: `${reportedHeight}px` }}
                    className="w-3.5 sm:w-5 bg-blue-500 hover:bg-blue-600 rounded-t transition-all relative"
                    title={`${m.month}: ${m.reported} reported`}
                  />
                  {/* Resolved Bar */}
                  <div
                    style={{ height: `${resolvedHeight}px` }}
                    className="w-3.5 sm:w-5 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all relative"
                    title={`${m.month}: ${m.resolved} resolved`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 mt-1">{m.month}</span>
                <span className="text-[9px] text-slate-400">{m.reported}/{m.resolved}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
