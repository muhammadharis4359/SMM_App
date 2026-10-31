import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Automatically ensure SQLite dev.db is in place at runtime
try {
  const rootDb = path.join(process.cwd(), 'dev.db');
  const prismaDb = path.join(process.cwd(), 'prisma', 'dev.db');

  if (fs.existsSync(prismaDb) && !fs.existsSync(rootDb)) {
    fs.copyFileSync(prismaDb, rootDb);
  } else if (fs.existsSync(rootDb) && !fs.existsSync(prismaDb)) {
    fs.copyFileSync(rootDb, prismaDb);
  }
} catch {
  // Gracefully fallback
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
