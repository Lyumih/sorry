import type { ApologyEntry } from "../types/apologyEntry.ts";
import { dayjs } from "../dayjs.ts";
import type { Dayjs } from "dayjs";

export type Period = "day" | "week" | "month";

export function isInPeriod(
  entry: ApologyEntry,
  anchor: Dayjs,
  period: Period,
): boolean {
  const t = dayjs(entry.createdAt);
  if (period === "day") {
    return t.isSame(anchor, "day");
  }
  if (period === "week") {
    const start = anchor.startOf("week");
    const end = anchor.endOf("week");
    return t.isBetween(start, end, "second", "[]");
  }
  return t.isSame(anchor, "month");
}

export function filterByPeriod(
  entries: ApologyEntry[],
  anchor: Dayjs,
  period: Period,
): ApologyEntry[] {
  return entries.filter((e) => isInPeriod(e, anchor, period));
}

export function getPeriodDayRange(anchor: Dayjs, period: Period): [Dayjs, Dayjs] {
  if (period === "day") {
    return [anchor.startOf("day"), anchor.endOf("day")];
  }
  if (period === "week") {
    return [anchor.startOf("week"), anchor.endOf("week")];
  }
  return [anchor.startOf("month"), anchor.endOf("month")];
}

export function periodLabel(period: Period): string {
  switch (period) {
    case "day":
      return "День";
    case "week":
      return "Неделя";
    case "month":
      return "Месяц";
  }
}

export function formatPeriodTitle(anchor: Dayjs, period: Period): string {
  if (period === "day") {
    return anchor.format("D MMMM YYYY");
  }
  if (period === "week") {
    const [a, b] = getPeriodDayRange(anchor, period);
    return `${a.format("D MMM")} — ${b.format("D MMM YYYY")}`;
  }
  return anchor.format("MMMM YYYY");
}
