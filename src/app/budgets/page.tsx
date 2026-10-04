"use client";

import { PageHeader } from "@/shared/components/page-header";
import { useUIStore } from "@/shared/store/ui-store";
import { useExpensesStore } from "@/modules/expenses/store";
import { monthLabel } from "@/shared/lib/dates";
import { BudgetBoard } from "@/modules/budgets/components/budget-board";

export default function BudgetsPage() {
  const month = useUIStore((s) => s.month);
  const hydrated = useExpensesStore((s) => s.hasHydrated);
  const expenses = useExpensesStore((s) => s.expenses);
  if (!hydrated || !month) return null;

  return (
    <div>
      <PageHeader
        index="05"
        overline="Limits"
        title="Budgets"
        subtitle={`Monthly envelopes, paced against ${monthLabel(month)}`}
      />
      <BudgetBoard month={month} expenses={expenses} />
    </div>
  );
}
