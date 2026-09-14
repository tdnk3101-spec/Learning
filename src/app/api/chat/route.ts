import { NextResponse } from 'next/server';
import { OFFENCE_CATEGORIES, PRECEDENT_INDEX } from '@/lib/mock-data';
import { addAuditLog, getAllCasesForGovernance, getAllClosedCases, getFilteredCases } from '@/lib/store';
import { UserPersona } from '@/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Ordered priority list of active Groq models for high resilience and zero rate-limit drops
const CANDIDATE_MODELS = Array.from(
  new Set(
    [
      process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      process.env.GROQ_FALLBACK_MODEL || 'groq/compound-mini',
      'openai/gpt-oss-20b',
      'groq/compound-mini',
      'qwen/qwen3.6-27b',
      'groq/compound',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
    ].filter(Boolean)
  )
);

// Guardrail regex patterns for explicit determination requests (NOT mere inquiries about rules)
const GUARDRAIL_PROMPT_PATTERNS = [
  /\b(declare (him|her|them|the student)? guilty|is (he|she|the student|they) guilty|find (him|her|them)? guilty)\b/i,
  /\b(should we expel (him|her|them|the student)|expel (him|her|them) now)\b/i,
  /\b(decide (the )?verdict for (him|her|them|the student)|sentence (him|her|them))\b/i,
];

function buildSystemPrompt(
  persona: UserPersona,
  casesSummary: string,
  activeCaseSummary?: string,
  closedCasesSummary?: string
): string {
  return `You are EDUguard, an advanced Institutional Due-Process & Disciplinary Information Assistant for higher education universities.

ACTIVE USER CONTEXT:
- Name: ${persona.name}
- Role: ${persona.role}
- Department: ${persona.department || 'Academic Affairs'}
- Designation: ${persona.designation}
${persona.studentRollNo ? `- Student Roll Number: ${persona.studentRollNo}` : ''}
${persona.activeCaseId ? `- Assigned Active Case Docket: ${persona.activeCaseId}` : ''}

CRITICAL DIRECTIVE ON ANSWERING QUESTIONS:
1. ANSWER ALL QUESTIONS THOROUGHLY & HELPICALLY:
   - You MUST answer EVERY question asked by the user. Never refuse to answer legitimate user questions.
   - Whether the question is about disciplinary rules, writing a defense letter, exam policies, plagiarism detection, appeals, evidence verification, closed case archives, general campus advice, or conversational greetings, provide a clear, detailed, and directly applicable answer.
   - Answer directly in the first 1-2 sentences, then provide structured details, actionable steps, and relevant references.
   - Speak in natural, authoritative, supportive, and accessible English that students, professors, and parents can easily understand.

2. WHERE TO VIEW CLOSED CASES IN EDUGUARD:
   - When asked where to see closed cases, give the exact places:
     • **In Docket Manager**: Go to the Active Dockets page (/cases) and select the **"Closed Cases (Archive)"** tab, or open directly via URL (/cases?status=CLOSED).
     • **In Sidebar Navigation**: Click the **"Closed Cases Archive"** link in the navigation menu.
     • **In Command Center**: Check the **"Closed Records & Compliance"** KPI card on the Academic Command Center (/dashboard).
     • **For Students**: Log in to the **Student Due-Process Portal** (/student) and click the **"Closed History"** tab to view personal resolved records and remediation completion certificates.

3. STUDENT DEFENSE & STATUTORY DUE-PROCESS RIGHTS:
   - If a student asks how to defend themselves, what rights they have, or how to respond to an accusation:
     • **Right to Formal Notice**: The university must provide a written Show-Cause Notice detailing specific allegations, dates, and rule clauses.
     • **Evidence Inspection**: Right to inspect all evidence items (AST diff reports, Turnitin comparisons, logs) with SHA-256 cryptographic verification hashes before any hearing.
     • **Statutory Response Window**: Guaranteed 5 to 7 calendar days to submit a written explanation and supporting evidence.
     • **Formal Defense Submission**: Submit written representation and upload supporting files in the Student Portal (/student).
     • **Representation**: Right to be accompanied by a student ombudsman, peer advocate, or faculty advisor during hearings with mandatory 72-hour advance notice.
     • **Presumption of Innocence**: The burden of proof remains entirely on the university; the student is never presumed guilty.
     • **Right of Appeal**: 14 calendar days from formal determination to appeal to the Senate Appellate Board.

4. INSTITUTIONAL POLICIES REFERENCE:
- [ACAD-01] Academic Dishonesty & Plagiarism: Code Section 4.2(B) | Authority: HoD & Ethics Panel (Quorum: 3) | 7-day response window | 14-day appeal | Penalty Guide: Assignment grade nullification, 8h remedial citation seminar, restitution assignment.
- [ACAD-02] Examination Integrity & Unauthorized Devices: Statute XII Clause 4.4(A) | Authority: Central Exam Board (Quorum: 4) | 5-day response window | 14-day appeal | Penalty Guide: Exam paper cancellation (0 marks), 1-2 semester academic suspension, honors ineligibility.
- [COND-01] Campus Disorder & Noise Violations: Conduct Code Clause 2.1(C) | Authority: Dean of Student Affairs / Wardens (Quorum: 3) | 7-day response window | 14-day appeal | Penalty Guide: Written admonition, campus community restitution service (up to 20 hours).
- [COND-02] Property Damage & Lab Safety: Property Statute Clause 2.5(A) | Authority: Infrastructure & Dean (Quorum: 3) | 7-day response window | 14-day appeal | Penalty Guide: Repair cost recovery, laboratory safety seminar, probation.
- [COND-03] Harassment & Campus Safety: Safe Campus Charter Clause 5.1(B) | Authority: Standing Tribunal (Quorum: 5) | 5-day response window | 14-day appeal | Penalty Guide: No-contact directive, suspension, expulsion.

5. STATUTORY GUARDRAIL PRINCIPLE:
   - You provide legal policy retrieval, procedural tracking, notice drafting, defense guidance, and precedent comparison.
   - You NEVER declare guilt or decide punishments for individuals—that authority belongs solely to the authorized human Disciplinary Committee.
   - If (and ONLY if) the user explicitly demands that YOU personally declare a student guilty or expel them, clarify:
     "> **Due-Process Boundary**: Institutional regulations require that all determinations of guilt and disciplinary sanctions be made exclusively by the human Disciplinary Committee. Here is the objective statutory framework and precedent guidance for reference:"
   - Do NOT attach this disclaimer when the user is simply asking about policy rules, penalty ranges, deadlines, defense advice, or case facts!

${activeCaseSummary ? `FOCUSED ACTIVE DOCKET:\n${activeCaseSummary}\n` : ''}
${casesSummary ? `ACCESSIBLE DOCKETS IN REGISTRY:\n${casesSummary}\n` : ''}
${closedCasesSummary ? `CLOSED CASES IN ARCHIVE:\n${closedCasesSummary}\n` : ''}

CLOSED PRECEDENTS BENCHMARK:
- PREC-2024-0014: Code Similarity in Algorithm Lab (First-time, partial intent -> 8-Hour Academic Citation Workshop & grade cap).
- PREC-2025-0022: Cosmetic Variable Renaming (Reckless -> Zero marks on project, written reprimand).
- PREC-2023-0089: Smartwatch in Midterm Exam (Confiscated -> Midterm score cancelled, 1-semester probation).
- PREC-2025-00118: Uncited Reference Duplication in OS Lab (Completed 8-hour citation workshop -> Successfully closed & expunged after 3 years).
- PREC-2025-00092: Circuit Fabrication Apparatus Overload (Accidental -> High-Voltage Safety Seminar -> Successfully closed).`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, persona, activeCaseId } = body;

    const currentPersona: UserPersona = persona || {
      id: 'user-hod-cse',
      name: 'Dr. Meera Sharma',
      role: 'HEAD_OF_DEPARTMENT',
      department: 'Computer Science & Engineering',
      designation: 'Professor & Head of Department',
      email: 'm.sharma@institution.edu',
    };

    // Filter accessible cases according to RBAC
    const accessibleCases =
      currentPersona.role === 'GOVERNANCE_VIEWER'
        ? getAllCasesForGovernance()
        : getFilteredCases(currentPersona);

    const closedCases = getAllClosedCases();

    const activeCase = activeCaseId ? accessibleCases.find((c) => c.id === activeCaseId) : undefined;
    const activeCaseSummary = activeCase
      ? `Case ${activeCase.caseNumber} (${activeCase.studentDisplayRef}): "${activeCase.title}" | Status: ${activeCase.status} | Offence: ${activeCase.offenceCategory.code} (${activeCase.offenceCategory.relevantClause}) | Dept: ${activeCase.department} | Evidence: ${activeCase.incidentReport?.evidenceItems?.length || 0} items | Checklist: ${activeCase.checklistItems.filter((i) => i.status === 'COMPLETED').length}/${activeCase.checklistItems.length} steps completed`
      : undefined;

    const casesSummary = accessibleCases
      .slice(0, 5)
      .map(
        (c) =>
          `- ${c.caseNumber} [${c.offenceCategory.code}]: "${c.title}" (${c.studentDisplayRef}) | Status: ${c.status}`
      )
      .join('\n');

    const closedCasesSummary = closedCases
      .map(
        (c) =>
          `- ${c.caseNumber} [${c.offenceCategory.code}]: "${c.title}" (${c.studentDisplayRef}) | Verdict: ${c.decision?.verdict || 'Resolved'} | Sanction: ${c.decision?.sanctionImposed || 'Remediation completed'} | Retention Expiry: ${c.retentionExpiryAt ? new Date(c.retentionExpiryAt).toLocaleDateString() : 'Active Archival'}`
      )
      .join('\n');

    const lastUserMessage =
      messages && messages.length > 0 ? messages[messages.length - 1].content : '';

    // Check for explicit determination guardrail trigger
    let guardrailTriggered = false;
    for (const pattern of GUARDRAIL_PROMPT_PATTERNS) {
      if (pattern.test(lastUserMessage)) {
        guardrailTriggered = true;
        break;
      }
    }

    const systemPrompt = buildSystemPrompt(
      currentPersona,
      casesSummary,
      activeCaseSummary,
      closedCasesSummary
    );

    // Keep clean conversation history (last 10 messages for context)
    const filteredHistory = (messages || [])
      .filter((m: { role: string; content: string }) => m.content && m.content.trim())
      .slice(-10)
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...filteredHistory,
    ];

    let replyText = '';
    let usedModel = '';

    // Try candidate models in prioritized sequence with fast timeouts
    if (GROQ_API_KEY) {
      for (const model of CANDIDATE_MODELS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout per candidate

          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: apiMessages,
              temperature: 0.3,
              max_tokens: 2048,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (groqRes.ok) {
            const data = await groqRes.json();
            let rawContent = data.choices?.[0]?.message?.content?.trim() || '';

            // Clean any thinking tags from reasoning models
            rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

            if (rawContent) {
              replyText = rawContent;
              usedModel = model;
              break; // Successfully got response
            }
          } else {
            const errData = await groqRes.json().catch(() => null);
            console.warn(`Groq model ${model} returned HTTP ${groqRes.status}:`, errData?.error?.message);
          }
        } catch (modelErr) {
          console.warn(`Attempt with Groq model ${model} failed or timed out:`, modelErr);
        }
      }
    }

    // If Groq models were exhausted, rate-limited, or offline, invoke intelligent local rule engine
    if (!replyText) {
      console.warn('All Groq models unavailable or exhausted, activating high-fidelity institutional engine');
      replyText = generateDeterministicFallback(lastUserMessage, currentPersona, accessibleCases);
      usedModel = 'eduguard-institutional-knowledge-engine';
    }

    // Prepend guardrail boundary notice if explicitly triggered
    if (
      guardrailTriggered &&
      !replyText.includes('Due-Process Boundary') &&
      !replyText.includes('STATUTORY GUARDRAIL')
    ) {
      replyText = `> **Due-Process Boundary**: Disciplinary findings and sanctions are strictly reserved for the authorized human Disciplinary Committee. Here is the statutory framework:\n\n${replyText}`;
    }

    // Append cryptographic audit log
    try {
      await addAuditLog({
        caseId: activeCaseId || undefined,
        action: 'CHATBOT_INTERACTION',
        performedBy: currentPersona.name,
        details: `Disciplinary Chatbot Query: "${lastUserMessage.slice(0, 80)}..." [Model: ${usedModel}]`,
        metadata: {
          queryLength: lastUserMessage.length,
          guardrailTriggered,
          model: usedModel,
          role: currentPersona.role,
        },
      });
    } catch (auditErr) {
      console.error('Audit log failed:', auditErr);
    }

    return NextResponse.json({
      message: replyText,
      guardrailTriggered,
      modelUsed: usedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat server error' },
      { status: 500 }
    );
  }
}

/**
 * Comprehensive institutional knowledge & reasoning engine for offline or rate-limited environments.
 * Thoroughly answers all inquiries, including defense strategies, policy interpretations, drafting templates,
 * timelines, appeals, closed archives, hearings, and general campus questions.
 */
function generateDeterministicFallback(
  query: string,
  persona: UserPersona,
  cases: unknown[]
): string {
  const q = query.toLowerCase().trim();

  // 1. Greetings & System Identity
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.startsWith('hi ') ||
    q.startsWith('hello ') ||
    q.includes('who are you') ||
    q.includes('what can you do') ||
    q.includes('what are you') ||
    q.includes('help me')
  ) {
    return `### Welcome to EDUguard AI Disciplinary Assistant

**Hello, ${persona.name}!** I am your institutional due-process companion. I am fully equipped to assist you with any questions regarding university disciplinary governance, student protections, and procedural fairness.

**How I Can Help You:**
- 🔍 **Policy Lookup & Sanction Guides**: Ask about Academic Dishonesty (ACAD-01), Exam Conduct (ACAD-02), Campus Disorder (COND-01), Lab Safety (COND-02), or Anti-Harassment (COND-03).
- 🛡️ **Student Defense Guidance**: Step-by-step instructions on writing defense letters, inspecting evidence, and requesting ombudsman representation.
- ⏱️ **Timelines & Statutory Windows**: Inquire about response windows (5-7 calendar days), hearing notice (72 hours), and appeal clocks (14 days).
- 📁 **Closed Cases & Precedent Archive**: Guidance on viewing resolved historical cases and analyzing precedent consistency.
- 📄 **Notice & Statement Drafting**: Generating formal representation drafts, show-cause notices, or appeal petitions.
- 🔒 **Evidence Integrity Checks**: Explaining SHA-256 cryptographic verification and Turnitin/AST diff reports.

*Feel free to ask any question—for example: "How can I defend myself against plagiarism allegations?", "Where can I see closed cases?", or "What happens in a disciplinary hearing?"*`;
  }

  // 2. Plagiarism & Unauthorized Collaboration (ACAD-01)
  if (
    q.includes('plagiarism') ||
    q.includes('acad-01') ||
    q.includes('code') ||
    q.includes('ast') ||
    q.includes('similarity') ||
    q.includes('collaboration') ||
    q.includes('turnitin') ||
    q.includes('chatgpt') ||
    q.includes('ai tool')
  ) {
    return `### Academic Integrity Code (ACAD-01): Plagiarism & Unauthorized Collaboration

**Direct Answer:**
Under **Academic Integrity Code Section 4.2(B)**, allegations of unauthorized code sharing, uncited text duplication, or undisclosed AI assistance are investigated under the principle of educational remediation rather than arbitrary punishment.

**Prescribed Sanction Guidelines:**
| Infraction Tier | Typical Determination | Prescribed Institutional Measure |
|---|---|---|
| **Tier 1 (First-Time / Negligent)** | Partial structural overlap without intent to deceive | Assignment grade nullification, 8-hour Academic Citation Seminar, proctored re-submission |
| **Tier 2 (Substantial / Reckless)** | Intentional duplication or variable obfuscation | Zero marks on course component, formal written reprimand on institutional record |
| **Tier 3 (Egregious / Multi-Course)** | Commercial commissioning or widespread copying | Course failure ('F' grade), one-semester academic suspension |

**Guaranteed Due-Process Rights for Students:**
1. **Notice**: Must receive a formal Show-Cause Notice specifying exact code lines or paragraphs flagged.
2. **Evidence Inspection**: Right to inspect AST syntax trees, Turnitin match reports, and commit timelines at least 72 hours before any hearing.
3. **Response Window**: Full **7 calendar days** to submit a written explanation and commit logs proving independent work.`;
  }

  // 3. Examination Cheating & Unauthorized Devices (ACAD-02)
  if (
    q.includes('exam') ||
    q.includes('cheating') ||
    q.includes('acad-02') ||
    q.includes('phone') ||
    q.includes('mobile') ||
    q.includes('smartwatch') ||
    q.includes('unauthorized device') ||
    q.includes('test hall') ||
    q.includes('invigilator')
  ) {
    return `### Examination Integrity Code (ACAD-02): Cheating & Unauthorized Devices

**Direct Answer:**
Under **Statute XII Clause 4.4(A)**, possession or use of unauthorized electronic devices (smartphones, programmable smartwatches, hidden notes) in an examination venue triggers an immediate formal inquiry by the Central Examination Disciplinary Board.

**Procedural Framework & Sanctions:**
- **Authority**: Central Examination Board (Mandatory Quorum: 4 senior faculty members).
- **Prescribed Sanction Range**:
  • **Passive Possession (Device turned off / no communication proven)**: Cancellation of the individual exam paper (zero marks awarded) with warning.
  • **Active Usage (Exchanging answers / online access)**: Cancellation of all semester examination papers and **1-2 semester academic suspension**.
- **Statutory Response Window**: **5 calendar days** from the dispatch of the formal summons.
- **Student Safeguards**:
  1. Proctorial incident log and confiscated device chain-of-custody must be cryptographically sealed.
  2. The student has the right to present oral testimony accompanied by an accredited student ombudsman.
  3. Any decision must be delivered in writing citing the exact evidentiary findings.`;
  }

  // 4. Campus Disorder & Misconduct (COND-01)
  if (
    q.includes('cond-01') ||
    q.includes('disorder') ||
    q.includes('noise') ||
    q.includes('curfew') ||
    q.includes('hostel') ||
    q.includes('fight') ||
    q.includes('campus conduct')
  ) {
    return `### Student Conduct Code (COND-01): Campus Disorder & Standards

**Direct Answer:**
Under **Campus Conduct Code Clause 2.1(C)**, disruptive behavior in academic buildings or residential halls is handled under restorative justice procedures overseen by the Dean of Student Affairs and Hall Wardens.

**Key Governance Guidelines:**
- **Authority**: Dean of Student Affairs / Hostel Board (Quorum: 3).
- **Statutory Response Window**: **7 calendar days** to provide an explanation.
- **Standard Sanctions**: Written admonition, campus community restitution service (up to 20 hours), or hostel probation.
- **Right to Fair Hearing**: The respondent is entitled to review any security camera logs or witness statements prior to informal resolution or tribunal hearing.`;
  }

  // 5. Property Damage & Lab Safety (COND-02)
  if (
    q.includes('cond-02') ||
    q.includes('property') ||
    q.includes('apparatus') ||
    q.includes('damage') ||
    q.includes('laboratory') ||
    q.includes('equipment') ||
    q.includes('safety')
  ) {
    return `### Property & Safety Statute (COND-02): Lab Safety & Apparatus Integrity

**Direct Answer:**
Under **Property & Laboratory Safety Statute Clause 2.5(A)**, incidents involving damage to scientific apparatus, computational servers, or campus infrastructure distinguish strictly between accidental negligence and intentional vandalism.

**Sanction & Restitution Matrix:**
- **Accidental Misuse with Voluntary Disclosure**: Mandatory completion of a Laboratory Safety Re-Certification Seminar; no punitive notation on academic transcript.
- **Reckless / Unauthorized Access**: Restitution for documented repair costs and 1-semester restriction on unsupervised lab equipment access.
- **Intentional Sabotage**: Restitution recovery plus formal disciplinary probation and potential suspension.`;
  }

  // 6. Anti-Harassment & Student Safety (COND-03)
  if (
    q.includes('cond-03') ||
    q.includes('harassment') ||
    q.includes('bullying') ||
    q.includes('ragging') ||
    q.includes('safety') ||
    q.includes('threat')
  ) {
    return `### Safe Campus Charter (COND-03): Anti-Harassment & Non-Discrimination

**Direct Answer:**
Under **Safe Campus Charter Clause 5.1(B)**, all allegations of harassment, discrimination, or intimidation are treated with immediate institutional priority by a specialized Standing Tribunal.

**Protective & Disciplinary Protocols:**
- **Authority**: Standing Disciplinary Tribunal (Mandatory Quorum: 5 members, including legal and student welfare representatives).
- **Interim Measures**: Immediate reciprocal no-contact directives and schedule adjustments to protect all parties during the inquiry.
- **Timelines**: **5 calendar days** statutory response window; expedited hearing scheduled within 10 days.
- **Sanction Range**: Disciplinary probation, campus exclusion directives, academic suspension, or expulsion.`;
  }

  // 7. Student Defense Strategy & Statutory Rights
  if (
    q.includes('defend') ||
    q.includes('defense') ||
    q.includes('protect') ||
    q.includes('falsely accused') ||
    q.includes('innocent') ||
    q.includes('rights') ||
    q.includes('what should i do')
  ) {
    return `### Student Disciplinary Defense Guide: How to Protect Your Rights

**Direct Answer:**
If you are facing a disciplinary inquiry, institutional due process guarantees you specific rights and procedural protections that the university must strictly follow.

**Essential Actionable Steps for Your Defense:**

1. **Access Your Defense Portal**:
   - Open the [Student Due-Process Portal](/student) and unlock your case docket using your assigned Case ID (e.g. \`EDU-2026-00042\`).

2. **Inspect All Sealed Evidence**:
   - Verify all evidence documents (AST comparison diffs, proctorial incident logs, git commits).
   - Check that evidence items match their official SHA-256 cryptographic hashes to ensure the file has not been altered or tampered with.

3. **Utilize Your Full Response Window**:
   - You have **5 to 7 calendar days** (depending on the offense code) to submit your formal written representation.
   - Do not rush or provide hasty oral statements before reviewing the exact notice clauses.

4. **Prepare Supporting Documentation**:
   - Gather earlier assignment drafts, Google Docs/OneDrive edit timestamps, commit histories, course notes, or medical records that establish independent creation.

5. **Request Student Ombudsman Representation**:
   - You have the statutory right to bring an accredited student ombudsman, peer advocate, or faculty mentor to all committee proceedings.

6. **Exercise Right of Appeal**:
   - If the committee delivers an adverse finding, you have a guaranteed **14 calendar days** to appeal to the Senate Appellate Board.`;
  }

  // 8. Defense Letter / Representation Template
  if (
    q.includes('template') ||
    q.includes('draft') ||
    q.includes('letter') ||
    q.includes('statement') ||
    q.includes('representation') ||
    q.includes('how to write')
  ) {
    return `### Formal Defense Statement: Official Written Representation Template

You can adapt the following institutional template when submitting your written explanation in the [Student Due-Process Portal](/student):

\`\`\`markdown
FORMAL WRITTEN REPRESENTATION IN RESPONSE TO SHOW-CAUSE NOTICE
To: The Disciplinary Committee / Head of Department
Date: [Insert Date]
Case Reference: [e.g. EDU-2026-00042]
Student Name & Roll No: [Your Name] | [Roll Number]
Department: [Your Department]

1. STATEMENT OF RECEIPT & TIMELINESS
I acknowledge receipt of the Show-Cause Notice regarding [Case Title] on [Date]. I submit this formal representation within the guaranteed statutory 7-day response window.

2. FACTUAL BACKGROUND & CONTEXT
- [Chronologically state how and when you worked on the assignment/exam.]
- [Specify tools, textbooks, lecture slides, and notes utilized.]
- [Address specific overlap percentages or allegations directly with factual explanations.]

3. SUPPORTING EVIDENCE ATTACHMENTS
I attach the following verifiable records:
- Exhibit A: Timestamped version history / Git commit log (SHA-256 verified)
- Exhibit B: Handwritten preparatory notes / draft outlines
- Exhibit C: Communications with teaching assistant regarding clarifying questions

4. FORMAL REQUEST
In accordance with Section 4.2 of the Academic Regulations, I respectfully request:
a) Full consideration of this explanation and the attached verifiable drafts.
b) An opportunity to be heard in person accompanied by a student ombudsman if the committee requires oral clarification.

Respectfully submitted,
[Your Name]
\`\`\``;
  }

  // 9. Closed Cases Archive & Where to Find Them
  if (
    q.includes('closed') ||
    q.includes('archive') ||
    q.includes('past case') ||
    q.includes('history') ||
    q.includes('edu-2025-00118') ||
    q.includes('edu-2025-00092')
  ) {
    return `### Closed Cases Archive & Historical Records in EDUguard

**Direct Answer:**
Closed cases in EDUguard are permanently preserved with full cryptographic audit trails. You can view closed cases in several places:

1. **In Docket Manager**:
   - Navigate to [Active Dockets](/cases) and click the **"Closed Cases (Archive)"** tab, or navigate directly to \`/cases?status=CLOSED\`.
2. **In the Student Portal**:
   - If you are logged in as a student, open the [Student Defense Portal](/student) and switch to the **"Closed History"** tab to view your past resolved infractions, remediation certificates, and retention purge dates.
3. **In the Academic Command Center**:
   - Check the **"Closed Records & Compliance"** KPI card on the [Dashboard](/dashboard).
4. **In Navigation**:
   - Click the **"Closed Cases Archive"** link in the main navigation sidebar.

**Archived Cases Currently on Record:**
- **EDU-2025-00118**: *Uncited Reference Duplication in OS Lab* (Student #CS-8902 - Rahul Verma)
  • **Verdict**: Substantiated (First-time negligent citation omission)
  • **Sanction**: Mandatory 8-hour Academic Citation Seminar (Completed & Certified)
  • **Status**: Completed & Archived (Retention active until November 2028)
- **EDU-2025-00092**: *Circuit Fabrication Laboratory Overload* (Student #EC-2094 - Priya Sundaram)
  • **Verdict**: Accidental misuse with voluntary reporting
  • **Sanction**: High-Voltage Safety Re-Certification (Satisfied)
  • **Status**: Completed & Archived (Retention active until October 2028)`;
  }

  // 10. Statutory Windows & Deadlines
  if (
    q.includes('window') ||
    q.includes('deadline') ||
    q.includes('timeline') ||
    q.includes('days') ||
    q.includes('time') ||
    q.includes('clock')
  ) {
    return `### Mandatory Statutory Timelines & Procedural Clocks

**Direct Answer:**
University due-process regulations enforce strict statutory deadlines that protect all participants from arbitrary delays or hurried proceedings:

| Statutory Stage | Prescribed Timeframe | Legal Significance |
|---|---|---|
| **Show-Cause Response Window** | **5 to 7 Calendar Days** | Mandatory period for student to inspect evidence and submit written defense. |
| **Oral Hearing Summons** | **72 Hours Advance Notice** | Minimum guaranteed preparation time; summons must specify charges and panel members. |
| **Committee Reasoning Delivery** | **5 Business Days** | The committee must deliver a written, evidence-based determination following the hearing. |
| **Appellate Filing Window** | **14 Calendar Days** | Time allowed for the student to lodge a formal appeal to the Senate Appellate Board. |

*Procedural Safeguard:* If the university fails to provide the full statutory response window or advance hearing notice, any subsequent disciplinary finding is legally vulnerable to procedural dismissal.`;
  }

  // 11. Appeals & Senate Appellate Board
  if (
    q.includes('appeal') ||
    q.includes('senate') ||
    q.includes('appellate') ||
    q.includes('overturn') ||
    q.includes('disagree with decision') ||
    q.includes('challenge')
  ) {
    return `### Formal Disciplinary Appeals & Appellate Board Guidelines

**Direct Answer:**
Any student or department dissatisfied with a Disciplinary Committee determination has the statutory right to file an appeal with the **Senate Appellate Board** within **14 calendar days** of receiving the written decision.

**Valid Grounds for Appeal:**
1. **Procedural Defect**: The committee failed to follow prescribed due-process steps (e.g. denying evidence inspection, shortening response window, failure of quorum).
2. **New Exculpatory Evidence**: Substantial evidence that was genuinely unavailable during the initial proceedings is discovered.
3. **Disproportionate Sanction**: The penalty imposed significantly exceeds established institutional precedents for similar first-time infractions.
4. **Apparent Bias or Conflict of Interest**: A panel member had a personal conflict and failed to recuse themselves.

**Appellate Powers:**
The Senate Appellate Board may **uphold the decision**, **reduce the sanction**, **order a fresh inquiry before an independent panel**, or **completely vacate the charges**.`;
  }

  // 12. Disciplinary Hearings & Committee Protocols
  if (
    q.includes('hearing') ||
    q.includes('committee') ||
    q.includes('summons') ||
    q.includes('ombudsman') ||
    q.includes('advocate') ||
    q.includes('witness')
  ) {
    return `### Disciplinary Committee Hearings & Oral Proceedings Protocol

**Direct Answer:**
Disciplinary hearings are formal institutional proceedings designed to evaluate allegations impartially.

**Key Standards for a Fair Hearing:**
- **Quorum Requirements**:
  • HoD / Ethics Panel (ACAD-01): Minimum 3 voting members.
  • Central Examination Disciplinary Board (ACAD-02): Minimum 4 voting members.
  • Standing Tribunal (COND-03): Minimum 5 members.
- **Advance Summons**: Written notice must be dispatched at least **72 hours in advance**, listing the allegations, panel members, and meeting time.
- **Student Ombudsman Presence**: The respondent has the right to be accompanied by a student ombudsman, peer representative, or faculty advisor.
- **Audio/Written Record**: An official transcript or detailed summary minutes must be recorded and signed by all panel members.`;
  }

  // 13. Case EDU-2026-00042 (Rahul Verma)
  if (
    q.includes('00042') ||
    q.includes('rahul') ||
    q.includes('verma') ||
    q.includes('cs-8902') ||
    q.includes('active case')
  ) {
    return `### Docket Summary: Case EDU-2026-00042

**Direct Answer:**
Case **EDU-2026-00042** is an active disciplinary inquiry currently in the **RESPONSE_WINDOW** stage.

- **Respondent**: Rahul Verma (Student Ref #CS-8902, B.Tech CSE Semester 5)
- **Offence Category**: ACAD-01 (Academic Dishonesty & Assessment Irregularity, Clause 4.2B)
- **Incident Summary**: 94% Abstract Syntax Tree (AST) code structure overlap in Algorithms Lab Benchmark Assignment #4.
- **Current Status**: Response Window Active (5 calendar days remaining).
- **Cryptographically Sealed Evidence**:
  • \`similarity_report_ast_diff.pdf\` (428 KB, SHA-256: \`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\`)
  • \`git_commit_timings_log.csv\` (18.4 KB, SHA-256: \`a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0\`)
- **Procedural Checklist**: 2 of 8 statutory steps completed (Show-cause notice issued and acknowledged).
- **Next Required Milestone**: Submission of written explanation or expiration of response window on 17 September 2026 at 18:00 UTC.`;
  }

  // 14. Faculty & Staff Roles / Employee IDs
  if (
    q.includes('faculty') ||
    q.includes('employee') ||
    q.includes('emp-') ||
    q.includes('login') ||
    q.includes('role') ||
    q.includes('hod') ||
    q.includes('dean') ||
    q.includes('registrar')
  ) {
    return `### Institutional Roles & Faculty Authentication (Employee IDs)

**Direct Answer:**
EDUguard enforces strict Role-Based Access Control (RBAC) to preserve confidential student records and guarantee fair governance.

**Institutional Faculty Accounts & Employee IDs:**
- **EMP-1001**: **Dr. Meera Sharma** — Head of Department (Computer Science & Engineering). Authorized to initiate dockets, dispatch show-cause notices, and oversee department ethics panels.
- **EMP-1002**: **Prof. Rajesh K. Nair** — Disciplinary Committee Chair. Presides over formal hearings, records committee deliberation minutes, and drafts reasoned decisions.
- **EMP-1003**: **Dr. Sunita Deshmukh** — Registrar & Legal Compliance Officer. Monitors due-process checklist compliance, verifies cryptographic SHA-256 evidence seals, and handles Senate appeals.
- **EMP-1004**: **Dr. Anand Sundaram** — Dean of Student Affairs. Oversees student conduct cases (COND-01/02/03) and coordinates with student ombudsmen.

**Student Access Modes:**
- **General Campus Students** (e.g. Roll #CS-9104): Can access the AI assistant and "How It Works" guide.
- **Accused Students** (e.g. Roll #CS-8902 with Case ID \`EDU-2026-00042\`): Can unlock their confidential defense workspace, inspect evidence hashes, and submit written defense representations.`;
  }

  // 15. Universal Dynamic Knowledge Synthesizer for ANY other query
  return `### Institutional Due-Process Guidance

**Direct Answer:**
Regarding your inquiry on **"${query.trim()}"**: Under institutional governance regulations, all disciplinary processes adhere to statutory fairness, transparent evidence inspection, and documented procedural milestones.

**Key Principles Governing Your Query:**
1. **Applicable Regulatory Standards**:
   - The institution enforces five distinct offence categories: Academic Dishonesty (**ACAD-01**), Exam Integrity (**ACAD-02**), Campus Disorder (**COND-01**), Lab & Property Safety (**COND-02**), and Anti-Harassment (**COND-03**).
   - Every docket requires a mandatory quorum of senior faculty and adherence to the 8-Step Due-Process Checklist.

2. **Procedural Safeguards**:
   - Students have guaranteed statutory response windows (5 to 7 calendar days) and mandatory 72-hour advance hearing notices.
   - All evidence items (similarity diffs, proctor reports, server logs) are sealed with tamper-evident SHA-256 cryptographic hashes.

3. **Actionable Recommendations**:
   - **For Case Inspection**: Visit [Active Dockets](/cases) or check the [Closed Cases Archive](/cases?status=CLOSED).
   - **For Student Defense**: Access the [Student Due-Process Portal](/student) to inspect sealed exhibits or draft a formal written statement.
   - **For Hearing Representation**: Request the presence of a student ombudsman or academic mentor through the Dean of Student Affairs.

*If you need specific policy text, deadline calculations, notice drafts, or docket summaries, please ask and I will provide the exact details immediately.*`;
}
