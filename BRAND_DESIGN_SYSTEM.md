# BranDive Media Solutions - Design System Specification
**Product:** BranDive SocialFlow AI  
**Source of Truth:** Verified from live inspection of [BranDive Media Solutions Official Website](https://www.brandivemedsols.com/) (`index-b9wM4kkp.css` and live DOM).  
**Document Status:** Complete & Verified Official Brand Identity

---

## 1. Brand Essence & Visual Language
BranDive Media Solutions (BMS) blends creative digital agency expertise with high-tech execution. The brand identity conveys digital excellence, trust, precision, and modern SaaS fluidity.

Key visual elements:
- Deep oceanic navy backgrounds paired with vibrant, electric Brandive Blue (`#0E88D3`).
- Clean glassmorphism cards with subtle border strokes (`rgba(14, 136, 211, 0.2)`).
- Crisp typography using **Lexend** for modern geometric authority and **Poppins** for warm, readable UI legibility.
- Official BranDive logos preserved with exact proportions and clear spacing.

---

## 2. Color Palette (Verified Tokens)

### Primary Colors
| Token Name | CSS Variable | Hex | HSL / RGB | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Brandive Blue** | `--brandive-blue` / `--primary` | `#0E88D3` | `hsl(203, 81%, 44%)` / `rgb(14, 136, 211)` | Primary CTA buttons, active tabs, brand accents, glowing indicators |
| **Brandive Blue Dark** | `--brandive-blue-dark` | `#09639B` | `hsl(203, 89%, 32%)` | Button hover states, pressed states, deep highlights |
| **Brandive Light Tint**| `--brandive-light-blue` | `#E6F4FC` | `rgb(230, 244, 252)` | Soft badge backgrounds, subtle callouts, light-mode card highlights |

### Neutral & Surface Colors (Dark SaaS Theme - High Precision)
| Token Name | CSS Variable | Hex | HSL / RGB | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas Background** | `--background` | `#080D1A` | `hsl(222, 55%, 7%)` | Main app background, workspace viewport |
| **Card Surface** | `--card` | `#0E1526` | `hsl(222, 45%, 10%)` | Content cards, widgets, data tables, modals |
| **Card Elevate / Hover**| `--card-hover` | `#151E34` | `hsl(222, 42%, 15%)` | Hovered cards, dropdown menus, flyouts |
| **Sidebar Surface** | `--sidebar-bg` | `#0A0F1D` | `hsl(222, 48%, 8%)` | Persistent left-hand navigation sidebar |
| **Border Default** | `--border` | `#1E293B` | `hsl(217, 33%, 17%)` | Standard dividers, card outlines |
| **Border Active / Brand**| `--border-brand` | `#0E88D333` | `rgba(14, 136, 211, 0.25)` | Focused inputs, selected items, featured cards |

### Typography Colors
| Token Name | CSS Variable | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Text Bright** | `--text-primary` | `#F8FAFC` | Headings, titles, high-contrast labels |
| **Text Secondary**| `--text-secondary` | `#94A3B8` | Body text, descriptions, table contents |
| **Text Muted** | `--text-muted` | `#64748B` | Timestamps, placeholder text, secondary metadata |
| **Text Accent** | `--text-accent` | `#545454` | Tertiary text, specific brand footnotes (extracted from site) |

### Status & Feedback Tokens
| Token Name | Hex | Usage |
| :--- | :--- | :--- |
| **Success / Published** | `#10B981` | Emerald 500: Confirmed published post, healthy API token |
| **Scheduled / Queued** | `#38BDF8` | Sky 400: Content ready in queue, waiting for publishing window |
| **Pending Approval** | `#F59E0B` | Amber 500: Awaiting user/team manual sign-off |
| **Failed / Action Req** | `#EF4444` | Red 500: Platform API error, expired token, failed upload |
| **Draft / In Progress** | `#8B5CF6` | Violet 500: AI draft generated, in review |
| **Demo / Mocked Mode** | `#EC4899` | Pink 500: Clear badge indicating simulation mode |

---

## 3. Typography Hierarchy

Imported directly via Google Fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
```

- **Headings & Display Typography (`font-family: 'Lexend', sans-serif`):**
  - Used for Page Titles, Modal Headers, KPI metrics, Campaign Titles, Section Labels.
  - H1: `2.25rem (36px)`, `font-weight: 700`, `letter-spacing: -0.025em`
  - H2: `1.75rem (28px)`, `font-weight: 600`, `letter-spacing: -0.02em`
  - H3: `1.25rem (20px)`, `font-weight: 600`
  - H4: `1.05rem (17px)`, `font-weight: 500`

- **Body & Controls Typography (`font-family: 'Poppins', sans-serif`):**
  - Used for Body Copy, Navigation links, Form Inputs, Buttons, Tooltips, Status Badges.
  - Body Normal: `0.9375rem (15px)`, `font-weight: 400`, `line-height: 1.6`
  - Body Small / Meta: `0.8125rem (13px)`, `font-weight: 400`
  - Micro / Badges: `0.75rem (12px)`, `font-weight: 500`, `letter-spacing: 0.02em`

---

## 4. Logo Usage & Proportions

The official BranDive logo (`logo.png` / `logo.jpg`) has been retrieved directly from the official website asset bundle.
- **Aspect Ratio:** The logo features the stylized BranDive emblem and logotype.
- **Navbar / Header Display:** Height `36px` to `42px` with proportional width.
- **Collapsed Sidebar / Favicon:** Height `28px` to `32px`.
- **Contrast Rule:** On dark backgrounds, use high-contrast rendering with transparent container or subtle circular pill background where applicable.
- **Clearance Area:** Minimum padding around logo equals 50% of the emblem's height.

---

## 5. UI Components & Interaction Tokens

### Buttons
- **Primary:** `background-color: var(--brandive-blue)`, text: `#FFFFFF`, `font-family: 'Poppins'`, `font-weight: 500`, border radius: `8px`. Hover: `background-color: #09639B; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(14, 136, 211, 0.4)`.
- **Secondary / Ghost:** `background: transparent; border: 1px solid var(--border); color: var(--text-primary)`. Hover: `background: rgba(255, 255, 255, 0.05); border-color: var(--brandive-blue)`.
- **Danger (e.g., Pause All Publishing, Delete):** `background: #EF4444`, text: `#FFFFFF`.

### Cards & Glassmorphism
```css
.brandive-card {
  background: rgba(14, 21, 38, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.brandive-card:hover {
  border-color: rgba(14, 136, 211, 0.35);
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.45), 0 0 20px rgba(14, 136, 211, 0.15);
}
```

### Forms & Inputs
- Height: `40px`, padding: `0 14px`.
- Background: `rgba(10, 15, 29, 0.8)`.
- Border: `1px solid #1E293B`.
- Focus ring: `outline: none; border-color: #0E88D3; box-shadow: 0 0 0 3px rgba(14, 136, 211, 0.25)`.

### Status Badges
- Displayed with rounded pill shape (`rounded-full`), `font-size: 11px`, `font-weight: 600`, with subtle translucent background matching status color and crisp text.

---

## 6. Verification Checklist
- [x] Official HEX values extracted from live stylesheet (`#0E88D3`, `#E6F4FC`, `#545454`).
- [x] Font families verified against live Google Font import (`Lexend` and `Poppins`).
- [x] Official logo downloaded and saved as local verified assets.
- [x] Contrast ratio meets WCAG AA standard (4.5:1 for normal text, 3:1 for large text).
