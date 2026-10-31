import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export function syncSqliteDb() {
  try {
    const cwd = process.cwd();
    const possibleSources = [
      path.join(cwd, 'dev.db'),
      path.join(cwd, 'prisma', 'dev.db'),
      path.resolve(cwd, '..', 'dev.db'),
      path.resolve(cwd, '..', 'prisma', 'dev.db'),
      path.resolve(cwd, '..', '..', 'dev.db'),
      path.resolve(cwd, '..', '..', 'prisma', 'dev.db'),
    ];

    let foundValidDb: string | null = null;
    for (const src of possibleSources) {
      if (fs.existsSync(src)) {
        try {
          const stats = fs.statSync(src);
          if (stats.size > 20000) {
            foundValidDb = src;
            break;
          }
        } catch {}
      }
    }

    if (foundValidDb) {
      const targets = [
        path.join(cwd, 'dev.db'),
        path.join(cwd, 'prisma', 'dev.db'),
      ];
      for (const target of targets) {
        const targetExists = fs.existsSync(target);
        const targetTooSmall = targetExists && fs.statSync(target).size < 20000;
        if (!targetExists || targetTooSmall) {
          const dir = path.dirname(target);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.copyFileSync(foundValidDb, target);
        }
      }
    }
  } catch (err) {
    console.warn('SQLite auto-sync notification:', err);
  }
}

// Run initial sync on module load
syncSqliteDb();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
