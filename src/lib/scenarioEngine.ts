export type ScenarioType = "income_change" | "market_shift" | "lump_sum";

export interface ScenarioInput {
  type: ScenarioType;
  incomeChangePct?: number;
  marketShiftPct?: number;
  lumpSumAmount?: number;
  lumpSumMonth?: number;
  horizonMonths: number;
  monthlyContribution?: number;
}

export interface SimulationPoint {
  month: number;
  baseline: number;
  scenario: number;
}

export interface SimulationResult {
  points: SimulationPoint[];
  baselineEnd: number;
  scenarioEnd: number;
  delta: number;
  deltaPct: number;
  goalImpacts: {
    id: string;
    name: string;
    baselineProgress: number;
    scenarioProgress: number;
    statusChange: string;
  }[];
}

const MARKET_SENSITIVITY: Record<string, number> = {
  equity: 1.0,
  etf: 0.95,
  mutual_fund: 0.85,
  reit: 0.7,
  invit: 0.65,
  gold: 0.25,
  bond: -0.15,
  fixed_deposit: 0.0,
  alternative: 0.8,
  other: 0.5,
};

const ASSUMED_ANNUAL_RETURN = 0.09;

export function runSimulation(
  currentValue: number,
  holdings: { asset_class: string; current_value: number }[],
  goals: { id: string; name: string; target_amount: number; current_amount: number }[],
  input: ScenarioInput
): SimulationResult {
  const months = Math.max(1, input.horizonMonths);
  const monthlyRate = ASSUMED_ANNUAL_RETURN / 12;
  const baseContribution = input.monthlyContribution || 0;

  let scenarioStartValue = currentValue;

  if (input.type === "market_shift" && input.marketShiftPct != null) {
    const total = holdings.reduce((s, h) => s + h.current_value, 0) || 1;
    let shocked = 0;
    holdings.forEach((h) => {
      const sensitivity = MARKET_SENSITIVITY[h.asset_class] ?? 0.5;
      const classShock = 1 + (input.marketShiftPct! / 100) * sensitivity;
      shocked += h.current_value * classShock;
    });
    scenarioStartValue = shocked;
  }

  if (input.type === "lump_sum" && input.lumpSumAmount && (input.lumpSumMonth ?? 0) === 0) {
    scenarioStartValue += input.lumpSumAmount;
  }

  let scenarioContribution = baseContribution;
  if (input.type === "income_change" && input.incomeChangePct != null) {
    scenarioContribution = baseContribution * (1 + input.incomeChangePct / 100);
  }

  const points: SimulationPoint[] = [];
  let baseline = currentValue;
  let scenario = scenarioStartValue;

  for (let m = 0; m <= months; m++) {
    points.push({
      month: m,
      baseline: Math.round(baseline),
      scenario: Math.round(scenario),
    });

    baseline = baseline * (1 + monthlyRate) + baseContribution;
    scenario = scenario * (1 + monthlyRate) + scenarioContribution;

    if (
      input.type === "lump_sum" &&
      input.lumpSumAmount &&
      input.lumpSumMonth != null &&
      m + 1 === input.lumpSumMonth
    ) {
      scenario += input.lumpSumAmount;
    }
  }

  const baselineEnd = points[points.length - 1].baseline;
  const scenarioEnd = points[points.length - 1].scenario;
  const delta = scenarioEnd - baselineEnd;
  const deltaPct = baselineEnd ? (delta / baselineEnd) * 100 : 0;

  const goalImpacts = goals.map((g) => {
    const baselineProgress = Math.min(100, (baselineEnd / g.target_amount) * 100);
    const scenarioProgress = Math.min(100, (scenarioEnd / g.target_amount) * 100);
    let statusChange = "similar";
    if (scenarioProgress - baselineProgress > 5) statusChange = "improved";
    else if (baselineProgress - scenarioProgress > 5) statusChange = "worsened";
    return {
      id: g.id,
      name: g.name,
      baselineProgress: +baselineProgress.toFixed(1),
      scenarioProgress: +scenarioProgress.toFixed(1),
      statusChange,
    };
  });

  return {
    points,
    baselineEnd,
    scenarioEnd,
    delta: Math.round(delta),
    deltaPct: +deltaPct.toFixed(1),
    goalImpacts,
  };
}
