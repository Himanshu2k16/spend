"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { NAV_ITEMS } from "@/shared/lib/nav";
import { cn } from "@/shared/lib/utils";
import { useUIStore } from "@/shared/store/ui-store";

/** Mobile tab bar — ink-bordered tray with a square add stamp. */
export function MobileNav() {
  const pathname = usePathname();
  const openExpenseSheet = useUIStore((s) => s.openExpenseSheet);
  // Keep the tray at 5 targets: Settings stays reachable via the topbar gear.
  const mobileItems = NAV_ITEMS.filter((item) => item.href !== "/settings");

  return (
    <div
      className="mobile-rail fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
    >
      <motion.button
        onClick={() => openExpenseSheet()}
        aria-label="Add expense"
        whileTap={{ scale: 0.92 }}
        className="absolute -top-8 right-5 z-10 grid h-14 w-14 cursor-pointer place-items-center border border-ink bg-primary text-paper shadow-hard"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <nav
        aria-label="Primary mobile"
        className="flex items-stretch justify-between border-2 border-ink bg-surface"
      >
        {mobileItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-[58px] cursor-pointer flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors duration-150",
                active ? "bg-primary/10 text-primary" : "text-ink-faint hover:text-ink-soft"
              )}
            >
              <Icon className="h-[19px] w-[19px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
