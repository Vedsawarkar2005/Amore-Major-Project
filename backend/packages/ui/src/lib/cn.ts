import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Compose conditional classes and resolve conflicting Tailwind utilities deterministically. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
