import { z } from "zod";

const ISO_DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date attendue au format AAAA-MM-JJ");
// Optional date: tolerates "" / null / undefined from form inputs and normalizes to undefined.
const ISO_DATE_OPT = z
  .preprocess((v) => (v === "" || v == null ? undefined : v), ISO_DATE.optional());
// Optional nullable date: keeps null when explicitly sent, normalizes "" to null.
const ISO_DATE_NULLABLE = z
  .preprocess((v) => (v === "" ? null : v), ISO_DATE.nullable().optional());
// Optional string that tolerates "" -> undefined.
const optionalString = (max: number) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : v), z.string().max(max).optional());
const positiveNumber = z.coerce.number().nonnegative();
const positiveInt = z.coerce.number().int().nonnegative();

export const bandeCreateSchema = z.object({
  nom: z.string().min(1, "Nom requis").max(120),
  dateDeDepart: ISO_DATE_OPT,
  sujetsDepart: positiveInt,
  nombreDeces: positiveInt.optional(),
  valeurMaterielFixe: positiveNumber.optional(),
  statut: z.enum(["active", "terminee"]).optional(),
});

export const bandeUpdateSchema = z.object({
  nom: z.string().min(1).max(120).optional(),
  dateDeDepart: ISO_DATE_OPT,
  sujetsDepart: positiveInt.optional(),
  nombreDeces: positiveInt.optional(),
  valeurMaterielFixe: positiveNumber.optional(),
  statut: z.enum(["active", "terminee"]).optional(),
});

export const depenseCreateSchema = z.object({
  date: ISO_DATE_OPT,
  designation: z.string().min(1, "Désignation requise").max(200),
  categorie: z.string().min(1, "Catégorie requise").max(100),
  quantite: positiveNumber,
  prixUnitaire: positiveNumber,
});

export const chargeFixeCustomCreateSchema = z.object({
  designation: z.string().min(1, "Désignation requise").max(255),
  montant: z.coerce.number().positive("Le montant doit être > 0"),
  categorie: optionalString(100),
  commentaire: optionalString(2000),
});

export const chargeFixeCustomUpdateSchema = z.object({
  designation: z.string().min(1).max(255).optional(),
  montant: z.coerce.number().positive("Le montant doit être > 0").optional(),
  categorie: optionalString(100),
  commentaire: optionalString(2000),
});

export const venteCreateSchema = z.object({
  date: ISO_DATE,
  quantiteVendue: z.coerce.number().int().positive("Quantité vendue doit être > 0"),
  prixUnitaire: positiveNumber,
});

export const mortaliteCreateSchema = z.object({
  date: ISO_DATE,
  ageJours: positiveInt,
  decesJour: positiveInt,
});

// Optional positive number that tolerates "" -> undefined.
const positiveNumberOpt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  positiveNumber.optional(),
);
const positiveNumberNullable = z.preprocess(
  (v) => (v === "" ? null : v),
  positiveNumber.nullable().optional(),
);

export const peseeCreateSchema = z.object({
  date: ISO_DATE,
  ageJours: positiveInt,
  poidsMoyenG: positiveNumberOpt,
  poidsMinG: positiveNumberNullable,
  poidsMaxG: positiveNumberNullable,
  objectifPoidsG: positiveNumberNullable,
}).refine(
  (v) => (v.poidsMoyenG != null && v.poidsMoyenG > 0) || (v.poidsMinG != null && v.poidsMaxG != null),
  { message: "Renseignez le poids moyen, ou poids min ET max" },
);

export const stockAlimentSchema = z.object({
  designation: z.string().min(1).max(200),
  type: z.enum(["entree", "sortie"]).optional(),
  quantiteKg: positiveNumber,
  prixUnitaire: positiveNumberNullable,
  fournisseur: optionalString(200),
  date: ISO_DATE,
  commentaire: optionalString(1000),
});

export const stockMedicamentSchema = z.object({
  nom: z.string().min(1).max(200),
  type: z.enum(["entree", "sortie"]).optional(),
  quantite: positiveNumber,
  unite: z.string().max(50).optional(),
  datePeremption: ISO_DATE_NULLABLE,
  fournisseur: optionalString(200),
  date: ISO_DATE,
  commentaire: optionalString(1000),
});
