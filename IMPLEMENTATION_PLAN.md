# BranDive SocialFlow AI - Implementation Plan

**Product:** BranDive SocialFlow AI  
**Owner:** BranDive Media Solutions (BMS)  
**Primary Specification:** `BranDive_SocialFlow_AI_Requirements.md`  
**Companion Documents:** `BRAND_DESIGN_SYSTEM.md`, `PLATFORM_API_FEASIBILITY.md`  

---

## 1. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                            BranDive SocialFlow AI UI                              |
|   Next.js 15 (App Router) + React 19 + TypeScript + BranDive Design System CSS    |
|   (Lexend & Poppins Typography, Brandive Blue #0E88D3, Dark Glassmorphism)         |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                  API Layer                                        |
|  - Auth & Session Guard (Tenant Isolation)  - Onboarding & Brand Profiles         |
|  - Asset Management & Metadata Validation   - AI Gateway (Gemini/OpenAI Provider) |
|  - Campaign & Content Engine API            - Social Integration Gateway          |
|  - Subscription & Quota Enforcement         - Audit Logger & Event Dispatcher     |
+-----------------------------------------------------------------------------------+
                                         |
                 +-----------------------+-----------------------+
                 |                                               |
                 v                                               v
+----------------------------------+            +----------------------------------+
|      Database (Prisma ORM)       |            |    Durable Publishing Worker     |
| - Users & Workspaces (Multi-ten) |            | - Idempotent Job Execution       |
| - Brand Profiles & Assets        |            | - UTC Scheduling & Retries       |
| - Social Accounts & Credentials  |            | - Dead-Letter State Handling     |
| - Campaigns & Content Items      |            | - Global Emergency Pause         |
| - Publish Jobs & Audit Logs      |            | - Reconcile Uncertain Status     |
+----------------------------------+            +----------------------------------+
                 |                                               |
                 +-----------------------+-----------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |        Social Connectors Layer        |
                     | - Meta (Facebook & Instagram)         |
                     | - LinkedIn (Member & Organization)    |
                     | - YouTube Data API v3                 |
                     | - High-Fidelity Demo Mode Engine      |
                     +---------------------------------------+
```

### Key Technical Decisions:
1. **Full-Stack Next.js 15 App Router with TypeScript:**
   - Single unified repository for maximum developer velocity, server actions, type-safe API routes, and instantaneous SSR/client rendering.
2. **Prisma ORM with Multi-Tenant Architecture:**
   - Every tenant resource is strictly keyed to a `workspace_id`.
   - All server operations enforce tenant authorization checks before executing queries.
   - Dual-engine compatibility: SQLite for rapid local development/automated testing; PostgreSQL for production cloud deployment.
3. **Encrypted Token Vault:**
   - AES-256-GCM authenticated encryption for OAuth access/refresh tokens. Secrets never stored as plaintext, never sent to frontend bundles, and masked in audit logs.
4. **Official BMS Design System:**
   - Exact brand tokens verified from `brandivemedsols.com`: Brandive Blue (`#0E88D3`), dark navy canvas (`#080D1A`), card surfaces (`#0E1526`), typography (`Lexend` & `Poppins`), and official logo assets.
5. **Durable In-Process & Background Scheduler:**
   - Deterministic job state machine (`draft -> awaiting_approval -> approved -> scheduled -> publishing -> published`).
   - Idempotency key per post to guarantee zero duplicate publishing during server restarts or retries.
   - Global one-click emergency "Pause All Publishing" control.

---

## 2. Milestone Breakdown & Delivery Plan

### Milestone 0: Repository & Feasibility Audit (Completed)
- [x] Workspace inspected; verified no conflicting legacy code.
- [x] Live official BMS website (`brandivemedsols.com`) inspected; CSS tokens, Google fonts, and logos extracted.
- [x] `BRAND_DESIGN_SYSTEM.md` authored.
- [x] `PLATFORM_API_FEASIBILITY.md` authored with official permissions, account prerequisites, rate limits, and quota analysis for Meta, LinkedIn, and YouTube.
- [x] `IMPLEMENTATION_PLAN.md` authored.

### Milestone 1: Application Foundation & BranDive UI Shell (Completed)
- [x] Initialize Next.js project with TypeScript, Prisma, Lucide icons, and modern CSS variables.
- [x] Implement BranDive Design System in `app/globals.css` with responsive layout, glassmorphic cards, and custom scrollbars.
- [x] Configure database schema in `prisma/schema.prisma` covering:
  - `User`, `Workspace`, `WorkspaceMember`, `Subscription`, `Plan`, `UsageRecord`, `AuditLog`.
- [x] Build Authentication & Session Management:
  - Register, Login, Session token verification, Logout.
  - Multi-tenant workspace switcher and role authorization (`owner`, `admin`, `member`).
- [x] Build Dashboard Shell & Persistent Navigation:
  - Sidebar with BMS Logo, Workspace Switcher, Quick "Pause All Publishing" emergency toggle, Plan badge.
  - Navigation: Overview, Calendar, Campaigns, Asset Library, Social Accounts, YouTube Studio, Analytics, Team & Billing, Settings.
- [x] Seed script with initial plans (`Basic`, `Diamond`, `Premium`) and demo workspace.

### Milestone 2: Brand Profile & Asset Management (Completed)
- [x] Database models: `BrandProfile`, `BrandAsset`.
- [x] Guided 4-step Brand Onboarding & Profile Manager:
  - Company identity, industry, target audience & geography, brand voice & tone presets, campaign goals, prohibited claims & compliance notes.
- [x] Private Media & Asset Library:
  - Multi-file drag-and-drop upload with validation (MIME type, file size, dimensions).
  - Categorization (logos, product shots, videos, campaign graphics).
  - Asset preview modal, tag filter, and campaign assignment.

### Milestone 3: AI Campaign Planner & Content Engine (Completed)
- [x] Database models: `Campaign`, `ContentItem`, `ContentAsset`, `AIRun`.
- [x] AI Gateway Provider:
  - Configurable engine (Google Gemini / OpenAI / Mock AI Fallback).
  - Structured JSON outputs: campaign themes, multi-platform post concepts, hashtag groups, CTAs, and recommended posting windows.
  - Strict brand guardrails: forbids hallucinating missing prices, fake testimonials, or unauthorized claims.
- [x] Platform-Specific Content Adaptation:
  - Instagram: Visual-first copy, hashtag clusters, alt-text suggestions.
  - Facebook: Engaging conversational post with link preview/CTA.
  - LinkedIn: Professional perspective, industry insight, targeted hashtags.
  - YouTube: Search-optimized title (<=100 chars), comprehensive description (<=5000 chars), tags, chapters/timestamps.
- [x] Interactive Content Editor & Live Platform Previews.

### Milestone 4: Content Calendar, Approval Modes & Durable Scheduler (Completed)
- [x] Database models: `PublishJob`, `ApprovalEvent`.
- [x] Three Configurable Approval Modes:
  1. *Manual Approval* (default): Every post requires human sign-off before scheduling.
  2. *Campaign Approval*: Approving a campaign releases its posts to schedule.
  3. *Rule-Based Auto-Publish*: Explicitly enabled for approved channels/content types.
- [x] Content Calendar Interface:
  - Month, Week, and Queue views with status filters (Draft, Queued, Published, Failed).
  - Quick action to approve, reject, reschedule, or publish immediately.
- [x] Durable Scheduler Engine:
  - Periodic queue processor running with UTC timestamps and local workspace timezone display.
  - Idempotency key verification to prevent duplicate publishing.
  - Global emergency pause check before any job executes.

### Milestone 5: Social Platform Connectors & Demo Mode (Completed)
- [x] Database models: `SocialAccount`.
- [x] Generic `SocialConnector` interface with implementations:
  - `MetaConnector` (Facebook Pages & Instagram Professional).
  - `LinkedInConnector` (Member Profiles & Organization Pages).
  - `YouTubeConnector` (YouTube Data API v3).
- [x] Connection Management UI:
  - Visual health indicators, token expiry countdown, capability matrix.
  - Reconnect / Disconnect workflows.
- [x] High-Fidelity Demo Mode:
  - Explicit `[DEMO MODE]` tagging.
  - Realistic account linking simulation, status reconciliation, and error recovery simulations.

### Milestone 6: YouTube Video Assistant (Completed)
- [x] Video analysis and metadata generation pipeline:
  - 3-5 high-converting title options.
  - Description generator with automated chapter timestamps.
  - Tag optimization and category suggestion.
  - Thumbnail concept briefs.
  - COPPA compliance (`selfDeclaredMadeForKids` mandatory toggle).
- [x] Resumable upload simulator and publication state tracker.

### Milestone 7: Subscription Tiers, Analytics, Notifications & Polish (Completed)
- [x] Tiered Plan Quota Enforcement (`Basic`, `Diamond`, `Premium`):
  - Workspaces, connected accounts, AI runs, video processing, scheduled posts.
  - Server-side quota validation and UI limit warning bars.
- [x] Analytics & Performance Dashboard:
  - Post success/failure metrics, platform breakdown, engagement rates.
  - CSV report export for client agency reporting.
- [x] Notification Center:
  - In-app notification drawer with alerts for publishing outcomes, upcoming posts, and token health.
- [x] Comprehensive Automated Tests:
  - Unit tests for tenant isolation, scheduling logic, quota checks, and AI schema validation.
  - Integration tests for content approval flows and scheduler idempotency.

---

## 3. Verification & Acceptance Criteria
Every milestone must compile without errors, pass automated tests, adhere strictly to `BRAND_DESIGN_SYSTEM.md`, and provide clear setup documentation in `README.md`.
