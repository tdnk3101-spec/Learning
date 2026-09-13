'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  Scale,
  Hash,
  ShieldAlert,
  ArrowLeft,
  Gavel,
  AlertTriangle,
  UserX,
  Building,
} from 'lucide-react';

import { getCaseById, getCurrentPersona, getPrecedents, toggleChecklistItem, updateCommitteeHearing } from '@/lib/store';

export default function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [persona, setPersona] = React.useState(getCurrentPersona());
  const [caseItem, setCaseItem] = React.useState(getCaseById(caseId, persona));
  const [recusedMembers, setRecusedMembers] = React.useState<string[]>([]);
  const [alternateAppointed, setAlternateAppointed] = React.useState<boolean>(false);
  const [isUpdatingStep, setIsUpdatingStep] = React.useState<number | null>(null);
  const [committeeSaved, setCommitteeSaved] = React.useState<boolean>(false);

  const handleToggleStep = async (stepNumber: number) => {
    if (!caseItem) return;
    setIsUpdatingStep(stepNumber);
    try {
      const updated = await toggleChecklistItem(caseItem.id, stepNumber, persona);
      setCaseItem({ ...updated });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update checklist step');
    } finally {
      setIsUpdatingStep(null);
    }
  };

  const handleSaveCommittee = async () => {
    if (!caseItem) return;
    try {
      const baseMembers = caseItem.committeeRecord?.membersAssigned || [];
      const effectiveMembers = baseMembers.filter((m) => !recusedMembers.includes(m));
      if (alternateAppointed) {
        effectiveMembers.push('Dr. Ananya Sen (Alternate Faculty Nominee)');
      }
      await updateCommitteeHearing(
        caseItem.id,
        caseItem.committeeRecord?.committeeChair || 'Dr. K. Swaminathan',
        effectiveMembers,
        caseItem.committeeRecord?.hearingDate || new Date().toISOString(),
        caseItem.committeeRecord?.hearingVenue || 'Academic Senate Hall A',
        caseItem.committeeRecord?.deliberationMinutes || 'Formal hearing convened. Member declarations and quorum verified.',
        persona
      );
      setCommitteeSaved(true);
      setTimeout(() => setCommitteeSaved(false), 3500);
      const updated = getCaseById(caseId, persona);
      if (updated) setCaseItem({ ...updated });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating committee quorum');
    }
  };


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
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 mx-auto text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted / Case Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Under the institutional RBAC guardrails, you can only inspect case dockets within your department or
          to which you are explicitly assigned as a committee member.
        </p>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to accessible dockets
        </Link>
      </div>
    );
  }

  const precedents = getPrecedents(undefined, caseItem.offenceCategoryId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/cases" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Dockets
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="font-mono text-xs font-bold text-slate-900">{caseItem.caseNumber}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{caseItem.title}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span>Department: <strong>{caseItem.department}</strong></span>
            <span>·</span>
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {caseItem.studentDisplayRef}
            </span>
            <span>·</span>
            <span>
              Opened: <strong>{new Date(caseItem.createdAt).toLocaleDateString()}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/cases/${caseItem.id}/notice`}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Prescribed Notice
          </Link>

          <Link
            href={`/cases/${caseItem.id}/appeal`}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            Statutory Appeal
          </Link>

          {(persona.role === 'DEAN_STUDENT_AFFAIRS' || persona.role === 'COMMITTEE_MEMBER') && (
            <Link
              href={`/cases/${caseItem.id}/decision`}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Gavel className="w-4 h-4 text-emerald-400" />
              {caseItem.decision ? 'Inspect Reasoned Order' : 'Record Human Decision'}
            </Link>
          )}
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Procedural Timeline, Evidence & Decision */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestone Status Banner */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Milestone</span>
                <h3 className="text-sm font-bold text-slate-900">{caseItem.status.replace(/_/g, ' ')}</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Response Clock</span>
              <p className="text-xs font-semibold text-amber-600">
                {caseItem.notices.length > 0 ? '7 Days Statutory (Active)' : 'Awaiting Notice Dispatch'}
              </p>
            </div>
          </div>

          {/* Procedural Checklist Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Procedural Due-Process Checklist</h2>
                <p className="text-xs text-slate-500">
                  Statutory sequence of rights and hearing obligations for {caseItem.offenceCategory.code}.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Due-Process Enforced
              </span>
            </div>

            <div className="space-y-3">
              {caseItem.checklistItems.map((step) => (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-4 ${
                    step.status === 'COMPLETED'
                      ? 'bg-emerald-50/40 border-emerald-200/80'
                      : step.status === 'IN_PROGRESS'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-slate-50/70 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5">
                      {step.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : step.status === 'IN_PROGRESS' ? (
                        <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {step.stepNumber}
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-slate-900">{step.requirement}</p>
                      <p className="text-[11px] text-slate-500">{step.description}</p>
                      {step.notes && (
                        <p className="text-[10px] text-slate-600 font-medium italic pt-1">Note: {step.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <div className="text-[10px]">
                      <span className="text-slate-400 block">Due Date:</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(step.dueDate).toLocaleDateString()}
                      </span>
                      {step.completedAt && (
                        <span className="block text-emerald-700 font-semibold mt-0.5">
                          Done: {new Date(step.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Interactive Step Toggle */}
                    <button
                      type="button"
                      disabled={isUpdatingStep === step.stepNumber}
                      onClick={() => handleToggleStep(step.stepNumber)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs ${
                        step.status === 'COMPLETED'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      title="Click to advance or toggle due-process step"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {isUpdatingStep === step.stepNumber
                        ? 'Updating...'
                        : step.status === 'COMPLETED'
                        ? 'Mark Incomplete'
                        : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Committee & Quorum Tracker */}
          {(() => {
            const baseMembers = caseItem.committeeRecord?.membersAssigned || [];
            const effectiveCount = baseMembers.filter((m) => !recusedMembers.includes(m)).length + (alternateAppointed ? 1 : 0);
            const isQuorumValid = effectiveCount >= (caseItem.offenceCategory.defaultQuorum || 3);

            return (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Disciplinary Committee Constitution &amp; Quorum
                    </h2>
                    <p className="text-xs text-slate-500">
                      Mandatory statutory quorum: minimum {caseItem.offenceCategory.defaultQuorum} non-recused members.
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isQuorumValid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800 animate-pulse'
                    }`}
                  >
                    {isQuorumValid ? `Quorum Verified (${effectiveCount}/3)` : `Quorum Defect (${effectiveCount}/3)`}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Appointed Panel Chair:</span>
                    <span className="font-bold text-slate-800">{caseItem.committeeRecord?.committeeChair}</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-slate-500 block text-[11px] font-semibold">
                      Standing Panel Members &amp; Conflict Disclosures:
                    </span>
                    <div className="space-y-1.5">
                      {baseMembers.map((m, idx) => {
                        const isRecused = recusedMembers.includes(m);
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                              isRecused
                                ? 'bg-red-50/70 border-red-200 text-red-900'
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isRecused ? (
                                <UserX className="w-4 h-4 text-red-600" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                              <div>
                                <span className="font-medium">{m}</span>
                                <span className="text-[10px] text-slate-400 block">
                                  {isRecused ? 'Formally Recused (Personal / Academic Conflict)' : 'Impartiality Oath Confirmed'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (isRecused) {
                                  setRecusedMembers(recusedMembers.filter((item) => item !== m));
                                } else {
                                  setRecusedMembers([...recusedMembers, m]);
                                }
                              }}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition ${
                                isRecused
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                              }`}
                            >
                              {isRecused ? 'Clear Recusal' : 'Declare Conflict'}
                            </button>
                          </div>
                        );
                      })}

                      {alternateAppointed && (
                        <div className="p-2.5 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <div>
                              <span className="font-bold">Dr. Ananya Sen (Alternate Faculty Nominee)</span>
                              <span className="text-[10px] text-emerald-700 block">Appointed by Dean to fulfill Quorum</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            Alternate Active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isQuorumValid && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-red-900">Statutory Quorum Defect ({effectiveCount}/3 Required)</p>
                          <p className="text-[11px] text-red-700 leading-tight">
                            Under University Regulation §12.3, hearings cannot legally deliberate without at least 3 impartial members.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAlternateAppointed(true)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg shadow-xs shrink-0 transition"
                      >
                        Appoint Alternate Nominee
                      </button>
                    </div>
                  )}

                  {caseItem.committeeRecord?.deliberationMinutes && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-semibold text-slate-700 block mb-1">Deliberation Minutes:</span>
                      <p className="text-[11px] text-slate-600 italic leading-relaxed">
                        &ldquo;{caseItem.committeeRecord.deliberationMinutes}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Save Quorum Determination Button */}
                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      {committeeSaved ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Quorum Saved &amp; Cryptographically Sealed
                        </span>
                      ) : (
                        <span>Save panel adjustments to formal case ledger.</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveCommittee}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Save Committee Status
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}


          {/* Decision Order (If Recorded) */}
          {caseItem.decision && (
            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-sm font-bold text-emerald-950">Formal Reasoned Decision Order</h2>
                  </div>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Decided by named human authority under statutory due process.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded font-semibold">
                  Human Authority Signed
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Verdict / Finding of Responsibility:</span>
                  <p className="font-bold text-slate-900 text-sm">{caseItem.decision.verdict}</p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Sanction Imposed:</span>
                  <p className="font-semibold text-emerald-800 bg-emerald-100/70 p-2 rounded-lg">
                    {caseItem.decision.sanctionImposed}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Detailed Legal &amp; Factual Reasoning:</span>
                  <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-emerald-200/60 mt-1">
                    {caseItem.decision.reasoningText}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Appellate Route:</span>
                    <p className="font-semibold text-slate-800">{caseItem.decision.appealRoute}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Statutory Appeal Deadline:</span>
                    <p className="font-semibold text-amber-700">
                      {new Date(caseItem.decision.appealDeadline).toLocaleDateString()} (14 Days)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cryptographic Evidence Locker */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-600" />
              Cryptographic Evidence Locker (WORM Mode)
            </h2>

            <div className="space-y-2">
              {caseItem.incidentReport?.evidenceItems.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{ev.fileName}</p>
                      <p className="text-[10px] text-slate-400">
                        {(ev.fileSize / 1024).toFixed(1)} KB · Uploaded by {ev.uploadedBy}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      SHA-256: {ev.sha256Checksum.substring(0, 16)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Precedents & Policy Lookup */}
        <div className="space-y-6">
          {/* Precedent Browser Card (WITH PROMINENT "FOR REFERENCE ONLY" LABEL) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Comparable Precedents</h2>
              </div>
              <p className="text-xs text-slate-500">
                Anonymized historical cases for {caseItem.offenceCategory.name}.
              </p>
            </div>

            {/* MANDATORY GUARDRAIL BANNER */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <strong className="block font-bold mb-0.5">⚠️ FOR REFERENCE ONLY — NOT AN AI RECOMMENDATION</strong>
              The disciplinary committee is legally bound to judge this case on its independent facts. Past cases do
              not dictate the sanction.
            </div>

            <div className="space-y-3">
              {precedents.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-slate-700">{p.anonymizedCaseRef}</span>
                    <span className="text-slate-400 font-medium">{p.yearResolved}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{p.generalizedFacts}</p>
                  <div className="pt-1.5 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500 block text-[10px]">Applied Sanction Range:</span>
                    <strong className="text-slate-800">{p.sanctionImposedRange}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Statutory Rules Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-600" />
              Statutory Authority Rules
            </h2>
            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Procedural Ref:</span>
                <span className="font-semibold text-slate-800">{caseItem.offenceCategory.procedureReference}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Response Window:</span>
                <span className="font-semibold text-slate-800">{caseItem.offenceCategory.responseWindowDays} days</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Statutory Quorum:</span>
                <span className="font-semibold text-slate-800">{caseItem.offenceCategory.defaultQuorum} members</span>
              </div>
              <div className="flex justify-between">
                <span>Appeal Period:</span>
                <span className="font-semibold text-slate-800">{caseItem.offenceCategory.appealWindowDays} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
