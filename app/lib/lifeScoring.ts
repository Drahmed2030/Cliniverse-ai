// Life Score calculation — Cliniverse Aether 2026
export interface VitalityPillars {
  physical: number;
  mental: number;
  social: number;
  professional: number;
}

export interface LifeScoreResult {
  total: number;
  pillars: VitalityPillars;
  deltaVsYesterday?: number;
  label: "Low" | "Fair" | "Good balance" | "Excellent";
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function computeLifeScore(opts: {
  steps?: number;
  activeMinutes?: number;
  sleepHours?: number;
  casesCompleted: number;
  xpEarned: number;
  streakDays: number;
  mindfulnessMinutes?: number;
  yesterdayTotal?: number;
}): LifeScoreResult {
  const { steps=0, activeMinutes=0, sleepHours, casesCompleted,
          xpEarned, streakDays, mindfulnessMinutes=0, yesterdayTotal } = opts;

  // Physical
  const stepsScore   = clamp((steps / 10000) * 70);
  const activeScore  = clamp((activeMinutes / 45) * 20);
  const sleepScore   = sleepHours ? clamp(((sleepHours - 5) / 3) * 30 + 50) : 40;
  const physical     = clamp(stepsScore * 0.5 + activeScore * 0.3 + (sleepScore - 40) * 0.2 + 20);

  // Mental
  const mindScore    = clamp(mindfulnessMinutes * 3);
  const mental       = clamp(50 + mindScore * 0.3 + (sleepHours ? (sleepHours - 6) * 5 : 0));

  // Professional (from Cliniverse)
  const casesScore   = clamp(casesCompleted * 20);
  const xpScore      = clamp(xpEarned / 8);
  const streakScore  = clamp(streakDays * 8);
  const professional = clamp(casesScore * 0.5 + xpScore * 0.3 + streakScore * 0.2);

  // Social
  const social = 50;

  const total = Math.round(
    physical * 0.30 + mental * 0.25 + professional * 0.30 + social * 0.15
  );

  const label =
    total >= 85 ? "Excellent" :
    total >= 70 ? "Good balance" :
    total >= 50 ? "Fair" : "Low";

  return {
    total: clamp(total),
    pillars: {
      physical: Math.round(physical),
      mental:   Math.round(mental),
      social:   Math.round(social),
      professional: Math.round(professional),
    },
    deltaVsYesterday: yesterdayTotal !== undefined ? total - yesterdayTotal : undefined,
    label,
  };
}
