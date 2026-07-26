import type { AssetClass, RiskTolerance } from "@/types";
import { formatClass } from "./utils";

export interface HealthInputHolding {
  asset_class: string;
  current_value: number;
  volatility_annual?: number | null;
}

export interface RiskResult {
  portfolioVolatility: number;
  herfindahl: number;
  topClassPct: number;
  topClassName: string;
  concentrationLabel: "Low" | "Moderate" | "High" | "Very High";
  riskLabel: string;
  riskScore: number;
}

export interface DiversificationResult {
  matchesTolerance: boolean;
  mismatches: string[];
  overRepresented: string[];
  underRepresented: string[];
  summary: string;
}

const CLASS_VOL: Record<string, number> = {
  equity: 18,
  etf: 16,
  mutual_fund: 15,
  bond: 6,
  fixed_deposit: 1,
  gold: 12,
  reit: 14,
  invit: 13,
  alternative: 22,
  other: 12,
};

export function calcRisk(holdings: HealthInputHolding[]): RiskResult {
  const total = holdings.reduce((s, h) => s + h.current_value, 0) || 1;
  let portVol = 0;
  const classWeights: Record<string, number> = {};

  holdings.forEach((h) => {
    const w = h.current_value / total;
    const vol = h.volatility_annual ?? CLASS_VOL[h.asset_class] ?? 12;
    portVol += w * vol;
    classWeights[h.asset_class] = (classWeights[h.asset_class] || 0) + w;
  });

  const hhi = Object.values(classWeights).reduce((s, w) => s + w * w, 0);
  const sorted = Object.entries(classWeights).sort((a, b) => b[1] - a[1]);
  const [topClassName, topWeight] = sorted[0] || ["none", 0];
  const topClassPct = topWeight * 100;

  let concentrationLabel: RiskResult["concentrationLabel"] = "Low";
  if (hhi > 0.45 || topClassPct > 70) concentrationLabel = "Very High";
  else if (hhi > 0.3 || topClassPct > 55) concentrationLabel = "High";
  else if (hhi > 0.2 || topClassPct > 40) concentrationLabel = "Moderate";

  let riskLabel = "Balanced";
  let riskScore = 5;
  if (portVol < 8) {
    riskLabel = "Lower volatility – income-oriented";
    riskScore = 3;
  } else if (portVol < 13) {
    riskLabel = "Moderate volatility – blended";
    riskScore = 5;
  } else if (portVol < 18) {
    riskLabel = "Higher volatility – growth-tilted";
    riskScore = 7;
  } else {
    riskLabel = "Elevated volatility – aggressive";
    riskScore = 9;
  }

  if (concentrationLabel === "High" || concentrationLabel === "Very High") {
    riskLabel += " · concentration elevates risk";
    riskScore = Math.min(10, riskScore + 1);
  }

  return {
    portfolioVolatility: +portVol.toFixed(1),
    herfindahl: +hhi.toFixed(3),
    topClassPct: +topClassPct.toFixed(1),
    topClassName,
    concentrationLabel,
    riskLabel,
    riskScore,
  };
}

export function calcDiversification(
  holdings: HealthInputHolding[],
  riskTolerance: RiskTolerance | null | undefined
): DiversificationResult {
  const total = holdings.reduce((s, h) => s + h.current_value, 0) || 1;
  const alloc: Record<string, number> = {};
  holdings.forEach((h) => {
    alloc[h.asset_class] = (alloc[h.asset_class] || 0) + h.current_value / total;
  });

  const targets: Record<string, Record<string, [number, number]>> = {
    conservative: {
      equity: [0.15, 0.35],
      bond: [0.25, 0.45],
      fixed_deposit: [0.15, 0.35],
      gold: [0.05, 0.15],
    },
    moderate: {
      equity: [0.35, 0.55],
      bond: [0.15, 0.3],
      fixed_deposit: [0.05, 0.2],
      gold: [0.05, 0.12],
    },
    aggressive: {
      equity: [0.55, 0.8],
      bond: [0.05, 0.2],
      fixed_deposit: [0.0, 0.1],
      gold: [0.0, 0.1],
    },
  };

  const band = targets[riskTolerance || "moderate"] || targets.moderate;
  const over: string[] = [];
  const under: string[] = [];
  const mismatches: string[] = [];

  Object.entries(band).forEach(([cls, [low, high]]) => {
    const actual = alloc[cls] || 0;
    if (actual > high + 0.05) {
      over.push(cls);
      mismatches.push(
        `${formatClass(cls)} is higher than typical for a ${riskTolerance} profile`
      );
    } else if (actual < low - 0.05) {
      under.push(cls);
      mismatches.push(
        `${formatClass(cls)} is lower than typical for a ${riskTolerance} profile`
      );
    }
  });

  const top = Object.entries(alloc).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] > 0.6) {
    mismatches.push(
      `${formatClass(top[0])} makes up more than 60% of the portfolio`
    );
  }

  const matchesTolerance = mismatches.length === 0;
  const summary = matchesTolerance
    ? `Your current mix is broadly consistent with a ${riskTolerance || "moderate"} risk stance.`
    : `Your allocation differs from what is commonly seen for a ${riskTolerance || "moderate"} profile in a few areas.`;

  return {
    matchesTolerance,
    mismatches,
    overRepresented: over,
    underRepresented: under,
    summary,
  };
}
