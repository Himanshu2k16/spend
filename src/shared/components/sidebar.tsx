"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/shared/components/brand-mark";
import { monthLabel } from "@/shared/lib/dates";
import { NAV_ITEMS } from "@/shared/lib/nav";
import { formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { useUIStore } from "@/shared/store/ui-store";
import { expensesInMonth, sumAmounts } from "@/modules/expenses/utils/aggregate";
import { totalOverallBudget, useExpensesStore } from "@/modules/expenses/store";

export function Sidebar() {
  const pathname = usePathname();
  const month = useUIStore((s) => s.month);
  const expenses = useExpensesStore((s) => s.expenses);
  const budgets = useExpensesStore((s) => s.budgets);
  const overallBudget = useExpensesStore((s) => s.overallBudget);
  const currency = useExpensesStore((s) => s.currency);

  const monthTotal = month ? sumAmounts(expensesInMonth(expenses, month)) : 0;
  const budget = totalOverallBudget({ budgets, overallBudget });
  const pct = budget > 0 ? Math.min(1, monthTotal / budget) : 0;
  const over = budget > 0 && monthTotal > budget;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-ink/25 bg-surface px-5 py-7 lg:flex">
      <Link href="/" className="mb-9 flex items-center gap-3 px-1">
        <BrandMark className="h-10 w-10" />
        <span>
          <span className="block font-display text-[22px] font-semibold leading-none tracking-tight">
            Spend
          </span>
          <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            personal ledger
          </span>
        </span>
      </Link>

      <nav className="flex flex-col" aria-label="Primary">
        {NAV_ITEMS.map((item, i) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex cursor-pointer items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition-colors duration-150",
                active
                  ? "border-primary bg-primary/8 font-semibold text-primary"
                  : "border-transparent text-ink-soft hover:border-ink/30 hover:text-ink"
              )}
            >
              <span
                className={cn(
                  "tnum font-mono text-[10px]",
                  active ? "text-primary" : "text-ink-faint"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <Icon className="h-[17px] w-[17px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border border-ink/25 bg-paper p-4">
        <p className="label-mono">{month ? monthLabel(month, "short") : "This month"} · spent</p>
        <p className="tnum mt-2 font-mono text-xl font-semibold tracking-tight">
          {formatMoney(monthTotal, currency)}
        </p>
        {budget > 0 ? (
          <>
            <div className="mt-3 h-1.5 border border-ink/30 bg-surface">
              <div
                className={cn("h-full", over ? "bg-negative" : "bg-primary")}
                style={{ width: `${Math.round(pct * 100)}%` }}
              />
            </div>
            <p className="tnum mt-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
              {Math.round(pct * 100)}% of {formatMoney(budget, currency, { decimals: false })}
            </p>
          </>
        ) : (
          <p className="mt-2 text-[11px] text-ink-faint">
            No budget yet —{" "}
            <Link href="/budgets" className="text-primary underline underline-offset-2">
              set one
            </Link>
          </p>
        )}
      </div>

      <p className="mt-5 px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        Local-first · v1.0.0
      </p>
    </aside>
  );
}
