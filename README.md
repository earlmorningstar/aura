# Aura — Creator Analytics Dashboard

> Your entire creator business. One glass dashboard.

Aura brings revenue, audience, and content analytics into a single, beautiful, AI-powered place. Built for solo creators and solopreneurs who are tired of jumping between tabs.

---

## Screenshots

> _![Dashboard Overview](public/dashboard_ss.png)_

---

## Features

- **Revenue Dashboard** — track Stripe, Gumroad, affiliate, and manual transactions in real time
- **Audience Analytics** — follower growth, platform breakdowns, engagement rates, and top‑performing content
- **Content Performance** — see which posts drive the most revenue and followers
- **AI‑Powered Insights** — weekly summaries and a conversational “Ask Aura AI” chat assistant powered by GPT‑4o‑mini
- **Workspace Management** — create, rename, delete, and switch between multiple workspaces (Personal, Agency, Side Projects)
- **Subscription Billing** — Stripe Checkout (Starter & Pro plans), 14‑day free trial, customer portal, and paywall guard
- **Global Date‑Range Picker** — one filter controls all data across every page
- **Glassmorphic UI** — animated counters, spring‑physics interactions, fully responsive
- **Authentication** — magic link and Google OAuth via Supabase Auth
- **Notifications** — in‑app bell with dropdown, real‑time unread count, and settings card
- **Mobile Ready** — bottom navigation, floating quick‑action button, polished mobile header
- **Light / Dark / System Theme** — respects OS preference, with a clean light palette (dark is the default brand aesthetic)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Data Fetching | TanStack Query (React Query) |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend / Database | Supabase (PostgreSQL + Auth) |
| AI | OpenAI GPT‑4o‑mini |
| Payments | Stripe (Checkout, Webhooks, Customer Portal) |
| Deployment | Vercel |

---

## Pages

### Landing Page
Public homepage with hero section, dashboard preview mockup, feature grid, social proof strip, footer, and pricing cards with live Stripe checkout.

### Login / Sign Up
Magic link or Google OAuth sign‑in. New users are created automatically on first login and are directed to an onboarding screen to set their display name.

### Dashboard — Overview
Dynamic greeting using the user’s profile name. Six KPI cards, a Revenue Trend chart, an AI Summary card (real, data‑driven), and an “At a Glance” quick‑stats strip. All data responds to the global date‑range picker (visible only on this tab on mobile).

### Revenue
MRR and growth chips in the header, CSV export button, Daily Revenue bar chart, Revenue by Source donut chart, a searchable and sortable Transaction List, and an Add Transaction form. New transactions appear instantly.

### Audience
Summary KPIs, an Audience Growth area chart with platform breakdown pills, individual Platform cards (YouTube, Twitter/X, Newsletter) with sparklines, and a Top Audience‑Driving Content list. Clean empty states when no data exists.

### Content
KPI header, platform and sort filters, grid/list view toggle, content performance cards, an “+ Add Content” modal (with custom platform input), and a 12‑week publishing cadence heatmap (now fully dynamic).

### Insights
Category filter tabs, AI‑generated insight cards with priority and action chips, a Regenerate button, and graceful fallback when the AI service is unavailable.

### Settings
Profile (editable name, auto‑refresh), Notifications (unread count, mark all read), Subscription (Upgrade / Manage based on plan), Security (password reset), Appearance (theme switcher).

### Ask Aura AI
Slide‑over panel from the topbar or mobile floating button. Sends your real data as context so the assistant gives personalised answers.

### Mobile Experience
On small screens the sidebar and topbar are replaced by:
- A **sticky mobile header** with avatar, greeting, workspace pill, and subscription label (when subscribed)
- A **bottom navigation bar** with links to all tabs
- A **floating action button (FAB)** that opens a bottom sheet with date‑range picker, Ask Aura AI, workspace switcher, new workspace, and Settings

---

## Project Structure


```
aura/
├── app/
│ ├── (auth)/  # Authenticated routes
│ │ ├── dashboard/ # Overview page
│ │ ├── revenue/
│ │ ├── audience/
│ │ ├── content/
│ │ ├── insights/
│ │ └── settings/
│ ├── (marketing)/ # Public pages (landing, features, pricing, blog, about, contact, careers, privacy, terms, cookies)
│ ├── api/
│ │ ├── ai-chat/ # Ask Aura AI endpoint
│ │ ├── ai-summary/ # Weekly summary endpoint
│ │ ├── checkout/ # Stripe Checkout session creation
│ │ ├── portal/ # Stripe Customer Portal session
│ │ ├── stripe/webhook/ # Stripe webhook handler
│ │ └── stripe-keys/ # Price IDs for the client
│ └── login/
├── components/
│ ├── ai/ # AI chat panel
│ ├── audience/ # Audience page, add‑audience modal
│ ├── auth/ # Subscription guard
│ ├── billing/ # Paywall overlay, subscription pill
│ ├── charts/ # Revenue trend, audience growth
│ ├── content/ # Content page, performance cards
│ ├── dashboard/ # KPIs, AI summary card, overview content
│ ├── layout/ # Sidebar, topbar, mobile nav, mobile header, mobile quick‑actions
│ ├── revenue/ # Revenue page, charts, transaction form & table
│ ├── settings/ # Settings content, theme switcher, subscription button
│ ├── ui/ # GlassCard, GlassButton, GlassKPI, DataTable, skeletons, confirm dialog, toast, etc.
│ └── workspace/ # New workspace modal, workspace actions
├── hooks/ # TanStack Query hooks (useRevenue, useAudienceData, useContentPieces, useSubscription, useUser, etc.)
├── lib/ # Supabase clients, Stripe, plans mapping, notify helper, metadata helper
├── stores/ # Zustand stores (date‑range, workspace, UI, etc.)
└── public/ # Static assets
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- A [Stripe](https://stripe.com) account (for payment features)

### Installation

```bash
# Clone the repository
git clone https://github.com/earlmorningstar/aura.git
cd aura

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root of the project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migrations from the `/supabase` folder (if provided) or set up tables manually
3. Enable the following auth providers in your Supabase dashboard:
   - Email (magic link)
   - Google OAuth
4. Add your site URL and redirect URLs to the Supabase auth settings

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

Aura is built to deploy on [Vercel](https://vercel.com) with zero configuration.

1. Push your repository to GitHub
2. Import the project into Vercel
3. Add all environment variables from `.env.local` to the Vercel project settings
4. Deploy

---

## License

[MIT](LICENSE)

---

Made with ❤️ by Onyeabor Joel [Earl Morningstar]