// Database Service Layer & Connection Pooling Configuration
// Ready for Neon Postgres / Supabase / Local PostgreSQL

interface MinimalPrismaClient {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  case?: unknown;
  incidentReport?: unknown;
  evidenceItem?: unknown;
  offenceCategory?: unknown;
  proceduralChecklistItem?: unknown;
  notice?: unknown;
  committeeRecord?: unknown;
  decision?: unknown;
  auditLogEntry?: unknown;
  precedentIndex?: unknown;
}

const globalForPrisma = globalThis as unknown as {
  prisma: MinimalPrismaClient | undefined;
};

let client: MinimalPrismaClient | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PrismaModule = require('@prisma/client');
  if (PrismaModule && PrismaModule.PrismaClient) {
    client =
      globalForPrisma.prisma ??
      (new PrismaModule.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      }) as MinimalPrismaClient);

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client;
    }
  }
} catch {
  // Fallback gracefully when Prisma client has not yet been generated
  client = null;
}

export const prisma = client;
export default prisma;
