# Arrow of Deliverance Ministries International (ADMI) — ADM Global

> **"A Shining Light to the Nations"**
> Proclaiming the Gospel of Jesus Christ and empowering people to fulfill their potential in God.
> Also known as: **ADMI**, **ADM Global**, **Victory Chapel**, and **Victory Family**.

This repository is a Turborepo-powered monorepo housing the web platform, administrative dashboard, and backend services for Arrow of Deliverance Ministries International based in Jalingo, Taraba State, Nigeria.

---

## 🏛️ Monorepo Structure

```text
admi/
├── apps/
│   ├── web/          # Public-facing church website (Next.js 16, Port 3002)
│   ├── admin/        # Church administration & operations portal (Next.js 16, Port 3001)
│   └── api/          # Backend API services, oRPC endpoints & cron jobs (Next.js 16, Port 3000)
├── packages/
│   ├── database/     # Drizzle ORM schema, migrations & Postgres client (@repo/database)
│   ├── ui/           # Shared UI component library & design system (@repo/ui)
│   ├── tailwind-config/ # Shared Tailwind CSS configurations (@repo/tailwind-config)
│   ├── typescript-config/ # Shared tsconfig bases (@repo/typescript-config)
│   └── eslint-config/ # Shared linting configurations (@repo/eslint-config)
```

---

## 🚀 Applications & Packages

### Applications (`apps/`)

- **`web` ([`apps/web`](file:///home/lerhem/CODE/ADMI/admi/apps/web))**: The public church website.
  - Features: Hero vision showcase, sermon library (YouTube integrated), upcoming events & reservations, member testimonies, prayer/counseling/inquiry forms, giving information.
  - **SEO & AI Discoverable**: Fully configured with Open Graph, Twitter Cards, JSON-LD Church/Organization schema, dynamic `/sitemap.xml`, `/robots.txt`, and `/llms.txt` for AI assistant discovery.
  - Runs on: **`http://localhost:3002`**

- **`admin` ([`apps/admin`](file:///home/lerhem/CODE/ADMI/admi/apps/admin))**: The staff and church operations management dashboard.
  - Features: Authentication via Better Auth, events & reservation management, testimony approvals, analytics & reporting, media management via Cloudflare R2 / S3.
  - Runs on: **`http://localhost:3001`**

- **`api` ([`apps/api`](file:///home/lerhem/CODE/ADMI/admi/apps/api))**: Backend API service.
  - Features: Type-safe RPC via `@orpc` (server, OpenAPI, Zod validation), event & testimony services, contact submissions, presigned S3/R2 upload & download, automated YouTube sermon sync cron task.
  - Runs on: **`http://localhost:3000`**

### Shared Packages (`packages/`)

- **`@repo/database`**: PostgreSQL schema definitions using Drizzle ORM, migration files, and database connection clients.
- **`@repo/ui`**: Shared React component library built with Tailwind CSS, Base UI, and Tabler icons.
- **`@repo/tailwind-config`**: Shared Tailwind presets and styling tokens.
- **`@repo/typescript-config`**: Shared TypeScript configuration files.
- **`@repo/eslint-config`**: Shared ESLint configurations across the workspace.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [GSAP](https://gsap.com/)
- **Monorepo Tooling**: [Turborepo](https://turbo.build/repo), [pnpm](https://pnpm.io/)
- **Database & ORM**: PostgreSQL, [Drizzle ORM](https://orm.drizzle.team/), Drizzle Kit
- **API & RPC**: [oRPC](https://orpc.dev/), Zod v4, OpenAPI
- **Auth**: [Better Auth](https://www.better-auth.com/)
- **Storage**: Cloudflare R2 / AWS S3 SDK
- **Icons**: [Tabler Icons](https://tabler.io/icons)

---

## 📋 Prerequisites

- **Node.js**: `>= 24.0.0`
- **pnpm**: `>= 10.0.0`
- **PostgreSQL**: Running instance or hosted database (e.g., Supabase, Neon)

---

## ⚡ Getting Started

### 1. Clone & Install Dependencies

```sh
git clone <repo-url>
cd admi
pnpm install
```

### 2. Configure Environment Variables

Create `.env` files in the corresponding apps/packages:

#### `apps/api/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/admi_db"
YOUTUBE_API_KEY="your-youtube-api-key"
YOUTUBE_CHANNEL_ID="@arrowofdeliveranceministries"
CRON_SECRET="your-secure-cron-secret"
R2_BUCKET_NAME="admi-media"
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_ENDPOINT_URL="https://<account_id>.r2.cloudflarestorage.com"
```

#### `apps/web/.env`:

```env
ADMI_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_SITE_URL="https://admglobal.org"
```

#### `apps/admin/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/admi_db"
BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL="http://localhost:3001"
ADMI_API_URL="http://localhost:3000/api"
```

### 3. Setup the Database

Generate and run Drizzle migrations:

```sh
# Generate migrations
pnpm --filter @repo/database db:generate

# Apply migrations
pnpm --filter @repo/database db:migrate

# (Optional) Open Drizzle Studio
pnpm --filter @repo/database db:studio
```

### 4. Run Development Servers

Start all applications concurrently with Turborepo:

```sh
pnpm dev
```

Or run individual apps:

```sh
pnpm --filter web dev    # Web on http://localhost:3002
pnpm --filter admin dev  # Admin on http://localhost:3001
pnpm --filter api dev    # API on http://localhost:3000
```

---

## 📜 Common Scripts

| Command                                   | Description                                           |
| ----------------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                                | Starts all apps in development mode with Turbo TUI    |
| `pnpm build`                              | Builds all apps and packages                          |
| `pnpm lint`                               | Runs ESLint across all workspaces                     |
| `pnpm check-types`                        | Type-checks all packages and apps without emitting JS |
| `pnpm format`                             | Formats code with Prettier                            |
| `pnpm --filter @repo/database db:migrate` | Runs database migrations                              |
| `pnpm --filter @repo/database db:studio`  | Launches Drizzle Studio GUI                           |
| `pnpm --filter api update-youtube-videos` | Syncs latest YouTube sermons into the database        |

---

## 🔍 SEO & AI Discovery

The web application is tailored for high discoverability on Google, Bing, and AI search engines:

- **Keywords & Aliases**: Configured for searches including _Arrow of Deliverance Ministries_, _ADMI_, _Victory Chapel_, _Victory Family_, and _ADM Global_.
- **Structured Data**: Standard Church/Organization JSON-LD schema with address, social profiles, leadership, and alternate names.
- **Sitemap & Robots**: Dynamic `sitemap.xml` and `robots.txt` at root.
- **AI Integration**: Implements the [`/llms.txt`](file:///home/lerhem/CODE/ADMI/admi/apps/web/public/llms.txt) standard for LLMs and AI web agents.

---

## 📄 License

Private & proprietary to Arrow of Deliverance Ministries International. All rights reserved.
