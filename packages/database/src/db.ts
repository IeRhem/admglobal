import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env/server';
import { relations } from './schema';

const client = postgres(env.DATABASE_URL, { prepare: false })
export const db = drizzle({ client, relations });
export type database = typeof db;
