# ADM Global — Web Application (`apps/web`)

The official public website for **Arrow of Deliverance Ministries International (ADMI)**, also known as **Victory Chapel** and **Victory Family**.

Built with [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), and [Base UI](https://base-ui.com/).

---

## 🌟 Key Features

- **Hero & Ministry Vision**: Dynamic visual grid and 3D depth carousel showcasing the church community.
- **Sermon Library**: Integrated with YouTube Data API via the API service, featuring the latest preaching, video archive, and search.
- **Upcoming Events & Reservations**: Event calendar, event details, and registration/reservation forms connected to the backend.
- **Member Testimonies**: Testimonial carousel and reader ("Showmelujah Reports"), plus a submission form at `/testify`.
- **Get in Touch**: Prayer requests, pastoral counseling, and general inquiry forms.
- **Online Giving**: Information on tithes, offerings, building projects, and bank details at `/give`.
- **Comprehensive SEO & AI Discoverability**:
  - Metadata optimized for queries like _Arrow of Deliverance Ministries_, _ADMI_, _Victory Chapel_, _Victory Family_, and _ADM Global_.
  - Full Open Graph, Twitter Cards, and canonical URLs.
  - JSON-LD Structured Data (`Church` and `Organization` schemas).
  - Dynamic [`/sitemap.xml`](file:///home/lerhem/CODE/ADMI/admi/apps/web/app/sitemap.ts) and [`/robots.txt`](file:///home/lerhem/CODE/ADMI/admi/apps/web/app/robots.ts).
  - Machine-readable [`/llms.txt`](file:///home/lerhem/CODE/ADMI/admi/apps/web/public/llms.txt) for AI assistants (ChatGPT, Claude, Gemini, Perplexity).
  - Web App Manifest at `/manifest.webmanifest`.

---

## ⚙️ Environment Variables

Create `.env` in `apps/web/`:

```env
# URL to the ADMI backend API
ADMI_API_URL="http://localhost:3000/api"

# Production site URL used for canonical links, sitemaps, and social cards
NEXT_PUBLIC_SITE_URL="https://admglobal.org"
```

---

## 🚀 Getting Started

From the monorepo root:

```sh
# Start only the web app
pnpm --filter web dev
```

Or from within `apps/web`:

```sh
pnpm dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

---

## 🔗 API Integration

The web app integrates with `apps/api`:

- **Sermons**: Loaded via `GET /api/sermons` (or YouTube fallback).
- **Events**: Loaded from `GET /api/events` and `GET /api/events/:slug`.
- **Reservations**: Forwarded server-side to `POST /api/events/:id/reservations`.
- **Testimonies**: Fetched from `GET /api/testimonies` and submitted via `POST /api/testimonies`.
- **Contact Forms**: Forwarded to `POST /api/contact`.

---

## 📁 Directory Structure

```text
apps/web/
├── app/
│   ├── about/              # About Us & leadership
│   ├── contact/            # Contact, prayer & counseling forms
│   ├── events/             # Upcoming events & event detail [slug]
│   ├── give/               # Giving & partnership accounts
│   ├── manifest.webmanifest/ # Dynamic PWA manifest route
│   ├── sermons/            # Sermon video library
│   ├── testify/            # Testimony submission form
│   ├── testimonies/        # Testimony archive & details [id]
│   ├── layout.tsx          # Root layout, fonts, SEO & JSON-LD
│   ├── page.tsx            # Landing page
│   ├── robots.ts           # Dynamic robots.txt
│   └── sitemap.ts          # Dynamic sitemap.xml
├── components/             # Page components, navigation & UI blocks
├── data/                   # Data helpers & fallback event listings
├── lib/                    # SEO configuration, API client & utilities
└── public/                 # Static assets, church logos & llms.txt
```
