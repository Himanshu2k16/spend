"use client";

import { useUIStore } from "@/shared/store/ui-store";
import { useExpensesStore } from "@/modules/expenses/store";
import { monthLabel } from "@/shared/lib/dates";
import { PageHeader } from "@/shared/components/page-header";
import { StatCards } from "@/modules/dashboard/components/stat-cards";
import { PulseChart } from "@/modules/dashboard/components/pulse-chart";
import { BudgetRings } from "@/modules/dashboard/components/budget-rings";
import { RecentList } from "@/modules/dashboard/components/recent-list";
import { GlanceCard } from "@/modules/dashboard/components/glance-card";
import { InsightStrip } from "@/modules/dashboard/components/insight-strip";

export default function DashboardPage() {
  const month = useUIStore((s) => s.month);
  const hydrated = useExpensesStore((s) => s.hasHydrated);
  if (!hydrated || !month) return null;

  return (
    <div className="space-y-5">
      <PageHeader
        index="01"
        overline="Overview"
        title="Dashboard"
        subtitle={monthLabel(month)}
      />
      <InsightStrip month={month} />
      <StatCards month={month} />
      <div className="grid gap-5 lg:grid-cols-3">
        <PulseChart className="lg:col-span-2" />
        <BudgetRings month={month} />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <RecentList className="lg:col-span-2" />
        <GlanceCard month={month} />
      </div>
    </div>
  );
}
