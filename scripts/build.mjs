import { execSync } from 'child_process';

// Strictly enforce NODE_ENV=production to eliminate non-standard environment errors in Hostinger CI/CD
process.env.NODE_ENV = 'production';

console.log('📦 Step 1: Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });

console.log('🗄️ Step 2: Synchronizing SQLite Database schema...');
execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });

console.log('🌱 Step 3: Seeding default plans and demo admin account...');
execSync('node scripts/seed.mjs', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });

console.log('🚀 Step 4: Compiling Next.js application with production environment...');
execSync('npx next build', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });
