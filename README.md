# BranDive SocialFlow AI

> **"Give us your brand, content, and goals. SocialFlow AI turns them into a platform-ready content calendar and publishes approved content on schedule."**

BranDive SocialFlow AI is a modern multi-platform campaign automation and publishing SaaS application developed for **BranDive Media Solutions (BMS)**. It is built as a secure, multi-tenant application with tiered subscriptions, official OAuth 2.0 platform adapters, durable UTC scheduling, and strict brand compliance guardrails.

---

## 🚀 Key Features

1. **Executive Campaign Dashboard:**
   - Unified overview of scheduled, published, and pending-approval posts.
   - Connected channels health matrix with explicit `[DEMO MODE]` tagging.
   - One-click global **"PAUSE ALL PUBLISHING"** emergency freeze control.

2. **Official BMS Design System:**
   - Verified from live inspection of [brandivemedsols.com](https://www.brandivemedsols.com/).
   - Authentic typography: **Lexend** (headings) & **Poppins** (body & UI controls).
   - Brand colors: **Brandive Blue** (`#0E88D3`), dark navy canvas (`#080D1A`), and subtle glassmorphic surfaces (`#0E1526`).
   - Reusable design tokens documented in [`BRAND_DESIGN_SYSTEM.md`](./BRAND_DESIGN_SYSTEM.md).

3. **Multi-Tenant Security & Tenant Isolation:**
   - Every workspace resource is strictly scoped by `workspaceId`.
   - Sensitive OAuth tokens and secrets are encrypted at rest with **AES-256-GCM** authenticated encryption (`lib/crypto.ts`).
   - Immutable audit trail (`lib/audit.ts`) records approvals, connections, and publishing attempts.

4. **Brand Profile & Voice Guidelines:**
   - Guided onboarding wizard capturing company identity, core services, target audience, tone presets, active offers, and prohibited words/claims.
   - Strict compliance guardrails: automatically flags or rejects posts with forbidden claims.

5. **AI Campaign Planner & Multi-Channel Studio:**
   - One brief synthesizes 3-4 content pillars and platform-tailored post variations.
   - Channel-specific copy for **Instagram** (visual-first, hashtag clusters), **Facebook** (conversational context), **LinkedIn** (executive insight), and **YouTube** (title options & descriptions with chapters).
   - Best-time recommendation engine with confidence scores and reasoning.

6. **Content Calendar & Approval Workflows:**
   - Three approval modes: *Manual Approval* (default), *Campaign Approval*, and *Rule-Based Auto-Publish*.
   - Month, Week, and Queue list views.
   - Post Inspector modal for copy editing, approving, rejecting, or triggering immediate publishing.

7. **Official Social Platform Connectors & Demo Mode:**
   - Official API integration layer for Meta (Facebook & Instagram), LinkedIn, and YouTube Data API v3.
   - Full feasibility and governance analyzed in [`PLATFORM_API_FEASIBILITY.md`](./PLATFORM_API_FEASIBILITY.md).
   - **High-Fidelity Demo Mode:** When official API keys are pending developer review, simulated channels operate with realistic constraints and clear `[DEMO MODE]` badges.

8. **YouTube Video Assistant:**
   - Analyzes briefs and generates title options, descriptions with timestamped chapters, keyword tags, category recommendations, and thumbnail briefs.
   - Mandatory COPPA `selfDeclaredMadeForKids` compliance declaration.

9. **Tiered Plan Quota Enforcement:**
   - Server-side quota calculations for **Basic** ($29/mo), **Diamond** ($79/mo), and **Premium** ($199/mo).
   - Usage progress bars for AI runs, storage bytes, connected channels, and scheduled posts.

---

## 🛠 Tech Stack

- **Frontend & API:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Vanilla CSS with Brandive design tokens (`app/globals.css`), Lucide React icons
- **Database:** Prisma ORM with SQLite (development/testing) and PostgreSQL compatibility (production)
- **Cryptography:** Node.js `crypto` with `aes-256-gcm`
- **Testing:** Vitest automated test suite

---

## 📦 Getting Started

### Prerequisites
- Node.js 20+ (tested on v22.12.0)
- npm 10+

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local variables:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
PORT=3000
JWT_SECRET="brandive-socialflow-jwt-super-secret-key-min-32-chars-2026"
TOKEN_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
AI_PROVIDER="MOCK"
```

### 3. Initialize & Seed Database
```bash
npm run db:push
npm run db:seed
```
This provisions:
- Subscription plans (`Basic`, `Diamond`, `Premium`)
- Demo User: `demo@brandivemedsols.com` / `Password123!`
- Demo Workspace: `BranDive Media Solutions`
- Brand assets, demo channels (Meta IG, Meta FB, LinkedIn, YouTube), and initial campaign calendar items.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the automated test suite covering crypto, authentication, AI campaign generation, and social connectors:
```bash
npm run test
```
Result:
```
 ✓ tests/scheduler.test.ts (3 tests)
 ✓ tests/campaignEngine.test.ts (3 tests)
 ✓ tests/crypto.test.ts (3 tests)
 ✓ tests/auth.test.ts (3 tests)

 Test Files  4 passed (4)
      Tests  12 passed (12)
```

---

## 📚 Documentation Reference

- [`BRAND_DESIGN_SYSTEM.md`](./BRAND_DESIGN_SYSTEM.md) - Verified BMS colors, typography, logo guidelines, and tokens.
- [`PLATFORM_API_FEASIBILITY.md`](./PLATFORM_API_FEASIBILITY.md) - Official permissions, account prerequisites, rate limits, and YouTube quota rules.
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) - Architectural rollout and milestone delivery.
- [`SECURITY.md`](./SECURITY.md) - Security posture, encryption, tenant isolation, and audit logging.

---

## 🏢 Product Owner
**BranDive Media Solutions (BMS)**  
Official Website: [https://www.brandivemedsols.com/](https://www.brandivemedsols.com/)  
Contact: `contact@brandivemedsols.com`
