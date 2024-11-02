//

import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  username: text("username").primaryKey(),
});

export const feedsTable = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").unique().notNull(),
  name: text("name").notNull(),
  content: text("content"),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    username: text("username").references(() => users.username),
    feed_id: uuid("feed_id").references(() => feedsTable.id),
  },
  (table) => {
    return {
      username_feed_id_unique: unique("username_feed_id_unique").on(
        table.username,
        table.feed_id
      ),
    };
  }
);
