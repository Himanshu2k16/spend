"use client";

import { Asterisk } from "lucide-react";
import { Panel } from "@/shared/components/panel";
import { addMonthsKey, monthLabel } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { getCategory } from "@/modules/categories";
import { useExpensesStore } from "@/modules/expenses/store";
import { categoryTotals, expensesInMonth, sumAmounts } from "@/modules/expenses/utils/aggregate";

/** The ledger's editorial voice — a serif marginalia note about the month. */
export function InsightStrip({ month }: { month: string }) {
  const expenses = useExpensesStore((s) => s.expenses);
  const currency = useExpensesStore((s) => s.currency);

  const cur = expensesInMonth(expenses, month);
  const prev = expensesInMonth(expenses, addMonthsKey(month, -1));
  const total = sumAmounts(cur);
  const prevTotal = sumAmounts(prev);

  if (cur.length === 0) return null;

  const cats = categoryTotals(cur);
  const top = cats[0];
  const topCat = top ? getCategory(top.categoryId) : null;
  const deltaPct = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

  return (
    <Panel delay={0.1} className="border-l-4 border-l-primary px-5 py-4">
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center border border-accent text-accent">
          <Asterisk className="h-4 w-4" />
        </span>
        <p className="font-display text-[17px] leading-relaxed text-ink">
          You've written{" "}
          <strong className="tnum font-mono text-[15px] font-semibold not-italic">
            {formatMoney(total, currency)}
          </strong>{" "}
          across {cur.length} entr{cur.length === 1 ? "y" : "ies"}
          {deltaPct !== null ? (
            <>
              {" "}
              —{" "}
              <strong
                className={`font-mono text-[15px] font-semibold not-italic ${
                  deltaPct > 0 ? "text-negative" : "text-primary"
                }`}
              >
                {deltaPct === 0 ? "flat" : `${Math.abs(deltaPct)}% ${deltaPct > 0 ? "more" : "less"}`}
              </strong>{" "}
              than {monthLabel(addMonthsKey(month, -1), "long")}
            </>
          ) : null}
          {top && topCat ? (
            <>
              .{" "}
              <strong className="font-semibold not-italic" style={{ color: topCat.color }}>
                {topCat.label}
              </strong>{" "}
              leads the page at {Math.round(top.share * 100)}%.
            </>
          ) : null}
        </p>
      </div>
    </Panel>
  );
}
