import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert UTC time to India Standard Time (IST: UTC+5:30)
export function convertToIST(dateString?: string): Date | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    // IST is UTC+5:30, so add 5 hours and 30 minutes
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate;
  } catch {
    return null;
  }
}

// Format time in IST
export function formatTimeIST(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const istDate = convertToIST(dateString);
    if (!istDate) return dateString;
    return istDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return dateString;
  }
}

// Format date in IST
export function formatDateIST(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const istDate = convertToIST(dateString);
    if (!istDate) return dateString;
    return istDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateString;
  }
}
