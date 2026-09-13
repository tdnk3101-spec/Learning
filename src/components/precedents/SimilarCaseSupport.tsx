'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  X,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  Clock,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { Case, PrecedentIndex, RankedPrecedentMatch } from '@/types';
import { getCurrentPersona, getFilteredCases } from '@/lib/store';
import { rankPrecedentsForCase, inferCaseIntent, inferOccurrenceType } from '@/lib/similarity-engine';
import { PRECEDENT_INDEX } from '@/lib/mock-data';

interface Props {
  initialCaseId?: string;
}

export default function SimilarCaseSupport({ initialCaseId }: Props) {
  const [activeCases, setActiveCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialCaseId || '');
  const [selectedPrecedentForModal, setSelectedPrecedentForModal] = useState<RankedPrecedentMatch | null>(null);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [minMatchThreshold, setMinMatchThreshold] = useState<number>(0);

  useEffect(() => {
    const persona = getCurrentPersona();
    const cases = getFilteredCases(persona);
    setActiveCases(cases);
    if (!selectedCaseId && cases.length > 0) {
      setSelectedCaseId(cases[0].id);
    }
  }, [selectedCaseId]);

  const activeCase = activeCases.find((c) => c.id === selectedCaseId) || activeCases[0];

  // Rank precedents
  const rankedMatches: RankedPrecedentMatch[] = activeCase
    ? rankPrecedentsForCase(activeCase, PRECEDENT_INDEX).filter(
        (m) => m.score.overallPct >= minMatchThreshold
      )
    : [];

  const handleExportBrief = (match: RankedPrecedentMatch) => {
    if (!activeCase) return;
    const brief = `### PRECEDENT COMPARATIVE MEMORANDUM FOR INQUIRY COMMITTEE
**ACTIVE DOCKET:** ${activeCase.caseNumber} — ${activeCase.title}
**RESPONDENT:** ${activeCase.studentDisplayRef}
**CLASSIFICATION:** ${activeCase.offenceCategory.code} (${activeCase.offenceCategory.name})

**COMPARATIVE PRECEDENT:** ${match.precedent.anonymizedCaseRef} (${match.precedent.yearResolved})
**OVERALL MULTI-FACTOR SIMILARITY:** ${match.score.overallPct}%

---

#### 1. MULTI-FACTOR SCORE BREAKDOWN
- Offence Type Match (25% weight): ${match.score.offenceTypeScore}%
- Intent Alignment (20% weight): ${match.score.intentScore}%
- Circumstances & Setting Match (15% weight): ${match.score.circumstancesScore}%
- Severity Rating Match (15% weight): ${match.score.severityScore}%
- Disciplinary History Match (10% weight): ${match.score.occurrenceScore}%
- Evidence Pattern Overlap (15% weight): ${match.score.evidenceScore}%

#### 2. KEY FACTUAL SIMILARITIES
${match.score.similarityFactors.map((f) => `- ${f}`).join('\n')}

#### 3. DISTINGUISHING FACTORS
${match.score.distinguishingFactors.map((f) => `- ${f}`).join('\n')}

#### 4. PROCEDURAL COMPARISON
${match.score.proceduralAlignment}

#### 5. HISTORICAL OUTCOME RECORDED (FOR REFERENCE ONLY)
- Finding: ${match.precedent.outcomeRecorded.finding}
- Historical Sanction: ${match.precedent.outcomeRecorded.sanction}
- Committee Reasoning: ${match.precedent.outcomeRecorded.reasoningSummary}
- Appeal History: ${match.precedent.outcomeRecorded.appealOutcome}

*STATUTORY GUARDRAIL NOTICE:*
This memorandum is provided strictly for committee reference and consistency under institutional due-process regulations. The system does not recommend, evaluate, or determine punishments. Disciplinary discretion resides exclusively with the authorized committee.`;

    navigator.clipboard.writeText(brief);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  if (!activeCase) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Scale className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-semibold">No active dockets available under your current persona.</p>
      </div>
    );
  }

  const activeIntent = inferCaseIntent(activeCase);
  const activeOccurrence = inferOccurrenceType(activeCase);

  return (
    <div className="space-y-6">
      {/* Statutory Guardrail Alert */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-300 shadow-xs flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-950">
          <strong className="font-bold text-sm block text-amber-900">
            STATUTORY COMPLIANCE DIRECTIVE: SYSTEM PROVIDES INFORMATION ONLY
          </strong>
          <p className="text-amber-800 leading-relaxed text-xs">
            The Similar Case Support module analyzes multi-factor attributes (offence type, intent, circumstances, severity, occurrence history, and evidence topology) to provide historical precedents.
            <strong> The system does NOT determine guilt or prescribe sanctions.</strong> Precedents are provided to help authorized human inquiry panels maintain institutional parity, consistency, and fairness.
          </p>
        </div>
      </div>

      {/* Case Selector & Threshold Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Active Case Docket to Compare:
          </label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full sm:w-auto min-w-[320px] px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {activeCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.title} ({c.studentDisplayRef})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500 block">Precedents Evaluated:</span>
            <span className="text-xs font-bold text-slate-900">{rankedMatches.length} Matches</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Min Similarity: {minMatchThreshold}%
            </label>
            <input
              type="range"
              min={0}
              max={80}
              step={10}
              value={minMatchThreshold}
              onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
              className="w-24 accent-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Active Case Fact Breakdown Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white text-slate-800 border border-emerald-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono font-bold">
              Active Docket: {activeCase.caseNumber}
            </span>
            <span className="text-xs text-slate-400 font-medium">·</span>
            <span className="text-xs text-slate-600 font-medium">{activeCase.studentDisplayRef}</span>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs font-semibold">
            {activeCase.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{activeCase.title}</h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {activeCase.incidentReport?.description || 'Incident registered under institutional disciplinary protocol.'}
          </p>
        </div>

        {/* 6 Key Factor Profile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-emerald-100 text-xs">
          <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Offence Category</span>
            <span className="font-bold text-emerald-800 block mt-0.5 truncate">{activeCase.offenceCategory.code}</span>
            <span className="text-[10px] text-slate-500 truncate block">{activeCase.offenceCategory.name}</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Inferred Intent</span>
            <span className="font-bold text-emerald-800 block mt-0.5">{activeIntent.intent}</span>
            <span className="text-[10px] text-slate-500 block truncate">{activeIntent.rationale}</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">3. Circumstances</span>
            <span className="font-bold text-slate-800 block mt-0.5 truncate">Academic Lab</span>
            <span className="text-[10px] text-slate-500 block truncate">{activeCase.department}</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">4. Severity</span>
            <span className="font-bold text-amber-800 block mt-0.5">{activeCase.offenceCategory.severity}</span>
            <span className="text-[10px] text-slate-500 block">Statutory Guide</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">5. Occurrence</span>
            <span className="font-bold text-blue-800 block mt-0.5">{activeOccurrence.replace('_', ' ')}</span>
            <span className="text-[10px] text-slate-500 block">First Disciplinary Citation</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">6. Evidence</span>
            <span className="font-bold text-purple-800 block mt-0.5">{activeCase.incidentReport?.evidenceItems?.length || 0} Sealed Items</span>
            <span className="text-[10px] text-slate-500 block truncate">AST Diff &amp; Git Logs</span>
          </div>
        </div>
      </div>

      {/* Ranked Precedents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Ranked Precedents by Multi-Factor Similarity
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated across 6 dimensions. Sorted from highest genuine comparability to lowest.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rankedMatches.map((match, idx) => {
            const p = match.precedent;
            const score = match.score;

            // Score badge color
            const badgeColor =
              score.overallPct >= 85
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : score.overallPct >= 70
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-slate-100 text-slate-800 border-slate-300';

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {p.anonymizedCaseRef}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {p.categoryCode}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Rank #{idx + 1}</span>
                    </div>

                    <div className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono border ${badgeColor}`}>
                      {score.overallPct}% Match
                    </div>
                  </div>

                  {/* Title & Facts */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">{p.title}</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {p.generalizedFacts}
                    </p>
                  </div>

                  {/* 6-Factor Mini Breakdown Bars */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Multi-Factor Comparison Breakdown:
                    </span>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Offence Type (25%):</span>
                        <strong className="text-slate-800 font-mono">{score.offenceTypeScore}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Intent Alignment (20%):</span>
                        <strong className="text-slate-800 font-mono">{score.intentScore}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Circumstances (15%):</span>
                        <strong className="text-slate-800 font-mono">{score.circumstancesScore}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Severity Match (15%):</span>
                        <strong className="text-slate-800 font-mono">{score.severityScore}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Occurrence (10%):</span>
                        <strong className="text-slate-800 font-mono">{score.occurrenceScore}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Evidence Pattern (15%):</span>
                        <strong className="text-slate-800 font-mono">{score.evidenceScore}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Historical Outcome Tag */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                      Historical Precedent Outcome:
                    </span>
                    <p className="text-xs text-slate-800 font-semibold">{p.outcomeRecorded.sanction}</p>
                    <p className="text-[11px] text-slate-500 italic">Finding: {p.outcomeRecorded.finding}</p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">Resolved Year: {p.yearResolved}</span>
                  <button
                    onClick={() => setSelectedPrecedentForModal(match)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Side-by-Side Comparison
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {selectedPrecedentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base tracking-tight text-white">
                    Side-by-Side Precedent Comparative Analysis
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                    {selectedPrecedentForModal.score.overallPct}% Multi-Factor Match
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Institutional Consistency Matrix: Active Case vs Precedent {selectedPrecedentForModal.precedent.anonymizedCaseRef}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportBrief(selectedPrecedentForModal)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  {copiedBrief ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied Brief!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Export Precedent Brief
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPrecedentForModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Mandatory Guardrail Banner inside modal */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <strong>STATUTORY DUE-PROCESS ASSURANCE: REFERENCE ONLY</strong>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    This comparison highlights historical precedents to preserve institutional continuity across academic terms.
                    <strong> Neither this module nor the chatbot recommends sanctions.</strong> The Disciplinary Committee retains full independent authority.
                  </p>
                </div>
              </div>

              {/* Two Column Side-by-Side Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Active Docket */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        ACTIVE DOCKET FILE
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{activeCase.caseNumber}</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {activeCase.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Case Title &amp; Offence:</span>
                      <strong className="text-slate-900 block">{activeCase.title}</strong>
                      <span className="text-slate-600 text-[11px] block">{activeCase.offenceCategory.applicablePolicy} ({activeCase.offenceCategory.relevantClause})</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intent Assessment:</span>
                      <strong className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block text-[11px] mt-0.5">
                        {activeIntent.intent}
                      </strong>
                      <p className="text-[11px] text-slate-600 mt-1">{activeIntent.rationale}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Circumstances &amp; Setting:</span>
                      <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                        {activeCase.incidentReport?.description}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evidentiary Topology:</span>
                      <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5 mt-1">
                        {activeCase.incidentReport?.evidenceItems?.map((ev) => (
                          <li key={ev.id}>
                            <strong>{ev.fileName}</strong> (SHA-256: <span className="font-mono text-[10px]">{ev.sha256Checksum.slice(0, 10)}...</span>)
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Due-Process State:</span>
                      <p className="text-[11px] text-slate-700">
                        Milestones Completed: <strong>{activeCase.checklistItems.filter((c) => c.status === 'COMPLETED').length} of {activeCase.checklistItems.length}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Historical Precedent */}
                <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-4">
                  <div className="border-b border-emerald-200 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        HISTORICAL PRECEDENT
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {selectedPrecedentForModal.precedent.anonymizedCaseRef}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Resolved {selectedPrecedentForModal.precedent.yearResolved}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Precedent Title &amp; Offence:</span>
                      <strong className="text-slate-900 block">{selectedPrecedentForModal.precedent.title}</strong>
                      <span className="text-slate-600 text-[11px] block">{selectedPrecedentForModal.precedent.categoryName} ({selectedPrecedentForModal.precedent.categoryCode})</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Historical Intent:</span>
                      <strong className="text-blue-800 bg-blue-50 px-2 py-0.5 rounded inline-block text-[11px] mt-0.5">
                        {selectedPrecedentForModal.precedent.intent}
                      </strong>
                      <p className="text-[11px] text-slate-600 mt-1">{selectedPrecedentForModal.precedent.intentDescription}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Circumstances &amp; Setting:</span>
                      <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                        {selectedPrecedentForModal.precedent.circumstances}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evidence Patterns Relied Upon:</span>
                      <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5 mt-1">
                        {selectedPrecedentForModal.precedent.evidencePatterns.map((ep, idx) => (
                          <li key={idx}><strong>{ep}</strong></li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Procedure Followed in Precedent:
                      </span>
                      <p className="text-[11px] text-slate-700">
                        Adjudicated by <strong>{selectedPrecedentForModal.precedent.procedureFollowed.hearingBody}</strong> (Quorum: {selectedPrecedentForModal.precedent.procedureFollowed.quorum}, Hearings: {selectedPrecedentForModal.precedent.procedureFollowed.hearingsCount}, Duration: {selectedPrecedentForModal.precedent.procedureFollowed.durationDays} days).
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-300">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                        Recorded Sanction &amp; Reasoning:
                      </span>
                      <strong className="text-slate-900 block text-xs mt-0.5">
                        {selectedPrecedentForModal.precedent.outcomeRecorded.sanction}
                      </strong>
                      <p className="text-[11px] text-slate-600 mt-1">
                        <em>Reasoning:</em> {selectedPrecedentForModal.precedent.outcomeRecorded.reasoningSummary}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        <em>Appeal Outcome:</em> {selectedPrecedentForModal.precedent.outcomeRecorded.appealOutcome}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deep Qualitative Comparative Synthesis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <h5 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Similarities (Equivalence Factors)
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-slate-700">
                    {selectedPrecedentForModal.score.similarityFactors.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <h5 className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Key Distinguishing Differences
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-slate-700">
                    {selectedPrecedentForModal.score.distinguishingFactors.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Procedural & Consistency Analysis */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-400" /> Procedural Due-Process &amp; Consistency Considerations
                </h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {selectedPrecedentForModal.score.proceduralAlignment}
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300">
                  {selectedPrecedentForModal.score.outcomeConsistencyNotes}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                EDUguard Multi-Factor Precedent Engine · Audit logged under SHA-256
              </span>
              <button
                onClick={() => setSelectedPrecedentForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
