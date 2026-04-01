import { pgTable, serial, integer, numeric, text, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bandesTable = pgTable("bandes", {
  id: serial("id").primaryKey(),
  numero: integer("numero").notNull(),
  nom: text("nom").notNull(),
  sujetsDepart: integer("sujets_depart").notNull(),
  nombreDeces: integer("nombre_deces").notNull().default(0),
  valeurMaterielFixe: numeric("valeur_materiel_fixe", { precision: 15, scale: 2 }).notNull().default("0"),
  statut: text("statut").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bandeDepensesTable = pgTable("bande_depenses", {
  id: serial("id").primaryKey(),
  bandeId: integer("bande_id").notNull().references(() => bandesTable.id, { onDelete: "cascade" }),
  designation: text("designation").notNull(),
  categorie: text("categorie").notNull(),
  quantite: numeric("quantite", { precision: 15, scale: 2 }).notNull(),
  prixUnitaire: numeric("prix_unitaire", { precision: 15, scale: 2 }).notNull(),
});

export const bandeVentesTable = pgTable("bande_ventes", {
  id: serial("id").primaryKey(),
  bandeId: integer("bande_id").notNull().references(() => bandesTable.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  quantiteVendue: integer("quantite_vendue").notNull(),
  prixUnitaire: numeric("prix_unitaire", { precision: 15, scale: 2 }).notNull(),
});

export const chargesFixesTable = pgTable("charges_fixes", {
  id: serial("id").primaryKey(),
  bandeId: integer("bande_id").notNull().references(() => bandesTable.id, { onDelete: "cascade" }).unique(),
  loyer: numeric("loyer", { precision: 15, scale: 2 }).notNull().default("0"),
});

export const depensesVenteTable = pgTable("depenses_vente", {
  id: serial("id").primaryKey(),
  bandeId: integer("bande_id").notNull().references(() => bandesTable.id, { onDelete: "cascade" }),
  designation: text("designation").notNull(),
  montant: numeric("montant", { precision: 15, scale: 2 }).notNull(),
});

export const insertBandeSchema = createInsertSchema(bandesTable).omit({ id: true, numero: true, createdAt: true });
export type InsertBande = z.infer<typeof insertBandeSchema>;
export type Bande = typeof bandesTable.$inferSelect;

export const insertBandeDepenseSchema = createInsertSchema(bandeDepensesTable).omit({ id: true });
export type InsertBandeDepense = z.infer<typeof insertBandeDepenseSchema>;
export type BandeDepense = typeof bandeDepensesTable.$inferSelect;

export const insertBandeVenteSchema = createInsertSchema(bandeVentesTable).omit({ id: true });
export type InsertBandeVente = z.infer<typeof insertBandeVenteSchema>;
export type BandeVente = typeof bandeVentesTable.$inferSelect;

export const insertChargesFixeSchema = createInsertSchema(chargesFixesTable).omit({ id: true });
export type InsertChargesFixe = z.infer<typeof insertChargesFixeSchema>;
export type ChargesFixe = typeof chargesFixesTable.$inferSelect;

export const insertDepenseVenteSchema = createInsertSchema(depensesVenteTable).omit({ id: true });
export type InsertDepenseVente = z.infer<typeof insertDepenseVenteSchema>;
export type DepenseVente = typeof depensesVenteTable.$inferSelect;
