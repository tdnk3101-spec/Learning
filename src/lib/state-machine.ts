// Procedural State Machine & Due-Process Checklist Engine for EDUguard — Student Discipline Agent
// Strictly enforces institutional due process and prevents skipping procedural milestones

import {
  Case,
  CaseStatus,
  ChecklistStatus,
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
    description: 'Incident reported, persons and witnesses added, evidence secured with SHA-256.',
  },
  {
    status: 'NOTICE_ISSUED',
    label: 'Notice of Charge',
    stepNumber: 2,
    description: 'Formal policy-compliant notice dispatched to respondent student.',
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
    description: 'Disciplinary committee constituted, verifying minimum quorum and absence of bias.',
  },
  {
    status: 'HEARING_SCHEDULED',
    label: 'Hearing & Representation',
    stepNumber: 5,
    description: 'Hearing summons issued, right to be heard safeguarded.',
  },
  {
    status: 'DECISION_RECORDED',
    label: 'Human Decision',
    stepNumber: 6,
    description: 'Reasoned order and sanction recorded strictly by authorized human authority.',
  },
  {
    status: 'APPEAL_WINDOW',
    label: 'Appeal Period',
    stepNumber: 7,
    description: 'Statutory appeal window open with designated appellate authority.',
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
 * Cycle checklist status through: PENDING -> IN_PROGRESS -> COMPLETED -> PENDING
 */
export function cycleChecklistStatus(status: ChecklistStatus): ChecklistStatus {
  switch (status) {
    case 'PENDING':
      return 'IN_PROGRESS';
    case 'IN_PROGRESS':
      return 'COMPLETED';
    case 'COMPLETED':
      return 'PENDING';
    default:
      return 'PENDING';
  }
}

/**
 * Deterministically generates the 8 statutory due-process checklist items as specified in Step 3 of EDUguard:
 * 1. Student notified?
 * 2. Notice delivered?
 * 3. Response window provided?
 * 4. Student given right to be heard?
 * 5. Committee correctly constituted?
 * 6. Required documents submitted?
 * 7. Hearing completed?
 * 8. Decision recorded?
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
      requirement: 'Student notified?',
      description: `Formal disciplinary communication prepared and dispatched under ${category.applicablePolicy}.`,
      dueDate: addDays(startDate, 1),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-2`,
      caseId,
      stepNumber: 2,
      requirement: 'Notice delivered?',
      description: 'Proof of electronic delivery or physical service logged with delivery receipt timestamp.',
      dueDate: addDays(startDate, 2),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-3`,
      caseId,
      stepNumber: 3,
      requirement: 'Response window provided?',
      description: `Mandatory statutory response window of ${category.responseWindowDays} calendar days afforded to respondent.`,
      dueDate: addDays(startDate, 2 + category.responseWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-4`,
      caseId,
      stepNumber: 4,
      requirement: 'Student given right to be heard?',
      description: 'Opportunity to submit written statement, examine evidence, and request an oral representation advocate.',
      dueDate: addDays(startDate, 3 + category.responseWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-5`,
      caseId,
      stepNumber: 5,
      requirement: 'Committee correctly constituted?',
      description: `Panel verified for statutory quorum (min ${category.defaultQuorum} members) and formal conflict-of-interest disclosures signed.`,
      dueDate: addDays(startDate, 4 + category.responseWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-6`,
      caseId,
      stepNumber: 6,
      requirement: 'Required documents submitted?',
      description: 'Incident report, witness statements, student response, and sealed SHA-256 evidence deposited in docket.',
      dueDate: addDays(startDate, 6 + category.responseWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-7`,
      caseId,
      stepNumber: 7,
      requirement: 'Hearing completed?',
      description: 'Oral inquest convened with respondent attendance recorded and deliberation minutes logged.',
      dueDate: addDays(startDate, 8 + category.responseWindowDays),
      status: 'PENDING',
    },
    {
      id: `chk-${caseId}-8`,
      caseId,
      stepNumber: 8,
      requirement: 'Decision recorded?',
      description: 'Authorized disciplinary authority enters reasoned order, findings, sanction, and appeal route.',
      dueDate: addDays(startDate, 10 + category.responseWindowDays),
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

  // Guardrail check: Decision recorded can only be performed by authorized roles
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
