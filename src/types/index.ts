// Core Type Definitions for Student Discipline Management System ("Agent 47")

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

export type ChecklistStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'WAIVED';

export type NoticeType =
  | 'NOTICE_OF_CHARGE'
  | 'HEARING_SUMMONS'
  | 'DECISION_ORDER'
  | 'APPEAL_INFO';

export type DeliveryStatus = 'DRAFT' | 'DISPATCHED' | 'DELIVERED' | 'FAILED';

export type UserRole =
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
}

export interface OffenceCategory {
  id: string;
  code: string; // e.g. "ACAD-01"
  name: string;
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

export interface IncidentReport {
  id: string;
  caseId: string;
  incidentDate: string;
  location: string;
  description: string;
  reportingPerson: string;
  reportingDepartment: string;
  witnessCount: number;
  evidenceItems: EvidenceItem[];
  createdAt: string;
}

export interface ProceduralChecklistItem {
  id: string;
  caseId: string;
  stepNumber: number;
  requirement: string;
  description: string;
  dueDate: string;
  completedAt?: string;
  completedBy?: string;
  evidenceRef?: string;
  status: ChecklistStatus;
  notes?: string;
}

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

// CRITICAL GUARDRAIL: HUMAN-WRITE-ONLY
export interface Decision {
  id: string;
  caseId: string;
  decidedBy: string;
  decidingAuthority: string;
  verdict: string;
  reasoningText: string;
  sanctionImposed: string;
  sanctionStartDate?: string;
  sanctionEndDate?: string;
  appealRoute: string;
  appealDeadline: string;
  appealSubmitted: boolean;
  decidedAt: string;
  decisionDocHash: string;
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

export interface PrecedentIndex {
  id: string;
  offenceCategoryId: string;
  categoryCode: string;
  categoryName: string;
  anonymizedCaseRef: string;
  generalizedFacts: string;
  mitigatingFactors?: string;
  aggravatingFactors?: string;
  sanctionImposedRange: string;
  yearResolved: number;
  searchKeywords: string[];
}

export interface Case {
  id: string;
  caseNumber: string; // e.g. DISC-2026-00042
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
  createdAt: string;
  updatedAt: string;
  retentionExpiryAt?: string;
  closedAt?: string;
  isPurged: boolean;
}
