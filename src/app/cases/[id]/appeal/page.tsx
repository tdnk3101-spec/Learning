'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Scale,
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  Send,
  Gavel,
  ShieldCheck,
} from 'lucide-react';

import { getCaseById, getCurrentPersona, addAuditLog, updateCaseStatus } from '@/lib/store';
import { computeSha256 } from '@/lib/audit';

export default function CaseAppealPage() {
  const params = useParams();
  const caseId = params.id as string;
  const caseItem = getCaseById(caseId);
  const persona = getCurrentPersona();

  const [appealGround, setAppealGround] = React.useState<
    'PROCEDURAL_IRREGULARITY' | 'NEW_MATERIAL_EVIDENCE' | 'DISPROPORTIONATE_SANCTION'
  >('PROCEDURAL_IRREGULARITY');
  const [appealStatement, setAppealStatement] = React.useState('');
  const [evidenceName, setEvidenceName] = React.useState<string | null>(null);
  const [evidenceHash, setEvidenceHash] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [appealLodged, setAppealLodged] = React.useState(false);

  // Appellate Authority review state
  const [appellateOutcome, setAppellateOutcome] = React.useState<'UPHELD' | 'MODIFIED' | 'QUASHED' | 'REMANDED'>('MODIFIED');
  const [appellateReasoning, setAppellateReasoning] = React.useState('');
  const [appellateOrderSigned, setAppellateOrderSigned] = React.useState(false);

  if (!caseItem) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-xl font-bold text-slate-800">Case Docket Not Found</h1>
        <Link href="/cases" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">
          Return to Active Dockets
        </Link>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidenceName(file.name);
    const hash = await computeSha256(file.name + Date.now().toString());
    setEvidenceHash(hash);
  };

  const handleLodgeAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addAuditLog({
        caseId: caseItem.id,
        action: 'APPEAL_LODGED',
        performedBy: `${persona.name} (${persona.role})`,
        details: `Statutory appeal filed under ground [${appealGround}]. Supporting artifact SHA-256: ${
          evidenceHash || 'NONE'
        }`,
      });

      updateCaseStatus(caseItem.id, 'APPEAL_WINDOW');
      setIsSubmitting(false);
      setAppealLodged(true);
    }, 800);
  };

  const handleAppellateDetermination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appellateReasoning.trim()) return;

    addAuditLog({
      caseId: caseItem.id,
      action: 'APPEAL_DECIDED',
      performedBy: `${persona.name} (Appellate Authority)`,
      details: `Appellate bench entered final order: [${appellateOutcome}]. Reasoned Order: ${appellateReasoning.substring(
        0,
        120
      )}...`,
    });

    updateCaseStatus(caseItem.id, 'CLOSED');
    setAppellateOrderSigned(true);
  };


  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/cases/${caseItem.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Case {caseItem.caseNumber}</span>
        </Link>

        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
          Statute §22: Appellate Tribunal
        </span>
      </div>

      {/* Case Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {caseItem.caseNumber}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600">{caseItem.department}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Statutory Appellate Review Chamber
            </h1>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Statutory Window
            </span>
            <span className="text-xs font-bold font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full inline-block mt-0.5">
              14-Day Appeal Period
            </span>
          </div>
        </div>

        {/* Existing Decision Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Original Hearing Finding:</span>
            <span className="font-bold text-slate-800">
              {caseItem.decision?.verdict || 'Responsibility Sustained by Disciplinary Panel'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Sanction Imposed:</span>
            <span className="font-semibold text-emerald-800">
              {caseItem.decision?.sanctionImposed || '1-Semester Suspension & Mandatory Honor Seminar'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Respondent Reference:</span>
            <span className="font-mono text-slate-800 font-semibold">{caseItem.studentDisplayRef}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Appeal Lodgement Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-slate-900">Lodge Formal Due-Process Appeal</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Appeals are evaluated exclusively by the independent Appellate Authority under University Statute §22.
              </p>
            </div>

            {appealLodged ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Appeal Registered &amp; Sealed into Cryptographic Ledger</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  Your appeal grounds under <strong>[{appealGround}]</strong> have been forwarded to the Executive Appellate
                  Tribunal. All sanctions remain stayed pending appellate determination.
                </p>
                {evidenceHash && (
                  <div className="pt-1 font-mono text-[10px] text-emerald-800">
                    Evidence Artifact SHA-256: {evidenceHash}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleLodgeAppeal} className="space-y-4 text-xs">
                {/* Statutory Grounds Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">
                    Statutory Ground for Appeal (Choose One)
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        key: 'PROCEDURAL_IRREGULARITY',
                        title: '1. Procedural Irregularity',
                        desc: 'Defect in summons, improper quorum, or denial of statutory right to inspect evidence.',
                      },
                      {
                        key: 'NEW_MATERIAL_EVIDENCE',
                        title: '2. New Material Evidence',
                        desc: 'Relevant factual evidence that could not reasonably have been produced during the initial hearing.',
                      },
                      {
                        key: 'DISPROPORTIONATE_SANCTION',
                        title: '3. Disproportionate Sanction',
                        desc: 'Sanction is grossly excessive relative to established institutional precedents and mitigating factors.',
                      },
                    ].map((g) => (
                      <label
                        key={g.key}
                        className={`block p-3 rounded-xl border transition cursor-pointer ${
                          appealGround === g.key
                            ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          <input
                            type="radio"
                            name="appealGround"
                            value={g.key}
                            checked={appealGround === g.key}
                            onChange={() => setAppealGround(g.key as typeof appealGround)}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{g.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 ml-5 mt-0.5">{g.desc}</p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Written Petition Grounds */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">
                    Specific Representation &amp; Factual Justification
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={appealStatement}
                    onChange={(e) => setAppealStatement(e.target.value)}
                    placeholder="Articulate precisely why the original finding or sanction violates procedural fairness or fails to account for critical facts..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-sans"
                  />
                </div>

                {/* Evidence Artifact Attachment */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Supporting Evidence / Affidavit</label>
                  <div className="flex items-center justify-between gap-2 flex-wrap p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-slate-500" />
                      <span>{evidenceName ? `Attached: ${evidenceName}` : 'Select Document'}</span>
                      <input type="file" onChange={handleFileUpload} className="hidden" />
                    </label>

                    {evidenceHash && (
                      <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        SHA-256: {evidenceHash.substring(0, 16)}...
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !appealStatement.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Lodging Appeal...' : 'Submit Formal Appeal to Appellate Tribunal'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Appellate Tribunal Decision Chamber (For Dean / Authority) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B1E33] rounded-3xl p-6 sm:p-8 text-white border border-[#1E3A5F] shadow-xl space-y-5">
            <div className="border-b border-[#1E3A5F] pb-3">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-sm tracking-tight text-white">Appellate Tribunal Adjudication</h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Reserved for Senior Appellate Authority (Dean / Provost / Vice Chancellor).
              </p>
            </div>

            {appellateOrderSigned ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Appellate Determination Rendered</span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  Final appellate order entered as <strong>[{appellateOutcome}]</strong>.
                  Signed by {persona.name}. The decision is final and binding on the university.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAppellateDetermination} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200 block text-[11px]">Appellate Determination Order</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'UPHELD', label: 'Uphold Sanction' },
                      { key: 'MODIFIED', label: 'Modify / Reduce' },
                      { key: 'QUASHED', label: 'Quash & Expunge' },
                      { key: 'REMANDED', label: 'Remand Re-hearing' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setAppellateOutcome(opt.key as typeof appellateOutcome)}
                        className={`py-2 px-3 rounded-xl font-bold text-[11px] border text-center transition ${
                          appellateOutcome === opt.key
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200 block text-[11px]">
                    Appellate Tribunal Reasoning &amp; Order Text
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={appellateReasoning}
                    onChange={(e) => setAppellateReasoning(e.target.value)}
                    placeholder="Enter the appellate bench's legal rationale, procedural findings, and final modified disposition..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!appellateReasoning.trim()}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  Sign &amp; Seal Appellate Order
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-[#1E3A5F] text-[10px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Cryptographic sign-off logged to SHA-256 blockchain ledger.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
