"use client";

import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

/** Ruled ledger panel — sharp corners, hairline border, never a floating card. */
export function Panel({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay }}
      className={cn("border border-ink/20 bg-surface", className)}
    >
      {children}
    </motion.section>
  );
}

/** Panel caption strip: mono label on a hairline rule. */
export function PanelHeader({
  label,
  right,
}: {
  label: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/15 bg-surface-deep/50 px-4 py-2.5 sm:px-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      {right}
    </div>
  );
}
