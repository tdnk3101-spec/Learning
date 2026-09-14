import { NextResponse } from 'next/server';
import { OFFENCE_CATEGORIES, PRECEDENT_INDEX } from '@/lib/mock-data';
import { addAuditLog, getAllCasesForGovernance, getAllClosedCases, getFilteredCases } from '@/lib/store';
import { UserPersona } from '@/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'qwen/qwen3.8-27b';

// Guardrail regex patterns for explicit determination requests (NOT mere inquiries about rules)
const GUARDRAIL_PROMPT_PATTERNS = [
  /\b(declare (him|her|them|the student)? guilty|is (he|she|the student|they) guilty|find (him|her|them)? guilty)\b/i,
  /\b(should we expel (him|her|them|the student)|expel (him|her|them) now)\b/i,
  /\b(decide (the )?verdict for (him|her|them|the student)|sentence (him|her|them))\b/i,
];

function buildSystemPrompt(persona: UserPersona, casesSummary: string, activeCaseSummary?: string, closedCasesSummary?: string): string {
  return `You are EDUguard, an advanced Institutional Due-Process & Disciplinary Information Assistant for higher education universities.

ACTIVE USER CONTEXT:
- Name: ${persona.name}
- Role: ${persona.role}
- Department: ${persona.department || 'Academic Affairs'}
- Designation: ${persona.designation}
${persona.studentRollNo ? `- Student Roll Number: ${persona.studentRollNo}` : ''}

CORE INSTRUCTIONS FOR DIRECT, ACCURATE & HELPFUL RESPONSES:
1. ANSWER DIRECTLY FIRST:
   - Always answer the user's specific question immediately in the first 1-2 clear, simple sentences.
   - Address questions about policies, active cases, closed cases, statutory defense rights, deadlines, and precedents directly.
   - Speak in natural, authoritative, supportive, and accessible English that students, professors, and parents can easily understand.

2. HOW TO VIEW CLOSED CASES IN EDUGUARD:
   - If the user asks where to find or see closed cases: Explain that closed cases are accessible in the **Closed Cases Archive**:
     • **In Docket Manager**: Navigate to the Active Dockets page (/cases) and select the **"Closed Cases (Archive)"** tab, or open directly via URL (/cases?status=CLOSED).
     • **In Sidebar Navigation**: Click the **"Closed Cases Archive"** link in the navigation menu.
     • **In Dashboard**: Check the **"Closed Records & Compliance"** KPI card on the Academic Command Center (/dashboard).
     • **For Students**: Log in to the **Student Due-Process Portal** (/student) and click the **"Closed History"** tab to view personal resolved records and remediation completion certificates.

3. STUDENT DEFENSE & DUE-PROCESS RIGHTS:
   - If a student asks for defense advice or how to protect themselves:
     • **Right to Notice & Information**: The student has the statutory right to receive a formal Show-Cause Notice containing specific allegations and policy clauses.
     • **Evidence Inspection**: Right to inspect all sealed evidence items (e.g. Turnitin/AST code comparison, proctorial reports) along with SHA-256 cryptographic verification hashes before any hearing.
     • **Statutory Response Window**: Strict 5 to 7 calendar days to submit a written explanation without penalty.
     • **Formal Defense Submission**: The student can submit their written factual representation and attach defense evidence documents directly in the Student Portal (/student).
     • **Right to Representation**: Right to be accompanied by a student ombudsman or academic advisor during committee hearings with mandatory 72-hour advance notice.
     • **Presumption of Innocence**: The burden of proof remains on the institution; the student is never presumed guilty.
     • **Right of Appeal**: 14 calendar days following any formal determination to appeal to the Senate Appellate Board.

4. STRUCTURE YOUR ANSWER CLEANLY:
   - Format answers using clean markdown:
     • **Direct Answer**: The exact answer to what was asked.
     • **Applicable Policy / Case Reference**: Cite specific codes (e.g. ACAD-01, ACAD-02, COND-01), section, docket ID, or statutory timeframe.
     • **Rights & Actionable Next Steps**: Clear guidance on what the student, committee, or user should do.

5. STATUTORY GUARDRAIL PRINCIPLE:
   - You provide legal policy retrieval, procedural tracking, notice drafting, defense guidance, and precedent comparison.
   - You NEVER declare guilt or decide punishments for individuals—that authority belongs solely to the authorized human Disciplinary Committee.
   - If (and ONLY if) the user explicitly asks you to declare guilt or pass a sentence on a student, state:
     "> **Due-Process Boundary**: Institutional regulations require that all determinations of guilt and disciplinary sanctions be made exclusively by the human Disciplinary Committee. Here is the objective statutory framework and precedent guidance for reference:"
   - Do NOT attach this disclaimer when the user is simply asking about policy rules, penalty ranges, deadlines, defense advice, or case facts!

INSTITUTIONAL POLICIES REFERENCE:
- [ACAD-01] Academic Dishonesty & Assessment Irregularity: Code Clause 4.2(B) | Authority: HoD & Ethics Panel (Quorum: 3) | 7-day response window | 14-day appeal | Penalty Guide: Assignment grade nullification, 8h remedial citation seminar, restitution assignment.
- [ACAD-02] Examination Integrity & Unauthorized Devices: Statute XII Clause 4.4(A) | Authority: Central Exam Board (Quorum: 4) | 5-day response window | 14-day appeal | Penalty Guide: Exam paper cancellation (0 marks), 1-2 semester suspension, honors ineligibility.
- [COND-01] Campus Disorder & Noise Violations: Conduct Code Clause 2.1(C) | Authority: Dean of Student Affairs / Wardens (Quorum: 3) | 7-day response window | 14-day appeal | Penalty Guide: Written admonition, campus community restitution service (up to 20 hours).
- [COND-02] Property Damage & Lab Safety: Property Statute Clause 2.5(A) | Authority: Infrastructure & Dean (Quorum: 3) | 7-day response window | 14-day appeal | Penalty Guide: Repair cost recovery, laboratory safety seminar, probation.
- [COND-03] Harassment & Campus Safety: Safe Campus Charter Clause 5.1(B) | Authority: Standing Tribunal (Quorum: 5) | 5-day response window | 14-day appeal | Penalty Guide: No-contact directive, suspension, expulsion.

${activeCaseSummary ? `FOCUSED ACTIVE DOCKET:\n${activeCaseSummary}\n` : ''}
${casesSummary ? `ACCESSIBLE DOCKETS IN REGISTRY:\n${casesSummary}\n` : ''}
${closedCasesSummary ? `CLOSED CASES IN ARCHIVE:\n${closedCasesSummary}\n` : ''}

CLOSED PRECEDENTS BENCHMARK (For Reference):
- PREC-2024-0014: Code Similarity in Algorithm Lab (First-time, partial intent -> 8-Hour Academic Citation Workshop & grade cap).
- PREC-2025-0022: Cosmetic Variable Renaming (Reckless -> Zero marks on project, written reprimand).
- PREC-2023-0089: Smartwatch in Midterm Exam (Confiscated -> Midterm score cancelled, 1-semester probation).
- PREC-2025-00118: Uncited Reference Duplication in OS Lab (Completed 8-hour citation workshop -> Successfully closed & expunged after 3 years).`;
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

    const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';

    // Check for guardrail violation trigger
    let guardrailTriggered = false;
    for (const pattern of GUARDRAIL_PROMPT_PATTERNS) {
      if (pattern.test(lastUserMessage)) {
        guardrailTriggered = true;
        break;
      }
    }

    // Call Groq API
    let replyText = '';
    let usedModel = GROQ_MODEL;

    const systemPrompt = buildSystemPrompt(currentPersona, casesSummary, activeCaseSummary, closedCasesSummary);
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: apiMessages,
          temperature: 0.2,
          max_tokens: 2048,
        }),
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        replyText = data.choices?.[0]?.message?.content?.trim() || '';
      }

      // If primary model failed, returned empty text, or hit reasoning truncation, use fallback model
      if (!replyText) {
        console.warn('Primary Groq model returned empty content or failed, invoking fallback:', GROQ_FALLBACK_MODEL);
        const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GROQ_FALLBACK_MODEL,
            messages: apiMessages,
            temperature: 0.2,
            max_tokens: 2048,
          }),
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          replyText = fallbackData.choices?.[0]?.message?.content?.trim() || '';
          usedModel = GROQ_FALLBACK_MODEL;
        }
      }

      if (!replyText) {
        throw new Error('All Groq models produced empty responses');
      }
    } catch (llmErr) {
      console.error('LLM invocation failed, using deterministic institutional response:', llmErr);
      replyText = generateDeterministicFallback(lastUserMessage, currentPersona, accessibleCases);
      usedModel = 'local-rule-engine';
    }


    // Prepend guardrail warning if triggered and not already included
    if (guardrailTriggered && !replyText.includes('Due-Process Boundary') && !replyText.includes('STATUTORY GUARDRAIL')) {
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
 * High-fidelity deterministic fallback engine for offline or rate-limited environments
 */
function generateDeterministicFallback(query: string, persona: UserPersona, cases: unknown[]): string {
  const q = query.toLowerCase();

  if (q.includes('penalty') || q.includes('cheating') || q.includes('exam') || q.includes('acad-02')) {
    return `### Prescribed Sanctions for Examination Cheating (ACAD-02)

**Direct Answer:**
Under **Statute XII Clause 4.4(A)**, penalties for unauthorized devices or cheating during an exam range from **cancellation of the exam paper (zero marks)** to **1-2 semester academic suspension**, depending on whether intent and communication were proven.

**Applicable Procedure:**
- **Authority**: Central Examination Disciplinary Board (Mandatory Quorum: 4 members).
- **Statutory Clock**: You are entitled to a **5 calendar day** response window from receipt of formal notice.
- **Appeals**: Any decision can be appealed within **14 calendar days** to the Senate Appellate Board.

**Guaranteed Due-Process Rights:**
1. Right to inspect confiscated device logs and proctorial witness statements.
2. Right to attend oral proceedings with an accredited student ombudsman or advocate.
3. Presumption of innocence remains active until final written determination.`;
  }

  if (q.includes('plagiarism') || q.includes('acad-01') || q.includes('code') || q.includes('collaboration')) {
    return `### Academic Integrity Code (ACAD-01): Plagiarism & Unauthorized Collaboration

**Direct Answer:**
Under **Academic Integrity Code Section 4.2(B)**, unauthorized code sharing or uncited duplication typically results in **assignment grade nullification** and completion of an **8-Hour Remedial Academic Citation Workshop**. First-time negligent occurrences prioritize educational restitution over severe punitive measures.

**Key Procedural Requirements:**
- **Notice**: A formal Show-Cause Notice must be dispatched citing exact diff overlap percentages.
- **Response Window**: **7 calendar days** provided to submit written defense and mitigating explanations.
- **Evidence Access**: All AST diff reports and git commit logs must be shared at least 72 hours before hearing.`;
  }

  if (q.includes('window') || q.includes('deadline') || q.includes('days') || q.includes('time')) {
    return `### Statutory Timelines & Response Windows

**Direct Answer:**
The university disciplinary code guarantees strict statutory time windows that cannot be shortened by any authority:

| Stage | Prescribed Window | Statutory Purpose |
|---|---|---|
| **Show-Cause Response** | **5 to 7 Calendar Days** | Opportunity for student to submit written explanation and evidence |
| **Hearing Notice** | **72 Hours Advance Notice** | Guaranteed preparation time and summons of student advocate |
| **Appellate Review** | **14 Calendar Days** | Right to lodge appeal following receipt of reasoned determination |

*Procedural Safeguard:* If the university fails to provide the full statutory response window, any subsequent disciplinary finding is procedurally void.`;
  }

  if (q.includes('edu-2026-00042') || q.includes('00042') || q.includes('rahul')) {
    return `### Docket Inspection: Case EDU-2026-00042

**Direct Answer:**
Case **EDU-2026-00042** is currently in the **RESPONSE_WINDOW** stage under Academic Integrity Code Section 4.2(B).

- **Respondent**: Student Ref #CS-8902 (Rahul Verma)
- **Status**: Response Window Active (5 calendar days remaining)
- **Allegation**: 94% AST code structure overlap in Algorithms Lab Benchmark #4
- **Evidence Sealed**:
  • \`similarity_report_ast_diff.pdf\` (428 KB, SHA-256 Verified)
  • \`git_commit_timings_log.csv\` (18.4 KB, SHA-256 Verified)
- **Checklist Progress**: 2 of 8 statutory milestones completed (Show-cause notice dispatched and acknowledged)
- **Next Step**: Expiration of response window on 17 September 2026 at 18:00 UTC.`;
  }

  if (q.includes('closed') || q.includes('archive') || q.includes('resolved') || q.includes('edu-2025-00118') || q.includes('edu-2025-00092')) {
    return `### Closed Cases Archive & Historical Resolutions

**Direct Answer:**
Closed cases in EDUguard are permanently preserved with full cryptographic audit trails. You can inspect closed cases in the portal via:
1. **Docket Manager**: Go to the [Active Dockets](/cases) page and select the **"Closed Cases (Archive)"** tab (or direct link: \`/cases?status=CLOSED\`).
2. **Sidebar Navigation**: Click **"Closed Cases Archive"** in the navigation menu.
3. **Student Portal**: If you are a student, check the **"Closed History"** tab on the [Student Defense Portal](/student) to view your past resolved dockets and compliance certificates.

**Archived Closed Cases in Registry:**
- **EDU-2025-00118**: *Uncited Reference Duplication in OS Lab* (Student #CS-8902 - Rahul Verma)
  • **Verdict**: Substantiated (First-Time Negligent Infraction — Educational Remediation)
  • **Sanction Imposed**: Mandatory 8-Hour Academic Citation Seminar & Proctored Lab Resubmission
  • **Status**: Completed & Closed (Retention active until November 2028)
- **EDU-2025-00092**: *Circuit Fabrication Laboratory Apparatus Accidental Overload* (Student #EC-2094 - Priya Sundaram)
  • **Verdict**: Accidental Misuse with Voluntary Disclosure
  • **Sanction Imposed**: High-Voltage Safety Re-Certification Seminar (Satisfied)
  • **Status**: Completed & Closed (Retention active until October 2028)`;
  }

  if (q.includes('defend') || q.includes('defense') || q.includes('protect') || q.includes('rights') || q.includes('help')) {
    return `### Student Due-Process Defense Guide & Statutory Protections

**Direct Answer:**
Under institutional regulations, every student is entitled to comprehensive due-process protections when facing an inquiry:

**Key Steps for Your Defense:**
1. **Inspect Evidence & Notice**:
   - Access the [Student Due-Process Portal](/student) to review the official Show-Cause Notice and all sealed evidence items with SHA-256 cryptographic verification hashes.
2. **Submit Your Written Representation**:
   - Use the statutory response window (5 to 7 calendar days) to submit your factual explanation and upload supporting documentation (e.g. earlier code drafts, timestamped notes, commit logs).
3. **Ombudsman & Advocate Representation**:
   - You have the statutory right to be accompanied by a student ombudsman, faculty mentor, or certified peer advocate during all committee oral proceedings.
4. **Mandatory 72-Hour Hearing Notice**:
   - The university cannot summon you to a hearing without at least 72 hours advance written notice.
5. **Right of Appeal**:
   - Any formal committee determination can be appealed to the Senate Appellate Board within 14 calendar days of receipt.`;
  }

  return `### EDUguard Disciplinary Registry

**Direct Answer:**
I have searched the university disciplinary governance index for your query.

- **Available Policies**: Academic Dishonesty (ACAD-01), Exam Conduct (ACAD-02), Campus Standards (COND-01), Lab Safety (COND-02), Anti-Harassment (COND-03).
- **Closed Cases Archive**: Available under [Closed Cases](/cases?status=CLOSED) or via the Closed Cases tab in Docket Manager.
- **Student Due-Process Portal**: Available at [Student Defense Portal](/student) with evidence inspection and statement submission.
- **Active Dockets**: Accessible according to your current role (${persona.name} · ${persona.role.replace(/_/g, ' ')}).

Please ask any specific question (e.g. *"Where can I see closed cases?"*, *"How can a student defend against cheating allegations?"*, or *"What is the penalty for ACAD-01?"*).`;

}
