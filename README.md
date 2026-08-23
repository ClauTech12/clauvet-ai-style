# Clauvèra

A luxury fashion e-commerce site rooted in Buea, Cameroon — 870m above sea level.

**Tagline:** "Elevated Fashion, Rooted in Cameroon"

Clauvèra is a curated online fashion store where every order is confirmed
directly with the customer over WhatsApp, with payment via MTN Mobile Money,
Orange Money, or cash on delivery. Real people fulfill every order — no
automated stylist, no fake AI gimmicks.

## Tech stack

- **Framework:** TanStack Start (React, SSR)
- **Styling:** Tailwind CSS with a custom design system (Fraunces / Instrument Sans / IBM Plex Mono, OKLCH color tokens)
- **Backend:** Supabase (Postgres, Auth, Storage) — self-hosted project, not Lovable Cloud
- **Deployment:** Cloudflare Workers
- **Error monitoring:** Sentry (client + server)
- **Languages:** English, French, and Cameroonian Pidgin (PCM)

## Key features

- Product catalog with categories, sizes, and colors
- Cart and checkout with delivery-details capture (name, phone, town, address)
- Delivery estimates per town (Buea, Limbe, Mamfe, Kumba, Douala)
- WhatsApp handoff for order confirmation and payment
- Auto-generated PDF receipts (branded, itemized, used as proof of purchase for pickup/delivery)
- Two-tier admin panel: Super Admin (staff/roles, store settings) and Admin (day-to-day: products, stock, orders)
- Row-Level-Security-backed Supabase policies for staff-only actions

## Local development

You'll need Node.js and npm.

git clone https://github.com/ClauTech12/clauvet-ai-style.git
cd clauvet-ai-style
npm install
npm run dev

Set up your own .env with:

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SENTRY_DSN=
SENTRY_DSN=

## Scripts

npm run dev - start local dev server
npm run build - production build (client + server)
npm run lint - eslint
npm run format - prettier

## Deployment

This project deploys to Cloudflare Workers via wrangler.jsonc. Production environment variables (like SENTRY_DSN) are set directly in that file, or via wrangler secret put for anything sensitive.
