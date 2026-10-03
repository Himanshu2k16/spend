"use client";

import { Activity, Gauge, ReceiptText, Rocket } from "lucide-react";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { WEEKDAY_LABELS, friendlyDate, weekdayIndex } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { useExpensesStore } from "@/modules/expenses/store";
import { expensesInMonth } from "@/modules/expenses/utils/aggregate";

/** Compact ruled metrics strip for the dashboard side column. */
export function GlanceCard({ month, className }: { month: string; className?: string }) {
  const expenses = useExpensesStore((s) => s.expenses);
  const currency = useExpensesStore((s) => s.currency);
  const cur = expensesInMonth(expenses, month);

  const count = cur.length;
  const largest = cur.reduce<null | (typeof cur)[number]>(
    (best, e) => (!best || e.amount > best.amount ? e : best),
    null
  );
  const avg = count > 0 ? cur.reduce((s, e) => s + e.amount, 0) / count : 0;
  const busiest = (() => {
    const days = new Map<string, number>();
    for (const e of cur) days.set(e.date, (days.get(e.date) ?? 0) + 1);
    let best: { iso: string; n: number } | null = null;
    for (const [iso, n] of days) if (!best || n > best.n) best = { iso, n };
    return best;
  })();

  const rows = [
    {
      icon: ReceiptText,
      label: "Transactions",
      value: count === 0 ? "—" : `${count}`,
      sub: count === 0 ? "this month" : "logged this month",
    },
    {
      icon: Rocket,
      label: "Biggest hit",
      value: largest ? formatMoney(largest.amount, currency) : "—",
      sub: largest ? friendlyDate(largest.date) : "no purchases yet",
    },
    {
      icon: Gauge,
      label: "Avg per entry",
      value: count === 0 ? "—" : formatMoney(avg, currency),
      sub: "spend per transaction",
    },
    {
      icon: Activity,
      label: "Busiest day",
      value: busiest ? WEEKDAY_LABELS[weekdayIndex(busiest.iso)] : "—",
      sub: busiest ? `${busiest.n} transaction${busiest.n === 1 ? "" : "s"}` : "quiet month",
    },
  ];

  return (
    <Panel className={className}>
      <PanelHeader label="At a glance" />
      <div className="grid grid-cols-2 gap-px bg-ink/12">
        {rows.map((row) => (
          <div key={row.label} className="bg-surface p-4">
            <div className="mb-2 flex items-center gap-2">
              <row.icon className="h-3.5 w-3.5 text-primary" />
              <span className="label-mono">{row.label}</span>
            </div>
            <p className="tnum font-mono text-lg font-semibold leading-none">{row.value}</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              {row.sub}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
