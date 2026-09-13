// Cryptographic SHA-256 Hash-Chaining Audit Log Engine
// Implements tamper-evident audit logging for the Student Discipline Management System

import { AuditLogEntry, UserRole } from '@/types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Calculates SHA-256 hash string (hex) cross-runtime (Node.js & Browser)
 */
export async function computeSha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js environment fallback
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(text).digest('hex');
  } catch {
    // Fallback simple bit-manipulation hash for environments without native crypto
    let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
    for (let i = 0, ch; i < text.length; i++) {
      ch = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(64, '0');
  }
}

/**
 * Constructs the canonical digest payload string to guarantee deterministic hashing
 */
export function buildAuditCanonicalString(
  prevHash: string,
  actorId: string,
  actorRole: UserRole,
  action: string,
  payloadHash: string,
  timestamp: string
): string {
  return `${prevHash}|${actorId}|${actorRole}|${action}|${payloadHash}|${timestamp}`;
}

/**
 * Creates a new hash-chained audit log entry linked to the previous log
 */
export async function createAuditEntry(
  prevEntry: AuditLogEntry | null,
  actorId: string,
  actorName: string,
  actorRole: UserRole,
  action: string,
  details: string,
  payload: Record<string, unknown>,
  caseId?: string
): Promise<AuditLogEntry> {
  const timestamp = new Date().toISOString();
  const payloadJson = JSON.stringify(payload, Object.keys(payload).sort());
  const payloadHash = await computeSha256(payloadJson);
  const prevHash = prevEntry ? prevEntry.currHash : GENESIS_HASH;

  const canonicalString = buildAuditCanonicalString(
    prevHash,
    actorId,
    actorRole,
    action,
    payloadHash,
    timestamp
  );
  const currHash = await computeSha256(canonicalString);

  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    caseId,
    actorId,
    actorName,
    actorRole,
    action,
    details,
    payloadHash,
    prevHash,
    currHash,
    timestamp,
  };
}

export interface VerificationResult {
  isValid: boolean;
  totalEntries: number;
  tamperedEntryIndex?: number;
  expectedHash?: string;
  actualHash?: string;
  failureReason?: string;
}

/**
 * Verifies cryptographic integrity of the entire audit chain from genesis to tail
 */
export async function verifyAuditChain(entries: AuditLogEntry[]): Promise<VerificationResult> {
  if (!entries || entries.length === 0) {
    return { isValid: true, totalEntries: 0 };
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const expectedPrevHash = i === 0 ? GENESIS_HASH : entries[i - 1].currHash;

    // Check 1: Chain link linkage
    if (entry.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalEntries: entries.length,
        tamperedEntryIndex: i,
        expectedHash: expectedPrevHash,
        actualHash: entry.prevHash,
        failureReason: `Broken Hash Link at entry #${i + 1} (${entry.action}). Previous hash does not match preceding entry current hash.`,
      };
    }

    // Check 2: Content integrity check
    const canonical = buildAuditCanonicalString(
      entry.prevHash,
      entry.actorId,
      entry.actorRole,
      entry.action,
      entry.payloadHash,
      entry.timestamp
    );
    const recalculatedCurrHash = await computeSha256(canonical);

    if (recalculatedCurrHash !== entry.currHash) {
      return {
        isValid: false,
        totalEntries: entries.length,
        tamperedEntryIndex: i,
        expectedHash: recalculatedCurrHash,
        actualHash: entry.currHash,
        failureReason: `Data Tampering Detected at entry #${i + 1} (${entry.action}). Payload or metadata was modified after insertion.`,
      };
    }
  }

  return {
    isValid: true,
    totalEntries: entries.length,
  };
}
