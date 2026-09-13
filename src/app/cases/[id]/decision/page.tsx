'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Gavel,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Scale,
} from 'lucide-react';
import { getCaseById, getCurrentPersona, recordHumanDecision } from '@/lib/store';

export default function RecordDecisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [persona, setPersona] = React.useState(getCurrentPersona());
  const [caseItem, setCaseItem] = React.useState(getCaseById(caseId, persona));

  const [verdict, setVerdict] = React.useState('Charge Substantiated (Remedial Action Required)');
  const [reasoning, setReasoning] = React.useState('');
  const [sanction, setSanction] = React.useState('');
  const [appealRoute, setAppealRoute] = React.useState('Executive Disciplinary Appeals Tribunal (Office of the Provost)');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  // Strict Guardrail Check: Only Dean or Committee Member
  const isAuthorizedToDecide =
    persona.role === 'DEAN_STUDENT_AFFAIRS' || persona.role === 'COMMITTEE_MEMBER';

  if (!isAuthorizedToDecide) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl p-8 border border-red-200 shadow-sm space-y-3">
        <ShieldAlert className="w-12 h-12 mx-auto text-red-500" />
        <h2 className="text-base font-bold text-slate-900">Guardrail Enforcement: Authority Denied</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Decisions on guilt and sanction cannot be recorded by role <strong className="font-mono">{persona.role}</strong>.
          Only a named Dean of Student Affairs or assigned Disciplinary Committee Member may record a decision.
        </p>
        <p className="text-[11px] text-slate-400">
          Tip: Switch persona in the sidebar to <strong>Prof. Arthur Sterling (Dean)</strong> or <strong>Dr. Rajiv Menon (Committee Chair)</strong>.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasoning || !sanction) {
      alert('Reasoning text and sanction selection are mandatory under due-process rules.');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordHumanDecision(caseItem.id, verdict, reasoning, sanction, appealRoute, persona);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('persona-changed'));
      }

      router.push(`/cases/${caseItem.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      alert(`Guardrail error: ${message}`);
      setIsSubmitting(false);
    }
  };

  const statutoryAppealDays = caseItem.offenceCategory.appealWindowDays;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/cases/${caseItem.id}`}
          className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Final Stage: Human Deliberation
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="font-mono text-xs font-bold text-slate-900">{caseItem.caseNumber}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Record Reasoned Decision Order</h1>
        </div>
      </div>

      {/* Mandatory Guardrail Declaration Card */}
      <div className="bg-[#0B1727] text-slate-200 rounded-2xl p-6 border border-[#1E3A5F] shadow-md space-y-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <Lock className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Mandatory Human Deliberation Guardrail
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          You are acting as the designated competent authority (<strong>{persona.name}</strong>).
          In compliance with due process statutes, <strong>no automated AI model or heuristic script has write access to this record</strong>.
          Your legal and factual rationale will be cryptographically signed and hash-chained into the permanent tribunal record.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Verdict & Sanction */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Gavel className="w-4 h-4 text-emerald-600" />
            1. Finding of Responsibility & Sanction
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Verdict / Determination <span className="text-red-500">*</span>
            </label>
            <select
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
            >
              <option value="Charge Substantiated in Full">Charge Substantiated in Full</option>
              <option value="Charge Substantiated (Remedial Action Required)">Charge Substantiated (Remedial Action Required)</option>
              <option value="Charge Substantiated with Mitigating Circumstances">Charge Substantiated with Mitigating Circumstances</option>
              <option value="Charge Dismissed / Exonerated">Charge Dismissed / Exonerated (No Fault Found)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sanction Imposed <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sanction}
              onChange={(e) => setSanction(e.target.value)}
              placeholder="e.g. Formal Written Admonition + Zero grade on Assignment 4 + Mandatory Academic Ethics Seminar"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Policy guidance for {caseItem.offenceCategory.code}: {caseItem.offenceCategory.sanctionRangeGuide}
            </p>
          </div>
        </div>

        {/* Card 2: Legal & Factual Rationale */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Reasoned Legal & Factual Justification
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Written Reasoning (Human Authority Only) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Detail the evidence considered, credibility determinations of respondent statements, mitigating or aggravating factors, and proportionate balancing of educational objectives..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-sans"
            />
          </div>
        </div>

        {/* Card 3: Statutory Appellate Window */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            3. Statutory Appeal Channel & Deadlines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Appellate Body</label>
              <input
                type="text"
                required
                value={appealRoute}
                onChange={(e) => setAppealRoute(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Appeal Window</label>
              <div className="px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold">
                {statutoryAppealDays} Calendar Days from Today
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500">
            Sign and seal with authority credentials: <strong className="text-slate-700">{persona.name}</strong>
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {isSubmitting ? 'Sealing Reasoned Order...' : 'Record Human Decision & Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
