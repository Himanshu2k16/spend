"use client";

import { MotionConfig } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { currentMonthKey } from "@/shared/lib/dates";
import { api, ApiError } from "@/shared/lib/api";
import { useAuthStore } from "@/shared/store/auth-store";
import { useUIStore } from "@/shared/store/ui-store";
import { useExpensesStore } from "@/modules/expenses/store";

/** Boots a session: who am I → load my ledger → open on the current month. */
export function Providers({ children }: { children: React.ReactNode }) {
  const refreshKey = useAuthStore((s) => s.refreshKey);
  const bootRan = useRef(false);

  const runBoot = useCallback(async () => {
    const auth = useAuthStore.getState();
    const expenses = useExpensesStore.getState();
    auth.setBootError(null);
    auth.setStatus("loading");

    try {
      const me = await api.get<{ user: { id: string; email: string; name: string; currency: string } }>(
        "/api/auth/me"
      );
      auth.setUser(me.user);

      const [expensesList, budgets, prefs] = await Promise.all([
        api.get<import("@/modules/expenses/types").Expense[]>("/api/expenses"),
        api.get<{ budgets: Record<string, number>; overallBudget: number | null }>("/api/settings/budgets"),
        api.get<{ currency: string }>("/api/settings/preferences"),
      ]);

      expenses.loadFromServer({
        expenses: expensesList,
        budgets: budgets.budgets,
        overallBudget: budgets.overallBudget,
        currency: prefs.currency,
      });
      useUIStore.getState().setMonth(currentMonthKey());
      auth.setStatus("authed");
    } catch (err) {
      expenses.setHasHydrated(false);
      if (err instanceof ApiError && err.status === 401) {
        auth.setUser(null);
        auth.setStatus("anon");
      } else {
        auth.setStatus("error");
        auth.setBootError(err instanceof Error ? err.message : "Could not reach the server");
      }
    }
  }, []);

  useEffect(() => {
    // React strict mode / re-renders: run once per refreshKey change.
    if (bootRan.current && refreshKey === 0) return;
    bootRan.current = true;
    void runBoot();
  }, [refreshKey, runBoot]);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
