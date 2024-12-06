import { pgTable, serial, text, timestamp, date, boolean } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: date('date').notNull(),
  completed: boolean('completed').notNull().default(false),
})
