// packages/database/drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./src/env/server";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
});