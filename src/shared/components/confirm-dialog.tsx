"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { springSnappy } from "@/shared/lib/motion";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink/45"
            onClick={onClose}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={springSnappy}
            className="relative w-full max-w-sm border-2 border-ink bg-surface p-6 shadow-lift"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center border-2 border-negative text-negative">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm text-ink-soft">{body}</p>
            <div className="mt-6 flex gap-2.5">
              <button onClick={onClose} className="btn btn-ghost flex-1 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="btn btn-danger flex-1 cursor-pointer"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
