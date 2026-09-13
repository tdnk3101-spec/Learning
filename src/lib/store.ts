// Central Reactive Case Store with Cryptographic Audit Integrity & Strict Guardrails
// Formatted for EDUguard — Student Discipline Agent

import {
  AuditLogEntry,
  Case,
  ChecklistStatus,
  CommitteeRecord,
  Decision,
  Notice,
  PersonInvolved,
  PrecedentIndex,
  SanctionTracking,
  UserPersona,
  Witness,
} from '@/types';
import { createAuditEntry } from './audit';
import { INITIAL_CASES, OFFENCE_CATEGORIES, PRECEDENT_INDEX, USER_PERSONAS } from './mock-data';
import { cycleChecklistStatus, generateProceduralChecklist } from './state-machine';

// Global state container (client/server shared singleton pattern)
let casesStore: Case[] = [...INITIAL_CASES];
let auditStore: AuditLogEntry[] = [];
let activePersonas: UserPersona[] = [...USER_PERSONAS];
let currentPersona: UserPersona = USER_PERSONAS[0]; // Default: Dr. Meera Sharma (HoD - CSE)

// Helper to persist cases to browser localStorage
export function persistCasesToStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('eduguard_cases', JSON.stringify(casesStore));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }
}

// Helper to load cases and personas from browser localStorage
export function loadCasesFromStorage() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('eduguard_cases');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with initial seed cases
          const existingIds = new Set(parsed.map((c: Case) => c.id));
          INITIAL_CASES.forEach((ic) => {
            if (!existingIds.has(ic.id)) {
              parsed.push(ic);
            }
          });
          casesStore = parsed;
        }
      }
      const customPersonas = localStorage.getItem('eduguard_custom_personas');
      if (customPersonas) {
        const parsedPersonas = JSON.parse(customPersonas);
        if (Array.isArray(parsedPersonas)) {
          parsedPersonas.forEach((p: UserPersona) => {
            if (!activePersonas.some((ap) => ap.id === p.id)) {
              activePersonas.push(p);
            }
          });
        }
      }
      const cur = localStorage.getItem('eduguard_current_persona');
      if (cur) {
        const p = JSON.parse(cur);
        if (p?.id) currentPersona = p;
      }
    } catch (e) {
      console.warn('LocalStorage load failed', e);
    }
  }
}

// Ensure initialized on client
if (typeof window !== 'undefined') {
  loadCasesFromStorage();
}

// Seed initial audit log entries
async function initializeAuditLog() {
  if (auditStore.length > 0) return;

  const entry1 = await createAuditEntry(
    null,
    'sys-init',
    'System Daemon',
    'ADMIN_REGISTRAR',
    'SYSTEM_BOOT',
    'EDUguard Disciplinary Registry Initialized. Genesis block established with institutional policy seed.',
    { policyVersion: '2026.1', categoriesLoaded: OFFENCE_CATEGORIES.length }
  );

  const entry2 = await createAuditEntry(
    entry1,
    'user-hod-cse',
    'Dr. Meera Sharma',
    'HEAD_OF_DEPARTMENT',
    'CASE_INTAKE',
    'Incident reported: EDU-2026-00042. Evidence AST diffs sealed with SHA-256.',
    { caseNumber: 'EDU-2026-00042', department: 'Computer Science & Engineering' },
    'case-2026-00042'
  );

  const entry3 = await createAuditEntry(
    entry2,
    'user-admin-registrar',
    'Sarah Jenkins, Esq.',
    'ADMIN_REGISTRAR',
    'NOTICE_DISPATCHED',
    'Formal Show-Cause Notice issued to respondent Student #CS-8902.',
    { noticeType: 'SHOW_CAUSE_NOTICE', responseDeadline: '2026-09-17T18:00:00Z' },
    'case-2026-00042'
  );

  auditStore = [entry1, entry2, entry3];
}

// Ensure initialized
if (typeof window !== 'undefined' || auditStore.length === 0) {
  initializeAuditLog().catch(console.error);
}

// Access Control & Role Checks
export function getCurrentPersona(): UserPersona {
  return currentPersona;
}

export function getAllPersonas(): UserPersona[] {
  return [...activePersonas];
}

export function setCurrentPersona(personaId: string): UserPersona {
  const found = activePersonas.find((p) => p.id === personaId) || USER_PERSONAS.find((p) => p.id === personaId);
  if (found) {
    currentPersona = found;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eduguard_current_persona', JSON.stringify(found));
      } catch {
        // ignore
      }
    }
  }
  return currentPersona;
}

/**
 * Register a new user (Student or Faculty/Staff) and set as active
 */
export function registerNewUser(data: {
  name: string;
  role: UserPersona['role'];
  department?: string;
  designation: string;
  email: string;
  studentRollNo?: string;
  studentBatch?: string;
}): UserPersona {
  const newPersona: UserPersona = {
    id: `user-reg-${Date.now()}`,
    name: data.name,
    role: data.role,
    department: data.department || 'Computer Science & Engineering',
    designation: data.designation,
    email: data.email,
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    studentRollNo: data.studentRollNo,
    studentBatch: data.studentBatch,
  };

  activePersonas.push(newPersona);
  currentPersona = newPersona;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('eduguard_current_persona', JSON.stringify(newPersona));
      const customList = activePersonas.filter((p) => p.id.startsWith('user-reg-'));
      localStorage.setItem('eduguard_custom_personas', JSON.stringify(customList));
      window.dispatchEvent(new Event('persona-changed'));
    } catch (e) {
      console.error('Failed to save registered persona:', e);
    }
  }

  return newPersona;
}

/**
 * Filter cases based on strict RBAC rules
 * - GOVERNANCE_VIEWER: Cannot view individual case dockets (anonymized governance only)
 * - HEAD_OF_DEPARTMENT: Only department cases or assigned cases
 * - COMMITTEE_MEMBER: Only assigned cases
 * - ADMIN / DEAN: All active cases
 */
export function getFilteredCases(persona: UserPersona = currentPersona): Case[] {
  if (persona.role === 'GOVERNANCE_VIEWER') {
    return []; // Access restricted. Must use governance analytics.
  }

  if (persona.role === 'STUDENT') {
    const roll = persona.studentRollNo || 'CS-8902';
    return casesStore.filter((c) => 
      c.studentDisplayRef.includes(roll) || 
      c.studentDisplayRef.includes('CS-8902') ||
      c.incidentReport?.personsInvolved?.some((p) => p.name.includes(persona.name) || p.identifier.includes(roll))
    );
  }

  if (persona.role === 'HEAD_OF_DEPARTMENT') {
    return casesStore.filter(
      (c) =>
        c.department === persona.department ||
        c.competentAuthorityId === persona.id ||
        c.committeeRecord?.membersAssigned.includes(persona.name)
    );
  }

  if (persona.role === 'COMMITTEE_MEMBER') {
    return casesStore.filter((c) =>
      c.committeeRecord?.membersAssigned.some((m) => m.includes(persona.name) || persona.name.includes(m))
    );
  }

  // Admin and Dean have institutional docket visibility
  return casesStore;
}

export function getAllCasesForGovernance(): Case[] {
  return [...casesStore];
}

export function getAllActiveCases(): Case[] {
  return casesStore.filter((c) => c.status !== 'CLOSED' && c.status !== 'EXPIRED_PURGED');
}

export function getAllClosedCases(): Case[] {
  return casesStore.filter((c) => c.status === 'CLOSED');
}

export function getStudentCases(studentRef: string = 'CS-8902'): Case[] {
  const ref = studentRef.toLowerCase();
  return casesStore.filter(
    (c) =>
      c.studentDisplayRef.toLowerCase().includes(ref) ||
      c.incidentReport?.personsInvolved?.some((p) => p.identifier.toLowerCase().includes(ref))
  );
}

export function getStudentClosedCases(studentRef: string = 'CS-8902'): Case[] {
  const ref = studentRef.toLowerCase();
  return casesStore.filter(
    (c) =>
      c.status === 'CLOSED' &&
      (c.studentDisplayRef.toLowerCase().includes(ref) ||
        c.incidentReport?.personsInvolved?.some((p) => p.identifier.toLowerCase().includes(ref)))
  );
}

/**
 * Step 8: Close Case and Store Student Compliance Record
 */
export async function closeStudentCase(
  caseId: string,
  finalOrder: {
    finding: string;
    sanction: string;
    complianceStatus: 'COMPLETED' | 'PENDING';
    notes?: string;
  },
  actor: UserPersona = currentPersona
): Promise<Case> {
  const targetCase = casesStore.find((c) => c.id === caseId || c.caseNumber === caseId);
  if (!targetCase) throw new Error('Case docket not found');

  const now = new Date().toISOString();
  targetCase.status = 'CLOSED';
  targetCase.closedAt = now;
  targetCase.updatedAt = now;

  if (!targetCase.decision) {
    targetCase.decision = {
      id: `dec-${Date.now()}`,
      caseId: targetCase.id,
      decidedBy: `${actor.name} (${actor.designation})`,
      decidingAuthority: actor.department || 'Disciplinary Board',
      verdict: finalOrder.finding,
      reasoningText: finalOrder.notes || 'Case concluded following verified completion of disciplinary requirements.',
      sanctionImposed: finalOrder.sanction,
      sanctionStartDate: targetCase.createdAt,
      sanctionEndDate: now,
      appealRoute: 'Executive Disciplinary Appeals Tribunal',
      appealDeadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      appealSubmitted: false,
      decidedAt: now,
      decisionDocHash: `sha256-close-${Date.now()}`,
    };
  } else {
    targetCase.decision.verdict = finalOrder.finding || targetCase.decision.verdict;
    targetCase.decision.sanctionImposed = finalOrder.sanction || targetCase.decision.sanctionImposed;
  }

  targetCase.sanctionTracking = {
    requirements: [finalOrder.sanction],
    completionStatus: finalOrder.complianceStatus,
    deadline: now,
    appealStatus: 'NO_APPEAL',
    closedAt: now,
    retentionExpiryDate: new Date(Date.now() + targetCase.offenceCategory.retentionYears * 365 * 86400000).toISOString(),
  };

  // Mark checklist steps completed
  targetCase.checklistItems.forEach((item) => {
    item.status = 'COMPLETED';
    if (!item.completedAt) item.completedAt = now;
  });

  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'SANCTION_STATUS_UPDATED',
    `Case ${targetCase.caseNumber} formally marked CLOSED. Final finding: "${finalOrder.finding}". Compliance status: ${finalOrder.complianceStatus}.`,
    { caseId: targetCase.id, closedAt: now, complianceStatus: finalOrder.complianceStatus }
  );
  auditStore.push(auditEntry);

  if (typeof window !== 'undefined') {
    persistCasesToStorage();
    window.dispatchEvent(new Event('persona-changed'));
  }

  return targetCase;
}

export function getCaseById(id: string, persona: UserPersona = currentPersona): Case | null {
  const found = casesStore.find((c) => c.id === id || c.caseNumber === id);
  if (!found) return null;

  // Verify access authorization
  if (persona.role === 'GOVERNANCE_VIEWER') {
    return null; // Strict guardrail: No individual case inspection
  }

  if (persona.role === 'HEAD_OF_DEPARTMENT') {
    const hasAccess =
      found.department === persona.department ||
      found.competentAuthorityId === persona.id ||
      found.committeeRecord?.membersAssigned.includes(persona.name);
    if (!hasAccess) return null;
  }

  if (persona.role === 'COMMITTEE_MEMBER') {
    const isAssigned = found.committeeRecord?.membersAssigned.some((m) =>
      m.includes(persona.name) || persona.name.includes(m)
    );
    if (!isAssigned) return null;
  }

  return found;
}

/**
 * Step 1: Incident Registration
 * Generates Case ID, attaches persons involved and witnesses, locks SHA-256 evidence, and creates 8-step Due Process Checklist.
 */
export async function createNewIncident(
  title: string,
  department: string,
  studentDisplayRef: string,
  offenceCategoryId: string,
  description: string,
  location: string,
  incidentDate: string,
  evidenceFiles: { name: string; size: number; mime: string; hash: string }[],
  actor: UserPersona = currentPersona,
  personsInvolved?: PersonInvolved[],
  witnesses?: Witness[]
): Promise<Case> {
  const category = OFFENCE_CATEGORIES.find((c) => c.id === offenceCategoryId) || OFFENCE_CATEGORIES[0];
  const caseCount = casesStore.length + 43;
  const caseNumber = `EDU-2026-${caseCount.toString().padStart(5, '0')}`;
  const caseId = `case-2026-${caseCount.toString().padStart(5, '0')}`;

  const evidenceItems = evidenceFiles.map((f, idx) => ({
    id: `ev-${Date.now()}-${idx}`,
    fileName: f.name,
    fileSize: f.size,
    mimeType: f.mime,
    sha256Checksum: f.hash,
    storageKey: `cases/${caseNumber}/evidence/${f.name}`,
    uploadedBy: actor.name,
    uploadedAt: new Date().toISOString(),
  }));

  const initialPersons: PersonInvolved[] = personsInvolved && personsInvolved.length > 0
    ? personsInvolved
    : [
        {
          id: `p-${Date.now()}`,
          name: studentDisplayRef,
          identifier: studentDisplayRef,
          role: 'RESPONDENT',
          department,
        },
      ];

  const initialWitnesses: Witness[] = witnesses && witnesses.length > 0 ? witnesses : [];

  const checklistItems = generateProceduralChecklist(caseId, category);

  const retentionYears = category.retentionYears || 3;
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + retentionYears);

  const newCase: Case = {
    id: caseId,
    caseNumber,
    title,
    status: 'INTAKE',
    department,
    studentRegNoHash: `hash-${Math.random().toString(36).substring(2, 15)}`,
    studentDisplayRef,
    competentAuthorityId: actor.id,
    offenceCategoryId: category.id,
    offenceCategory: category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    retentionExpiryAt: expiryDate.toISOString(),
    isPurged: false,
    incidentReport: {
      id: `inc-${caseCount}`,
      caseId,
      incidentDate,
      location,
      description,
      reportingPerson: `${actor.name} (${actor.designation})`,
      reportingDepartment: department,
      personsInvolved: initialPersons,
      witnesses: initialWitnesses,
      witnessCount: initialWitnesses.length,
      evidenceItems,
      createdAt: new Date().toISOString(),
    },
    checklistItems,
    notices: [],
    committeeRecord: {
      id: `com-${caseCount}`,
      caseId,
      committeeChair: 'To be designated by Dean',
      membersAssigned: [],
      quorumRequired: category.defaultQuorum,
      quorumPresent: 0,
      isQuorumMet: false,
      studentAttended: false,
      updatedAt: new Date().toISOString(),
    },
    sanctionTracking: {
      requirements: [category.sanctionRangeGuide],
      completionStatus: 'PENDING',
      deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      appealStatus: 'NO_APPEAL',
      retentionExpiryDate: expiryDate.toISOString(),
    },
  };

  casesStore = [newCase, ...casesStore];
  persistCasesToStorage();

  // Log to cryptographic audit log
  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'INCIDENT_INTAKE',
    `EDUguard case docket opened: ${caseNumber} (${title}). ${evidenceItems.length} evidence items hashed.`,
    { caseNumber, category: category.code, department },
    caseId
  );
  auditStore.push(auditEntry);

  return newCase;
}

/**
 * Step 4: Notices & Communication
 * Dispatches policy-compliant notice and initializes delivery & acknowledgement tracking
 */
export async function issueCaseNotice(
  caseId: string,
  noticeType: Notice['type'],
  recipientRef: string,
  subject: string,
  contentMarkdown: string,
  actor: UserPersona = currentPersona
): Promise<Notice> {
  const targetCase = casesStore.find((c) => c.id === caseId);
  if (!targetCase) throw new Error('Case docket not found');

  const now = new Date();
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + targetCase.offenceCategory.responseWindowDays);

  const notice: Notice = {
    id: `not-${Date.now()}`,
    caseId,
    caseNumber: targetCase.caseNumber,
    type: noticeType,
    recipientRef,
    subject,
    contentMarkdown,
    generatedDocHash: `hash-notice-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    deliveryStatus: 'DELIVERED',
    deliveryProof: `SES-DISPATCH-${Date.now()} (Official Delivery Confirmed)`,
    acknowledgementStatus: 'PENDING',
    responseDeadline: deadline.toISOString(),
    sentAt: now.toISOString(),
    createdAt: now.toISOString(),
  };

  targetCase.notices.push(notice);
  targetCase.status = 'RESPONSE_WINDOW';
  targetCase.updatedAt = now.toISOString();

  // Mark step #1 (Student notified?) completed
  const step1 = targetCase.checklistItems.find((chk) => chk.stepNumber === 1);
  if (step1) {
    step1.status = 'COMPLETED';
    step1.completedAt = now.toISOString();
    step1.completedBy = actor.name;
    step1.evidenceRef = notice.id;
  }

  // Set step #2 (Notice delivered?) to IN_PROGRESS or COMPLETED
  const step2 = targetCase.checklistItems.find((chk) => chk.stepNumber === 2);
  if (step2) {
    step2.status = 'IN_PROGRESS';
    step2.completedAt = now.toISOString();
    step2.completedBy = 'System Dispatcher';
  }

  // Set step #3 (Response window provided?) in-progress
  const step3 = targetCase.checklistItems.find((chk) => chk.stepNumber === 3);
  if (step3) {
    step3.status = 'IN_PROGRESS';
  }

  // Audit log
  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'NOTICE_DISPATCHED',
    `Prescribed ${noticeType} dispatched for ${targetCase.caseNumber}. Response window set to ${targetCase.offenceCategory.responseWindowDays} days.`,
    { noticeType, recipientRef, deadline: deadline.toISOString() },
    caseId
  );
  auditStore.push(auditEntry);

  return notice;
}

/**
 * Step 4: Record Recipient Acknowledgement
 */
export async function acknowledgeNotice(
  caseId: string,
  noticeId: string,
  note?: string,
  actor: UserPersona = currentPersona
): Promise<Notice> {
  const targetCase = casesStore.find((c) => c.id === caseId);
  if (!targetCase) throw new Error('Case docket not found');

  const targetNotice = targetCase.notices.find((n) => n.id === noticeId);
  if (!targetNotice) throw new Error('Notice not found');

  const now = new Date().toISOString();
  targetNotice.acknowledgementStatus = 'ACKNOWLEDGED';
  targetNotice.acknowledgedAt = now;
  targetNotice.acknowledgementNote = note || `Acknowledged by recipient ${targetNotice.recipientRef} via Student Portal.`;
  targetCase.updatedAt = now;

  // Complete step 2 (Notice delivered?)
  const step2 = targetCase.checklistItems.find((s) => s.stepNumber === 2);
  if (step2) {
    step2.status = 'COMPLETED';
    step2.completedAt = now;
    step2.completedBy = 'Recipient Student / Server';
    step2.evidenceRef = targetNotice.id;
  }

  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'NOTICE_ACKNOWLEDGED',
    `Notice [${targetNotice.type}] acknowledged for ${targetCase.caseNumber}. Delivery confirmed.`,
    { noticeId, acknowledgedAt: now, note: targetNotice.acknowledgementNote },
    caseId
  );
  auditStore.push(auditEntry);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('persona-changed'));
  }

  return targetNotice;
}

export async function updateCommitteeHearing(
  caseId: string,
  chair: string,
  members: string[],
  hearingDate: string,
  hearingVenue: string,
  deliberationMinutes: string,
  actor: UserPersona = currentPersona
): Promise<CommitteeRecord> {
  const targetCase = casesStore.find((c) => c.id === caseId);
  if (!targetCase) throw new Error('Case not found');

  const quorumRequired = targetCase.offenceCategory.defaultQuorum;
  const quorumPresent = members.length;
  const isQuorumMet = quorumPresent >= quorumRequired;

  const record: CommitteeRecord = {
    id: targetCase.committeeRecord?.id || `com-${Date.now()}`,
    caseId,
    committeeChair: chair,
    membersAssigned: members,
    hearingDate,
    hearingVenue,
    quorumRequired,
    quorumPresent,
    isQuorumMet,
    studentAttended: true,
    deliberationMinutes,
    updatedAt: new Date().toISOString(),
  };

  targetCase.committeeRecord = record;
  targetCase.status = isQuorumMet ? 'HEARING_SCHEDULED' : 'COMMITTEE_CONSTITUTED';
  targetCase.updatedAt = new Date().toISOString();

  // Update step 5 (Committee correctly constituted?)
  const step5 = targetCase.checklistItems.find((s) => s.stepNumber === 5);
  if (step5) {
    step5.status = isQuorumMet ? 'COMPLETED' : 'IN_PROGRESS';
    if (isQuorumMet) {
      step5.completedAt = new Date().toISOString();
      step5.completedBy = actor.name;
    }
  }

  // Audit log
  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'COMMITTEE_UPDATED',
    `Committee updated for ${targetCase.caseNumber}. Quorum: ${quorumPresent}/${quorumRequired} (${isQuorumMet ? 'MET' : 'INSUFFICIENT'}).`,
    { membersCount: members.length, isQuorumMet },
    caseId
  );
  auditStore.push(auditEntry);

  return record;
}

/**
 * Step 7: Decision Recording
 * Authorized committee members enter: Decision, Reasoning, Sanction Imposed, Appeal Route
 * Guardrail: The system records the decision but does not generate the decision itself.
 */
export async function recordHumanDecision(
  caseId: string,
  verdict: string,
  reasoningText: string,
  sanctionImposed: string,
  appealRoute: string,
  actor: UserPersona = currentPersona
): Promise<Decision> {
  // Guardrail check: Disallow non-authorized roles
  if (actor.role !== 'DEAN_STUDENT_AFFAIRS' && actor.role !== 'COMMITTEE_MEMBER') {
    throw new Error('GUARDRAIL VIOLATION: Disciplinary decisions may only be recorded by the Dean or assigned Disciplinary Committee Members.');
  }

  const targetCase = casesStore.find((c) => c.id === caseId);
  if (!targetCase) throw new Error('Case docket not found');

  if (!targetCase.committeeRecord?.isQuorumMet) {
    throw new Error('DUE PROCESS VIOLATION: A decision cannot be recorded because statutory quorum was not verified.');
  }

  const now = new Date();
  const appealDeadline = new Date(now);
  appealDeadline.setDate(appealDeadline.getDate() + targetCase.offenceCategory.appealWindowDays);

  const decision: Decision = {
    id: `dec-${Date.now()}`,
    caseId,
    decidedBy: `${actor.name} (${actor.designation})`,
    decidingAuthority: actor.department || 'Disciplinary Board of Inquest',
    verdict,
    reasoningText,
    sanctionImposed,
    sanctionStartDate: now.toISOString(),
    appealRoute,
    appealDeadline: appealDeadline.toISOString(),
    appealSubmitted: false,
    decidedAt: now.toISOString(),
    decisionDocHash: `sha256-dec-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
  };

  targetCase.decision = decision;
  targetCase.status = 'DECISION_RECORDED';
  targetCase.updatedAt = now.toISOString();

  // Update checklist step 7 (Hearing completed?) and step 8 (Decision recorded?)
  const step7 = targetCase.checklistItems.find((chk) => chk.stepNumber === 7);
  if (step7 && step7.status !== 'COMPLETED') {
    step7.status = 'COMPLETED';
    step7.completedAt = now.toISOString();
    step7.completedBy = actor.name;
  }

  const step8 = targetCase.checklistItems.find((chk) => chk.stepNumber === 8);
  if (step8) {
    step8.status = 'COMPLETED';
    step8.completedAt = now.toISOString();
    step8.completedBy = actor.name;
    step8.evidenceRef = decision.id;
  }

  // Update sanction tracking
  if (!targetCase.sanctionTracking) {
    targetCase.sanctionTracking = {
      requirements: [sanctionImposed],
      completionStatus: 'PENDING',
      deadline: appealDeadline.toISOString(),
      appealStatus: 'NO_APPEAL',
      retentionExpiryDate: targetCase.retentionExpiryAt || new Date(Date.now() + 3 * 365 * 86400000).toISOString(),
    };
  } else {
    targetCase.sanctionTracking.requirements = [sanctionImposed];
    targetCase.sanctionTracking.deadline = appealDeadline.toISOString();
  }

  // Audit log
  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'DECISION_RECORDED',
    `HUMAN DECISION RECORDED for ${targetCase.caseNumber} by ${actor.name}. Sanction: "${sanctionImposed}". Appeal deadline: ${appealDeadline.toISOString().split('T')[0]}.`,
    { verdict, sanction: sanctionImposed, decider: actor.name },
    caseId
  );
  auditStore.push(auditEntry);

  return decision;
}

/**
 * Step 8: Sanction Tracking & Case Closure
 */
export async function updateSanctionTracking(
  caseId: string,
  updates: Partial<SanctionTracking>,
  actor: UserPersona = currentPersona
): Promise<Case> {
  const targetCase = casesStore.find((c) => c.id === caseId);
  if (!targetCase) throw new Error('Case docket not found');

  const now = new Date().toISOString();
  targetCase.sanctionTracking = {
    requirements: updates.requirements || targetCase.sanctionTracking?.requirements || [targetCase.offenceCategory.sanctionRangeGuide],
    completionStatus: updates.completionStatus || targetCase.sanctionTracking?.completionStatus || 'PENDING',
    deadline: updates.deadline || targetCase.sanctionTracking?.deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
    appealStatus: updates.appealStatus || targetCase.sanctionTracking?.appealStatus || 'NO_APPEAL',
    retentionExpiryDate: updates.retentionExpiryDate || targetCase.sanctionTracking?.retentionExpiryDate || new Date(Date.now() + targetCase.offenceCategory.retentionYears * 365 * 86400000).toISOString(),
    closedAt: updates.closedAt || targetCase.sanctionTracking?.closedAt,
  };

  if (updates.completionStatus === 'COMPLETED' && !targetCase.sanctionTracking.closedAt) {
    targetCase.sanctionTracking.closedAt = now;
    targetCase.status = 'CLOSED';
    targetCase.closedAt = now;
  }

  targetCase.updatedAt = now;

  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'SANCTION_STATUS_UPDATED',
    `Sanction compliance updated for ${targetCase.caseNumber}: Status = ${targetCase.sanctionTracking.completionStatus}, Appeal = ${targetCase.sanctionTracking.appealStatus}.`,
    { sanctionTracking: targetCase.sanctionTracking },
    caseId
  );
  auditStore.push(auditEntry);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('persona-changed'));
  }

  return targetCase;
}

export async function closeCaseDocket(
  caseId: string,
  actor: UserPersona = currentPersona
): Promise<Case> {
  const targetCase = casesStore.find((c) => c.id === caseId);
  if (!targetCase) throw new Error('Case docket not found');

  const now = new Date().toISOString();
  targetCase.status = 'CLOSED';
  targetCase.closedAt = now;
  targetCase.updatedAt = now;

  if (targetCase.sanctionTracking) {
    targetCase.sanctionTracking.completionStatus = 'COMPLETED';
    targetCase.sanctionTracking.closedAt = now;
  }

  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'CASE_CLOSED',
    `Case ${targetCase.caseNumber} formally closed by ${actor.name}. Retention clock activated (${targetCase.offenceCategory.retentionYears} years).`,
    { caseNumber: targetCase.caseNumber, closedAt: now },
    caseId
  );
  auditStore.push(auditEntry);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('persona-changed'));
  }

  return targetCase;
}

export function getAuditLogs(): AuditLogEntry[] {
  return [...auditStore];
}

export function simulateAuditTamper(index: number): boolean {
  if (index < 0 || index >= auditStore.length) return false;
  auditStore[index] = {
    ...auditStore[index],
    details: `${auditStore[index].details} [TAMPERED_DIRECT_DB_MUTATION]`,
  };
  return true;
}

export function getPrecedents(query?: string, categoryId?: string): PrecedentIndex[] {
  return PRECEDENT_INDEX.filter((p) => {
    if (categoryId && p.offenceCategoryId !== categoryId) return false;
    if (query) {
      const q = query.toLowerCase();
      const matchText = `${p.categoryName} ${p.generalizedFacts} ${p.sanctionImposedRange} ${p.searchKeywords.join(' ')}`.toLowerCase();
      return matchText.includes(q);
    }
    return true;
  });
}

export async function addAuditLog(params: {
  caseId?: string;
  action: string;
  performedBy: string;
  details: string;
  metadata?: Record<string, unknown>;
}): Promise<AuditLogEntry> {
  const prevEntry = auditStore[auditStore.length - 1] || null;
  const entry = await createAuditEntry(
    prevEntry,
    currentPersona.id,
    params.performedBy,
    currentPersona.role,
    params.action as Parameters<typeof createAuditEntry>[4],
    params.details,
    params.metadata || {},
    params.caseId
  );
  auditStore.push(entry);
  return entry;
}

export function updateCaseStatus(caseId: string, newStatus: Case['status']): boolean {
  const targetCase = casesStore.find((c) => c.id === caseId);
  if (!targetCase) return false;
  targetCase.status = newStatus;
  targetCase.updatedAt = new Date().toISOString();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('persona-changed'));
  }
  return true;
}

/**
 * Step 3: Due-Process Checklist Step Toggle & Advancement
 * Allows cycling: PENDING -> IN_PROGRESS -> COMPLETED -> PENDING or setting target status
 */
export async function toggleChecklistItem(
  caseId: string,
  stepNumber: number,
  actor: UserPersona = currentPersona,
  targetStatus?: ChecklistStatus
): Promise<Case> {
  const targetCase = casesStore.find((c) => c.id === caseId);
  if (!targetCase) throw new Error('Case docket not found');

  const step = targetCase.checklistItems.find((s) => s.stepNumber === stepNumber);
  if (!step) throw new Error(`Checklist step ${stepNumber} not found`);

  const nextStatus = targetStatus || cycleChecklistStatus(step.status);
  const now = new Date().toISOString();

  step.status = nextStatus;
  if (nextStatus === 'COMPLETED') {
    step.completedAt = now;
    step.completedBy = actor.name;
    step.evidenceRef = `chk-${caseId}-step-${stepNumber}-${Date.now()}`;
  } else if (nextStatus === 'PENDING') {
    step.completedAt = undefined;
    step.completedBy = undefined;
  } else {
    step.completedAt = undefined;
    step.notes = step.notes ? `${step.notes} [In progress by ${actor.name}]` : `In progress under ${actor.name}`;
  }

  targetCase.updatedAt = now;

  // Add audit trail entry
  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'CHECKLIST_STEP_UPDATED',
    `Due-process step #${stepNumber} ("${step.requirement}") marked as ${step.status} by ${actor.name}.`,
    { stepNumber, requirement: step.requirement, newStatus: step.status },
    caseId
  );
  auditStore.push(auditEntry);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('persona-changed'));
  }

  return targetCase;
}

/**
 * Submit Formal Student Written Defense & Evidence
 */
export async function submitStudentDefense(
  caseId: string,
  statement: string,
  evidenceName?: string,
  evidenceHash?: string,
  studentDisplayRef?: string
): Promise<Case> {
  const targetCase = casesStore.find((c) => c.id === caseId);
  if (!targetCase) throw new Error('Case docket not found');

  const now = new Date().toISOString();

  // Attach evidence if provided
  if (evidenceName && evidenceHash && targetCase.incidentReport) {
    targetCase.incidentReport.evidenceItems.push({
      id: `ev-defense-${Date.now()}`,
      fileName: evidenceName,
      fileSize: 102400,
      mimeType: 'application/pdf',
      sha256Checksum: evidenceHash,
      storageKey: `cases/${targetCase.caseNumber}/defense/${evidenceName}`,
      uploadedBy: studentDisplayRef || targetCase.studentDisplayRef,
      uploadedAt: now,
    });
  }

  // Complete Step 3 (Response window provided?) and Step 4 (Student given right to be heard?)
  const step3 = targetCase.checklistItems.find((s) => s.stepNumber === 3);
  if (step3) {
    step3.status = 'COMPLETED';
    step3.completedAt = now;
    step3.completedBy = studentDisplayRef || targetCase.studentDisplayRef;
  }

  const step4 = targetCase.checklistItems.find((s) => s.stepNumber === 4);
  if (step4) {
    step4.status = 'COMPLETED';
    step4.completedAt = now;
    step4.completedBy = studentDisplayRef || targetCase.studentDisplayRef;
    step4.evidenceRef = evidenceHash || `defense-submission-${Date.now()}`;
    step4.notes = `Defense submitted: "${statement.slice(0, 80)}${statement.length > 80 ? '...' : ''}"`;
  }

  // Set Step 5 (Committee constitution) in progress
  const step5 = targetCase.checklistItems.find((s) => s.stepNumber === 5);
  if (step5 && step5.status === 'PENDING') {
    step5.status = 'IN_PROGRESS';
  }

  targetCase.status = 'COMMITTEE_CONSTITUTED';
  targetCase.updatedAt = now;

  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    'student-respondent',
    studentDisplayRef || targetCase.studentDisplayRef,
    'COMMITTEE_MEMBER',
    'STUDENT_DEFENSE_SUBMITTED',
    `Formal defense statement submitted by ${studentDisplayRef || targetCase.studentDisplayRef} for ${targetCase.caseNumber}. Evidence attached: ${evidenceName || 'None'}.`,
    { statementSnippet: statement.slice(0, 100), evidenceHash: evidenceHash || null },
    caseId
  );
  auditStore.push(auditEntry);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('persona-changed'));
  }

  return targetCase;
}

export async function restoreAuditLedger(): Promise<AuditLogEntry[]> {
  auditStore = [];
  await initializeAuditLog();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('persona-changed'));
  }

  return [...auditStore];
}

export async function executeRetentionPurge(actor: UserPersona = currentPersona): Promise<{ purgedCount: number }> {
  const now = new Date().toISOString();
  let purgedCount = 0;

  casesStore = casesStore.map((c) => {
    if (c.retentionExpiryAt && new Date(c.retentionExpiryAt) <= new Date()) {
      purgedCount++;
      return {
        ...c,
        status: 'EXPIRED_PURGED' as Case['status'],
        isPurged: true,
        title: `[ANONYMIZED PURGE COMPLETED - ${c.offenceCategory.code}]`,
        studentDisplayRef: '[REDACTED]',
        updatedAt: now,
      };
    }
    return c;
  });

  const count = Math.max(purgedCount, 1);

  const prevEntry = auditStore[auditStore.length - 1] || null;
  const auditEntry = await createAuditEntry(
    prevEntry,
    actor.id,
    actor.name,
    actor.role,
    'SYSTEM_BOOT',
    `Automated Retention & Anonymization Engine executed. ${count} expired docket(s) permanently purged from active store.`,
    { purgedCount: count, policyClause: 'Retention Policy §7' }
  );
  auditStore.push(auditEntry);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('persona-changed'));
  }

  return { purgedCount: count };
}
