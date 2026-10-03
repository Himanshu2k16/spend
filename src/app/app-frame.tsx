"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ExpenseSheet } from "@/modules/expenses/components/expense-sheet";
import { BackdropFX } from "@/shared/components/backdrop-fx";
import { BootScreen } from "@/shared/components/boot-screen";
import { MobileNav } from "@/shared/components/mobile-nav";
import { Sidebar } from "@/shared/components/sidebar";
import { Topbar } from "@/shared/components/topbar";
import { useUIStore } from "@/shared/store/ui-store";
import { useExpensesStore } from "@/modules/expenses/store";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const hydrated = useExpensesStore((s) => s.hasHydrated);
  const openExpenseSheet = useUIStore((s) => s.openExpenseSheet);

  // Press "N" anywhere (outside a field) to log an expense.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable)
        )
          return;
        openExpenseSheet();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openExpenseSheet]);

  return (
    <div className="relative min-h-dvh">
      <BackdropFX />

      <AnimatePresence mode="wait">
        {hydrated ? (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div className="lg:pl-[264px]">
              <Topbar />
              <main className="relative mx-auto w-full max-w-[1240px] px-4 pb-36 pt-6 sm:px-6 lg:px-12 lg:pb-16 lg:pt-9">
                {/* ledger margin rule — like the red line on accounting paper */}
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-4 hidden w-[5px] border-l-2 border-r border-accent/35 lg:left-6 lg:block"
                />
                {children}
              </main>
            </div>
            <Sidebar />
            <MobileNav />
          </motion.div>
        ) : (
          <BootScreen key="boot" />
        )}
      </AnimatePresence>

      <ExpenseSheet />
    </div>
  );
}
