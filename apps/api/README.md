This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## YouTube sermons

The API stores eligible sermon videos in the `youtube_video` database table and
serves them from `GET /api/sermons`. The web app reads that endpoint using
`ADMI_API_URL`, which should be the API deployment origin (for example,
`https://api.example.com`).

Configure these environment variables on the API deployment:

- `DATABASE_URL`
- `YOUTUBE_API_KEY`
- `YOUTUBE_CHANNEL_ID` (a channel ID or `@handle`)
- `CRON_SECRET` (a long, random secret)

Configure `ADMI_API_URL` on the web deployment. The Vercel project for this app
must use `apps/api` as its Root Directory so Vercel reads this app's
`vercel.json`. Its cron schedule refreshes sermons at 08:00, 13:00, and 19:00
Africa/Lagos time (07:00, 12:00, and 18:00 UTC).

Apply the database migration, then run the first refresh manually so the public
endpoint is populated before the first scheduled run:

```sh
pnpm --filter @repo/database db:migrate
pnpm --filter api update-youtube-videos
```

The command calls the protected cron endpoint and uses `ADMI_API_URL` (or
`http://localhost:3000` by default) and `CRON_SECRET`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
