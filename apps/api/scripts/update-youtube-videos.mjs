const apiUrl = process.env.ADMI_API_URL ?? "http://localhost:3000";
const cronSecret = process.env.CRON_SECRET;

if (!cronSecret) {
  throw new Error("CRON_SECRET is required to refresh YouTube videos");
}

const response = await fetch(
  new URL("/api/cron/youtube", apiUrl),
  {
    headers: { Authorization: `Bearer ${cronSecret}` },
  },
);

const result = await response.json();
if (!response.ok) {
  throw new Error(result.error ?? `Refresh failed with HTTP ${response.status}`);
}

console.log(`Updated ${result.updated} YouTube videos`);
