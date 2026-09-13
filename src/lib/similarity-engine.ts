// Multi-Factor Precedent Similarity Engine for EDUguard
// Evaluates active disciplinary cases against historical closed precedents
// Strictly enforces procedural consistency without prescribing sanctions

import { Case, IntentType, MultiFactorScore, OccurrenceType, PrecedentIndex, RankedPrecedentMatch, SeverityLevel } from '@/types';
import { PRECEDENT_INDEX } from './mock-data';

const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  MINOR: 1,
  MODERATE: 2,
  MAJOR: 3,
  CRITICAL: 4,
};

/**
 * Infer active case intent from description, evidence and checklist notes
 */
export function inferCaseIntent(caseItem: Case): { intent: IntentType; rationale: string } {
  const text = `${caseItem.title} ${caseItem.incidentReport?.description || ''}`.toLowerCase();

  if (text.includes('contract cheating') || text.includes('freelance') || text.includes('commercial') || text.includes('fabricated') || text.includes('deliberate')) {
    return {
      intent: 'PREMEDITATED',
      rationale: 'Active file indicators suggest organized or pre-planned conduct.',
    };
  }
  if (text.includes('obfuscation') || text.includes('renam') || text.includes('rebase') || text.includes('concealed') || text.includes('past midnight')) {
    return {
      intent: 'RECKLESS',
      rationale: 'Record indicates conscious disregard of institutional standards or reckless risk-taking.',
    };
  }
  if (text.includes('collaboration') || text.includes('peer') || text.includes('uncited') || text.includes('shared') || text.includes('ast diff')) {
    return {
      intent: 'NEGLIGENT',
      rationale: 'Evidence points toward informal collaboration and negligent omission of proper attribution.',
    };
  }
  if (text.includes('accidental') || text.includes('mechanical fault') || text.includes('tampering')) {
    return {
      intent: 'ACCIDENTAL',
      rationale: 'Apparent procedural error or apparatus mishap during unsupervised utilization.',
    };
  }

  return {
    intent: 'NEGLIGENT',
    rationale: 'Standard presumption of procedural negligence pending formal hearing determination.',
  };
}

/**
 * Infer occurrence type (first time vs repeat)
 */
export function inferOccurrenceType(caseItem: Case): OccurrenceType {
  const text = `${caseItem.title} ${caseItem.incidentReport?.description || ''}`.toLowerCase();
  return text.includes('repeat') || text.includes('second offence') || text.includes('prior warning')
    ? 'REPEAT_OFFENCE'
    : 'FIRST_TIME';
}

/**
 * Extract evidence keywords from active case
 */
export function extractEvidenceKeywords(caseItem: Case): string[] {
  const items: string[] = [];
  if (caseItem.incidentReport?.evidenceItems) {
    for (const ev of caseItem.incidentReport.evidenceItems) {
      items.push(ev.fileName.toLowerCase());
    }
  }
  if (caseItem.incidentReport?.witnesses && caseItem.incidentReport.witnesses.length > 0) {
    items.push('witness statements');
  }
  return items;
}

/**
 * Calculates multi-factor score between an active case and a historical closed precedent
 */
export function calculatePrecedentSimilarity(
  activeCase: Case,
  precedent: PrecedentIndex
): MultiFactorScore {
  const activeIntent = inferCaseIntent(activeCase).intent;
  const activeOccurrence = inferOccurrenceType(activeCase);
  const activeSeverity = activeCase.offenceCategory.severity || 'MODERATE';
  const activeEvKeywords = extractEvidenceKeywords(activeCase);
  const activeText = `${activeCase.title} ${activeCase.incidentReport?.description || ''} ${activeCase.department}`.toLowerCase();

  // 1. Offence Type & Category Match (25%)
  let offenceTypeScore = 0;
  if (activeCase.offenceCategoryId === precedent.offenceCategoryId) {
    offenceTypeScore = 80;
    // Boost for sub-offence semantic similarity
    if (
      (activeText.includes('algorithm') && precedent.searchKeywords.includes('algorithms')) ||
      (activeText.includes('code') && precedent.searchKeywords.includes('code plagiarism')) ||
      (activeText.includes('device') && precedent.searchKeywords.includes('unauthorized device')) ||
      (activeText.includes('sound') && precedent.searchKeywords.includes('sound amplification'))
    ) {
      offenceTypeScore = 100;
    } else if (activeText.includes('git') && precedent.searchKeywords.includes('git repository')) {
      offenceTypeScore = 95;
    }
  } else if (activeCase.offenceCategory.code.startsWith('ACAD') && precedent.categoryCode.startsWith('ACAD')) {
    offenceTypeScore = 45;
  } else if (activeCase.offenceCategory.code.startsWith('COND') && precedent.categoryCode.startsWith('COND')) {
    offenceTypeScore = 45;
  } else {
    offenceTypeScore = 15;
  }

  // 2. Intent Alignment (20%)
  let intentScore = 0;
  if (activeIntent === precedent.intent) {
    intentScore = 100;
  } else if (
    (activeIntent === 'NEGLIGENT' && precedent.intent === 'RECKLESS') ||
    (activeIntent === 'RECKLESS' && precedent.intent === 'NEGLIGENT') ||
    (activeIntent === 'ACCIDENTAL' && precedent.intent === 'NEGLIGENT')
  ) {
    intentScore = 65;
  } else if (
    (activeIntent === 'RECKLESS' && precedent.intent === 'PREMEDITATED') ||
    (activeIntent === 'PREMEDITATED' && precedent.intent === 'RECKLESS')
  ) {
    intentScore = 40;
  } else {
    intentScore = 20;
  }

  // 3. Circumstances & Setting Match (15%)
  let circumstancesScore = 30;
  const precedentCircumstances = `${precedent.circumstances} ${precedent.generalizedFacts}`.toLowerCase();
  const contextTokens = ['lab', 'deadline', 'exam', 'midterm', 'after-hours', 'peer', 'collaboration', 'hostel', 'capstone'];
  let matchedTokens = 0;
  for (const token of contextTokens) {
    if (activeText.includes(token) && precedentCircumstances.includes(token)) {
      matchedTokens++;
    }
  }
  circumstancesScore = Math.min(100, 30 + matchedTokens * 25);

  // 4. Severity Level Match (15%)
  const activeSevVal = SEVERITY_ORDER[activeSeverity] || 2;
  const precSevVal = SEVERITY_ORDER[precedent.severity] || 2;
  const sevDelta = Math.abs(activeSevVal - precSevVal);
  const severityScore = sevDelta === 0 ? 100 : sevDelta === 1 ? 65 : sevDelta === 2 ? 30 : 10;

  // 5. Occurrence History Match (10%)
  const occurrenceScore = activeOccurrence === precedent.occurrenceHistory ? 100 : 25;

  // 6. Evidence Pattern Overlap (15%)
  let evidenceMatches = 0;
  const precEvidenceText = precedent.evidencePatterns.join(' ').toLowerCase();
  for (const ev of activeEvKeywords) {
    if (
      (ev.includes('diff') && precEvidenceText.includes('diff')) ||
      (ev.includes('ast') && precEvidenceText.includes('ast')) ||
      (ev.includes('git') && precEvidenceText.includes('git')) ||
      (ev.includes('log') && precEvidenceText.includes('log')) ||
      (ev.includes('witness') && precEvidenceText.includes('witness')) ||
      (ev.includes('decibel') && precEvidenceText.includes('decibel'))
    ) {
      evidenceMatches++;
    }
  }
  const evidenceScore = Math.min(100, Math.max(25, evidenceMatches * 35));

  // Weighted total (0 - 100)
  const overallPct = Math.round(
    0.25 * offenceTypeScore +
    0.20 * intentScore +
    0.15 * circumstancesScore +
    0.15 * severityScore +
    0.10 * occurrenceScore +
    0.15 * evidenceScore
  );

  // Derive concrete similarities and distinguishing factors
  const similarityFactors: string[] = [];
  const distinguishingFactors: string[] = [];

  if (activeCase.offenceCategoryId === precedent.offenceCategoryId) {
    similarityFactors.push(`Both cases fall under statutory classification ${precedent.categoryCode} (${precedent.categoryName}).`);
  } else {
    distinguishingFactors.push(`Differing offence classification: Active is ${activeCase.offenceCategory.code}, while precedent is ${precedent.categoryCode}.`);
  }

  if (activeIntent === precedent.intent) {
    similarityFactors.push(`Identical mental state/intent assessment: Both characterized by ${activeIntent.toLowerCase()} conduct.`);
  } else {
    distinguishingFactors.push(`Intent variance: Active case characterized as ${activeIntent.toLowerCase()} vs. precedent characterized as ${precedent.intent.toLowerCase()}.`);
  }

  if (activeOccurrence === precedent.occurrenceHistory) {
    similarityFactors.push(`Equivalent occurrence posture: Both involving ${activeOccurrence === 'FIRST_TIME' ? 'first-time respondents with clean disciplinary records' : 'prior disciplinary history'}.`);
  } else {
    distinguishingFactors.push(`Disciplinary record variance: Active case is ${activeOccurrence.replace('_', ' ').toLowerCase()} vs. precedent was ${precedent.occurrenceHistory.replace('_', ' ').toLowerCase()}.`);
  }

  if (evidenceMatches > 0) {
    similarityFactors.push(`Evidentiary alignment: Shared reliance on technical verification artifacts (${precedent.evidencePatterns.slice(0, 2).join(', ')}).`);
  } else {
    distinguishingFactors.push(`Distinct evidence topology: Precedent relied primarily on ${precedent.evidencePatterns[0] || 'different records'}.`);
  }

  if (severityScore === 100) {
    similarityFactors.push(`Equivalent institutional severity rating: Both categorized as ${activeSeverity}.`);
  } else {
    distinguishingFactors.push(`Severity divergence: Active docket rated ${activeSeverity} vs precedent rated ${precedent.severity}.`);
  }

  // Procedural comparison
  const proceduralAlignment = `Precedent was adjudicated by ${precedent.procedureFollowed.hearingBody} with a quorum of ${precedent.procedureFollowed.quorum} over ${precedent.procedureFollowed.durationDays} days. Active docket requires statutory quorum of ${activeCase.offenceCategory.defaultQuorum} members.`;

  // Precedent outcome note
  const outcomeConsistencyNotes = `In ${precedent.anonymizedCaseRef} (${precedent.yearResolved}), the committee recorded: "${precedent.outcomeRecorded.sanction}". Reasoning noted: ${precedent.outcomeRecorded.reasoningSummary} (Disciplinary discretion resides exclusively with the committee).`;

  return {
    overallPct,
    offenceTypeScore,
    intentScore,
    circumstancesScore,
    severityScore,
    occurrenceScore,
    evidenceScore,
    similarityFactors,
    distinguishingFactors,
    proceduralAlignment,
    outcomeConsistencyNotes,
  };
}

/**
 * Ranks all closed precedents against an active case using multi-factor comparison
 */
export function rankPrecedentsForCase(
  activeCase: Case,
  catalog: PrecedentIndex[] = PRECEDENT_INDEX
): RankedPrecedentMatch[] {
  const matches: RankedPrecedentMatch[] = catalog.map((precedent) => {
    const score = calculatePrecedentSimilarity(activeCase, precedent);
    return { precedent, score };
  });

  return matches.sort((a, b) => b.score.overallPct - a.score.overallPct);
}
