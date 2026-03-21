import type { ApologyEntry } from "../types/apologyEntry.ts";
import { dayjs } from "../dayjs.ts";
import type { Dayjs } from "dayjs";

export type PhraseCounts = {
  total: number;
  prosti: number;
  izvini: number;
  both: number;
};

export function aggregatePhraseCounts(entries: ApologyEntry[]): PhraseCounts {
  const counts: PhraseCounts = { total: entries.length, prosti: 0, izvini: 0, both: 0 };
  for (const e of entries) {
    if (e.phraseType === "prosti") counts.prosti += 1;
    else if (e.phraseType === "izvini") counts.izvini += 1;
    else counts.both += 1;
  }
  return counts;
}

export type DailyPoint = {
  dateKey: string;
  label: string;
  prosti: number;
  izvini: number;
  both: number;
};

/** Одна точка на календарный день в диапазоне [start, end] включительно. */
export function buildDailyPoints(
  entries: ApologyEntry[],
  rangeStart: Dayjs,
  rangeEnd: Dayjs,
): DailyPoint[] {
  const byDay = new Map<string, { prosti: number; izvini: number; both: number }>();
  let d = rangeStart.startOf("day");
  const last = rangeEnd.endOf("day");
  while (d.isBefore(last) || d.isSame(last, "day")) {
    const key = d.format("YYYY-MM-DD");
    byDay.set(key, { prosti: 0, izvini: 0, both: 0 });
    d = d.add(1, "day");
  }

  for (const e of entries) {
    const key = dayjs(e.createdAt).format("YYYY-MM-DD");
    if (!byDay.has(key)) continue;
    const row = byDay.get(key)!;
    if (e.phraseType === "prosti") row.prosti += 1;
    else if (e.phraseType === "izvini") row.izvini += 1;
    else row.both += 1;
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, v]) => ({
      dateKey,
      label: dayjs(dateKey).format("DD.MM"),
      prosti: v.prosti,
      izvini: v.izvini,
      both: v.both,
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
