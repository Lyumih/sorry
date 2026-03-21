import type { ApologyEntry } from "../types/apologyEntry.ts";
import { dayjs } from "../dayjs.ts";
import type { Dayjs } from "dayjs";

export type PhraseCounts = {
  total: number;
};

export function aggregatePhraseCounts(entries: ApologyEntry[]): PhraseCounts {
  return { total: entries.length };
}

export type DailyPoint = {
  dateKey: string;
  label: string;
  /** Число записей за день (форма «Прости, Извини»). */
  count: number;
};

/** Одна точка на календарный день в диапазоне [start, end] включительно. */
export function buildDailyPoints(
  entries: ApologyEntry[],
  rangeStart: Dayjs,
  rangeEnd: Dayjs,
): DailyPoint[] {
  const byDay = new Map<string, number>();
  let d = rangeStart.startOf("day");
  const last = rangeEnd.endOf("day");
  while (d.isBefore(last) || d.isSame(last, "day")) {
    const key = d.format("YYYY-MM-DD");
    byDay.set(key, 0);
    d = d.add(1, "day");
  }

  for (const e of entries) {
    const key = dayjs(e.createdAt).format("YYYY-MM-DD");
    if (!byDay.has(key)) continue;
    byDay.set(key, byDay.get(key)! + 1);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, count]) => ({
      dateKey,
      label: dayjs(dateKey).format("DD.MM"),
      count,
    }));
}

export function groupEntriesByDay(
  entries: ApologyEntry[],
): { dayKey: string; dayLabel: string; items: ApologyEntry[] }[] {
  const map = new Map<string, ApologyEntry[]>();
  for (const e of entries) {
    const key = dayjs(e.createdAt).format("YYYY-MM-DD");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  const keys = [...map.keys()].sort((a, b) => b.localeCompare(a));
  return keys.map((dayKey) => ({
    dayKey,
    dayLabel: dayjs(dayKey).format("D MMMM YYYY"),
    items: map.get(dayKey)!,
  }));
}
