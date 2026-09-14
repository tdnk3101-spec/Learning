# EDUguard — Student Discipline Agent: System Architecture, Complete Flow & Live RAG Specification

## 1. Executive Summary & Purpose
**EDUguard** is an institutional due-process orchestration engine and disciplinary agent built for higher-education universities. 
In traditional university disciplinary procedures, student cases often suffer from:
- Inconsistent penalty imposition across departments.
- Procedural irregularities (missing notice windows, arbitrary evidence handling, absence of quorum).
- High legal vulnerability due to lack of verifiable audit trails.
- Accidental bias or lack of transparency.

### Core Philosophy: The Due-Process Boundary
EDUguard is intentionally designed with an immutable **Statutory Due-Process Boundary**:
- **What EDUguard DOES**: Automates statutory policy mapping, generates legally compliant show-cause notices, tracks mandatory response countdowns, verifies evidence integrity via SHA-256 checksums, calculates precedent similarity, and records cryptographic audit logs.
- **What EDUguard NEVER DOES**: It **never** declares a student guilty and **never** imposes or decides punishments. All adjudicative authority resides strictly with authorized human committees (*audi alteram partem* — the right to be heard).

---

## 2. Where the Agent is Initialized & Runtime Environment

### A. Server-Side Route Handler: `src/app/api/chat/route.ts`
The conversational disciplinary agent is instantiated and executed per request inside the Next.js App Router API route:
- **Location**: `src/app/api/chat/route.ts`
- **Method**: `POST`
- **Trigger**: Called by the client UI (`EduguardChatModal.tsx`) and the landing page simulator (`src/app/page.tsx`).
- **LLM Initialization**:
  - Provider: **GroqCloud API** (`https://api.groq.com/openai/v1/chat/completions`)
  - API Key: `process.env.GROQ_API_KEY`
  - Primary Model: `process.env.GROQ_MODEL` (Default: `llama-3.3-70b-versatile`)
  - Fallback Model: `process.env.GROQ_FALLBACK_MODEL` (Default: `qwen/qwen3.8-27b`)
  - Temperature: `0.1` (Strict, deterministic institutional reasoning with minimal variance)
  - Max Tokens: `1000` tokens per reply

### B. Offline & High-Reliability Fallback Engine
If the Groq API encounters network issues, rate limits, or missing API keys, the route handler intercepts the failure and invokes:
```typescript
generateDeterministicFallback(lastUserMessage, currentPersona, accessibleCases)
```
Located within `src/app/api/chat/route.ts`, this rule engine provides institutional guidance for examination cheating (ACAD-02), plagiarism (ACAD-01), statutory time windows, and docket inspection.

### C. Client-Side State & Persona Store: `src/lib/store.ts`
- **Location**: `src/lib/store.ts`
- **Initialization**: Runs on app startup and in the browser:
  - Loads seeded dockets (`INITIAL_CASES` from `src/lib/mock-data.ts`).
  - Hydrates from browser `localStorage` (`eduguard_cases`, `eduguard_current_persona`).
  - Dispatches custom `persona-changed` events across windows/components.
  - Initializes the **Cryptographic Genesis Audit Block** via `initializeAuditLog()`.

### D. Multi-Factor Similarity Engine: `src/lib/similarity-engine.ts`
- Initialized on-demand by `src/app/api/similar-cases/route.ts` and UI components (`SimilarCaseSupport.tsx`, `/precedents`).
- Evaluates active cases against the closed precedent database `PRECEDENT_INDEX`.

### E. Database Layer: `prisma/schema.prisma` & `src/lib/db.ts`
- Configured with Prisma ORM 7 to support enterprise persistence:
  - Models: `Case`, `IncidentReport`, `PersonInvolved`, `Witness`, `EvidenceItem`, `ProceduralChecklistItem`, `Notice`, `CommitteeRecord`, `Decision`, `AppealRecord`, `SanctionTracking`, `Precedent`, `AuditLog`.

---

## 3. Technology Stack Breakdown

| Layer | Technology | Purpose in EDUguard |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (App Router)** | Server & client rendering, optimized page routing, modular layouts |
| **UI Library** | **React 19** | Component lifecycle, hooks (`useState`, `useEffect`), reactive event handling |
| **Language** | **TypeScript 5** | Strict type safety across all legal entities, dockets, notices, and personas |
| **Styling & Design** | **Tailwind CSS v4** | Clean, accessible institutional design system with neutral & emerald colorways |
| **Icons** | **Lucide React** | Contextual icons (Scales of justice, shields, locks, hashes, timestamps) |
| **LLM Inference** | **Groq Cloud API** | Ultra-fast token generation for conversational retrieval and policy explanation |
| **Primary LLM** | **LLaMA 3.3 70B Versatile** | Large reasoning model for natural language understanding and statutory policy synthesis |
| **Fallback LLM** | **Qwen 2.5 / 3.8 27B** | High-reliability backup model ensuring zero downtime |
| **Deterministic Fallback** | **TypeScript Rule Engine** | Offline emergency fallback providing hardcoded institutional answers |
| **Cryptographic Security** | **Web Crypto & Node `crypto`** | Computes SHA-256 checksums for evidence files and hash-chains audit entries |
| **Database ORM** | **Prisma 7 (`@prisma/client`)** | Relational mapping for cases, evidence, decisions, appeals, and audit logs |
| **Precedent Matching** | **Multi-Factor Scoring Engine** | Mathematical 6-vector weighted similarity model (0-100% match index) |
| **State Persistence** | **Browser LocalStorage + Singleton** | Instant in-browser reactivity, role-switching, and offline persistence |

---

## 4. What is "Live RAG" in EDUguard?

### Understanding Live RAG
Traditional chatbots either rely purely on pre-trained training data (which hallucinates non-existent university statutes) or basic document search.
**Live RAG (Retrieval-Augmented Generation)** in EDUguard is a **dynamic, multi-tier real-time context injection pipeline** that grounds every single LLM output in verified institutional facts.

### The 5 Layers of EDUguard Live RAG

```
[User Query + Active Screen Context]
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│ Layer 1: RBAC Security Filter (store.ts)               │
│ -> Only retrieves cases the active persona can see     │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Layer 2: Institutional Policy Grounding                │
│ -> Injects exact codes (ACAD-01, ACAD-02, COND-01..),  │
│    clauses, required quorums, and penalty guides       │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Layer 3: Active Docket Telemetry                       │
│ -> Injects current Case ID, Status, Checklist progress,│
│    SHA-256 evidence digests, and statutory deadlines   │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Layer 4: Multi-Factor Precedent Retrieval              │
│ -> Ranks historical closed cases via 6-point similarity│
│    and attaches top matching benchmarks & sanctions   │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ Layer 5: Statutory Guardrail Interceptor               │
│ -> Regex & semantic scan checks for determination bias │
│ -> If user asks for guilt, injects Due-Process Boundary│
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
[GroqCloud LLaMA-3.3-70B API (Temperature: 0.1)]
                         │
                         ▼
[Cryptographic SHA-256 Audit Log appended to Ledger]
                         │
                         ▼
[Verified, Grounded, Formatted Markdown Response]
```

#### 1. Real-Time RBAC Filtering
Before any retrieval occurs, the user's role (`STUDENT`, `FACULTY`, `HEAD_OF_DEPARTMENT`, `DEAN_STUDENT_AFFAIRS`, `ADMIN_REGISTRAR`, `COMMITTEE_MEMBER`, `GOVERNANCE_VIEWER`) is verified. A student can only retrieve information related to their own anonymized docket (`studentDisplayRef`), while an HoD retrieves departmental cases, and a Dean retrieves university-wide dockets.

#### 2. Statutory Policy Grounding
The dynamic system prompt injects exact institutional statutes:
- **[ACAD-01]** Academic Dishonesty: Code Clause 4.2(B) | Authority: HoD & Ethics Panel | 7-day window | 14-day appeal.
- **[ACAD-02]** Examination Integrity: Statute XII Clause 4.4(A) | Authority: Central Exam Board | 5-day window | 14-day appeal.
- **[COND-01]** Campus Standards: Conduct Code Clause 2.1(C) | Authority: Dean & Wardens | 7-day window | 14-day appeal.
- **[COND-02]** Property Damage: Property Statute Clause 2.5(A) | Authority: Infrastructure & Dean | 7-day window | 14-day appeal.
- **[COND-03]** Harassment: Safe Campus Charter Clause 5.1(B) | Authority: Standing Tribunal | 5-day window | 14-day appeal.

#### 3. Active Docket Telemetry Injection
When the user is viewing or inquiring about an active docket (e.g. `EDU-2026-00042`), the live case telemetry is fetched:
- Current state (e.g., `RESPONSE_WINDOW`).
- Evidence files attached and their verified SHA-256 checksums.
- Procedural checklist completion ratio (e.g., 2/8 milestones completed).
- Exact remaining hours/days on the statutory clock.

#### 4. Precedent Index Retrieval (Similarity Engine)
The similarity engine calculates a 6-vector weighted score against historical precedents:
$$\text{Score} = 0.25 \times S_{\text{offence}} + 0.20 \times S_{\text{intent}} + 0.15 \times S_{\text{circumstances}} + 0.15 \times S_{\text{severity}} + 0.10 \times S_{\text{occurrence}} + 0.15 \times S_{\text{evidence}}$$
This prevents disparate outcomes by supplying the committee with historical benchmarks.

#### 5. Guardrail Interception
If the user asks: *"Is Rahul guilty?"* or *"Should we expel him?"*, the prompt interceptor triggers `guardrailTriggered = true` and prepends the statutory boundary notice:
> **Due-Process Boundary**: Disciplinary findings and sanctions are strictly reserved for the authorized human Disciplinary Committee. Here is the statutory framework...

---

## 5. Complete End-to-End Due-Process Workflow (The 9 Stages)

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ 1. INTAKE    │ ──> │ 2. NOTICE ISSUED │ ──> │ 3. RESPONSE WINDOW  │
│ Evidence SHA │     │ Show-Cause Notice│     │ Statutory countdown │
└──────────────┘     └──────────────────┘     └─────────────────────┘
                                                         │
                                                         ▼
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ 6. DECISION  │ <── │ 5. HEARING       │ <── │ 4. COMMITTEE QUORUM │
│ Human Order  │     │ Representation   │     │ Bias check & quorum │
└──────────────┘     └──────────────────┘     └─────────────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ 7. APPEAL    │ ──> │ 8. COMPLIANCE    │ ──> │ 9. CASE CLOSED      │
│ 14-Day Clock │     │ Restitution / Sem│     │ Retention & Purge   │
└──────────────┘     └──────────────────┘     └─────────────────────┘
```

### Stage 1: Incident Registration (`/cases/new`)
- **Action**: Faculty or Proctor registers an incident.
- **Data Captured**: Title, Department, Incident Date, Location, Detailed Description.
- **Involved Parties**: Respondents (tagged with student reference IDs), Complainants, Victims.
- **Witnesses**: Witness names, designations, and initial statements.
- **WORM Evidence Sealing**: Evidence files (AST code diffs, logs, surveillance, exam papers) are digested using **SHA-256**. The checksum is permanently attached to prevent evidentiary tampering.
- **Audit**: Log entry `CASE_INTAKE` created and linked into the hash chain.

### Stage 2: Automated Policy & Offence Mapping
- **Action**: The policy engine maps the incident against the 5-point institutional database:
  1. Offence Category (e.g. Academic Dishonesty)
  2. Applicable Policy (e.g. Academic Integrity Code 2024)
  3. Relevant Policy Clause (e.g. Section 4.2(B))
  4. Required Procedure (e.g. Standard Departmental Inquiry)
  5. Competent Authority (e.g. HoD & Faculty Ethics Panel)
- **Parameters Set**: Minimum Quorum (e.g. 3 members), Response Window (e.g. 7 days), Appeal Window (e.g. 14 days), Retention Period (e.g. 3 years).

### Stage 3: Due-Process Statutory Checklist Gating (`/cases/[id]`)
Generates the 8 mandatory procedural milestones:
1. `Student notified?` (Dispatched under applicable policy)
2. `Notice delivered?` (Confirmed receipt / digital delivery log)
3. `Response window provided?` (5 or 7 calendar days enforced)
4. `Student given right to be heard?` (In-person or oral defense scheduled)
5. `Committee correctly constituted?` (Quorum validated, no conflict of interest)
6. `Required documents submitted?` (AST diffs, witness statements shared 72h prior)
7. `Hearing completed?` (Formal minutes and statement recorded)
8. `Decision recorded?` (Reasoned written order signed by authority)
*State Machine Rule*: A case cannot transition to decision if earlier milestones are incomplete.

### Stage 4: Statutory Notices & Communication (`/cases/[id]/notice`)
- Automated generation of formal notice templates:
  - **Show-Cause Notice**: Outlines specific allegations, cited clauses, response deadline, and right to inspect evidence.
  - **Hearing Notice**: Specifies date, venue, committee composition, and right to an accredited student advocate.
  - **Decision Communication**: Contains reasoned findings and the formal appeal procedure.
- Tracks delivery status: `DRAFT` -> `DISPATCHED` -> `DELIVERED`.

### Stage 5: Master Case File Management
- Centralized tamper-evident dossier accessible through RBAC.
- Encapsulates 8 core evidentiary elements: Incident report, Evidence items with SHA-256 hashes, Response statements, Checklist audit, Witness logs, Notice logs, Precedent comparisons, and Hearing minutes.

### Stage 6: Committee & Hearing Support Console
- Active assistance for disciplinary panels:
  - **Quorum Calculator**: Verifies that the required number of members (e.g., 3 or 4) are seated.
  - **Bias & Conflict of Interest Verification**: Confirms no reporting faculty sits as sole judge.
  - **Precedent Comparison**: Instant retrieval of similar historical closed cases to ensure sanction parity.

### Stage 7: Reasoned Decision Recording (`/cases/[id]/decision`)
- **Human-Exclusive Adjudication**: The system disables automatic punishment generation.
- The authorized committee enters:
  - Finding of Fact (Established vs. Not Established).
  - Detailed Reasoning Summary.
  - Sanction Selected from Approved Institutional Matrix (e.g., Remedial Citation Seminar, Grade Nullification, Restitution, Suspension).
  - Appeal Window Expiry Date (Statutory 14 calendar days).

### Stage 8: Sanction Compliance & Restitution Tracking
- Monitors compliance with educational restitution (e.g., attending an 8-hour citation workshop, completing campus restitution hours).
- Tracks deadlines and logs completion certificates.

### Stage 9: Case Closure & Retention Purge Engine (`/retention`)
- When all sanctions and appeal periods lapse, the case status moves to `CLOSED`.
- **Retention Clock**: Initiates a statutory countdown (e.g., 3 to 7 years).
- **Automated Expungement & Anonymization**: Once the retention period expires, personally identifiable student information is wiped or pseudonymized, retaining only statistical data for institutional governance reporting.

---

## 6. Feature-by-Feature Reference Guide

### 1. Interactive Policy & Case Simulator (`/#live-agent`)
- **Location**: Home page landing section.
- **Purpose**: Demonstrates real-time analysis of realistic student discipline scenarios (AST code similarity, unauthorized exam devices, sound violations).
- **Functionality**: Runs the simulator through all 5 policy dimensions, highlights applicable clauses, response deadlines, and evidence items.

### 2. Case Intake Console (`/cases/new`)
- **Purpose**: Formal incident filing.
- **Features**: Dynamic student search, role assignment (`RESPONDENT`, `COMPLAINANT`, `WITNESS`), file upload with real-time SHA-256 calculation, and automatic case number generator (`EDU-YYYY-XXXXX`).

### 3. Master Case Docket & State Machine (`/cases/[id]`)
- **Purpose**: Unified command center for an active case.
- **Features**: Interactive status stepper (9 stages), 8-step procedural checklist with one-click status toggling (`PENDING` -> `IN_PROGRESS` -> `COMPLETED`), evidence viewer with hash integrity check, and quick navigation to notices and decisions.

### 4. Notice Issuance Suite (`/cases/[id]/notice`)
- **Purpose**: Drafts and issues formal communications.
- **Features**: Generates formal university letterhead notices, auto-calculates response deadlines based on offence category, and registers dispatch audit logs.

### 5. Reasoned Decision Console (`/cases/[id]/decision`)
- **Purpose**: Adjudication logging.
- **Features**: Sanction selector, reasoning text area, quorum verification, and appeal deadline calculator.

### 6. Student Defense & Appeal Portal (`/student` & `/cases/[id]/appeal`)
- **Purpose**: Protects student rights and procedural fairness.
- **Features**:
  - Student views active notices and charges against them.
  - Inspects evidentiary files (AST diffs, witness statements).
  - Submits written explanation/defense with supporting file upload.
  - Submits formal appellate review petitions citing procedural error, disproportionate penalty, or newly discovered evidence.

### 7. Precedent Search & Similarity Engine (`/precedents` & `SimilarCaseSupport.tsx`)
- **Purpose**: Cross-departmental consistency and bias elimination.
- **Features**: Ranks historical dockets based on the 6-factor algorithm, displays detailed alignment factors and distinguishing differences, and presents precedent sanctions.

### 8. Cryptographic SHA-256 Audit Trail (`/audit`)
- **Purpose**: Anti-tamper accountability and legal defensibility.
- **Features**:
  - Inspects the full blockchain-style hash chain from the Genesis Block.
  - Canonical hash formula:
    $$\text{Hash}_n = \text{SHA256}(\text{Hash}_{n-1} \mid \text{ActorID} \mid \text{Role} \mid \text{Action} \mid \text{PayloadHash} \mid \text{Timestamp})$$
  - **One-Click Ledger Verification**: Scans every block in memory to confirm zero tampering has occurred.

### 9. Institutional Governance & Reporting Dashboard (`/dashboard`, `/governance`)
- **Purpose**: University leadership oversight (Deans, Senate, Provost).
- **Features**: Departmental breakdown, offence distribution, average procedural duration, appeal rate metrics, and compliance adherence rates.

### 10. Data Retention & Anonymization Console (`/retention`)
- **Purpose**: Compliance with privacy regulations and student expungement policies.
- **Features**: Shows active retention clocks, upcoming purge schedules, and execute expungement controls.

### 11. Floating EDUguard AI Assistant (`src/components/chat/EduguardChatModal.tsx`)
- **Purpose**: On-demand procedural guide accessible from any screen.
- **Features**: Direct answers, active case awareness, statutory citation, markdown rendering, and persona context.

---

## 7. Security, Integrity & Cryptographic Architecture

### A. SHA-256 WORM (Write Once, Read Many) Evidence Integrity
When an evidence file is attached, the system calculates:
```typescript
const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
```
This checksum is stored permanently on the evidence item. Any subsequent modification of the file will fail validation.

### B. Blockchain-Style Audit Hash-Chaining
Every critical action (`SYSTEM_BOOT`, `CASE_INTAKE`, `NOTICE_DISPATCHED`, `DEFENSE_SUBMITTED`, `DECISION_RECORDED`, `APPEAL_LODGED`, `CHATBOT_INTERACTION`) is recorded as a linked block:
- Contains `prevHash` pointing to the previous entry.
- Contains `currHash` representing the digest of the current transaction.
- Genesis Hash: `0000000000000000000000000000000000000000000000000000000000000000`.
- The ledger verifier (`verifyAuditLogIntegrity`) traverses the chain from block 0 to $N$, recalculating each hash. If any log or payload is altered, verification flags the exact corrupted index.

---

## 8. Summary: How All Pieces Fit Together
EDUguard transforms university discipline from an ad-hoc, paper-based, legally vulnerable process into an institutional, verifiable, due-process-first orchestration system:
1. **Intake** secures the facts and hashes evidence.
2. **Policy Engine** deterministically classifies the incident under statutory regulations.
3. **Checklist & State Machine** enforces mandatory milestones so students cannot be punished without due process.
4. **Live RAG & Groq LLM** provides real-time policy clarity, drafting assistance, and precedent insights with strict guardrails.
5. **Human Committee** retains sole authority to judge and sanction.
6. **Cryptographic Ledger** guarantees accountability, auditability, and fair appeals.
