import { pgTable, serial, text, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const financementTable = pgTable("financement", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  montant: numeric("montant", { precision: 15, scale: 2 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFinancementSchema = createInsertSchema(financementTable).omit({ id: true, createdAt: true });
export type InsertFinancement = z.infer<typeof insertFinancementSchema>;
export type Financement = typeof financementTable.$inferSelect;
