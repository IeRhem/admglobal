import { db, user } from '@repo/database'

const allUsers = await db.select().from(user);