import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Strictly enforce NODE_ENV=production to eliminate non-standard environment errors in Hostinger CI/CD
process.env.NODE_ENV = 'production';

console.log('📦 Step 1: Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });

console.log('🗄️ Step 2: Synchronizing SQLite Database schema...');
execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });

console.log('🌱 Step 3: Seeding default plans and demo admin account...');
execSync('node scripts/seed.mjs', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });

// Ensure dev.db exists in both root and prisma/
try {
  if (fs.existsSync('prisma/dev.db') && !fs.existsSync('dev.db')) {
    fs.copyFileSync('prisma/dev.db', 'dev.db');
  } else if (fs.existsSync('dev.db') && !fs.existsSync('prisma/dev.db')) {
    fs.copyFileSync('dev.db', 'prisma/dev.db');
  }
} catch (e) {
  console.warn('Database copy sync warning:', e);
}

console.log('🚀 Step 4: Compiling Next.js application with production environment...');
execSync('npx next build', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });

// Step 5: Copy database and public assets to standalone bundle for production runtime
try {
  if (fs.existsSync('.next/standalone')) {
    console.log('📋 Step 5: Copying dev.db and static assets into .next/standalone...');
    const dbSource = fs.existsSync('dev.db') ? 'dev.db' : (fs.existsSync('prisma/dev.db') ? 'prisma/dev.db' : null);
    if (dbSource) {
      fs.copyFileSync(dbSource, '.next/standalone/dev.db');
      if (!fs.existsSync('.next/standalone/prisma')) {
        fs.mkdirSync('.next/standalone/prisma', { recursive: true });
      }
      fs.copyFileSync(dbSource, '.next/standalone/prisma/dev.db');
    }
    if (fs.existsSync('public')) {
      fs.cpSync('public', '.next/standalone/public', { recursive: true });
    }
    if (fs.existsSync('.next/static')) {
      const standaloneStaticDir = path.join('.next', 'standalone', '.next', 'static');
      if (!fs.existsSync(standaloneStaticDir)) {
        fs.mkdirSync(standaloneStaticDir, { recursive: true });
      }
      fs.cpSync('.next/static', standaloneStaticDir, { recursive: true });
    }
    console.log('✅ Standalone bundle fully enriched with database and static assets.');
  }
} catch (err) {
  console.warn('Could not copy standalone assets:', err);
}
