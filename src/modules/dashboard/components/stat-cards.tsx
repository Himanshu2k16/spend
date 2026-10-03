"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Flame, Target, Wallet, type LucideIcon } from "lucide-react";
import { DeltaChip } from "@/shared/components/delta-chip";
import { EASE_OUT_EXPO } from "@/shared/lib/motion";
import { addMonthsKey, currentMonthKey, daysInMonthKey, monthLabel } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { getCategory } from "@/modules/categories";
import { totalOverallBudget, useExpensesStore } from "@/modules/expenses/store";
import { categoryTotals, expensesInMonth, sumAmounts } from "@/modules/expenses/utils/aggregate";

/** One ruled summary strip — four ledger cells, not four floating cards. */
export function StatCards({ month }: { month: string }) {
  const expenses = useExpensesStore((s) => s.expenses);
  const currency = useExpensesStore((s) => s.currency);
  const budgets = useExpensesStore((s) => s.budgets);
  const overallBudget = useExpensesStore((s) => s.overallBudget);

  const cur = expensesInMonth(expenses, month);
  const prev = expensesInMonth(expenses, addMonthsKey(month, -1));
  const total = sumAmounts(cur);
  const prevTotal = sumAmounts(prev);
  const delta = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null;

  const isCurrent = month === currentMonthKey();
  const daysElapsed = isCurrent ? new Date().getDate() : daysInMonthKey(month);
  const dailyAvg = total / Math.max(1, daysElapsed);

  const cats = categoryTotals(cur);
  const top = cats[0];
  const topCat = top ? getCategory(top.categoryId) : null;

  const budget = totalOverallBudget({ budgets, overallBudget });
  const left = Math.max(0, budget - total);
  const usedPct = budget > 0 ? Math.min(1, total / budget) : null;

  return (
    <div className="grid grid-cols-2 gap-px border border-ink/20 bg-ink/15 xl:grid-cols-4">
      <Cell label={`Spent · ${monthLabel(month, "short")}`} icon={Wallet} delay={0}>
        <p className="tnum font-mono text-[26px] font-semibold leading-tight tracking-tight">
          {formatMoney(total, currency)}
        </p>
        <div className="mt-2.5">
          <DeltaChip
            value={delta}
            invert
            suffix={`vs ${monthLabel(addMonthsKey(month, -1), "short")}`}
          />
        </div>
      </Cell>

      <Cell label="Daily average" icon={CalendarDays} delay={0.06}>
        <p className="tnum font-mono text-[26px] font-semibold leading-tight tracking-tight">
          {formatMoney(dailyAvg, currency)}
        </p>
        <p className="tnum mt-2.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          across {daysElapsed} day{daysElapsed === 1 ? "" : "s"}
        </p>
      </Cell>

      <Cell label="Top category" icon={Flame} delay={0.12}>
        {top && topCat ? (
          <>
            <div className="flex items-center gap-2">
              <topCat.icon className="h-[18px] w-[18px] shrink-0" style={{ color: topCat.color }} />
              <span className="truncate text-[15px] font-semibold">{topCat.label}</span>
            </div>
            <p className="tnum mt-1 font-mono text-lg font-semibold">
              {formatMoney(top.total, currency)}
            </p>
            <div className="mt-2.5 h-1.5 border border-ink/25 bg-paper">
              <div
                className="h-full"
                style={{ width: `${Math.round(top.share * 100)}%`, background: topCat.color }}
              />
            </div>
            <p className="tnum mt-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              {Math.round(top.share * 100)}% of month
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-soft">No spending recorded this month yet.</p>
        )}
      </Cell>

      <Cell label="Budget left" icon={Target} delay={0.18}>
        {budget > 0 && usedPct !== null ? (
          <>
            <p
              className={cn(
                "tnum font-mono text-[26px] font-semibold leading-tight tracking-tight",
                left <= 0 && "text-negative"
              )}
            >
              {formatMoney(left, currency)}
            </p>
            <div className="mt-2.5 h-1.5 border border-ink/25 bg-paper">
              <div
                className={cn(
                  "h-full",
                  usedPct >= 1 ? "bg-negative" : usedPct > 0.8 ? "bg-caution" : "bg-primary"
                )}
                style={{ width: `${Math.round(usedPct * 100)}%` }}
              />
            </div>
            <p className="tnum mt-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              {Math.round(usedPct * 100)}% of{" "}
              {formatMoney(budget, currency, { decimals: false })} used
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-soft">No monthly budget yet.</p>
            <Link
              href="/budgets"
              className="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary underline underline-offset-2"
            >
              Set one now
            </Link>
          </>
        )}
      </Cell>
    </div>
  );
}

function Cell({
  label,
  icon: Icon,
  delay,
  children,
}: {
  label: string;
  icon: LucideIcon;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay }}
      className="bg-surface p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="label-mono">{label}</p>
        <Icon className="h-4 w-4 text-ink-soft" />
      </div>
      {children}
    </motion.div>
  );
}
