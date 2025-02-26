import { uuid, varchar, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { Bookmark } from './Bookmark';

export const User = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  email: varchar('email').notNull().unique(),
  hash: varchar('hash').notNull(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
});

export const userRelations = relations(User, ({ many }) => ({
  bookmarks: many(Bookmark),
}));
