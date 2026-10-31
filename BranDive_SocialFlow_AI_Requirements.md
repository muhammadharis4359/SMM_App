# BranDive SocialFlow AI

## Product Idea, Requirements & Implementation Brief for Antigravity

**Product owner:** BranDive Media Solutions (BMS)\
**Working product name:** BranDive SocialFlow AI\
**Document purpose:** Product requirements and implementation starting
brief for Antigravity\
**Status:** Initial product specification --- validate platform API
access and policies before implementation

------------------------------------------------------------------------

## 1. Product Vision

Build a multi-platform social media automation SaaS product that lets a
business or creator provide brand details, campaign goals, media assets,
and a weekly or monthly content plan once. The system then uses AI to
plan campaigns, adapt content for each social platform, prepare posts,
recommend publishing times, schedule approved content, publish through
official platform integrations, and report results.

The goal is to reduce repetitive social media work without removing user
control. Routine work should run automatically after the user configures
permissions, connects their accounts, and chooses an approval policy.

This is a new BranDive Media Solutions product, not simply an internal
posting script. It should be designed as a secure, multi-tenant SaaS
application with tiered subscriptions, clear usage limits, reliable
scheduling, and an upgrade path.

### Core promise

**"Give us your brand, content, and goals. SocialFlow AI turns them into
a platform-ready content calendar and publishes approved content on
schedule."**

Do not promise that every platform action can be fully automated in
every account type. Each integration must follow the platform's official
APIs, permissions, account eligibility, rate limits, and publishing
rules.

------------------------------------------------------------------------

## 2. Product Objectives

1.  Onboard a business with a guided setup flow instead of requiring
    technical knowledge.
2.  Connect supported social accounts securely through official
    OAuth/API integrations.
3.  Accept weekly/monthly images, videos, campaign briefs, offers, and
    other source material.
4.  Generate a campaign and platform-specific content from the supplied
    material.
5.  Keep a visual calendar where users can review, edit, approve, pause,
    or reschedule content.
6.  Publish automatically at scheduled times after the configured
    approval requirements are satisfied.
7.  Support LinkedIn publishing with explicit user authorization and
    clear account/page selection.
8.  Analyse uploaded YouTube videos and generate titles, descriptions,
    tags, hashtags, chapters where feasible, and thumbnail suggestions.
9.  Recommend publishing windows using available account analytics and
    audience data; use clearly labelled estimates when data is
    insufficient.
10. Provide a unified dashboard for status, failures, engagement
    metrics, usage, and plan limits.
11. Make the product secure, auditable, accessible, and maintainable.
12. Offer Basic, Diamond, and Premium packages with sensible feature and
    usage boundaries.

### Non-goals for the first release

-   Scraping or automating social platforms through browser bots where
    official APIs are required or prohibit the behaviour.
-   Bypassing platform limits, account restrictions, verification, or
    review.
-   Guaranteeing viral reach, follower growth, or a universally "best"
    publishing time.
-   Automatically replying to all comments/DMs without a separately
    scoped feature, moderation rules, and user permission.
-   Generating fake engagement, spam, deceptive endorsements, or
    artificial followers.
-   Publishing unapproved content when the user has selected manual
    approval.
-   Training public/shared models on private customer assets without
    explicit consent.

------------------------------------------------------------------------

## 3. Target Users and Use Cases

### Primary customer segments

-   Small and medium businesses
-   Marketing agencies managing multiple clients
-   Personal brands, consultants, coaches, and creators
-   E-commerce brands
-   Local service businesses
-   Internal marketing teams

### Main user journey

1.  Create an account and workspace.
2.  Enter brand name, industry, audience, tone, language, offers, goals,
    and prohibited claims.
3.  Connect eligible social accounts using official authorization.
4.  Upload a week or month of photos, videos, logos, product details,
    offers, and campaign notes.
5.  Select platforms, posting frequency, campaign dates, and approval
    mode.
6.  AI analyses assets and creates campaign concepts, post copy,
    creative variants, hashtags, and a calendar.
7.  User reviews the calendar and edits/approves content, or enables
    automatic approval rules for trusted content types.
8.  Scheduler queues approved posts and publishes them through platform
    APIs.
9.  The system records publishing status and any platform response.
10. User reviews performance reports and receives actionable
    recommendations for the next cycle.

------------------------------------------------------------------------

## 4. Platforms and Integration Principles

### Instagram and Facebook

Use Meta's official APIs and supported account connections. Support only
eligible account types and required permissions. Instagram publishing
typically requires an eligible professional account and the appropriate
linked Meta setup. The application must clearly explain any
prerequisites during onboarding.

Potential capabilities, subject to current API access and review: -
Publish supported image, video, Reel, or carousel formats where
supported. - Publish Facebook Page content. - Schedule and manage
publishing jobs. - Retrieve supported insights and post metrics. -
Select Facebook Pages and eligible Instagram professional accounts.

Do not assume that every Instagram format, music library feature, story
type, or personal account is available through the API. Build capability
checks per account and content type.

### LinkedIn

Use LinkedIn's official OAuth and APIs. The user must authorize access,
select an eligible personal profile and/or organization page, and grant
the permissions required for the selected publishing actions. Access to
organization posting or analytics may require additional permissions or
app review.

Potential capabilities, subject to granted permissions: - Create text,
image, document, and video posts where supported. - Schedule posts
through SocialFlow's own scheduler. - Support a weekly target such as 3
or 5 posts. - Store the platform post identifier and status. - Retrieve
supported analytics when permission and API access allow.

Never collect LinkedIn passwords or ask users to share session cookies.
Do not use unauthorized browser automation.

### YouTube

Use the official YouTube Data API and OAuth flow. - User uploads or
selects a video file. - AI analyses available video/audio content and
the user's campaign brief. - Generate title options, description,
relevant tags, hashtags, category suggestions, thumbnail concepts, and
chapters/timestamps when the video can be reliably analysed. - Let the
user review and edit metadata. - Upload and schedule publication where
supported by the account and API permissions. - Configure visibility
(private, unlisted, public) and scheduled publication. - Track upload
progress, processing status, publication status, and supported
analytics. - Respect API quota, file-size, format, copyright, and
platform policy constraints.

Some YouTube API projects may have restrictions or audit requirements
affecting uploads or visibility. Display the actual integration status
and never imply that a scheduled upload succeeded until the API confirms
it.

### Future integrations

Design a connector interface so TikTok, X, Pinterest, and other
platforms can be added later without rewriting the campaign engine. Do
not include a platform in the launch promise until its official API
capabilities and commercial requirements have been verified.

------------------------------------------------------------------------

## 5. Subscription Packages

Package names are **Basic**, **Diamond**, and **Premium**. Exact prices
and final quotas are business decisions and should be configurable in
the admin panel rather than hard-coded.

Use the following as an initial packaging proposal. Validate margins, AI
costs, storage costs, and API constraints before launch.

  ---------------------------------------------------------------------------
  Feature           Basic              Diamond              Premium
  ----------------- ------------------ -------------------- -----------------
  Best fit          Individual/small   Growing brand        Agency or
                    business                                high-volume brand

  Workspaces        1                  1                    Multiple client
                                                            workspaces,
                                                            subject to quota

  Connected social  Up to 3            Up to 8              Up to 20,
  accounts                                                  configurable

  Platforms         Core supported     Core supported       Core supported
                    platforms          platforms            platforms

  AI content        Monthly            Weekly and monthly   Multi-campaign,
  calendar                                                  multi-brand
                                                            calendar

  AI caption/copy   Included, capped   Higher monthly       Highest allowance
  generation                           allowance            with fair-use cap

  Campaign          Basic campaign     Multi-platform       Advanced
  generation        planner            campaign planner     campaigns and
                                                            reusable campaign
                                                            templates

  Image post        Included, capped   Higher allowance     Higher allowance
  adaptation                                                and team workflow

  Video analysis    Limited monthly    Higher allowance     Highest
                    allowance                               allowance,
                                                            subject to
                                                            file/processing
                                                            limits

  Facebook +        Supported eligible Supported eligible   Supported
  Instagram         accounts           accounts             eligible accounts
  scheduling                                                

  LinkedIn          Limited/standard   3 or 5 posts per     Flexible posting
  scheduling        allowance          week setting         targets within
                                                            safe limits

  YouTube metadata  Metadata           Metadata plus        Advanced video
  assistant         generation         chapters/thumbnail   workflow and
                                       workflow             higher processing
                                                            allowance

  Approval workflow User approval      Approval or          Role-based
                    before publishing  configured           approvals and
                                       auto-publish rules   optional
                                                            multi-step
                                                            approval

  Best-time         General            Account insights     Cross-platform
  recommendations   recommended        where available      recommendations
                    windows                                 where data allows

  Analytics         Basic status and   Cross-platform       Advanced
                    performance        overview             reporting and
                                                            client-ready
                                                            exports

  Team members      1                  Small team allowance Role-based team
                                                            access

  Brand voice       1                  Multiple             Multiple brands
  profiles                             profiles/variants    and reusable
                                                            voice profiles

  Content asset     Small quota        Medium quota         Larger quota
  storage                                                   

  Watermark         None by default    None                 None

  Support           Standard           Priority             Priority/agency
                                                            support

  API/integration   Visible            Visible              Visible
  status                                                    

  White-label       No                 Optional add-on      Potential agency
  reports                                                   feature
  ---------------------------------------------------------------------------

### Important packaging rules

-   Store quotas in plan configuration: connected accounts, workspaces,
    AI generations, video minutes, storage, scheduled posts, users,
    analytics retention, and report exports.
-   Show usage before a user reaches a limit, and explain the next step.
-   Do not silently delete content or skip posts when a limit is
    reached. Warn the user and apply a documented policy.
-   Allow monthly and annual billing later. Use a payment provider
    supported in the target market after legal, tax, and payment
    availability review.
-   Keep feature flags so pricing changes do not require code rewrites.
-   Avoid claiming an unlimited plan if AI, video processing, or
    platform quotas impose real costs.

------------------------------------------------------------------------

## 6. Functional Requirements

### 6.1 Authentication and onboarding

-   Email/password and a supported social sign-in option if desired.
-   Email verification, password reset, secure sessions, logout from all
    sessions.
-   Workspace creation and invitation flow.
-   Business profile form:
    -   Brand/company name and website
    -   Industry and services/products
    -   Target audience and geography
    -   Preferred language(s)
    -   Brand tone and vocabulary
    -   Campaign goals
    -   CTA preferences
    -   Offers, dates, prices, and restrictions
    -   Brand assets and visual guidelines
    -   Words, claims, or topics to avoid
    -   Compliance notes and required disclaimers
-   Onboarding checklist showing incomplete setup and platform
    prerequisites.
-   Let users save progress and return later.

### 6.2 Social account connection

-   Use OAuth authorization; never request or store social account
    passwords.
-   Display each connection's platform, account/page name, granted
    capabilities, token status, last successful sync, and required
    reauthorization state.
-   Encrypt tokens at rest; restrict token access to backend integration
    services.
-   Support disconnect and revoke workflows.
-   Detect expired/revoked permissions and pause affected jobs.
-   Never expose tokens in logs, analytics, frontend responses, or error
    messages.
-   Separate permissions for publishing and analytics where possible.
-   Use least privilege and explain why each permission is needed.

### 6.3 Media and asset library

-   Upload images, videos, logos, fonts if licensing permits, brand
    guides, product images, and supporting documents.
-   Store metadata: owner/workspace, file type, dimensions, duration,
    size, checksum, upload date, campaign assignment, usage rights, and
    processing status.
-   Validate file type, file size, and actual file content.
-   Malware scan uploads where feasible; isolate media processing.
-   Generate thumbnails and image previews.
-   Allow folders, tags, search, duplicate detection, and campaign
    assignment.
-   Track whether an asset has been used in a post.
-   Let users record licensing/usage rights and expiry dates.
-   Keep user assets private to their workspace by default.
-   Provide deletion and retention controls.

### 6.4 AI campaign planner

Inputs: - Campaign goal (awareness, leads, sales, launch, event,
engagement, education, recruitment, etc.) - Campaign dates and time
zone - Target audience - Products/services and offer details - Source
images/videos and supporting copy - Selected social platforms -
Frequency per platform - Brand voice and content restrictions - CTA and
destination links - Relevant holidays/events, only when applicable and
verified

Outputs: - Campaign summary and objective - Content pillars and themes -
Weekly/monthly content calendar - Platform-specific post concepts -
Suggested asset per post - Caption/copy variants - CTA and relevant
hashtags - Creative instructions or design briefs - Recommended posting
window with explanation/confidence - Required disclaimers or missing
information - Review flags for unsupported claims, sensitive topics, or
asset mismatch

Requirements: - The planner must use supplied information as the primary
source and must not invent prices, discounts, testimonials, product
capabilities, certifications, or facts. - Flag missing or conflicting
information and ask the user rather than hallucinating. - Avoid posting
the exact same copy to every platform when the content should be
adapted. - Provide variety across campaign pillars and avoid repetitive
posts. - Allow regenerate, edit, lock, duplicate, move, and approve
actions. - Preserve user edits; regeneration must not overwrite approved
content without confirmation. - Let users define a campaign template and
reuse it.

### 6.5 AI content generation

For each post, generate structured fields: - Platform and format - Draft
caption/text - Headline/title where relevant - CTA - Hashtags/tags where
relevant - Alt text where supported - Asset references - Link and UTM
parameters if configured - Suggested date/time and time zone - Content
status - AI-generated rationale and warnings - Approval history

Generation should be platform-aware: - Instagram: concise visual-first
copy, appropriate hashtags, alt text, supported media format. -
Facebook: conversational context, links/CTA where appropriate, supported
Page format. - LinkedIn: professional context, useful insight,
non-spammy hashtags, audience-appropriate tone. - YouTube: searchable
but accurate title, useful description, relevant tags/hashtags, chapters
only when timestamps are supported by analysis.

Do not keyword-stuff, fabricate facts, use irrelevant hashtags, copy
competitor content, or generate deceptive claims. The user must own or
have permission to use supplied assets.

### 6.6 Creative generation and resizing

-   MVP should primarily use user-supplied assets and AI-generated copy.
-   Offer crop/resize recommendations for each platform.
-   Preserve the original asset and save derivatives separately.
-   Show a preview of the final platform-specific post before approval.
-   Optional later feature: generate background/creative variations,
    with brand guardrails and explicit user controls.
-   Do not assume that an AI-generated image can accurately reproduce
    logos, product labels, or exact text. Use verified brand assets for
    these elements.

### 6.7 Content calendar and scheduling

-   Calendar views: month, week, list, and campaign.
-   Filter by workspace, platform, campaign, status, and assigned
    reviewer.
-   Drag-and-drop rescheduling, with confirmation when it changes a
    campaign cadence.
-   User-configured time zone and daylight-saving handling.
-   Scheduler stores timestamps in UTC and displays local times
    appropriately.
-   Queue only content that has passed required validation and approval.
-   Prevent accidental duplicate jobs using idempotency keys.
-   Use durable background jobs, retries with backoff, and
    dead-letter/error states.
-   Check platform publishing windows and media requirements before
    sending.
-   Keep a publishing audit trail.
-   If publishing fails, show the reason, retry eligibility, and a clear
    recovery action.
-   Do not mark content as published until the platform confirms success
    and returns an identifier or equivalent evidence.
-   Avoid duplicate publishing when an API timeout makes the result
    uncertain; reconcile status before retrying.

### 6.8 Approval and autonomy modes

Support three configurable modes: 1. **Manual approval:** Every post
requires user approval. 2. **Campaign approval:** User approves the
campaign/calendar, then eligible scheduled posts can publish
automatically. 3. **Rule-based auto-publish:** User explicitly enables
auto-publishing for defined platforms, formats, and content types.

Safety requirements: - Default to manual approval for new accounts. -
Never auto-publish when required fields are missing, the media format is
invalid, a platform connection is unhealthy, or a policy/compliance
warning requires review. - Allow users to pause all publishing
immediately. - Provide a "next 7 days" review and a clear count of
queued posts. - Require renewed confirmation when changing from manual
approval to auto-publish. - Allow per-post, per-campaign, per-platform,
and global pause. - Clearly distinguish AI draft, pending approval,
scheduled, publishing, published, failed, and cancelled states.

### 6.9 LinkedIn weekly cadence

-   Offer presets for 3 posts/week and 5 posts/week, plus a custom
    schedule within plan limits.
-   Ask the user for preferred weekdays, time zone, and preferred
    posting windows.
-   AI plans content variety across the week rather than simply
    repeating one post.
-   Support personal profile and organization page only when permitted
    by official API access.
-   Explain that profile/page capabilities depend on LinkedIn
    permissions and app approval.
-   Never ask for LinkedIn passwords or automate through session
    cookies.

### 6.10 YouTube video workflow

1.  User uploads a video or selects an existing eligible video where
    supported.
2.  Validate file type, size, duration, and processing requirements.
3.  Analyse video/audio using permitted processing methods and available
    AI services.
4.  Generate 3--5 accurate title options, description, relevant
    tags/hashtags, category suggestions, thumbnail brief, and chapter
    suggestions when possible.
5.  Flag uncertain names, claims, quotes, or timestamps for review.
6.  User selects visibility, audience settings, and schedule.
7.  User previews metadata and confirms publishing/queueing.
8.  Upload through the official API with progress and resumable upload
    support where available.
9.  Monitor processing and final status.
10. Store the video ID, URL, publication time, metadata snapshot, and
    errors.
11. Fetch supported analytics and provide improvement suggestions.

Requirements: - Do not claim to fully understand video content if
analysis failed or was partial. - Do not generate false chapters or
fabricated quotations. - Make "made for kids" and other required
audience settings explicit; do not guess them. - Do not use copyrighted
music or footage without permission. - YouTube publishing may require
extra setup, API quota, or compliance review. Show those limitations
before the user schedules.

### 6.11 Best-time recommendations

-   Start with configurable recommended posting windows by platform,
    audience location, and industry where reliable account data is
    unavailable.
-   When authorized analytics exist, calculate recommendations from the
    customer's own historical results.
-   Consider the time zone, audience geography, past engagement, content
    type, and sufficient sample size.
-   Show the reason and confidence level, e.g. "Suggested: Tuesday 6:30
    PM --- based on recent engagement; medium confidence."
-   Do not present an estimate as a guarantee.
-   Improve recommendations gradually as more data accumulates.
-   Allow users to override all recommendations.

### 6.12 Analytics and reporting

-   Unified post status and performance overview.
-   Metrics only when available from the platform API and authorized
    permissions.
-   Clearly label each metric's source, definition, date range, and last
    refreshed time.
-   Compare campaign performance and platform performance without
    treating unlike metrics as directly equivalent.
-   Weekly/monthly reports with key outcomes, top posts, underperforming
    themes, and recommended experiments.
-   Export PDF/CSV in higher tiers if supported.
-   Optional client-ready/white-label reports as a future agency
    feature.
-   Do not fabricate missing metrics or imply that a correlation proves
    causation.

### 6.13 Notifications

-   In-app notifications and optional email notifications for:
    -   Campaign ready for review
    -   Upcoming scheduled posts
    -   Successful publication
    -   Failed publication
    -   Token expiry/revoked permission
    -   Usage limit approaching
    -   YouTube processing complete
    -   Weekly/monthly report ready
-   Let users control notification preferences.
-   Avoid sending repetitive alerts for the same unresolved issue.

### 6.14 Admin and subscription management

-   Plan definitions, feature flags, quotas, and usage counters.
-   User/workspace management and account status.
-   Integration health and error monitoring.
-   AI usage/cost monitoring by workspace and feature.
-   Job queue health and retry inspection.
-   Abuse prevention, rate limits, and audit logs.
-   Subscription lifecycle: trial, active, past due, cancelled, and
    expired.
-   Manual support tools must be permission-controlled and audited.
-   Do not let support staff view private media or tokens unless
    strictly necessary and explicitly authorized.

------------------------------------------------------------------------

## 7. Suggested MVP Scope

Build a focused first release before trying to support every platform
feature.

### MVP --- Phase 1

-   Authentication and workspace onboarding
-   Brand profile and voice settings
-   Asset library for images and videos
-   Meta account connection for eligible Facebook Pages and Instagram
    professional accounts
-   LinkedIn official OAuth connection where the application has
    required access
-   YouTube metadata generation and upload/scheduling workflow where API
    access permits
-   AI campaign planner and platform-specific copy generation
-   Calendar with draft, approval, scheduled, published, and failed
    states
-   Manual approval by default and explicit auto-publish setting
-   Durable scheduler and job status monitoring
-   Basic usage limits for Basic/Diamond/Premium
-   Basic analytics and failure notifications
-   Admin controls for plan limits and integration health

### Phase 2

-   Advanced team roles and multi-step approval
-   Deeper analytics and account-specific best-time recommendations
-   AI-assisted creative variations and smart resizing
-   Reusable campaign templates and evergreen content
-   Client-ready reports and agency workspaces
-   More granular policy/compliance checks
-   Additional platform connectors after official API review

### Phase 3

-   Advanced agency/white-label features
-   Cross-campaign recommendations and controlled experiments
-   Optional comment-management workflow with moderation and approval
-   More connectors where APIs and business demand support them

------------------------------------------------------------------------

## 8. Recommended Technical Architecture

Antigravity should inspect the existing repository and follow its
established conventions if a codebase already exists. If starting from
scratch, propose the simplest production-capable architecture before
implementation.

### Suggested stack (not mandatory)

-   Frontend: Next.js/React with TypeScript
-   UI: accessible component system and responsive design
-   Backend: TypeScript/Node.js API or another consistent, maintainable
    backend
-   Database: PostgreSQL
-   Job queue: Redis-backed queue or managed durable job service
-   Object storage: S3-compatible private storage
-   Authentication: secure managed auth or carefully implemented
    session-based auth
-   AI: provider abstraction supporting configurable LLM and
    media-analysis providers
-   Billing: pluggable payment provider selected after market/payment
    availability review
-   Monitoring: structured logs, error tracking, job metrics, and uptime
    checks
-   Deployment: containerized services with separate development,
    staging, and production environments

### Core services

1.  **Web application:** onboarding, asset library, calendar, review,
    analytics, billing.
2.  **API service:** authentication, authorization, business rules, CRUD
    operations.
3.  **Campaign engine:** creates campaign plans and platform-specific
    content.
4.  **AI gateway:** routes prompts and media-analysis tasks to
    configured providers; tracks cost and usage.
5.  **Media service:** validates, stores, scans, transforms, and
    analyses files.
6.  **Integration service:** platform OAuth, token refresh, API calls,
    capability checks.
7.  **Scheduler/worker service:** schedules jobs, publishes posts,
    retries safely, reconciles uncertain outcomes.
8.  **Analytics service:** imports supported metrics and creates
    reports.
9.  **Notification service:** in-app and email alerts.
10. **Admin/billing service:** plans, quotas, subscriptions, and
    operational controls.

Use provider interfaces for AI and social platforms so a vendor or API
can be changed without rewriting core product logic.

------------------------------------------------------------------------

## 9. Initial Data Model

Use migrations and appropriate indexes. Final schema should be refined
during implementation.

### Main entities

-   `users`: id, email, display_name, auth_provider, status, created_at,
    updated_at
-   `workspaces`: id, name, owner_user_id, timezone, locale, created_at
-   `workspace_members`: workspace_id, user_id, role, invited_by,
    joined_at
-   `subscriptions`: id, workspace_id, plan_id, status,
    billing_provider_ref, current_period_start, current_period_end
-   `plans`: id, name, features_json, quotas_json, active
-   `usage_records`: id, workspace_id, feature_key, quantity,
    period_start, period_end, metadata_json
-   `brand_profiles`: id, workspace_id, brand_name, website, industry,
    audience_json, tone_json, language, goals_json, restrictions_json
-   `brand_assets`: id, workspace_id, uploaded_by, storage_key,
    file_type, mime_type, size_bytes, checksum, dimensions_json,
    duration_seconds, rights_json, processing_status, created_at
-   `social_accounts`: id, workspace_id, platform, platform_account_id,
    account_name, account_type, scopes_json, encrypted_token_ref,
    token_expires_at, connection_status, last_sync_at
-   `campaigns`: id, workspace_id, name, objective, brief_json,
    start_at, end_at, status, created_by, created_at
-   `content_items`: id, workspace_id, campaign_id, platform, format,
    caption, title, description, hashtags_json, metadata_json, status,
    scheduled_at, timezone, approved_by, approved_at, published_at,
    platform_post_id, platform_url, failure_code, failure_message
-   `content_assets`: content_item_id, brand_asset_id, role, sort_order
-   `approval_events`: id, content_item_id, actor_user_id, action,
    comment, created_at
-   `publish_jobs`: id, content_item_id, idempotency_key, scheduled_at,
    status, attempt_count, next_attempt_at, started_at, finished_at,
    last_error_json
-   `platform_metrics`: id, content_item_id, metric_key, metric_value,
    measured_at, source, definition
-   `ai_runs`: id, workspace_id, feature_key, provider, model,
    input_tokens, output_tokens, media_seconds, estimated_cost, status,
    created_at
-   `notifications`: id, workspace_id, user_id, type, payload_json,
    read_at, created_at
-   `audit_logs`: id, workspace_id, actor_user_id, action,
    resource_type, resource_id, metadata_json, created_at

### Data model rules

-   Every tenant-owned record must be scoped to a workspace and
    authorized server-side.
-   Do not store raw access tokens in ordinary columns or logs. Use
    envelope encryption or a dedicated secrets manager/KMS where
    available.
-   Add unique constraints for platform account IDs within the relevant
    platform and appropriate tenant boundaries.
-   Use UTC timestamps; retain workspace time zone for display and
    scheduling decisions.
-   Add retention and deletion rules for assets, AI run details, audit
    records, and disconnected accounts.
-   Avoid storing raw video/audio transcripts longer than needed unless
    the user chooses to retain them.
-   Define cascade behavior carefully so deleting an account does not
    accidentally remove shared or legally required records.

------------------------------------------------------------------------

## 10. Initial API Surface

Use versioned APIs, validation, consistent error formats, pagination,
and server-side authorization. The endpoints below are a planning guide,
not a requirement to expose every operation publicly.

### Authentication and workspace

-   `POST /api/v1/auth/register`
-   `POST /api/v1/auth/login`
-   `POST /api/v1/auth/logout`
-   `GET /api/v1/me`
-   `POST /api/v1/workspaces`
-   `GET /api/v1/workspaces/:workspaceId`
-   `PATCH /api/v1/workspaces/:workspaceId`
-   `POST /api/v1/workspaces/:workspaceId/invitations`

### Brand and assets

-   `GET /api/v1/workspaces/:workspaceId/brand-profile`
-   `PUT /api/v1/workspaces/:workspaceId/brand-profile`
-   `POST /api/v1/workspaces/:workspaceId/assets`
-   `GET /api/v1/workspaces/:workspaceId/assets`
-   `GET /api/v1/assets/:assetId`
-   `DELETE /api/v1/assets/:assetId`

### Social accounts and integrations

-   `GET /api/v1/workspaces/:workspaceId/integrations`
-   `GET /api/v1/integrations/:platform/connect`
-   `GET /api/v1/integrations/:platform/callback`
-   `POST /api/v1/social-accounts/:accountId/sync`
-   `DELETE /api/v1/social-accounts/:accountId`
-   `GET /api/v1/social-accounts/:accountId/capabilities`

OAuth state must be signed/validated, short-lived, and protected against
CSRF. Use PKCE where supported. Callback handling must verify the
expected state and never trust client-supplied account IDs without
checking them against the provider response.

### Campaigns and content

-   `POST /api/v1/workspaces/:workspaceId/campaigns`
-   `GET /api/v1/workspaces/:workspaceId/campaigns`
-   `GET /api/v1/campaigns/:campaignId`
-   `PATCH /api/v1/campaigns/:campaignId`
-   `POST /api/v1/campaigns/:campaignId/generate-plan`
-   `POST /api/v1/campaigns/:campaignId/generate-content`
-   `GET /api/v1/workspaces/:workspaceId/calendar`
-   `GET /api/v1/content/:contentId`
-   `PATCH /api/v1/content/:contentId`
-   `POST /api/v1/content/:contentId/approve`
-   `POST /api/v1/content/:contentId/reject`
-   `POST /api/v1/content/:contentId/schedule`
-   `POST /api/v1/content/:contentId/publish-now`
-   `POST /api/v1/content/:contentId/cancel`

### YouTube

-   `POST /api/v1/youtube/analyse`
-   `POST /api/v1/youtube/generate-metadata`
-   `POST /api/v1/youtube/upload`
-   `GET /api/v1/youtube/uploads/:uploadId`
-   `PATCH /api/v1/youtube/videos/:videoId/metadata`

### Analytics, billing, and notifications

-   `GET /api/v1/workspaces/:workspaceId/analytics/overview`
-   `GET /api/v1/content/:contentId/metrics`
-   `GET /api/v1/workspaces/:workspaceId/usage`
-   `GET /api/v1/workspaces/:workspaceId/notifications`
-   `PATCH /api/v1/notifications/:notificationId`
-   `GET /api/v1/billing/plans`
-   `POST /api/v1/billing/checkout`
-   `POST /api/v1/billing/webhooks`
-   `GET /api/v1/admin/integration-health` (admin role only)

Use asynchronous jobs for expensive AI/media tasks and uploads. Return
job IDs and expose progress/status endpoints instead of keeping HTTP
requests open.

------------------------------------------------------------------------

## 11. UI/UX Requirements

### Product experience

-   Modern, polished BMS-branded SaaS interface.
-   Responsive desktop-first dashboard that also works on tablets and
    mobile.
-   Clear navigation: Overview, Calendar, Campaigns, Content Library,
    Social Accounts, Analytics, Team, Billing, Settings.
-   Show the next scheduled posts and recent publishing outcomes on the
    overview screen.
-   Visual account connection health and actionable errors.
-   One-click "Pause all publishing" control in a clearly accessible
    location.
-   Content cards should show platform, scheduled time, approval status,
    asset preview, and edit/preview actions.
-   Provide calendar, queue, and list views.
-   Use skeletons, empty states, progress indicators, and useful error
    messages.
-   Accessible color contrast, keyboard navigation, labels, focus
    states, and screen-reader-friendly status text.
-   Confirm destructive or high-impact actions.
-   Do not overload users with technical API errors; translate them into
    a plain-language explanation and a safe next step.
-   Keep platform-specific previews close to the editing experience.
-   Clearly indicate when a feature is unavailable due to plan, account
    eligibility, permission, or API restrictions.

### Suggested main screens

1.  Sign up / login
2.  Onboarding wizard
3.  Brand profile and voice
4.  Connect social accounts
5.  Asset library
6.  New campaign wizard
7.  AI-generated campaign calendar
8.  Content editor and platform preview
9.  Publishing queue
10. Calendar
11. YouTube video assistant
12. Analytics and reports
13. Team and approval settings
14. Plan, billing, and usage
15. Admin dashboard

------------------------------------------------------------------------

## 12. Security, Privacy, and Compliance

-   Use strict tenant isolation and server-side authorization for every
    workspace resource.
-   Apply least-privilege OAuth scopes.
-   Encrypt secrets and sensitive tokens at rest and in transit.
-   Store production secrets outside source control and frontend
    bundles.
-   Use secure cookies, CSRF protections, rate limiting, input
    validation, and output encoding.
-   Protect against SSRF, insecure file uploads, path traversal,
    malicious media, prompt injection from uploaded documents, and
    cross-tenant data exposure.
-   Treat uploaded content and text as untrusted input; it must never
    override system policies or trigger tool execution.
-   Validate all AI outputs against schema and platform constraints
    before publishing.
-   Add audit events for account connection/disconnection, permission
    changes, approvals, scheduling, publishing, exports, and admin
    access.
-   Provide account deletion, data export, consent controls, retention
    rules, and privacy policy/terms workflows.
-   Use only official, permitted APIs; observe each platform's developer
    terms and data-use rules.
-   Do not bypass API restrictions, scraping controls, rate limits, or
    review requirements.
-   Respect copyright, music/video licensing, consent, privacy, and
    applicable advertising disclosure rules.
-   Do not auto-generate or publish unsupported medical, financial,
    legal, or other high-impact claims without appropriate review.
-   Establish an incident-response procedure for leaked tokens,
    compromised accounts, or cross-tenant access.
-   Never log credentials, access tokens, full transcripts, or
    unnecessary personal data.

------------------------------------------------------------------------

## 13. Reliability and Error Handling

Every scheduled post should have an explicit lifecycle:
`draft → awaiting_approval → approved → scheduled → publishing → published`
with alternate states such as `rejected`, `paused`, `failed`,
`cancelled`, and `needs_reauthorization`.

Requirements: - Durable queue; scheduled jobs must survive process
restarts. - Idempotent publish attempts. - Retry transient
network/server errors with exponential backoff and jitter. - Do not
repeatedly retry permanent validation, permission, or policy errors. -
Reconcile uncertain API outcomes before retrying to avoid duplicates. -
Dead-letter queue and admin inspection for repeatedly failing jobs. -
Per-platform rate limiting and quota monitoring. - Health checks and
alerts for scheduler/worker failures. - Record request correlation IDs
without exposing secrets. - Provide a clear user-facing explanation and
recovery action. - If an account disconnects, pause its pending posts
and notify the owner. - Never silently discard a scheduled post.

------------------------------------------------------------------------

## 14. AI Quality and Guardrails

-   Use structured output schemas for campaign plans and posts.
-   Keep a clear distinction between user-provided facts, AI
    suggestions, and externally verified facts.
-   Ask follow-up questions if essential information is missing.
-   Do not invent testimonials, reviews, statistics, credentials,
    guarantees, or product details.
-   Avoid generic repetitive copy and platform-inappropriate formatting.
-   Use a brand-voice profile with editable examples and prohibited
    phrases.
-   Apply a pre-publication checklist for grammar, asset match, links,
    date/time, platform format, policy flags, and factual claims.
-   Show the user meaningful warnings rather than silently "fixing"
    sensitive details.
-   Use moderation/policy checks where appropriate and keep human review
    for ambiguous/high-risk content.
-   Evaluate output quality with a repeatable test set before changing
    prompts or models.
-   Track AI costs per workspace and feature, and enforce quotas.
-   Allow users to regenerate individual fields without losing the rest
    of the post.

------------------------------------------------------------------------

## 15. Acceptance Criteria

The MVP is not complete until the following can be demonstrated:

1.  A new user can create an account and complete brand onboarding.
2.  A user can connect an eligible social account using official OAuth,
    see its capabilities, and disconnect it.
3.  A user can upload assets and assign them to a campaign.
4.  The campaign planner generates a multi-day calendar based on the
    user's brief, assets, goals, and selected platforms.
5.  Generated posts use platform-specific fields and do not invent
    missing business facts.
6.  The user can edit, regenerate, preview, approve, reject, reschedule,
    and cancel posts.
7.  Only approved and valid posts enter the publishing queue when manual
    approval is active.
8.  A scheduled job runs at the correct local time, including time-zone
    changes, and the backend records the outcome.
9.  Failed posts are visible, retry safely when appropriate, and provide
    a clear recovery path.
10. The system does not publish duplicate posts after a worker restart
    or ambiguous timeout.
11. LinkedIn publishing is enabled only when the required API
    permissions are actually available.
12. YouTube metadata generation, upload status, and scheduled
    publication work where the configured API project and account permit
    them.
13. Basic, Diamond, and Premium quotas are enforced server-side and
    shown to users.
14. Workspace A cannot read or modify Workspace B's content, assets,
    integrations, usage, or reports.
15. OAuth tokens and secrets never appear in frontend responses or logs.
16. Users can pause all publishing and disconnect an account.
17. The dashboard accurately distinguishes draft, scheduled, published,
    failed, and needs-reauthorization states.
18. The app has automated tests for authorization, tenant isolation,
    scheduling, quota enforcement, and duplicate prevention.
19. Platform limitations and permission prerequisites are documented in
    onboarding and settings.
20. The project includes setup instructions, environment variable
    examples without secrets, database migrations, seed/demo data, and
    deployment notes.

------------------------------------------------------------------------

## 16. Testing Plan

### Unit tests

-   Campaign and platform-specific content validation
-   Plan quota calculations
-   Time-zone conversion and scheduling logic
-   Permission and role checks
-   AI output schema validation
-   Retry/backoff and state transitions

### Integration tests

-   OAuth state validation and callback handling
-   Social API adapters with mocked provider responses
-   Job queue processing and idempotency
-   Upload validation and object-storage permissions
-   Billing webhook signature validation
-   Notification dispatch

### End-to-end tests

-   New user onboarding
-   Connect account → generate campaign → review → approve → schedule
-   Publish success and failure simulation
-   Expired token and reauthorization flow
-   YouTube metadata and upload progress flow
-   Subscription quota reached
-   Pause all publishing
-   Cross-tenant authorization attempts

Use sandbox/test accounts where providers support them. Never run
destructive or test publishing against a real customer account without
explicit permission.

------------------------------------------------------------------------

## 17. Antigravity Implementation Instructions

Antigravity should work in controlled milestones and avoid generating a
giant untested codebase in one pass.

### Milestone 0 --- Repository and feasibility audit

1.  Inspect the repository, framework, package manager, existing code,
    environment, and deployment assumptions.
2.  Preserve existing working conventions unless there is a strong
    reason to change them.
3.  Identify official API prerequisites, developer app reviews, account
    eligibility, quota limits, and current publishing capabilities for
    Meta, LinkedIn, and YouTube.
4.  Produce `IMPLEMENTATION_PLAN.md` and `PLATFORM_API_FEASIBILITY.md`.
5.  Clearly mark features that need approval or cannot yet be verified.
6.  Do not fabricate API endpoints, scopes, or platform capabilities.

### Milestone 1 --- Foundation

-   App shell, responsive design system, authentication, workspace
    model, roles, database migrations, audit logging, environment
    configuration.
-   Add seed/demo workspace data.
-   Establish linting, formatting, type checks, tests, and CI where
    available.

### Milestone 2 --- Brand and asset management

-   Brand onboarding and voice settings.
-   Private media upload/storage and validation.
-   Asset library, preview, and campaign assignment.

### Milestone 3 --- Campaign and content engine

-   Campaign wizard and AI provider abstraction.
-   Structured campaign-plan and post schemas.
-   Platform-specific preview and editing.
-   Usage/cost metering.

### Milestone 4 --- Calendar and approval

-   Calendar/list/queue views.
-   Approval modes, audit history, global pause.
-   Durable scheduler and worker architecture, including idempotency and
    retry rules.

### Milestone 5 --- Platform connectors

-   Implement one connector at a time using official APIs.
-   Start with the platform whose API access and test account are
    available.
-   Implement OAuth, capabilities, connection health, publishing, status
    reconciliation, and supported metrics.
-   Keep each connector behind a stable adapter interface and feature
    flag.
-   Never substitute browser automation or scraping for unavailable
    official API access.

### Milestone 6 --- YouTube assistant

-   Metadata generation, video analysis, thumbnail brief, chapter
    suggestions, upload workflow, progress state, visibility,
    scheduling, and error recovery.
-   Respect quota and API project restrictions.

### Milestone 7 --- Plans, reporting, and polish

-   Basic/Diamond/Premium feature and quota configuration.
-   Usage dashboard and subscription state.
-   Analytics, notifications, accessibility, security hardening, and
    deployment documentation.

### Required deliverables

-   Working application code
-   `README.md` with local setup and deployment instructions
-   `.env.example` containing names/placeholders only, no real secrets
-   Database schema and migrations
-   Seed/demo data
-   `IMPLEMENTATION_PLAN.md`
-   `PLATFORM_API_FEASIBILITY.md`
-   `SECURITY.md` or equivalent security notes
-   Tests for critical workflows
-   Documented plan quotas and feature flags
-   A list of incomplete items, required credentials, provider
    approvals, and manual setup steps

### Working rules

-   First provide a short architecture/implementation plan and call out
    risks before making major changes.
-   Then implement in small, verifiable milestones.
-   Run tests, lint, and type checks after each milestone where
    available.
-   Do not claim a feature works unless it has been implemented and
    tested or its limitation is clearly stated.
-   Use real integrations only after required credentials and
    permissions are configured; provide mocked/demo mode meanwhile.
-   Never place API keys, OAuth secrets, or production tokens in source
    control.
-   Keep secrets server-side and use environment variables or a secrets
    manager.
-   Use maintainable abstractions and avoid overengineering.
-   If a platform API requirement is blocked, complete the integration
    interface and clearly document what is required; do not fake a
    successful publishing flow.
-   Ask the product owner only for decisions that materially block
    implementation. Make reversible technical choices using sensible
    defaults and document them.
-   Keep the interface and brand experience aligned with BranDive Media
    Solutions.

------------------------------------------------------------------------

## 18. Product Decisions to Confirm Before Public Launch

These are not blockers for building the initial foundation, but they
must be resolved before production launch:

-   Final product name and domain/subdomain
-   Exact prices, currency, billing intervals, taxes, and payment
    provider
-   Final account, post, AI-generation, storage, and video-minute quotas
-   Supported platforms and exact formats verified against current API
    access
-   Whether each plan includes a trial
-   Team-member limits and agency workspace model
-   Data retention and deletion schedule
-   AI provider(s), data-processing terms, and media retention settings
-   Support channels and response targets
-   Brand identity, typography, colors, and UI assets from BMS
-   Terms of service, privacy policy, consent language, and
    platform-specific disclosures

------------------------------------------------------------------------

## 19. Final Product Positioning

BranDive SocialFlow AI should be positioned as an **AI-powered social
media campaign and publishing workspace** --- not just a caption
generator or a basic scheduler.

Its differentiation should come from: - One brief powering a complete
weekly/monthly campaign - Platform-specific content rather than
copy-paste posting - A single calendar and approval workflow - Official
account connections and dependable scheduled publishing - YouTube video
metadata and publishing assistance - Transparent automation controls and
failure recovery - Clear tiered packages for businesses and agencies -
Brand-aware AI, user-owned assets, and practical performance insights

**Build principle:** Automate repetitive work, preserve user control,
verify platform capabilities, and never sacrifice account security or
publishing reliability for a demo.


## Mandatory BranDive Brand Identity Requirements

**Official reference:** https://www.brandivemedsols.com/

Antigravity must inspect the official BranDive Media Solutions website before implementing the application's final UI.

### Colors and typography
- Extract the actual brand colors, including HEX values, from the website's CSS and rendered interface.
- Identify the exact font families used for headings, body text, buttons, navigation, and forms.
- Do not guess colors or fonts or introduce an unrelated design palette.
- Reuse the official BranDive logo and preserve its proportions.
- Document the verified design system in a new file named `BRAND_DESIGN_SYSTEM.md`.

### Application-wide consistency
Apply the verified BranDive brand identity consistently to:
- Dashboard and navigation
- Campaign builder and content calendar
- Media library and social account connections
- YouTube automation and analytics
- Billing, settings, notifications, and administration
- Buttons, forms, cards, tables, typography, and status indicators

Create reusable design tokens using CSS variables or the equivalent framework feature. Maintain responsive layouts, readable contrast, keyboard accessibility, and consistent component styling.

### Mandatory implementation rules
1. Inspect the live website and available official brand assets before choosing the final palette and fonts.
2. Use verified brand values throughout the application.
3. Create `BRAND_DESIGN_SYSTEM.md` documenting colors, fonts, logo usage, spacing, and component styles.
4. If a brand value cannot be verified, document the uncertainty instead of presenting a guess as an official value.
5. Ensure the finished product looks like a natural extension of BranDive Media Solutions, not a generic SaaS template.

### Acceptance criteria
The UI is approved only when the brand colors and fonts have been verified, the official logo is correctly used, and all application pages follow the same documented design system.