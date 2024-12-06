import { PGlite } from '@electric-sql/pglite'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import { drizzle as pgDrizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'
export * from './schema'

const database = process.env.DATABASE_URL;
export const db = pgDrizzle(postgres(database ?? ''), { schema })
