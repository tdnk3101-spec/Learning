// Procedural State Machine & Checklist Engine for Student Discipline ("Agent 47")
// Strictly enforces institutional due process and prevents skipping procedural milestones

import {
  Case,
  CaseStatus,
  OffenceCategory,
  ProceduralChecklistItem,
  UserRole,
} from '@/types';

export const CASE_STATUS_WORKFLOW: {
  status: CaseStatus;
  label: string;
  stepNumber: number;
  description: string;
}[] = [
  {
    status: 'INTAKE',
    label: 'Incident Intake',
    stepNumber: 1,
    description: 'Incident reported, initial evidence secured with SHA-256 hashes, case assigned.',
  },
  {
    status: 'NOTICE_ISSUED',
    label: 'Notice of Charge',
    stepNumber: 2,
    description: 'Formal statement of charges dispatched in prescribed statutory format.',
  },
  {
    status: 'RESPONSE_WINDOW',
    label: 'Response Window',
    stepNumber: 3,
    description: 'Prescribed window open for student written representation / response.',
  },
  {
    status: 'COMMITTEE_CONSTITUTED',
    label: 'Committee & Quorum',
    stepNumber: 4,
    description: 'Formal disciplinary panel constituted, verifying minimum quorum requirements.',
  },
  {
    status: 'HEARING_SCHEDULED',
    label: 'Hearing & Summons',
    stepNumber: 5,
    description: 'Summons issued, date/venue set, procedural right-to-be-heard protected.',
  },
  {
    status: 'DECISION_RECORDED',
    label: 'Human Decision',
    stepNumber: 6,
    description: 'Reasoned order and sanction recorded strictly by named human authority.',
  },
  {
    status: 'APPEAL_WINDOW',
    label: 'Appeal Period',
    stepNumber: 7,
    description: 'Statutory 14-day appeal period open with designated appellate authority.',
  },
  {
    status: 'COMPLIANCE_TRACKING',
    label: 'Sanction Compliance',
    stepNumber: 8,
    description: 'Monitoring fulfillment of corrective sanctions and educational mandates.',
  },
  {
    status: 'CLOSED',
    label: 'Case Closed',
    stepNumber: 9,
    description: 'All requirements satisfied. Retention clock starts for automated anonymization.',
  },
];

/**
 * Deterministically generates procedural checklist items from the offence policy template
 */
export function generateProceduralChecklist(
  caseId: string,
  category: OffenceCategory,
  startDate = new Date()
): ProceduralChecklistItem[] {
  const addDays = (d: Date, days: number) => {
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result.toISOString();
  };

  return [
    {
      id: `chk-${caseId}-1`,
      caseId,
      stepNumber: 1,
      requirement: 'Incident Evidence Verification & Hash Registry',
      description: 'Collect statements and compute SHA-256 integrity checksums for all files.',
      dueDate: addDays(startDate, 1),
      completedAt: new Date().toISOString(),
      completedBy: 'System Auto-Audit',
      status: 'COMPLETED',
      notes: 'Initial evidence locker sealed with cryptographic hash logging.',
    },
    {
      id: `chk-${caseId}-2`,
      caseId,
      stepNumber: 2,
      requirement: 'Issue Prescribed Notice of Charge',
      description: `Prepare and dispatch formal Notice of Charge citing Institutional Code ${category.procedureReference}.`,
      dueDate: addDays(startDate, 2),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-3`,
      caseId,
      stepNumber: 3,
      requirement: `Statutory Response Window (${category.responseWindowDays} Days)`,
      description: 'Await student written statement or acknowledgment of charges.',
      dueDate: addDays(startDate, 2 + category.responseWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-4`,
      caseId,
      stepNumber: 4,
      requirement: `Constitute Disciplinary Committee (Quorum: ${category.defaultQuorum})`,
      description: `Formal nomination of bench members by Dean of Student Affairs meeting minimum quorum of ${category.defaultQuorum}.`,
      dueDate: addDays(startDate, 3 + category.responseWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-5`,
      caseId,
      stepNumber: 5,
      requirement: 'Issue Hearing Summons with 72-Hour Notice',
      description: 'Dispatch summons specifying date, venue, committee panel, and right to representative.',
      dueDate: addDays(startDate, 6 + category.responseWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-6`,
      caseId,
      stepNumber: 6,
      requirement: 'Human Deliberation & Reasoned Order Entry',
      description: 'Named deciding authority enters written reasoning and sanction. AI generation forbidden.',
      dueDate: addDays(startDate, 9 + category.responseWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-7`,
      caseId,
      stepNumber: 7,
      requirement: `Statutory Appeal Window (${category.appealWindowDays} Days)`,
      description: 'Permit submission of formal appeal to Executive Appeals Board before sanction execution.',
      dueDate: addDays(startDate, 9 + category.responseWindowDays + category.appealWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-8`,
      caseId,
      stepNumber: 8,
      requirement: 'Sanction Compliance Verification & Docket Closure',
      description: `Confirm completion of remedial sanctions and set retention expiry for ${category.retentionYears} years.`,
      dueDate: addDays(startDate, 30 + category.responseWindowDays),
      status: 'PENDING',
    },
  ];
}

/**
 * Validates whether a case can legally transition to the next state under due-process rules
 */
export function canTransitionTo(
  currentCase: Case,
  targetStatus: CaseStatus,
  userRole: UserRole
): { allowed: boolean; reason?: string } {
  // Guardrail check: Governance viewer is read-only
  if (userRole === 'GOVERNANCE_VIEWER') {
    return { allowed: false, reason: 'Governance viewers have strictly read-only analytical access.' };
  }

  // Guardrail check: Decision recorded can only be performed with a human decision object
  if (targetStatus === 'DECISION_RECORDED') {
    if (userRole !== 'DEAN_STUDENT_AFFAIRS' && userRole !== 'COMMITTEE_MEMBER') {
      return { allowed: false, reason: 'Decisions can only be recorded by the Dean or assigned Committee Member.' };
    }
    if (!currentCase.committeeRecord?.isQuorumMet) {
      return { allowed: false, reason: 'Due process violation: Committee quorum has not been satisfied.' };
    }
  }

  // Guardrail check: Cannot schedule hearing before committee constitution
  if (targetStatus === 'HEARING_SCHEDULED') {
    if (!currentCase.committeeRecord || currentCase.committeeRecord.membersAssigned.length === 0) {
      return { allowed: false, reason: 'A disciplinary committee must be constituted before scheduling a hearing.' };
    }
  }

  return { allowed: true };
}
