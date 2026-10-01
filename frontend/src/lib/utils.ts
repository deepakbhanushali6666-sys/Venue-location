import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Budgets are free text, so only plain numbers get the Indian grouping (10,00,000).
export function formatBudget(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  const numeric = raw.replace(/[₹,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(numeric)) return raw;
  return `₹${Number(numeric).toLocaleString("en-IN")}`;
}
