'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  FileText,
  UploadCloud,
  Send,
  Archive,
  Clock,
  ShieldCheck,
  Scale,
  Award,
  AlertCircle,
} from 'lucide-react';
import { computeSha256 } from '@/lib/audit';
import {
  getCurrentPersona,
  getFilteredCases,
  getStudentCases,
  getStudentClosedCases,
  submitStudentDefense,
} from '@/lib/store';

export default function StudentPortalPage() {
  const [currentPersona, setCurrentPersonaState] = React.useState(getCurrentPersona());
  const [activeTab, setActiveTab] = React.useState<'active' | 'closed'>('active');
  const [cases, setCases] = React.useState(getFilteredCases());
  const [allStudentCases, setAllStudentCases] = React.useState(getStudentCases('CS-8902'));
  const [closedCases, setClosedCases] = React.useState(getStudentClosedCases('CS-8902'));

  const studentRoll = currentPersona.studentRollNo || 'CS-8902';
  const studentName = currentPersona.role === 'STUDENT' ? currentPersona.name : 'Rahul Verma';

  const studentCase =
    allStudentCases.find((c) => c.status !== 'CLOSED') ||
    cases.find((c) => c.status !== 'CLOSED') ||
    cases[0];

  const [writtenStatement, setWrittenStatement] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [evidenceName, setEvidenceName] = React.useState<string | null>(null);
  const [evidenceHash, setEvidenceHash] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleUpdate = () => {
      const p = getCurrentPersona();
      setCurrentPersonaState(p);
      const roll = p.studentRollNo || 'CS-8902';
      setCases(getFilteredCases(p));
      setAllStudentCases(getStudentCases(roll));
      setClosedCases(getStudentClosedCases(roll));
    };
    handleUpdate();
    window.addEventListener('persona-changed', handleUpdate);
    return () => window.removeEventListener('persona-changed', handleUpdate);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidenceName(file.name);
    const hash = await computeSha256(`${file.name}-${file.size}-${Date.now()}`);
    setEvidenceHash(hash);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writtenStatement.trim()) {
      alert('Please enter your written response.');
      return;
    }
    if (!studentCase) return;

    setIsSubmitting(true);
    try {
      await submitStudentDefense(
        studentCase.id,
        writtenStatement,
        evidenceName || undefined,
        evidenceHash || undefined,
        'Student #CS-8902 (Rahul Verma)'
      );
      setSubmitted(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error submitting defense representation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Student Due-Process Portal
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Roll: {studentRoll}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, {studentName} 👋
          </h1>
          <p className="text-xs text-slate-500">
            {currentPersona.department || 'Computer Science & Engineering'} · Registered Academic Profile · Due-process file at a glance.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[100px]">
            <span className="text-[10px] text-slate-400 font-semibold block">Active Inquiry</span>
            <span className="text-xl font-bold text-slate-900">
              {allStudentCases.filter((c) => c.status !== 'CLOSED').length}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[120px]">
            <span className="text-[10px] text-emerald-700 font-semibold block">Closed Records</span>
            <span className="text-xl font-bold text-emerald-800">
              {closedCases.length}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[100px]">
            <span className="text-[10px] text-slate-500 font-semibold block">Due Process</span>
            <span className="text-xl font-bold text-emerald-600">100%</span>
          </div>
        </div>
      </div>

      {/* Interactive Tab Switcher: Active Proceedings vs Closed Records */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 max-w-md">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Inquiries</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {allStudentCases.filter((c) => c.status !== 'CLOSED').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('closed')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'closed'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Archive className="w-3.5 h-3.5 text-emerald-600" />
          <span>Closed History</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {closedCases.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Active Proceedings */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Active Notice & Written Statement Uploader */}
          <div className="lg:col-span-2 space-y-6">
            {studentCase ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {studentCase.caseNumber}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-1">{studentCase.title}</h2>
                  </div>
                  <Link
                    href={`/cases/${studentCase.id}/notice`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Official Notice
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Allegation Reference:</span>
                    <span className="font-semibold text-slate-800">
                      {studentCase.offenceCategory.code} ({studentCase.offenceCategory.procedureReference})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Notice Issued Date:</span>
                    <span className="font-semibold text-slate-800">10 September 2026</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Statutory Response Deadline:</span>
                    <span className="font-bold text-red-600">17 September 2026, 18:00 IST</span>
                  </div>
                </div>

                {/* Form for Student Written Representation */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Submit Your Formal Written Defense / Explanation</h3>
                    <span className="text-[10px] text-slate-400">Recorded into WORM Audit Log</span>
                  </div>

                  {submitted ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold">Your written statement has been submitted and sealed.</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          The Disciplinary Committee panel will review your statement prior to oral proceedings.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitResponse} className="space-y-3">
                      <textarea
                        rows={4}
                        required
                        value={writtenStatement}
                        onChange={(e) => setWrittenStatement(e.target.value)}
                        placeholder="Provide your factual representation, explanation of circumstances, and any mitigating factors..."
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-sans"
                      />

                      {/* Attachment uploader */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-slate-500" />
                          <span>{evidenceName ? `Attached: ${evidenceName}` : 'Attach Defense Document / Evidence'}</span>
                          <input type="file" onChange={handleFileUpload} className="hidden" />
                        </label>

                        {evidenceHash && (
                          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            SHA-256: {evidenceHash.substring(0, 12)}...
                          </span>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {isSubmitting ? 'Sealing & Submitting...' : 'Submit Written Defense'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">No Active Disciplinary Inquiries</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You have no pending charges or active response windows. Your record is currently clear.
                </p>
              </div>
            )}
          </div>

          {/* Right 1 Col: Recommended Actions & Student Rights */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-emerald-600">
                Recommended Next Action
              </h2>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2 text-xs">
                <p className="font-bold text-slate-900">
                  Review your notice of charge and submit your written response before 17 Sept.
                </p>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li>• 1 active procedural inquiry</li>
                  <li>• 5 calendar days remaining in response clock</li>
                  <li>• Student Ombudsman consultation available</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#0B1E33] text-white rounded-3xl p-6 border border-[#1E3A5F] shadow-sm space-y-3 text-xs">
              <h2 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>⚖️</span>
                Your Guaranteed Due-Process Rights
              </h2>
              <ul className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <span>You are presumed not responsible until human deliberation concludes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <span>You have the right to inspect all evidentiary artifacts prior to hearing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">3.</span>
                  <span>You may be accompanied by a student advocate during committee inquiry.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">4.</span>
                  <span>Right to appeal any decision within 14 statutory days to Executive Tribunal.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Past Closed Cases & Restitution History */}
      {activeTab === 'closed' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Archive className="w-4 h-4 text-emerald-600" />
                  <span>Archived Closed Cases &amp; Sanction Compliance History</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stored historical records, verified restorative workshop certificates, and statutory expunction countdowns.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                FERPA §7 PROTECTED
              </span>
            </div>

            {closedCases.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">No Past Disciplinary Violations on Record</p>
                <p className="text-[11px] text-slate-500">
                  This student has zero closed infraction records on file.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {closedCases.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4 hover:border-emerald-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold bg-white text-slate-900 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                          {c.caseNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{c.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>CLOSED &amp; SATISFIED</span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Resolved: {c.closedAt ? new Date(c.closedAt).toLocaleDateString() : '2025-11-14'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Finding of Responsibility</span>
                        <p className="text-[11px] font-medium text-slate-800 leading-snug">
                          {c.decision?.verdict || 'Substantiated — Educational Remediation Imposed'}
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanction Served</span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{c.decision?.sanctionImposed || '8-Hour Academic Citation Workshop Completed'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Retention Expunction</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {c.retentionExpiryAt
                              ? `Auto-Purge: ${new Date(c.retentionExpiryAt).toLocaleDateString()}`
                              : '3 Years (Hard Purge after Graduation)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {c.decision?.reasoningText && (
                      <div className="p-3 bg-white/70 rounded-xl border border-slate-200/70 text-[11px] text-slate-600">
                        <strong className="text-slate-800">Committee Reasoning Summary: </strong>
                        {c.decision.reasoningText}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-200/50">
                      <span className="font-mono text-[10px]">
                        Cryptographic Seal: {c.decision?.decisionDocHash ? c.decision.decisionDocHash.substring(0, 24) : 'sha256-verified'}...
                      </span>
                      <Link
                        href={`/cases/${c.id}`}
                        className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                      >
                        <span>Inspect Closed Dossier</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
