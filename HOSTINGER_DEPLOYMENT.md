# BranDive SocialFlow AI - Hostinger Deployment & Configuration Guide

This guide explains how to deploy **BranDive SocialFlow AI** on **Hostinger**, configure your `.env` variables (including Gemini and Social accounts), and operate the AI-driven content generation pipeline.

---

## 1. Environment Variables Explained (`.env`)

Here is what each variable in your [.env](file:///e:/BranDive%20SocialFlow%20AI/.env) does and how to fill it:

| Variable | Description | Recommended Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLite database file path. | `"file:./dev.db"` (Zero setup, runs anywhere) |
| `NODE_ENV` | Application mode. | `"production"` on Hostinger, `"development"` locally |
| `PORT` | Listening port. | `3000` |
| `NEXT_PUBLIC_APP_URL` | Your public domain or IP on Hostinger. | `https://yourdomain.com` (or `http://YOUR_VPS_IP:3000`) |
| `JWT_SECRET` | Secret key used to sign user auth cookies. | Any 32+ character string |
| `TOKEN_ENCRYPTION_KEY` | 32-byte AES-256 hex key to encrypt tokens in the DB. | A 64-character hexadecimal string |
| `AI_PROVIDER` | Active AI provider engine. | `"GEMINI"` |
| `GEMINI_API_KEY` | Google AI Studio API Key. | Starts with `AIzaSy...` (Get from Google AI Studio) |
| `META_APP_ID` | Facebook/Instagram App ID. | Optional (Leave empty for instant Demo Mode) |
| `META_APP_SECRET` | Facebook/Instagram App Secret. | Optional |
| `META_REDIRECT_URI` | Meta OAuth Callback URL. | `https://yourdomain.com/api/v1/integrations/meta/callback` |
| `LINKEDIN_CLIENT_ID` | LinkedIn Developer Client ID. | Optional (Leave empty for instant Demo Mode) |
| `LINKEDIN_CLIENT_SECRET`| LinkedIn Developer Client Secret. | Optional |
| `LINKEDIN_REDIRECT_URI` | LinkedIn OAuth Callback URL. | `https://yourdomain.com/api/v1/integrations/linkedin/callback` |
| `YOUTUBE_CLIENT_ID` | Google Cloud OAuth Client ID. | Optional (Leave empty for instant Demo Mode) |
| `YOUTUBE_CLIENT_SECRET` | Google Cloud OAuth Client Secret. | Optional |
| `YOUTUBE_REDIRECT_URI` | YouTube OAuth Callback URL. | `https://yourdomain.com/api/v1/integrations/youtube/callback` |

---

## 2. Deploying on Hostinger

### Option A: Hostinger VPS (Ubuntu 22.04 / 24.04) — Recommended

Hostinger VPS provides full control, automatic restarts via PM2, and fast performance.

#### Step 1: Connect to your Hostinger VPS via SSH
```bash
ssh root@YOUR_SERVER_IP
```

#### Step 2: Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2
```

#### Step 3: Clone or Upload the Codebase
```bash
git clone <YOUR_GIT_REPO_URL> /var/www/brandive-socialflow
cd /var/www/brandive-socialflow
```

#### Step 4: Configure `.env`
Create or edit `.env`:
```bash
nano .env
```
Paste your values (ensure `NEXT_PUBLIC_APP_URL="https://yourdomain.com"` and your valid `GEMINI_API_KEY`).

#### Step 5: Install & Prepare Database
```bash
npm install
npx prisma db push
node scripts/seed.mjs
```
*(Default seeded login: `demo@brandivemedsols.com` / `Password123!`)*

#### Step 6: Build with Standalone Output
```bash
npm run build
```

#### Step 7: Start with PM2
Next.js outputs a compact standalone server in `.next/standalone`:
```bash
# Copy public and static assets to standalone directory
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# Start with PM2
cd .next/standalone
pm2 start server.js --name "socialflow-ai"
pm2 save
pm2 startup
```

#### Step 8: Point Domain & Enable SSL (Nginx & Certbot)
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```
Configure Nginx to reverse-proxy port 3000 to your domain and run:
```bash
sudo certbot --nginx -d yourdomain.com
```

---

### Option B: Hostinger Cloud / Web Hosting (Node.js App via hPanel)
1. In Hostinger **hPanel**, go to **Websites** -> **Advanced** -> **Node.js**.
2. Set:
   - **Node.js version**: 20.x
   - **Application root**: `/public_html` or `/socialflow`
   - **Application startup file**: `node_modules/next/dist/bin/next` or `.next/standalone/server.js`
3. Upload the files via Git or File Manager.
4. Open the hPanel Terminal, run `npm install`, `npx prisma db push`, `node scripts/seed.mjs`, and `npm run build`.

---

## 3. How to Connect Social Media Accounts

BranDive SocialFlow AI supports two modes:

### A. High-Fidelity Demo Mode (No API Keys Required — Instant Testing)
If you leave `META_APP_ID`, `LINKEDIN_CLIENT_ID`, and `YOUTUBE_CLIENT_ID` blank in `.env`:
1. Log in to the application at `/login`.
2. Navigate to **Integrations** in the sidebar ([/integrations](file:///e:/BranDive%20SocialFlow%20AI/app/integrations/page.tsx)).
3. Click **"+ Connect Channel"**.
4. Select the platform (Instagram, Facebook Page, LinkedIn, or YouTube Channel).
5. Type your handle (e.g. `@brandive_media` or `BranDive Solutions`).
6. Click **"Connect Channel"**.
7. The account will immediately appear as **CONNECTED** with capabilities (photos, reels, carousels, video, metrics). You can start scheduling, approving, and publishing right away.

### B. Live Platform APIs (Production Mode)
When you are ready to publish directly to live social feeds:
- **Meta (Facebook & Instagram)**:
  1. Go to [developers.facebook.com](https://developers.facebook.com) -> Create App -> Business.
  2. Add **Facebook Login for Business** and **Instagram Graph API**.
  3. Copy **App ID** & **App Secret** to `.env` (`META_APP_ID` & `META_APP_SECRET`).
- **LinkedIn**:
  1. Go to [linkedin.com/developers](https://www.linkedin.com/developers) -> Create App -> Associate your company page.
  2. Request the **Share on LinkedIn** and **Sign In with LinkedIn** products.
  3. Add Client ID & Secret to `.env`.
- **YouTube**:
  1. Go to [console.cloud.google.com](https://console.cloud.google.com).
  2. Enable **YouTube Data API v3**.
  3. Create an **OAuth 2.0 Client ID** (Web application) and add credentials to `.env`.

---

## 4. How Gemini Creates Posts from User Input

1. **Strategic Inputs Provided by User**:
   - In **Brand Profile** ([/brand-profile](file:///e:/BranDive%20SocialFlow%20AI/app/brand-profile/page.tsx)): You define brand name, industry, tone of voice (e.g., *Authoritative, Innovative, Dynamic*), core services, target audience, and prohibited words/claims.
   - In **Campaign Studio** ([/campaigns](file:///e:/BranDive%20SocialFlow%20AI/app/campaigns/page.tsx)): You enter:
     - Campaign Name (e.g. *Fall Client Acquisition Sprint*)
     - Objective (*AWARENESS*, *LEADS*, *PRODUCT_LAUNCH*)
     - Target Channels (Meta IG, Meta FB, LinkedIn, YouTube)
     - Cadence (e.g. *4 posts per week*)
     - Brief Notes / Prompt (e.g. *"Focus on scalable B2B systems and client success metrics"*)
2. **Gemini AI Execution**:
   - The engine sends this comprehensive context to Gemini with a structured schema prompt.
   - Gemini generates:
     - Multi-tier content pillars.
     - Platform-adapted copy (Instagram visual hooks + hashtags; LinkedIn executive narrative; Facebook community pitch; YouTube title + chapter timestamps).
     - Optimal scheduling time per channel based on audience browsing habits.
     - Automated brand guardrail & compliance checks.
3. **Calendar & Publishing Workflow**:
   - The posts are saved to the workspace **Content Calendar** ([/calendar](file:///e:/BranDive%20SocialFlow%20AI/app/calendar/page.tsx)).
   - Depending on your workspace setting:
     - **Manual Approval Mode**: You review, edit, and click "Approve".
     - **Auto-Publish Mode**: Posts without compliance warnings are scheduled and published automatically at the target time.
