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
  ShieldCheck,
  Calendar,
  Send,
  Lock,
  Archive,
  History,
  Info,
  CheckCircle,
  Hourglass,
  FolderLock,
  UserCheck,
  BookOpen,
  Eye,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';

import {
  getCaseById,
  getCurrentPersona,
  getPrecedents,
  toggleChecklistItem,
  updateCommitteeHearing,
  updateSanctionTracking,
  closeCaseDocket,
  acknowledgeNotice,
} from '@/lib/store';
import { ChecklistStatus, SanctionTracking, RankedPrecedentMatch } from '@/types';
import { rankPrecedentsForCase } from '@/lib/similarity-engine';

export default function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [persona, setPersona] = React.useState(getCurrentPersona());
  const [caseItem, setCaseItem] = React.useState(getCaseById(caseId, persona));
  const [activeTab, setActiveTab] = React.useState<'workflow' | 'dossier' | 'committee' | 'sanctions'>('workflow');
  const [recusedMembers, setRecusedMembers] = React.useState<string[]>([]);
  const [alternateAppointed, setAlternateAppointed] = React.useState<boolean>(false);
  const [isUpdatingStep, setIsUpdatingStep] = React.useState<number | null>(null);
  const [committeeSaved, setCommitteeSaved] = React.useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = React.useState<string | null>(null);
  const [selectedPrecedentMatch, setSelectedPrecedentMatch] = React.useState<RankedPrecedentMatch | null>(null);
  const [copiedBrief, setCopiedBrief] = React.useState<boolean>(false);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleStepStatusChange = async (stepNumber: number, newStatus: ChecklistStatus) => {
    if (!caseItem) return;
    setIsUpdatingStep(stepNumber);
    try {
      const updated = await toggleChecklistItem(caseItem.id, stepNumber, persona, newStatus);
      setCaseItem({ ...updated });
      showFeedback(`Checklist Item #${stepNumber} updated to ${newStatus}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update checklist step');
    } finally {
      setIsUpdatingStep(null);
    }
  };

  const handleCycleStep = async (stepNumber: number) => {
    if (!caseItem) return;
    setIsUpdatingStep(stepNumber);
    try {
      const updated = await toggleChecklistItem(caseItem.id, stepNumber, persona);
      setCaseItem({ ...updated });
      showFeedback(`Checklist Item #${stepNumber} advanced`);
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
        caseItem.committeeRecord?.committeeChair || 'Dr. Rajiv Menon',
        effectiveMembers,
        caseItem.committeeRecord?.hearingDate || new Date().toISOString(),
        caseItem.committeeRecord?.hearingVenue || 'Academic Senate Hall A',
        caseItem.committeeRecord?.deliberationMinutes || 'Formal inquiry convened. Impartiality verified; quorum satisfied.',
        persona
      );
      setCommitteeSaved(true);
      setTimeout(() => setCommitteeSaved(false), 3500);
      const updated = getCaseById(caseId, persona);
      if (updated) setCaseItem({ ...updated });
      showFeedback('Disciplinary Committee Constitution and Quorum saved');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating committee quorum');
    }
  };

  const handleAcknowledgeNotice = async (noticeId: string) => {
    if (!caseItem) return;
    try {
      await acknowledgeNotice(caseItem.id, noticeId, 'Receipt acknowledged and logged via Student Portal verification.', persona);
      const updated = getCaseById(caseId, persona);
      if (updated) setCaseItem({ ...updated });
      showFeedback('Student notice acknowledgement confirmed and logged to audit ledger');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error acknowledging notice');
    }
  };

  const handleSanctionStatusUpdate = async (newStatus: SanctionTracking['completionStatus']) => {
    if (!caseItem) return;
    try {
      const updated = await updateSanctionTracking(caseItem.id, { completionStatus: newStatus }, persona);
      setCaseItem({ ...updated });
      showFeedback(`Sanction completion status marked as ${newStatus}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating sanction');
    }
  };

  const handleCloseCase = async () => {
    if (!caseItem) return;
    if (!confirm(`Are you sure you want to formally close docket ${caseItem.caseNumber}? This starts the retention timer.`)) return;
    try {
      const updated = await closeCaseDocket(caseItem.id, persona);
      setCaseItem({ ...updated });
      showFeedback(`Case ${caseItem.caseNumber} formally closed`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error closing case');
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
        <h2 className="text-lg font-bold text-slate-900">Access Restricted / Docket Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Under EDUguard role-based access control, you can only inspect case dockets within your department or
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
  const rankedPrecedents = rankPrecedentsForCase(caseItem);
  const completedChecklistCount = caseItem.checklistItems.filter((c) => c.status === 'COMPLETED').length;
  const checklistProgressPct = Math.round((completedChecklistCount / caseItem.checklistItems.length) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Feedback */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/40 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionSuccessMsg}
        </div>
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/cases" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Dockets
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {caseItem.caseNumber}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {caseItem.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{caseItem.title}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span>Jurisdiction: <strong>{caseItem.department}</strong></span>
            <span>·</span>
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {caseItem.studentDisplayRef}
            </span>
            <span>·</span>
            <span>
              Opened: <strong>{new Date(caseItem.createdAt).toLocaleDateString()}</strong>
            </span>
            {caseItem.closedAt && (
              <>
                <span>·</span>
                <span className="text-emerald-700 font-semibold">Closed: {new Date(caseItem.closedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/cases/${caseItem.id}/notice`}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            Notices ({caseItem.notices.length})
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

      {/* Step 2: Policy & Offence Mapping View (Statutory Grounding) */}
      <div className="bg-white rounded-2xl p-5 border border-blue-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-blue-100 pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Step 2: Statutory Policy &amp; Offence Mapping</h2>
              <p className="text-[11px] text-slate-500">Institutionally grounded due-process parameters for {caseItem.offenceCategory.code}</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Severity: {caseItem.offenceCategory.severity}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Offence Category</span>
            <p className="font-bold text-slate-900 mt-1">{caseItem.offenceCategory.name}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Applicable Policy</span>
            <p className="font-bold text-slate-900 mt-1">{caseItem.offenceCategory.applicablePolicy}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Relevant Policy Clause</span>
            <p className="font-semibold text-emerald-800 mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
              {caseItem.offenceCategory.relevantClause}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Required Procedure</span>
            <p className="font-medium text-slate-800 mt-1">{caseItem.offenceCategory.requiredProcedure}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">5. Competent Authority</span>
            <p className="font-bold text-slate-900 mt-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              {caseItem.offenceCategory.competentAuthority}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'workflow'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          Due-Process Checklist ({completedChecklistCount}/8)
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'dossier'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderLock className="w-4 h-4 text-blue-400" />
          Secure Case File Dossier (8 Records)
        </button>

        <button
          onClick={() => setActiveTab('committee')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'committee'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4 text-purple-400" />
          Committee Support Console
        </button>

        <button
          onClick={() => setActiveTab('sanctions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'sanctions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Archive className="w-4 h-4 text-amber-400" />
          Sanctions &amp; Case Closure
        </button>
      </div>

      {/* TAB 1: Step 3 — Due-Process Checklist Workflow */}
      {activeTab === 'workflow' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Checklist Progress Bar Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Step 3: Statutory Due-Process Checklist
                  </h2>
                  <p className="text-xs text-slate-500">
                    Each procedural milestone must be verified. Status cycles: <strong>Pending → In Progress → Completed</strong>.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">{completedChecklistCount} of 8 Completed</span>
                  <span className="text-[10px] text-slate-400 block">({checklistProgressPct}%)</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${checklistProgressPct}%` }}
                />
              </div>

              {/* Exact 8 Checklist Items */}
              <div className="space-y-3 pt-1">
                {caseItem.checklistItems.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                      step.status === 'COMPLETED'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : step.status === 'IN_PROGRESS'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-slate-50/70 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {step.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : step.status === 'IN_PROGRESS' ? (
                          <Hourglass className="w-5 h-5 text-amber-600 animate-pulse" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {step.stepNumber}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-slate-900">{step.requirement}</p>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                              step.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : step.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {step.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{step.description}</p>
                        {step.notes && (
                          <p className="text-[10px] text-slate-600 italic">Audit Note: {step.notes}</p>
                        )}
                        {step.completedAt && (
                          <span className="text-[10px] text-emerald-700 block font-medium">
                            Completed: {new Date(step.completedAt).toLocaleString()} ({step.completedBy || 'System'})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3-State Interactive Buttons */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleStepStatusChange(step.stepNumber, 'PENDING')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            step.status === 'PENDING'
                              ? 'bg-slate-700 text-white'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepStatusChange(step.stepNumber, 'IN_PROGRESS')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            step.status === 'IN_PROGRESS'
                              ? 'bg-amber-600 text-white'
                              : 'text-slate-400 hover:text-amber-700'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepStatusChange(step.stepNumber, 'COMPLETED')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            step.status === 'COMPLETED'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400 hover:text-emerald-700'
                          }`}
                        >
                          Completed
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isUpdatingStep === step.stepNumber}
                        onClick={() => handleCycleStep(step.stepNumber)}
                        className="text-[10px] text-slate-500 hover:text-emerald-700 font-medium underline"
                      >
                        {isUpdatingStep === step.stepNumber ? 'Recording...' : 'Cycle Next Status →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Committee Constitution & Quorum (Step 3 Requirement #5) */}
            {(() => {
              const baseMembers = caseItem.committeeRecord?.membersAssigned || [];
              const effectiveCount = baseMembers.filter((m) => !recusedMembers.includes(m)).length + (alternateAppointed ? 1 : 0);
              const isQuorumValid = effectiveCount >= (caseItem.offenceCategory.defaultQuorum || 3);

              return (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Disciplinary Committee Constitution &amp; Impartiality Check
                      </h2>
                      <p className="text-xs text-slate-500">
                        Mandatory quorum: minimum {caseItem.offenceCategory.defaultQuorum} non-recused impartial members.
                      </p>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isQuorumValid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800 animate-pulse'
                      }`}
                    >
                      {isQuorumValid ? `Quorum Verified (${effectiveCount}/${caseItem.offenceCategory.defaultQuorum})` : `Quorum Defect (${effectiveCount}/${caseItem.offenceCategory.defaultQuorum})`}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Appointed Committee Chair:</span>
                      <span className="font-bold text-slate-800">{caseItem.committeeRecord?.committeeChair}</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="text-slate-500 block text-[11px] font-semibold">
                        Committee Bench Members &amp; Conflict Recusal Declarations:
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
                                    {isRecused ? 'Formally Recused due to conflict' : 'Impartiality verified'}
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
                                <span className="text-[10px] text-emerald-700 block">Appointed by Dean to restore quorum</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              Alternate Nominee Active
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
                            <p className="font-bold text-red-900">Quorum Defect: Minimum {caseItem.offenceCategory.defaultQuorum} Members Required</p>
                            <p className="text-[11px] text-red-700 leading-tight">
                              Statutory due-process prohibits convening oral inquests or deliberating sanctions without quorum.
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

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {committeeSaved ? 'Quorum verified and saved to cryptographic ledger.' : 'Save quorum determination to docket.'}
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveCommittee}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Save Committee State
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Column: Docket Summary & Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                Case Summary &amp; Status
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Current Milestone:</span>
                  <strong className="text-slate-800">{caseItem.status.replace(/_/g, ' ')}</strong>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Response Window:</span>
                  <span className="font-semibold text-amber-700">{caseItem.offenceCategory.responseWindowDays} Days</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Hearing Quorum:</span>
                  <span className="font-semibold text-slate-800">Min {caseItem.offenceCategory.defaultQuorum} Members</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Statutory Appeal Period:</span>
                  <span className="font-semibold text-purple-700">{caseItem.offenceCategory.appealWindowDays} Days</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Retention Expiry:</span>
                  <span className="font-mono text-[11px] text-slate-700">
                    {caseItem.retentionExpiryAt ? new Date(caseItem.retentionExpiryAt).toLocaleDateString() : '3 Years'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Link Card to Notices */}
            <div className="bg-gradient-to-br from-slate-900 to-[#102A45] text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Statutory Communication</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate show-cause notices, hearing summons, committee communications, and track acknowledgements.
              </p>
              <Link
                href={`/cases/${caseItem.id}/notice`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Open Notice Engine →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Step 5 — Secure Case File Dossier (8 Sections) */}
      {activeTab === 'dossier' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Step 5: Secure Case File Dossier</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Maintain a secure case file containing all 8 evidentiary items, recorded with immutable timestamps and RBAC access control.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold">
              Access Control &amp; Timestamps Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Incident Report */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  1. Incident Report
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {caseItem.incidentReport ? new Date(caseItem.incidentReport.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {caseItem.incidentReport?.description || 'No statement registered.'}
              </p>
              <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                <span>Location: <strong>{caseItem.incidentReport?.location}</strong></span>
                <span>Reported by: <strong>{caseItem.incidentReport?.reportingPerson}</strong></span>
              </div>
            </div>

            {/* 2. Statements (Witnesses & Persons Involved) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  2. Witness &amp; Involved Statements
                </span>
                <span className="text-[10px] text-slate-500">
                  {caseItem.incidentReport?.personsInvolved.length || 0} Persons · {caseItem.incidentReport?.witnesses.length || 0} Witnesses
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                {caseItem.incidentReport?.personsInvolved.map((p) => (
                  <div key={p.id} className="flex justify-between text-[11px] py-0.5 border-b border-slate-200/40">
                    <span className="font-semibold text-slate-800">{p.name} ({p.role})</span>
                    <span className="text-slate-500 font-mono">{p.identifier}</span>
                  </div>
                ))}
                {caseItem.incidentReport?.witnesses.map((w) => (
                  <div key={w.id} className="text-[11px] text-slate-600 pt-0.5">
                    <strong>Witness: {w.name}</strong> ({w.designation})
                    {w.statementSummary && <p className="italic text-slate-500">&ldquo;{w.statementSummary}&rdquo;</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Evidence */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-purple-600" />
                  3. Cryptographic Evidence Items ({caseItem.incidentReport?.evidenceItems.length || 0})
                </span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.2 rounded border border-purple-200">
                  WORM Locked
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {caseItem.incidentReport?.evidenceItems.map((ev) => (
                  <div key={ev.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-800 truncate">{ev.fileName}</span>
                    <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                      SHA: {ev.sha256Checksum.substring(0, 12)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Notices & Delivery Proof */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-600" />
                  4. Dispatched Notices &amp; Acknowledgements
                </span>
                <span className="text-[10px] text-slate-500">{caseItem.notices.length} Recorded</span>
              </div>
              {caseItem.notices.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {caseItem.notices.map((n) => (
                    <div key={n.id} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{n.type.replace(/_/g, ' ')}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          n.acknowledgementStatus === 'ACKNOWLEDGED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {n.acknowledgementStatus}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Sent: {n.sentAt ? new Date(n.sentAt).toLocaleDateString() : 'Draft'}</span>
                        <span>To: {n.recipientRef}</span>
                      </div>
                      {n.acknowledgementStatus === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleAcknowledgeNotice(n.id)}
                          className="mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
                        >
                          Confirm Student Acknowledgement
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No formal notice dispatched yet.</p>
              )}
            </div>

            {/* 5. Student Responses */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  5. Student Written Responses
                </span>
                <span className="text-[10px] text-slate-500">Right to be Heard</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                {caseItem.checklistItems.find((c) => c.stepNumber === 4)?.notes ||
                  'Formal written representation submitted under statutory representation window.'}
              </p>
              <div className="pt-1">
                <Link
                  href="/student"
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Inspect in Student Defense Portal →
                </Link>
              </div>
            </div>

            {/* 6. Hearing Records */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  6. Hearing Records &amp; Deliberation Minutes
                </span>
                <span className="text-[10px] text-slate-500">
                  {caseItem.committeeRecord?.hearingDate ? new Date(caseItem.committeeRecord.hearingDate).toLocaleDateString() : 'Scheduled'}
                </span>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-slate-700 font-medium">Venue: {caseItem.committeeRecord?.hearingVenue || 'Senate Chamber B'}</p>
                <p className="text-[11px] text-slate-600 italic">
                  &ldquo;{caseItem.committeeRecord?.deliberationMinutes || 'Hearing convened; student representation heard.'}&rdquo;
                </p>
              </div>
            </div>

            {/* 7. Committee Records */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  7. Committee Composition &amp; Quorum
                </span>
                <span className="text-[10px] font-mono text-emerald-700">
                  {caseItem.committeeRecord?.isQuorumMet ? 'Quorum Verified' : 'Pending Quorum'}
                </span>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-slate-600">Chair: <strong>{caseItem.committeeRecord?.committeeChair}</strong></p>
                <p className="text-[11px] text-slate-500">
                  Members: {caseItem.committeeRecord?.membersAssigned.join(', ') || 'Pending appointment'}
                </p>
              </div>
            </div>

            {/* 8. Final Decision */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1.5">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-emerald-700" />
                  8. Final Reasoned Decision
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded font-bold">
                  {caseItem.decision ? 'Reasoned Order Signed' : 'Deliberation Pending'}
                </span>
              </div>
              {caseItem.decision ? (
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-slate-900">{caseItem.decision.verdict}</p>
                  <p className="font-semibold text-emerald-800 bg-white p-2 rounded border border-emerald-200/60">
                    Sanction: {caseItem.decision.sanctionImposed}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {caseItem.decision.reasoningText}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    Decided by {caseItem.decision.decidedBy} on {new Date(caseItem.decision.decidedAt).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Awaiting completion of oral inquest before authorized human entry.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Step 6 — Committee Support Console */}
      {activeTab === 'committee' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Step 6: Committee Support Console</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Objective institutional guidance for committee deliberations.
            </p>
          </div>

          {/* MANDATORY GUARDRAIL BANNER */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm mb-0.5">
                IMPORTANT: SYSTEM PROVIDES INFORMATION ONLY
              </strong>
              <span>
                EDUguard provides policy clauses, procedural requirements, timeline data, and anonymised previous precedents.
                <strong> The system does not tell the committee what punishment to give.</strong> Disciplinary discretion resides strictly with the authorized human committee.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Applicable Policy Clauses */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                1. Applicable Policy Clauses
              </h3>
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 block">{caseItem.offenceCategory.applicablePolicy}</span>
                <p className="font-semibold text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 text-[11px]">
                  {caseItem.offenceCategory.relevantClause}
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                  {caseItem.offenceCategory.description}
                </p>
              </div>
            </div>

            {/* 2. Procedural Requirements */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                2. Procedural Due-Process Requirements
              </h3>
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Statutory Quorum:</span>
                  <strong>Minimum {caseItem.offenceCategory.defaultQuorum} members without conflict</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Mandatory Response Window:</span>
                  <strong>{caseItem.offenceCategory.responseWindowDays} calendar days</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Notice of Summons:</span>
                  <strong>Minimum 72 hours prior notice to respondent</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Right of Representation:</span>
                  <strong>Right to be accompanied by certified student advocate</strong>
                </div>
              </div>
            </div>

            {/* 3. Similar Case Support & Precedent Matching */}
            <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-2.5 gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-purple-600" />
                    3. Similar Case Support (Multi-Factor Precedent Matching)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ranked by multi-factor comparability (offence, intent, circumstances, severity, occurrence, evidence).
                  </p>
                </div>
                <Link
                  href="/precedents"
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs flex items-center gap-1 self-start sm:self-auto"
                >
                  Full Precedent Index <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rankedPrecedents.slice(0, 4).map((match, idx) => {
                  const p = match.precedent;
                  const score = match.score;
                  const badgeColor =
                    score.overallPct >= 85
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : score.overallPct >= 70
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-slate-100 text-slate-800 border-slate-300';

                  return (
                    <div key={p.id} className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-3 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {p.anonymizedCaseRef}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Rank #{idx + 1}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${badgeColor}`}>
                            {score.overallPct}% Match
                          </span>
                        </div>

                        <div>
                          <strong className="text-slate-900 block text-xs">{p.title}</strong>
                          <p className="text-slate-600 text-[11px] leading-relaxed mt-1 line-clamp-2">{p.generalizedFacts}</p>
                        </div>

                        {/* Multi-Factor Mini Metrics */}
                        <div className="grid grid-cols-3 gap-1 text-[10px] p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-400 block">Intent:</span>
                            <strong className="text-slate-700">{score.intentScore}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Context:</span>
                            <strong className="text-slate-700">{score.circumstancesScore}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Evidence:</span>
                            <strong className="text-slate-700">{score.evidenceScore}%</strong>
                          </div>
                        </div>

                        <div className="p-2 bg-emerald-50/50 rounded border border-emerald-100 text-[11px] space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-emerald-800 block">Historical Outcome Sanction:</span>
                          <strong className="text-slate-900 line-clamp-2">{p.outcomeRecorded.sanction}</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Resolved: {p.yearResolved}</span>
                        <button
                          onClick={() => setSelectedPrecedentMatch(match)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Compare Side-by-Side
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Side-by-Side Precedent Modal inside Case Details */}
              {selectedPrecedentMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
                  <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
                    <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h4 className="font-bold text-sm text-white">Side-by-Side Precedent Comparison</h4>
                          <span className="text-[11px] text-slate-400">
                            {caseItem.caseNumber} vs {selectedPrecedentMatch.precedent.anonymizedCaseRef} ({selectedPrecedentMatch.score.overallPct}% Match)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPrecedentMatch(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                        <strong>Statutory Due-Process Guardrail:</strong> Provided for committee reference only to maintain consistency. Guilt and punishments are determined exclusively by authorized committee members.
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Active Docket Column */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">ACTIVE DOCKET</span>
                            <h5 className="font-bold text-slate-900 text-sm">{caseItem.caseNumber}</h5>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Title &amp; Offence:</span>
                            <strong className="text-slate-900">{caseItem.title}</strong>
                            <p className="text-slate-600 text-[11px] mt-0.5">{caseItem.offenceCategory.applicablePolicy}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Circumstances:</span>
                            <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">{caseItem.incidentReport?.description}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Sealed Evidence:</span>
                            <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5 mt-0.5">
                              {caseItem.incidentReport?.evidenceItems?.map((ev) => (
                                <li key={ev.id}><strong>{ev.fileName}</strong></li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Precedent Column */}
                        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                          <div className="border-b border-emerald-200 pb-2">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase">HISTORICAL PRECEDENT</span>
                            <h5 className="font-bold text-slate-900 text-sm">{selectedPrecedentMatch.precedent.anonymizedCaseRef}</h5>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Title &amp; Classification:</span>
                            <strong className="text-slate-900">{selectedPrecedentMatch.precedent.title}</strong>
                            <p className="text-slate-600 text-[11px] mt-0.5">{selectedPrecedentMatch.precedent.categoryName} ({selectedPrecedentMatch.precedent.categoryCode})</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Circumstances:</span>
                            <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">{selectedPrecedentMatch.precedent.circumstances}</p>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-emerald-300">
                            <span className="text-[10px] font-bold uppercase text-emerald-800 block">Recorded Sanction &amp; Finding:</span>
                            <strong className="text-slate-900">{selectedPrecedentMatch.precedent.outcomeRecorded.sanction}</strong>
                            <p className="text-[10px] text-slate-600 mt-0.5"><em>Reasoning:</em> {selectedPrecedentMatch.precedent.outcomeRecorded.reasoningSummary}</p>
                          </div>
                        </div>
                      </div>

                      {/* Similarities & Differences */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                          <strong className="text-emerald-900 text-xs block mb-1">Key Similarities:</strong>
                          <ul className="space-y-1 text-[11px] text-slate-700">
                            {selectedPrecedentMatch.score.similarityFactors.map((s, idx) => (
                              <li key={idx}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                          <strong className="text-amber-900 text-xs block mb-1">Distinguishing Differences:</strong>
                          <ul className="space-y-1 text-[11px] text-slate-700">
                            {selectedPrecedentMatch.score.distinguishingFactors.map((d, idx) => (
                              <li key={idx}>• {d}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-1 text-[11px]">
                        <strong className="text-white block text-xs">Procedural &amp; Consistency Consideration:</strong>
                        <p>{selectedPrecedentMatch.score.proceduralAlignment}</p>
                        <p className="text-emerald-300 pt-1">{selectedPrecedentMatch.score.outcomeConsistencyNotes}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => setSelectedPrecedentMatch(null)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                      >
                        Close Comparison
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Case Timeline */}
            <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                5. Case Procedural Timeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Incident Date</span>
                  <strong className="text-slate-900">{caseItem.incidentReport?.incidentDate ? new Date(caseItem.incidentReport.incidentDate).toLocaleDateString() : 'N/A'}</strong>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Docket Opened</span>
                  <strong className="text-slate-900">{new Date(caseItem.createdAt).toLocaleDateString()}</strong>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Notice Dispatched</span>
                  <strong className="text-slate-900">{caseItem.notices[0]?.sentAt ? new Date(caseItem.notices[0].sentAt).toLocaleDateString() : 'Pending'}</strong>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Decision / Closure</span>
                  <strong className="text-slate-900">{caseItem.decision ? new Date(caseItem.decision.decidedAt).toLocaleDateString() : 'In Progress'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Step 8 — Sanctions & Case Closure Tracking */}
      {activeTab === 'sanctions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">Step 8: Sanction &amp; Case Closure Tracking</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor sanction fulfillment status, deadlines, appellate disposition, docket closure, and retention purge clock.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                caseItem.status === 'CLOSED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Docket Status: {caseItem.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sanction Requirements & Completion Status */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 flex items-center justify-between">
                <span>Sanction Requirements &amp; Compliance</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Status: {caseItem.sanctionTracking?.completionStatus || 'PENDING'}
                </span>
              </h3>

              <div className="space-y-2">
                {(caseItem.sanctionTracking?.requirements || [caseItem.decision?.sanctionImposed || caseItem.offenceCategory.sanctionRangeGuide]).map((req, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Mandate #{idx + 1}:</span>
                      <p className="text-slate-700 mt-0.5">{req}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Switcher */}
              <div className="pt-2 border-t border-slate-200/80 space-y-2">
                <span className="text-[11px] font-semibold text-slate-700 block">Update Sanction Fulfillment Status:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleSanctionStatusUpdate(st)}
                      className={`px-3 py-1 rounded-lg font-bold text-[10px] transition ${
                        caseItem.sanctionTracking?.completionStatus === st
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Deadlines, Appeal Status, Case Closure & Retention */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900">Compliance Deadlines &amp; Case Closure</h3>

              <div className="space-y-2.5">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fulfillment Deadline</span>
                    <strong className="text-slate-800">
                      {caseItem.sanctionTracking?.deadline
                        ? new Date(caseItem.sanctionTracking.deadline).toLocaleDateString()
                        : '30 Days from Decision'}
                    </strong>
                  </div>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Appellate Status</span>
                    <strong className="text-slate-800">
                      {caseItem.decision?.appealSubmitted ? 'Appeal Lodged with Tribunal' : 'No Appeal Lodged (Within 14-Day Window)'}
                    </strong>
                  </div>
                  <Scale className="w-4 h-4 text-blue-600" />
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Record Retention Purge Date</span>
                    <strong className="text-slate-800">
                      {caseItem.retentionExpiryAt
                        ? new Date(caseItem.retentionExpiryAt).toLocaleDateString()
                        : `${caseItem.offenceCategory.retentionYears} Years post-resolution`}
                    </strong>
                  </div>
                  <Archive className="w-4 h-4 text-purple-600" />
                </div>
              </div>

              {/* Case Closure Action */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">Final Case Closure</span>
                  <p className="text-[10px] text-slate-500">Permanently closes docket and starts retention countdown.</p>
                </div>
                {caseItem.status !== 'CLOSED' ? (
                  <button
                    type="button"
                    onClick={handleCloseCase}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Close Case Docket
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                    Case Docket Closed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
