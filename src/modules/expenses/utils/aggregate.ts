import type { Expense } from "../types";
import { dayOfMonth, daysInMonthKey, toISODate, weekdayIndex } from "@/shared/lib/dates";

export function sumAmounts(list: Expense[]): number {
  return list.reduce((s, e) => s + e.amount, 0);
}

export function expensesInMonth(list: Expense[], key: string): Expense[] {
  return list.filter((e) => e.date.startsWith(key));
}

export function categoryTotals(
  list: Expense[]
): Array<{ categoryId: string; total: number; share: number; count: number }> {
  const map = new Map<string, { total: number; count: number }>();
  for (const e of list) {
    const cur = map.get(e.categoryId) ?? { total: 0, count: 0 };
    cur.total += e.amount;
    cur.count += 1;
    map.set(e.categoryId, cur);
  }
  const total = [...map.values()].reduce((s, v) => s + v.total, 0);
  return [...map.entries()]
    .map(([categoryId, v]) => ({
      categoryId,
      total: v.total,
      count: v.count,
      share: total > 0 ? v.total / total : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/** One bucket per day of the given month (index 0 = day 1). */
export function dailyTotalsForMonth(list: Expense[], key: string): number[] {
  const days = daysInMonthKey(key);
  const out = new Array<number>(days).fill(0);
  for (const e of list) {
    if (!e.date.startsWith(key)) continue;
    out[dayOfMonth(e.date) - 1] += e.amount;
  }
  return out;
}

export function lastNDaysSeries(
  list: Expense[],
  n: number,
  end = new Date()
): Array<{ iso: string; total: number }> {
  const byDate = new Map<string, number>();
  for (const e of list) byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.amount);

  const out: Array<{ iso: string; total: number }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const iso = toISODate(d);
    out.push({ iso, total: byDate.get(iso) ?? 0 });
  }
  return out;
}

export function monthSeries(
  list: Expense[],
  endKey: string,
  n: number
): Array<{ key: string; total: number }> {
  const totals = new Map<string, number>();
  for (const e of list) {
    const k = e.date.slice(0, 7);
    totals.set(k, (totals.get(k) ?? 0) + e.amount);
  }
  const [ey, em] = endKey.split("-").map(Number);
  const out: Array<{ key: string; total: number }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ey, em - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, total: totals.get(key) ?? 0 });
  }
  return out;
}

/** Totals by weekday, Monday-first (index 0 = Mon). */
export function weekdayTotals(list: Expense[]): number[] {
  const out = new Array<number>(7).fill(0);
  for (const e of list) out[weekdayIndex(e.date)] += e.amount;
  return out;
}
