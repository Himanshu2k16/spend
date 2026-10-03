"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, useRef } from "react";
import { currentMonthKey } from "@/shared/lib/dates";
import { useUIStore } from "@/shared/store/ui-store";
import { useExpensesStore } from "@/modules/expenses/store";

/** Boots persisted data, seeds first-run demo content and resolves the month. */
export function Providers({ children }: { children: React.ReactNode }) {
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    Promise.resolve(useExpensesStore.persist.rehydrate()).then(() => {
      const s = useExpensesStore.getState();
      if (!s.seeded && s.expenses.length === 0) s.loadDemoData();
      useUIStore.getState().setMonth(currentMonthKey());
      s.setHasHydrated(true);
    });
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
