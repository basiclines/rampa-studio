import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10
}
