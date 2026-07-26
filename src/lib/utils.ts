import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(n: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

export function formatClass(c: string) {
  const map: Record<string, string> = {
    equity: "Equities",
    etf: "ETFs",
    mutual_fund: "Mutual Funds",
    bond: "Bonds",
    fixed_deposit: "Fixed Deposits",
    gold: "Gold",
    reit: "REITs",
    invit: "InvITs",
    alternative: "Alternatives",
    other: "Other",
  };
  return map[c] || c;
}
