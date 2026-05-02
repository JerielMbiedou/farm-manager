import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcule l'âge en jours d'une bande à partir de sa date de départ.
 * Convention métier : J1 = date de départ. Retourne au minimum 1.
 */
export function getAgeJours(dateDeDepart: string | null | undefined, today: Date = new Date()): number {
  if (!dateDeDepart) return 1;
  const start = new Date(dateDeDepart + "T00:00:00");
  if (isNaN(start.getTime())) return 1;
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = todayMidnight.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}
