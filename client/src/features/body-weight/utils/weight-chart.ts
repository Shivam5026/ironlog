import type { BodyWeightEntry } from "../types/body-weight.types";

export interface WeightChartPoint {
  date: string;
  weight: number;
}

export type WeightChartRange = "7d" | "30d" | "all";

export interface WeightChartSummary {
  current: number | null;
  start: number | null;
  change: number | null;
}

function toChartPoint(entry: BodyWeightEntry): WeightChartPoint {
  return {
    date: entry.recordedAt,
    weight: Number(entry.weight),
  };
}

export function filterByRange(
  items: BodyWeightEntry[],
  range: WeightChartRange,
): BodyWeightEntry[] {
  if (range === "all") return items;

  const now = new Date();
  const days = range === "7d" ? 7 : 30;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return items.filter((item) => new Date(item.recordedAt) >= cutoff);
}

export function toChartData(items: BodyWeightEntry[]): WeightChartPoint[] {
  return items
    .slice()
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map(toChartPoint);
}

export function computeSummary(items: BodyWeightEntry[]): WeightChartSummary {
  if (items.length === 0) {
    return { current: null, start: null, change: null };
  }

  const sorted = items
    .slice()
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  const start = Number(sorted[0].weight);
  const current = Number(sorted[sorted.length - 1].weight);

  return {
    current,
    start,
    change: items.length >= 2 ? Math.round((current - start) * 100) / 100 : null,
  };
}

export function formatChartDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatChartWeight(weight: number) {
  return `${weight} kg`;
}
