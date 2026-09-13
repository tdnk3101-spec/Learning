'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  Printer,
  Send,
  CheckCircle2,
  ArrowLeft,
  Scale,
  Clock,
  ShieldCheck,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { getCaseById, getCurrentPersona, issueCaseNotice, acknowledgeNotice } from '@/lib/store';
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
  const [noticeType, setNoticeType] = React.useState<NoticeType>('SHOW_CAUSE_NOTICE');
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
      const subject = `EDUguard OFFICIAL NOTICE [${noticeType.replace(/_/g, ' ')}] — Ref: ${caseItem.caseNumber}`;
      const content = `Policy-compliant notice generated under ${caseItem.offenceCategory.applicablePolicy} (${caseItem.offenceCategory.relevantClause}).`;

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

  const handleAcknowledge = async (noticeId: string) => {
    try {
      await acknowledgeNotice(caseItem.id, noticeId, 'Acknowledged by student recipient with verified electronic receipt.', persona);
      setCaseItem(getCaseById(caseId, persona));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error acknowledging notice');
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Step 4: Notices &amp; Communication
              </span>
              <span className="font-mono text-xs font-bold text-slate-700">{caseItem.caseNumber}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">Policy-Compliant Notice Engine</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={noticeType}
            onChange={(e) => setNoticeType(e.target.value as NoticeType)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 shadow-xs"
          >
            <option value="SHOW_CAUSE_NOTICE">1. Show-Cause Notice</option>
            <option value="HEARING_NOTICE">2. Hearing Notice / Summons</option>
            <option value="COMMITTEE_COMMUNICATION">3. Committee Communication</option>
            <option value="DECISION_COMMUNICATION">4. Decision Communication Order</option>
            <option value="APPEAL_INFO">5. Appeal Information Notice</option>
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
            {isDispatching ? 'Dispatching...' : 'Dispatch Notice'}
          </button>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Official notice successfully dispatched with electronic delivery proof! Checklist updated.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
            STATUS: 200 DELIVERED
          </span>
        </div>
      )}

      {/* Dispatched Notices Ledger (Step 4 Records: Date sent, Recipient, Delivery status, Acknowledgement) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 no-print">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-600" />
            Recorded Notices &amp; Acknowledgements ({caseItem.notices.length})
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Immutable Delivery Tracking</span>
        </div>

        {caseItem.notices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Notice Type</th>
                  <th className="pb-2">Date Sent</th>
                  <th className="pb-2">Recipient</th>
                  <th className="pb-2">Delivery Status</th>
                  <th className="pb-2">Acknowledgement</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {caseItem.notices.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-900">
                      {n.type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                      {n.sentAt ? new Date(n.sentAt).toLocaleString() : 'Draft'}
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-blue-700">
                      {n.recipientRef}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {n.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          n.acknowledgementStatus === 'ACKNOWLEDGED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {n.acknowledgementStatus}
                      </span>
                      {n.acknowledgedAt && (
                        <span className="block text-[9px] text-slate-400 mt-0.5">
                          {new Date(n.acknowledgedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      {n.acknowledgementStatus === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={() => handleAcknowledge(n.id)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition"
                        >
                          Confirm Ack
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-medium flex items-center justify-end gap-1">
                          <CheckCircle className="w-3 h-3" /> Signed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No communications logged yet for this docket.</p>
        )}
      </div>

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
            EDUguard Disciplinary Tribunal &amp; Registrar
          </h2>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Office of the Dean of Student Affairs · Board of Inquest
          </h3>
          <p className="text-[10px] font-sans text-slate-500">
            Statutory Tribunal Constituted Under the Institutional Due-Process Charter of 2026
          </p>
        </div>

        {/* Notice Meta Information */}
        <div className="grid grid-cols-2 gap-4 text-xs font-sans border-b border-slate-200 pb-4">
          <div>
            <p className="text-slate-500">CASE DOCKET REFERENCE:</p>
            <p className="font-mono font-bold text-slate-900 text-sm">{caseItem.caseNumber}</p>
            <p className="text-slate-500 mt-1">DISPATCH DATE:</p>
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
          <div className="text-center font-bold font-sans uppercase tracking-wider text-sm py-1.5 bg-slate-100 border border-slate-200">
            {noticeType === 'SHOW_CAUSE_NOTICE'
              ? 'FORMAL SHOW-CAUSE NOTICE (EXPLANATION REQUIRED)'
              : noticeType === 'HEARING_NOTICE'
              ? 'SUMMONS & NOTICE OF ORAL HEARING'
              : noticeType === 'COMMITTEE_COMMUNICATION'
              ? 'OFFICIAL COMMITTEE COMMUNICATION'
              : noticeType === 'DECISION_COMMUNICATION'
              ? 'COMMUNICATION OF FINAL REASONED DECISION ORDER'
              : 'OFFICIAL NOTICE OF APPELLATE RIGHTS & PROCEDURES'}
          </div>

          <p>
            <strong>WHEREAS,</strong> an incident of disciplinary concern has been formally registered under docket{' '}
            <strong>{caseItem.caseNumber}</strong> alleging conduct inconsistent with institutional standards on{' '}
            <strong>{caseItem.incidentReport?.incidentDate ? new Date(caseItem.incidentReport.incidentDate).toLocaleDateString() : new Date().toLocaleDateString()}</strong>;
          </p>

          <p>
            <strong>AND WHEREAS,</strong> policy classification identifies governance under{' '}
            <strong className="font-mono text-blue-950">{caseItem.offenceCategory.applicablePolicy}</strong>, citing clause{' '}
            <strong className="font-mono text-emerald-950">{caseItem.offenceCategory.relevantClause}</strong> regarding{' '}
            <em>&ldquo;{caseItem.title}&rdquo;</em>;
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded font-sans text-xs space-y-2">
            <span className="font-bold block text-slate-900">STATEMENT OF REGISTERED ALLEGATION:</span>
            <p className="text-slate-700 italic">
              &ldquo;{caseItem.incidentReport?.description || 'Conduct under formal inquiry.'}&rdquo;
            </p>
            <p className="text-[11px] text-slate-500">
              Evidence secured: {caseItem.incidentReport?.evidenceItems.length || 0} cryptographic items deposited with SHA-256 integrity seal.
            </p>
          </div>

          {/* Statutory Rights Declaration */}
          <div className="space-y-2 font-sans text-xs pt-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
              MANDATORY DUE PROCESS RIGHTS GUARANTEED:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px]">
              <li>
                <strong>Statutory Right to Respond:</strong> You are afforded a mandatory representation window of{' '}
                <strong>{statutoryDays} calendar days</strong> (expiring on{' '}
                <strong>{deadlineDate.toLocaleDateString()}</strong>) to file a written defense.
              </li>
              <li>
                <strong>Right to Examine Evidence:</strong> You have full access to inspect all evidence files and checksums in the case file.
              </li>
              <li>
                <strong>Right to Representation:</strong> You may be accompanied by an accredited student ombudsman or academic advisor during hearings.
              </li>
              <li>
                <strong>Right to an Impartial Committee:</strong> The disciplinary committee must satisfy statutory quorum (minimum {caseItem.offenceCategory.defaultQuorum} members) without conflict of interest.
              </li>
              <li>
                <strong>Right to Appeal:</strong> Any subsequent decision order retains a {caseItem.offenceCategory.appealWindowDays}-day statutory window for appellate review.
              </li>
            </ol>
          </div>

          <div className="pt-8 grid grid-cols-2 gap-8 text-center font-sans text-xs border-t border-slate-200">
            <div className="space-y-1">
              <p className="font-bold text-slate-900">{persona.name}</p>
              <p className="text-slate-500 text-[11px]">{persona.designation}</p>
              <span className="text-[10px] text-slate-400 font-mono block">Digitally Dispatched via EDUguard</span>
            </div>

            <div className="space-y-1">
              <div className="h-8 flex items-center justify-center">
                <span className="font-mono text-[10px] text-slate-400">[DIGITAL DISPATCH SEAL]</span>
              </div>
              <p className="text-slate-500 text-[11px]">Office of Legal Compliance &amp; Due Process</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
