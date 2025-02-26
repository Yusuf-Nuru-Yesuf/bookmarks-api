import { uuid, varchar, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { User } from './User';

export const Bookmark = pgTable('bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  title: varchar('title').notNull(),
  description: varchar('description'),
  link: varchar('link').notNull(),
  userId: uuid('user_id')
    .references(() => User.id)
    .notNull(),
});

export const bookmarkRelations = relations(Bookmark, ({ one }) => ({
  author: one(User, {
    fields: [Bookmark.userId],
    references: [User.id],
  }),
}));
