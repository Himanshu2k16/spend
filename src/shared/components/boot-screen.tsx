"use client";

import { motion } from "framer-motion";
import { springSnappy } from "@/shared/lib/motion";
import { BrandMark } from "./brand-mark";

export function BootScreen() {
  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 grid place-items-center bg-paper"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 1.7, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={springSnappy}
        >
          <BrandMark className="h-16 w-16" />
        </motion.div>
        <div className="flex flex-col items-center gap-2.5">
          <p className="font-display text-3xl font-semibold tracking-tight">Spend</p>
          <p className="label-mono">
            opening the ledger<span className="animate-blink">_</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
