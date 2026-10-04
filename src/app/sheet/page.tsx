"use client";

import { PageHeader } from "@/shared/components/page-header";
import { monthLabel } from "@/shared/lib/dates";
import { useUIStore } from "@/shared/store/ui-store";
import { useExpensesStore } from "@/modules/expenses/store";
import { DailySheet } from "@/modules/sheet/components/daily-sheet";

export default function SheetPage() {
  const month = useUIStore((s) => s.month);
  const hydrated = useExpensesStore((s) => s.hasHydrated);
  if (!hydrated || !month) return null;

  return (
    <div>
      <PageHeader
        index="02"
        overline="Quick entry"
        title="Daily Sheet"
        subtitle={`Spreadsheet-style daily spending for ${monthLabel(month)} — today stays in view.`}
      />
      <DailySheet month={month} />
    </div>
  );
}
