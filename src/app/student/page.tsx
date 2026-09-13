'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  FileText,
  UploadCloud,
  Send,
} from 'lucide-react';
import { computeSha256 } from '@/lib/audit';
import { getFilteredCases, submitStudentDefense } from '@/lib/store';

export default function StudentPortalPage() {
  const [cases, setCases] = React.useState(getFilteredCases());
  const studentCase = cases.find((c) => c.studentDisplayRef.includes('CS-8902')) || cases[0];
  const [writtenStatement, setWrittenStatement] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [evidenceName, setEvidenceName] = React.useState<string | null>(null);
  const [evidenceHash, setEvidenceHash] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleUpdate = () => setCases(getFilteredCases());
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
      {/* Top Banner Greeting (Matching Reference Screen 4: "Good morning, Rahul") */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Student Due-Process Portal
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Roll: CS-8902</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, Rahul 👋
          </h1>
          <p className="text-xs text-slate-500">
            Computer Science &amp; Engineering · 2025 Batch · Your due-process inquiry file at a glance.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[100px]">
            <span className="text-[10px] text-slate-400 font-semibold block">Active Inquiry</span>
            <span className="text-xl font-bold text-slate-900">1</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-[120px]">
            <span className="text-[10px] text-amber-700 font-semibold block">Response Window</span>
            <span className="text-lg font-bold text-amber-900">5 Days Left</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[100px]">
            <span className="text-[10px] text-emerald-700 font-semibold block">Due Process</span>
            <span className="text-xl font-bold text-emerald-700">100%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Notice & Written Statement Uploader */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Notice Card */}
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
                <span className="font-semibold text-slate-800">{studentCase.offenceCategory.code} ({studentCase.offenceCategory.procedureReference})</span>
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
        </div>

        {/* Right 1 Col: Recommended Actions & Student Rights */}
        <div className="space-y-6">
          {/* Recommended Next Action Card (Matching Reference Screen 4) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-emerald-600">
              Recommended Next Action
            </h2>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2 text-xs">
              <p className="font-bold text-slate-900">
                Register for academic consultation before 17 Sept.
              </p>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• 1 active procedural inquiry</li>
                <li>• 5 calendar days remaining in response clock</li>
                <li>• Student Ombudsman appointment available</li>
              </ul>
            </div>
          </div>

          {/* Student Statutory Due-Process Rights Card */}
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
    </div>
  );
}
