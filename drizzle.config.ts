// Config to drizzle-kit CLI

import { defineConfig } from 'drizzle-kit'

const databaseURL = process.env.DATABASE_URL || '';

export default defineConfig({
  dbCredentials: {
    url: databaseURL
  },
  dialect: 'postgresql',
  out: './server/db/migrations',
  schema: './server/db/schema.ts'
})
