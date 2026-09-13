'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  Printer,
  Send,
  CheckCircle2,
  ArrowLeft,
  Scale,
} from 'lucide-react';
import { getCaseById, getCurrentPersona, issueCaseNotice } from '@/lib/store';
import { NoticeType } from '@/types';

export default function PrescribedNoticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [persona, setPersona] = React.useState(getCurrentPersona());
  const [caseItem, setCaseItem] = React.useState(getCaseById(caseId, persona));
  const [noticeType, setNoticeType] = React.useState<NoticeType>('NOTICE_OF_CHARGE');
  const [isDispatching, setIsDispatching] = React.useState(false);
  const [dispatchSuccess, setDispatchSuccess] = React.useState(false);

  React.useEffect(() => {
    const handleUpdate = () => {
      const current = getCurrentPersona();
      setPersona(current);
      setCaseItem(getCaseById(caseId, current));
    };
    window.addEventListener('persona-changed', handleUpdate);
    return () => window.removeEventListener('persona-changed', handleUpdate);
  }, [caseId]);

  if (!caseItem) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Case docket not found or access restricted.</p>
        <Link href="/cases" className="text-emerald-600 text-xs font-semibold mt-2 inline-block">
          Return to cases
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDispatchNotice = async () => {
    setIsDispatching(true);
    try {
      const recipientEmail = `official.student.${caseItem.studentDisplayRef.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@institution.edu`;
      const subject = `FORMAL NOTICE OF DISCIPLINARY PROCEEDINGS — Ref: ${caseItem.caseNumber}`;
      const content = `Prescribed Notice generated under ${caseItem.offenceCategory.procedureReference}`;

      await issueCaseNotice(caseItem.id, noticeType, recipientEmail, subject, content, persona);
      setDispatchSuccess(true);
      setCaseItem(getCaseById(caseId, persona));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('persona-changed'));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to dispatch notice';
      alert(`Error dispatching notice: ${message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const statutoryDays = caseItem.offenceCategory.responseWindowDays;
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + statutoryDays);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <Link
            href={`/cases/${caseItem.id}`}
            className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Prescribed Notice Generator</h1>
            <p className="text-xs text-slate-500">Case Ref: {caseItem.caseNumber} · Formatted for Official Legal Dispatch</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={noticeType}
            onChange={(e) => setNoticeType(e.target.value as NoticeType)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-xs"
          >
            <option value="NOTICE_OF_CHARGE">Notice of Charge (Form 1)</option>
            <option value="HEARING_SUMMONS">Hearing Summons (Form 2)</option>
            <option value="DECISION_ORDER">Decision &amp; Sanction Order (Form 3)</option>
            <option value="APPEAL_INFO">Right of Appeal Notice (Form 4)</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Print / PDF
          </button>

          <button
            onClick={handleDispatchNotice}
            disabled={isDispatching}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {isDispatching ? 'Dispatching...' : 'Dispatch with Delivery Proof'}
          </button>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Official notice successfully dispatched via recorded delivery webhook! Procedural checklist updated.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700 font-semibold">
            STATUS: 200 DELIVERED
          </span>
        </div>
      )}

      {/* Official Printable Notice Paper (White Parchment Card) */}
      <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm print-shadow-none space-y-6 text-slate-900 font-serif">
        {/* Institutional Header & Coat of Arms */}
        <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1.5">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center font-sans font-bold text-slate-900">
              <Scale className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-base font-bold uppercase tracking-widest text-slate-900">
            National Institute of Technology &amp; Advanced Studies
          </h2>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Office of the Registrar · Proctorial Board of Discipline
          </h3>
          <p className="text-[10px] font-sans text-slate-500">
            Statutory Tribunal Constituted Under the University Governance Act of 1982
          </p>
        </div>

        {/* Notice Meta Information */}
        <div className="grid grid-cols-2 gap-4 text-xs font-sans border-b border-slate-200 pb-4">
          <div>
            <p className="text-slate-500">DOCKET REFERENCE:</p>
            <p className="font-mono font-bold text-slate-900 text-sm">{caseItem.caseNumber}</p>
            <p className="text-slate-500 mt-1">ISSUANCE DATE:</p>
            <p className="font-semibold text-slate-900">{new Date().toLocaleDateString()}</p>
          </div>

          <div className="text-right">
            <p className="text-slate-500">RESPONDENT (STUDENT):</p>
            <p className="font-bold text-slate-900">{caseItem.studentDisplayRef}</p>
            <p className="text-slate-500 mt-1">DEPARTMENT:</p>
            <p className="font-semibold text-slate-900">{caseItem.department}</p>
          </div>
        </div>

        {/* Notice Body */}
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="text-center font-bold font-sans uppercase tracking-wider text-sm py-1 bg-slate-100 border border-slate-200">
            {noticeType === 'NOTICE_OF_CHARGE'
              ? 'FORMAL NOTICE OF DISCIPLINARY CHARGE & INQUIRY'
              : noticeType === 'HEARING_SUMMONS'
              ? 'SUMMONS TO APPEAR BEFORE DISCIPLINARY COMMITTEE'
              : noticeType === 'DECISION_ORDER'
              ? 'FINAL REASONED ORDER & NOTICE OF SANCTION'
              : 'OFFICIAL NOTICE OF APPELLATE RIGHTS'}
          </div>

          <p>
            <strong>WHEREAS,</strong> an incident report has been formally registered with the Competent Disciplinary
            Authority on <strong>{new Date(caseItem.createdAt).toLocaleDateString()}</strong> alleging breach of the
            Institutional Code of Conduct;
          </p>

          <p>
            <strong>AND WHEREAS,</strong> preliminary verification indicates grounds for formal inquiry under{' '}
            <strong className="font-mono">{caseItem.offenceCategory.procedureReference}</strong> concerning:{' '}
            <em>&ldquo;{caseItem.title}&rdquo;</em>;
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded font-sans text-xs space-y-2">
            <span className="font-bold block text-slate-900">STATEMENT OF ALLEGATIONS:</span>
            <p className="text-slate-700 italic">
              &ldquo;{caseItem.incidentReport?.description || 'Conduct inconsistent with academic integrity standards.'}&rdquo;
            </p>
            <p className="text-[11px] text-slate-500">
              Evidence on record: {caseItem.incidentReport?.evidenceItems.length || 0} items secured under WORM cryptographic storage.
            </p>
          </div>

          {/* Statutory Rights Declaration */}
          <div className="space-y-2 font-sans text-xs pt-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
              MANDATORY DUE PROCESS RIGHTS ENFORCED:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
              <li>
                <strong>Right to Written Representation:</strong> You are entitled to submit a comprehensive written
                statement within <strong>{statutoryDays} calendar days</strong> (Strict statutory deadline:{' '}
                <strong className="text-red-700">{deadlineDate.toLocaleDateString()}</strong>).
              </li>
              <li>
                <strong>Right to Full Disclosure:</strong> All documentary and technical evidence on record is
                available for inspection prior to committee oral proceedings.
              </li>
              <li>
                <strong>Right to Counsel / Representation:</strong> You may be accompanied by an approved student
                advocate or ombudsman representative.
              </li>
              <li>
                <strong>Presumption of Due Process:</strong> No punitive sanction shall be levied prior to formal
                deliberation by a duly constituted committee meeting statutory quorum of {caseItem.offenceCategory.defaultQuorum} members.
              </li>
            </ol>
          </div>
        </div>

        {/* Signatures & Seal */}
        <div className="pt-10 border-t border-slate-300 font-sans grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="w-36 border-b border-slate-900 pb-1 font-bold text-slate-900">
              {persona.name}
            </div>
            <p className="text-[11px] text-slate-600 font-semibold">{persona.designation}</p>
            <p className="text-[10px] text-slate-400">Authorized Disciplinary Officer</p>
          </div>

          <div className="text-right">
            <div className="inline-block text-left">
              <div className="w-36 border-b border-slate-900 pb-1 font-bold text-slate-900">
                Prof. Arthur Sterling
              </div>
              <p className="text-[11px] text-slate-600 font-semibold">Dean of Student Affairs</p>
              <p className="text-[10px] text-slate-400">Institutional Seal Affixed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
