import { pgTable, varchar, json, timestamp, index } from "drizzle-orm/pg-core";

// Table managée par connect-pg-simple — déclarée ici pour empêcher drizzle-kit
// de la supprimer lors d'un push schema.
export const sessionTable = pgTable(
  "session",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire", { precision: 6, mode: "date" }).notNull(),
  },
  (t) => [index("IDX_session_expire").on(t.expire)],
);
