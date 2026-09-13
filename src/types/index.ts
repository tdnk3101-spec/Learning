// Core Type Definitions for EDUguard — Student Discipline Agent
// Strictly enforces institutional due-process, procedural compliance, and cryptographic auditability

export type CaseStatus =
  | 'INTAKE'
  | 'NOTICE_ISSUED'
  | 'RESPONSE_WINDOW'
  | 'COMMITTEE_CONSTITUTED'
  | 'HEARING_SCHEDULED'
  | 'DECISION_RECORDED'
  | 'APPEAL_WINDOW'
  | 'COMPLIANCE_TRACKING'
  | 'CLOSED'
  | 'EXPIRED_PURGED';

export type SeverityLevel = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';

export type ChecklistStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

// Statutory notice types conforming to Step 4 of EDUguard workflow
export type NoticeType =
  | 'SHOW_CAUSE_NOTICE'
  | 'HEARING_NOTICE'
  | 'COMMITTEE_COMMUNICATION'
  | 'DECISION_COMMUNICATION'
  | 'APPEAL_INFO'
  // Backward-compatibility aliases
  | 'NOTICE_OF_CHARGE'
  | 'HEARING_SUMMONS'
  | 'DECISION_ORDER';

export type DeliveryStatus = 'DRAFT' | 'DISPATCHED' | 'DELIVERED' | 'FAILED';

export type UserRole =
  | 'STUDENT'
  | 'FACULTY'
  | 'ADMIN_REGISTRAR'
  | 'HEAD_OF_DEPARTMENT'
  | 'DEAN_STUDENT_AFFAIRS'
  | 'COMMITTEE_MEMBER'
  | 'GOVERNANCE_VIEWER';

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  designation: string;
  email: string;
  avatarUrl?: string;
  studentRollNo?: string;
  studentBatch?: string;
}

// 5-Point Policy & Offence Mapping (Step 2 of EDUguard workflow)
export interface OffenceCategory {
  id: string;
  code: string; // e.g. "ACAD-01"
  name: string; // 1. Offence Category
  applicablePolicy: string; // 2. Applicable Policy
  relevantClause: string; // 3. Relevant Policy Clause
  requiredProcedure: string; // 4. Required Procedure
  competentAuthority: string; // 5. Competent Disciplinary Authority
  severity: SeverityLevel;
  description: string;
  procedureReference: string;
  defaultQuorum: number;
  responseWindowDays: number;
  appealWindowDays: number;
  retentionYears: number;
  sanctionRangeGuide: string;
}

export interface EvidenceItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sha256Checksum: string;
  storageKey: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Student / Person involved in an incident (Step 1)
export interface PersonInvolved {
  id: string;
  name: string;
  identifier: string; // e.g. Student Ref #CS-8902 or Staff ID
  role: 'RESPONDENT' | 'COMPLAINANT' | 'INVOLVED' | 'VICTIM';
  department?: string;
  notes?: string;
}

// Witness record in an incident (Step 1)
export interface Witness {
  id: string;
  name: string;
  designation: string;
  statementSummary?: string;
  contactRef?: string;
}

// Case Incident Registration Report (Step 1)
export interface IncidentReport {
  id: string;
  caseId: string;
  incidentDate: string;
  location: string;
  description: string;
  reportingPerson: string;
  reportingDepartment: string;
  personsInvolved: PersonInvolved[];
  witnesses: Witness[];
  witnessCount: number;
  evidenceItems: EvidenceItem[];
  createdAt: string;
}

// Due-Process Statutory Checklist Item (Step 3)
// Items:
// 1. Student notified?
// 2. Notice delivered?
// 3. Response window provided?
// 4. Student given right to be heard?
// 5. Committee correctly constituted?
// 6. Required documents submitted?
// 7. Hearing completed?
// 8. Decision recorded?
export interface ProceduralChecklistItem {
  id: string;
  caseId: string;
  stepNumber: number;
  requirement: string; // e.g. "Student notified?"
  description: string;
  dueDate: string;
  completedAt?: string;
  completedBy?: string;
  evidenceRef?: string;
  status: ChecklistStatus; // PENDING -> IN_PROGRESS -> COMPLETED
  notes?: string;
}

// Statutory Notice & Communication Record (Step 4)
export interface Notice {
  id: string;
  caseId: string;
  caseNumber: string;
  type: NoticeType;
  recipientRef: string;
  subject: string;
  contentMarkdown: string;
  generatedDocHash: string;
  deliveryStatus: DeliveryStatus;
  deliveryProof?: string;
  acknowledgementStatus: 'PENDING' | 'ACKNOWLEDGED';
  acknowledgedAt?: string;
  acknowledgementNote?: string;
  responseDeadline: string;
  sentAt?: string;
  createdAt: string;
}

export interface CommitteeRecord {
  id: string;
  caseId: string;
  committeeChair: string;
  membersAssigned: string[];
  hearingDate?: string;
  hearingVenue?: string;
  quorumRequired: number;
  quorumPresent: number;
  isQuorumMet: boolean;
  studentAttended: boolean;
  studentRepresentative?: string;
  deliberationMinutes?: string;
  updatedAt: string;
}

// Decision Record (Step 7)
// Authorized members enter: Decision, Reasoning, Sanction Imposed, Appeal Route
// Guardrail: The system records the decision but does not generate the decision itself.
export interface Decision {
  id: string;
  caseId: string;
  decidedBy: string;
  decidingAuthority: string;
  verdict: string; // Decision
  reasoningText: string; // Reasoning
  sanctionImposed: string; // Sanction imposed
  sanctionStartDate?: string;
  sanctionEndDate?: string;
  appealRoute: string; // Appeal route
  appealDeadline: string;
  appealSubmitted: boolean;
  decidedAt: string;
  decisionDocHash: string;
}

// Sanction Tracking & Case Closure (Step 8)
export interface SanctionTracking {
  requirements: string[];
  completionStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  deadline: string;
  appealStatus: 'NO_APPEAL' | 'UNDER_REVIEW' | 'UPHELD' | 'MODIFIED' | 'DISMISSED';
  closedAt?: string;
  retentionExpiryDate: string;
}

// Cryptographic Append-Only Audit Entry
export interface AuditLogEntry {
  id: string;
  caseId?: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  payloadHash: string;
  prevHash: string;
  currHash: string;
  timestamp: string;
}

// Multi-Factor Precedent Matching & Similar Case Support Types
export type IntentType = 'PREMEDITATED' | 'NEGLIGENT' | 'RECKLESS' | 'ACCIDENTAL' | 'UNPROVEN';
export type OccurrenceType = 'FIRST_TIME' | 'REPEAT_OFFENCE';
export type CooperationLevel = 'FULL' | 'PARTIAL' | 'OBSTRUCTIVE';

export interface PrecedentProcedure {
  hearingBody: string;
  quorum: number;
  durationDays: number;
  representationProvided: boolean;
  noticesIssued: string[];
  hearingsCount: number;
}

export interface PrecedentOutcome {
  finding: string;
  sanction: string;
  reasoningSummary: string;
  appealOutcome: string;
  retentionPeriodYears: number;
}

export interface PrecedentCaseAttributes {
  cooperationLevel: CooperationLevel;
  restitutionOffered: boolean;
  remorseDemonstrated: boolean;
  academicImpact?: string;
}

export interface PrecedentIndex {
  id: string;
  offenceCategoryId: string;
  categoryCode: string;
  categoryName: string;
  anonymizedCaseRef: string;
  title?: string;
  generalizedFacts: string;
  mitigatingFactors?: string;
  aggravatingFactors?: string;
  sanctionImposedRange: string;
  yearResolved: number;
  searchKeywords: string[];
  // Multi-factor comparison fields
  offenceType: string;
  intent: IntentType;
  intentDescription: string;
  circumstances: string;
  severity: SeverityLevel;
  occurrenceHistory: OccurrenceType;
  evidencePatterns: string[];
  caseAttributes: PrecedentCaseAttributes;
  procedureFollowed: PrecedentProcedure;
  outcomeRecorded: PrecedentOutcome;
}

// Multi-factor match breakdown and side-by-side analysis
export interface MultiFactorScore {
  overallPct: number;
  offenceTypeScore: number; // 25%
  intentScore: number; // 20%
  circumstancesScore: number; // 15%
  severityScore: number; // 15%
  occurrenceScore: number; // 10%
  evidenceScore: number; // 15%
  similarityFactors: string[];
  distinguishingFactors: string[];
  proceduralAlignment: string;
  outcomeConsistencyNotes: string;
}

export interface RankedPrecedentMatch {
  precedent: PrecedentIndex;
  score: MultiFactorScore;
}

// EDUguard Chatbot Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intentDetected?: string;
  referencedCases?: string[];
  referencedClauses?: string[];
  guardrailTriggered?: boolean;
  guardrailExplanation?: string;
  suggestedPrompts?: string[];
}

export interface Case {
  id: string;
  caseNumber: string; // e.g. EDU-2026-00042
  title: string;
  status: CaseStatus;
  department: string;
  studentRegNoHash: string;
  studentDisplayRef: string;
  competentAuthorityId: string;
  offenceCategoryId: string;
  offenceCategory: OffenceCategory;
  incidentReport?: IncidentReport;
  checklistItems: ProceduralChecklistItem[];
  notices: Notice[];
  committeeRecord?: CommitteeRecord;
  decision?: Decision;
  sanctionTracking?: SanctionTracking;
  createdAt: string;
  updatedAt: string;
  retentionExpiryAt?: string;
  closedAt?: string;
  isPurged: boolean;
}
