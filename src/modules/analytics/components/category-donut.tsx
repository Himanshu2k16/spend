"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { EmptyState } from "@/shared/components/empty-state";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { ChartPie } from "lucide-react";
import { springSoft } from "@/shared/lib/motion";
import { formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { getCategory } from "@/modules/categories";
import { useExpensesStore } from "@/modules/expenses/store";
import { categoryTotals } from "@/modules/expenses/utils/aggregate";
import type { Expense } from "@/modules/expenses/types";

const SIZE = 230;
const STROKE = 27;
const R = (SIZE - STROKE) / 2 - 6;
const C = 2 * Math.PI * R;
const CX = SIZE / 2;
const CY = SIZE / 2;

export function CategoryDonutCard({
  expenses,
  className,
}: {
  expenses: Expense[];
  className?: string;
}) {
  const currency = useExpensesStore((s) => s.currency);
  const [active, setActive] = useState<number | null>(null);

  const data = categoryTotals(expenses);
  const total = data.reduce((s, d) => s + d.total, 0);

  let acc = 0;
  const segments = data.map((d) => {
    const len = d.share * C;
    const seg = { ...d, offset: acc };
    acc += len;
    return seg;
  });

  const activeSeg = active !== null ? segments[active] : null;
  const activeCat = activeSeg ? getCategory(activeSeg.categoryId) : null;

  return (
    <Panel className={cn(className)}>
      <PanelHeader label="Where it goes — category share" />
      {data.length === 0 ? (
        <EmptyState
          icon={ChartPie}
          title="No category data"
          body="Add a few expenses this month and the breakdown will bloom here."
        />
      ) : (
        <div className="flex flex-col items-center gap-7 p-5 sm:p-6 md:flex-row md:gap-8">
          <div className="relative h-[230px] w-[230px] shrink-0">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full -rotate-90">
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="rgba(33,29,22,0.1)"
                strokeWidth={STROKE}
              />
              {segments.map((seg, i) => {
                const cat = getCategory(seg.categoryId);
                const isActive = active === i;
                const dim = active !== null && !isActive;
                return (
                  <motion.circle
                    key={seg.categoryId}
                    cx={CX}
                    cy={CY}
                    r={R}
                    fill="none"
                    stroke={cat.color}
                    strokeLinecap="butt"
                    initial={{
                      strokeDashoffset: -seg.offset,
                      opacity: 0,
                      strokeDasharray: `0 ${C}`,
                    }}
                    animate={{
                      strokeDashoffset: -seg.offset,
                      opacity: dim ? 0.25 : 1,
                      strokeWidth: isActive ? STROKE + 7 : STROKE,
                      strokeDasharray: `${Math.max(0, seg.share * C - 2)} ${C}`,
                    }}
                    transition={{ ...springSoft, delay: i * 0.07 }}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    className="cursor-pointer"
                    style={{
                      pointerEvents: "stroke",
                      transition: "stroke-width 0.2s ease",
                    }}
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 grid place-items-center">
              <AnimatePresence mode="wait" initial={false}>
                {activeSeg && activeCat ? (
                  <motion.div
                    key={activeSeg.categoryId}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.16 }}
                    className="text-center"
                  >
                    <activeCat.icon
                      className="mx-auto mb-1.5 h-6 w-6"
                      style={{ color: activeCat.color }}
                    />
                    <p className="tnum font-mono text-xl font-semibold">
                      {formatMoney(activeSeg.total, currency)}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                      {activeCat.label} · {Math.round(activeSeg.share * 100)}%
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="total"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.16 }}
                    className="text-center"
                  >
                    <p className="label-mono mb-1">Total</p>
                    <p className="tnum font-mono text-2xl font-semibold">
                      {formatMoney(total, currency)}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                      {data.length} categories
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <ul className="w-full min-w-0 space-y-3">
            {segments.map((seg, i) => {
              const cat = getCategory(seg.categoryId);
              const dim = active !== null && active !== i;
              return (
                <li
                  key={seg.categoryId}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className={cn("cursor-default transition-opacity duration-150", dim && "opacity-40")}
                >
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0"
                        style={{ background: cat.color }}
                        aria-hidden
                      />
                      <span className="truncate font-medium">{cat.label}</span>
                      <span className="tnum shrink-0 font-mono text-xs text-ink-faint">
                        {Math.round(seg.share * 100)}%
                      </span>
                    </span>
                    <span className="tnum shrink-0 font-mono text-[13px] font-semibold">
                      {formatMoney(seg.total, currency)}
                    </span>
                  </div>
                  <div className="h-1 border border-ink/15 bg-paper">
                    <motion.div
                      className="h-full"
                      style={{ background: cat.color, transformOrigin: "left" }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: seg.share }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Panel>
  );
}
