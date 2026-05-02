import { pgTable, serial, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const activityLogTable = pgTable(
  "activity_log",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    userNom: text("user_nom").notNull(),
    action: text("action").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("activity_log_user_id_idx").on(t.userId)],
);

export type ActivityLog = typeof activityLogTable.$inferSelect;
