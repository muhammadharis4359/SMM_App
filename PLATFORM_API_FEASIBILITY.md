# BranDive SocialFlow AI - Platform API Feasibility Analysis
**Document Purpose:** Detailed technical feasibility, API permissions, account eligibility, rate limits, and compliance review for Meta (Facebook & Instagram), LinkedIn, and YouTube integrations.  
**Specification Reference:** `BranDive_SocialFlow_AI_Requirements.md` (Sections 4, 6.2, 6.7, 6.9, 6.10, 15)  
**Status:** Approved for implementation with official API adapters and strict Demo Mode fallback.

---

## 1. Executive Summary & Policy Compliance
BranDive SocialFlow AI is engineered as a secure, enterprise-grade SaaS application. In strict adherence to BMS guidelines and platform terms:
1. **Zero Browser Automation / Zero Scraping:** No unofficial APIs, browser puppets, or session cookie extraction are ever used.
2. **Official OAuth 2.0 Only:** All integrations rely strictly on official OAuth 2.0 flows, PKCE where supported, and encrypted token storage.
3. **No Fake Publishing:** The system never marks a scheduled post as "published" unless the official API returns an authoritative post/media ID. In demo/development environments where developer credentials are not yet configured, the system operates in an explicit **DEMO MODE**, marked with clear UI badges and simulated event logs.
4. **Tenant Isolation:** Tokens and platform accounts are isolated per workspace and never leaked in frontend payloads, logs, or error responses.

---

## 2. Meta Integration (Facebook Pages & Instagram Professional)

### 2.1 Overview & Architecture
Meta provides two official APIs:
- **Facebook Graph API** for Facebook Pages.
- **Instagram Graph API** for Instagram Professional accounts (Business and Creator).

### 2.2 Account Eligibility Requirements
- **Facebook:** The user must be an Admin or Editor of a Facebook Page. Personal user timelines are not supported for automated SaaS publishing under Meta policies.
- **Instagram:** The Instagram account **must be a Professional Account (Business or Creator)** and **must be linked to a Facebook Page**. Personal Instagram accounts cannot be published to via the API.
- **Meta Business Manager:** The client organization must have a verified Meta Business Account for production app access.

### 2.3 Required Official OAuth Permissions (Scopes)
| Permission | Purpose | App Review Needed? |
| :--- | :--- | :--- |
| `pages_show_list` | Discover and list Facebook Pages managed by the user | Yes (Standard/Advanced) |
| `pages_read_engagement` | Read Page profile info, posts, and engagement metrics | Yes |
| `pages_manage_posts` | Publish, edit, and delete posts on Facebook Pages | Yes |
| `instagram_basic` | Read Instagram account profile info and media list | Yes |
| `instagram_content_publish` | Create and publish single images, carousels, videos, and Reels | **Yes (Strict Review)** |
| `instagram_manage_insights` | Fetch analytics (reach, impressions, engagement) | Yes |
| `business_management` | Link Instagram accounts managed in Business Manager | Yes |

### 2.4 Technical Publishing Workflow
1. **Container Creation:** `POST /{ig_user_id}/media` with `image_url` or `video_url` (must be publicly accessible or signed cloud storage URL) and `caption`.
2. **Container Status Check (Videos/Reels):** `GET /{creation_id}?fields=status_code`. Must poll until `FINISHED` before publishing.
3. **Container Publish:** `POST /{ig_user_id}/media_publish` with `creation_id`.
4. **Facebook Page Post:** `POST /{page_id}/feed` with `message`, `link`, or `POST /{page_id}/photos` / `videos`.

### 2.5 Platform Limits & Constraints
- **Instagram API Publishing Limit:** 25 published posts per 24-hour rolling window per Instagram account.
- **Image Specifications:** JPEG format, aspect ratio between `4:5` (vertical) and `1.91:1` (horizontal). Max file size 8MB.
- **Reels/Video Specifications:** MP4 or MOV, H.264/AAC, frame rate 23-60 FPS, max file size 1GB (for Reels: 100MB recommended), duration 3 seconds to 15 minutes.
- **Token Lifecycle:** User access tokens last ~1-2 hours. Must be exchanged for a **Long-Lived User Access Token** (60 days) and subsequently exchanged for a **Page Access Token** (never expires unless revoked or user changes password).

---

## 3. LinkedIn Integration (Profiles & Organization Pages)

### 3.1 Overview & Architecture
LinkedIn provides REST APIs through the LinkedIn Developer Portal using OAuth 2.0 with the Community Management API and Share on LinkedIn frameworks.

### 3.2 Account Eligibility Requirements
- **Personal Profiles:** Any verified LinkedIn member account.
- **Company / Organization Pages:** The user must be an assigned Administrator with "Super Admin" or "Content Admin" role on the target Organization Page.

### 3.3 Required Official OAuth Permissions (Scopes)
| Permission / Product | Purpose | Approval Prerequisite |
| :--- | :--- | :--- |
| `openid`, `profile`, `email` | Authenticate user identity and retrieve URN | Default OpenID Connect |
| `w_member_social` | Publish posts, images, articles to personal profile | Available upon creating Developer App |
| `w_organization_social` | Publish posts, images, and videos to Organization Pages | **Requires "Community Management API" Product Approval** |
| `r_organization_social` | Read organization post metrics and engagement | **Requires "Community Management API" Product Approval** |

### 3.4 Technical Publishing Workflow
LinkedIn uses the **UGC (User Generated Content) Post API** / **Versioned Posts API** (`/rest/posts`):
1. Register upload request (`POST /rest/images?action=initializeUpload` or `/rest/videos`).
2. Upload media binary to the returned upload URL.
3. Create post: `POST /rest/posts` with `author` (URN format `urn:li:person:{id}` or `urn:li:organization:{id}`), `commentary`, `visibility` (`"PUBLIC"`), and `content` references.

### 3.5 Platform Limits & Constraints
- Organization posting requires platform application review by LinkedIn.
- Access tokens expire after **60 days**. Refresh tokens expire after **365 days**.
- Posting frequency must adhere to LinkedIn safe limits (e.g., maximum 20-25 posts per day per member to prevent spam flags; our plan recommends 3-5 high-value posts per week).

---

## 4. YouTube Integration (Video Metadata & Publishing)

### 4.1 Overview & Architecture
The YouTube Data API v3 and YouTube Partner APIs provide programmatic video metadata generation, uploads, scheduling, and analytics.

### 4.2 Account Eligibility Requirements
- A standard Google / YouTube account with an initialized YouTube Channel.
- Custom thumbnails require the channel to be phone-verified with YouTube.
- Videos longer than 15 minutes require account verification with Google.

### 4.3 Required Official OAuth Permissions (Scopes)
| Scope URL | Purpose | Review Prerequisite |
| :--- | :--- | :--- |
| `https://www.googleapis.com/auth/youtube.upload` | Upload videos and set publishing schedule/privacy | Sensitive Scope (Requires Google App Verification) |
| `https://www.googleapis.com/auth/youtube.readonly` | Retrieve channel info, upload status, video analytics | Non-sensitive/Sensitive |
| `https://www.googleapis.com/auth/youtubepartner` | Advanced channel management (optional for agency tier) | Restricted Scope |

### 4.4 Technical Publishing Workflow
1. **Resumable Upload Initialization:** `POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`.
2. **Binary Upload:** Send chunks via `PUT` with `Content-Range`.
3. **Metadata Specification:**
   - `snippet.title`: Max 100 characters.
   - `snippet.description`: Max 5,000 characters (includes generated chapters and timestamps).
   - `snippet.tags`: Relevant keyword tags (max 500 characters total).
   - `snippet.categoryId`: Target YouTube category ID (e.g., "22" for People & Blogs, "28" for Science & Technology).
   - `status.privacyStatus`: `"private"`, `"unlisted"`, or `"public"`.
   - `status.publishAt`: Scheduled publish timestamp in ISO-8601 UTC (requires `status.privacyStatus = "private"`).
   - `status.selfDeclaredMadeForKids`: Explicit boolean (mandatory by COPPA regulations).

### 4.5 Critical Quota & Verification Constraints
- **Default Project Quota:** 10,000 units per day.
- **Cost Per Video Upload:** **1,600 units**.
  - *Impact:* An unverified/default project can only upload **6 videos per day** across all users before hitting the daily quota.
  - *Production Action:* BranDive must apply for a YouTube Data API Quota Extension through Google Cloud Console before scaling.
- **App Verification Rule:** Unverified apps have uploaded videos permanently locked to "Private" visibility until Google Cloud verification is completed.

---

## 5. Technical Dependencies Matrix

| Component | Library / Driver | Role |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) / React 19 / TypeScript | Unified full-stack SaaS frontend & API service |
| **Database & ORM** | Prisma / SQLite (development) & PostgreSQL (production) | Multi-tenant schema, strict relational constraints, migrations |
| **Cryptography** | Node.js `crypto` (`aes-256-gcm`) | Encryption of OAuth tokens and secrets at rest |
| **Scheduler** | Durable background scheduler with idempotency keys | Zero duplicate post guarantees, exponential backoff retries |
| **AI Gateway** | Unified AI Provider Interface (Gemini 2.5/Flash, OpenAI) | Schema-validated structured campaign generation |
| **Media Handling** | Sharp & Node streaming | Image validation, resizing metadata, thumbnail generation |

---

## 6. Implementation Strategy: Real vs. Demo Mode

To enable full end-to-end testing immediately without waiting for lengthy external platform app reviews:
```
           +--------------------------------------------+
           |       SocialConnector Gateway              |
           +--------------------------------------------+
                                  |
              +-------------------+-------------------+
              |                                       |
    [Credentials Present]                   [Credentials Missing]
              |                                       |
  +-----------------------+              +---------------------------+
  | Official Platform API |              | High-Fidelity Demo Mode   |
  | - Real OAuth Flow     |              | - Simulated OAuth Dance   |
  | - Meta Graph API      |              | - Capability Introspection|
  | - LinkedIn Post API   |              | - Realistic Status Lifecycle
  | - YouTube Data API    |              | - Clear "DEMO MODE" Badge |
  +-----------------------+              +---------------------------+
```

1. **Auto-Detection:** The system inspects environment variables (`META_CLIENT_ID`, `LINKEDIN_CLIENT_ID`, `YOUTUBE_CLIENT_ID`).
2. **Real Mode:** When configured, executes real OAuth and REST API calls.
3. **Demo Mode:** When credentials are null/empty, provides a realistic interactive sandbox:
   - Connects mock accounts with real-world capability matrices.
   - Emulates token expiry, health checks, rate limits, and failure recovery.
   - Posts scheduled in Demo Mode execute through the scheduler and record simulated publish events without communicating with external servers.
   - **Crucially:** The UI explicitly displays the `[DEMO MODE]` badge on every mocked account and post, fulfilling the specification requirement to never mislead users or fake successful production publishing.
