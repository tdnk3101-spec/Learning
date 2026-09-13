import { NextResponse } from 'next/server';
import { getCaseById, getCurrentPersona, addAuditLog } from '@/lib/store';
import { rankPrecedentsForCase } from '@/lib/similarity-engine';
import { PRECEDENT_INDEX } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, customCase } = body;
    const persona = getCurrentPersona();

    // Fetch active case
    let activeCase = null;
    if (caseId) {
      activeCase = getCaseById(caseId, persona);
    }
    if (!activeCase && customCase) {
      activeCase = customCase;
    }

    if (!activeCase) {
      return NextResponse.json(
        { error: 'Case not found or access restricted under current persona.' },
        { status: 404 }
      );
    }

    // Rank all closed precedents using multi-factor engine
    const rankedMatches = rankPrecedentsForCase(activeCase, PRECEDENT_INDEX);

    // Audit log precedent retrieval
    try {
      await addAuditLog({
        caseId: activeCase.id,
        action: 'PRECEDENT_SIMILARITY_MATCH',
        performedBy: persona.name,
        details: `Multi-factor precedent match computed for case ${activeCase.caseNumber}. Top match: ${rankedMatches[0]?.precedent.anonymizedCaseRef} (${rankedMatches[0]?.score.overallPct}% similarity).`,
        metadata: {
          topMatchRef: rankedMatches[0]?.precedent.anonymizedCaseRef,
          topMatchScore: rankedMatches[0]?.score.overallPct,
          precedentsEvaluated: PRECEDENT_INDEX.length,
        },
      });
    } catch (auditErr) {
      console.error('Audit logging failed for precedent similarity:', auditErr);
    }

    return NextResponse.json({
      activeCase: {
        id: activeCase.id,
        caseNumber: activeCase.caseNumber,
        title: activeCase.title,
        status: activeCase.status,
        department: activeCase.department,
        category: activeCase.offenceCategory,
        incidentReport: activeCase.incidentReport,
      },
      rankedPrecedents: rankedMatches,
      guardrailDirective: 'Precedent matching is for committee reference and institutional consistency only. The system does not recommend or determine punishments.',
    });
  } catch (error: unknown) {
    console.error('Similar Cases API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
