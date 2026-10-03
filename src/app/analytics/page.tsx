"use client";

import { PageHeader } from "@/shared/components/page-header";
import { useUIStore } from "@/shared/store/ui-store";
import { useExpensesStore } from "@/modules/expenses/store";
import { expensesInMonth } from "@/modules/expenses/utils/aggregate";
import { monthLabel } from "@/shared/lib/dates";
import { CategoryDonutCard } from "@/modules/analytics/components/category-donut";
import { TrendCard } from "@/modules/analytics/components/trend-chart";
import { WeekdayCard } from "@/modules/analytics/components/weekday-chart";
import { TopExpensesCard } from "@/modules/analytics/components/top-expenses";

export default function AnalyticsPage() {
  const month = useUIStore((s) => s.month);
  const hydrated = useExpensesStore((s) => s.hasHydrated);
  const expenses = useExpensesStore((s) => s.expenses);
  if (!hydrated || !month) return null;

  const cur = expensesInMonth(expenses, month);

  return (
    <div className="space-y-5">
      <PageHeader
        index="03"
        overline="Deep dive"
        title="Analytics"
        subtitle={`Patterns and breakdowns for ${monthLabel(month)}`}
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <CategoryDonutCard expenses={cur} className="lg:col-span-3" />
        <TrendCard month={month} className="lg:col-span-2" />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <WeekdayCard expenses={cur} className="lg:col-span-2" />
        <TopExpensesCard expenses={cur} className="lg:col-span-3" />
      </div>
    </div>
  );
}
