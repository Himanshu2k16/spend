"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonthsKey, currentMonthKey, monthLabel } from "@/shared/lib/dates";
import { EASE_OUT_EXPO } from "@/shared/lib/motion";
import { useUIStore } from "@/shared/store/ui-store";
import { cn } from "@/shared/lib/utils";

export function MonthSwitcher() {
  const month = useUIStore((s) => s.month);
  const setMonth = useUIStore((s) => s.setMonth);
  if (!month) return <div className="h-10 w-[196px]" aria-hidden />;

  const isCurrent = month === currentMonthKey();

  return (
    <div className="flex items-stretch border border-ink/40 bg-surface">
      <button
        aria-label="Previous month"
        onClick={() => setMonth(addMonthsKey(month, -1))}
        className="grid w-9 cursor-pointer place-items-center border-r border-ink/20 text-ink-soft transition hover:bg-ink/6 hover:text-ink active:bg-ink/12"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="relative flex min-w-[136px] items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={month}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26, ease: EASE_OUT_EXPO }}
            className="tnum block py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em]"
          >
            {monthLabel(month)}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        aria-label="Next month"
        onClick={() => setMonth(addMonthsKey(month, 1))}
        disabled={isCurrent}
        className={cn(
          "grid w-9 place-items-center border-l border-ink/20 transition",
          isCurrent
            ? "opacity-30"
            : "cursor-pointer text-ink-soft hover:bg-ink/6 hover:text-ink active:bg-ink/12"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {!isCurrent && (
        <button
          onClick={() => setMonth(currentMonthKey())}
          className="cursor-pointer border-l border-ink/20 bg-accent/10 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent transition hover:bg-accent/20"
        >
          Today
        </button>
      )}
    </div>
  );
}
