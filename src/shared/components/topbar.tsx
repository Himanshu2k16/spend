"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Moon, Plus, Settings2, Sun } from "lucide-react";
import { BrandMark } from "@/shared/components/brand-mark";
import { MonthSwitcher } from "@/shared/components/month-switcher";
import { NAV_ITEMS } from "@/shared/lib/nav";
import { currencySymbol } from "@/shared/lib/money";
import { useAuthStore } from "@/shared/store/auth-store";
import { useUIStore } from "@/shared/store/ui-store";
import { useExpensesStore } from "@/modules/expenses/store";

const MONTH_PAGES = new Set(["/", "/sheet", "/analytics", "/budgets"]);

export function Topbar() {
  const pathname = usePathname();
  const openExpenseSheet = useUIStore((s) => s.openExpenseSheet);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const currency = useExpensesStore((s) => s.currency);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const item = NAV_ITEMS.find((n) => n.href === pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/30 bg-surface">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Spend home" className="lg:hidden">
            <BrandMark className="h-8 w-8" />
          </Link>
          <div className="hidden sm:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              Spend
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-none">
              {item?.label ?? "Overview"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="grid h-9 w-9 cursor-pointer place-items-center border border-ink/35 bg-paper text-ink-soft transition hover:border-ink hover:text-ink"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Settings gear for screens without the full sidebar (mobile bottom tray holds 5) */}
          <Link
            href="/settings"
            aria-label="Settings"
            className="grid h-9 w-9 cursor-pointer place-items-center border border-ink/35 bg-paper text-ink-soft transition hover:border-ink hover:text-ink lg:hidden"
          >
            <Settings2 className="h-4 w-4" />
          </Link>

          {MONTH_PAGES.has(pathname) && <MonthSwitcher />}

            <Link
              href="/settings"
              title="Change currency in settings"
              className="hidden h-9 cursor-pointer items-center gap-1.5 border border-ink/35 bg-paper px-3 font-mono text-xs font-semibold transition hover:border-ink md:flex"
            >
              <span className="text-primary">{currencySymbol(currency)}</span>
              {currency}
            </Link>

            {user && (
              <>
                <span
                  title={user.email}
                  className="hidden h-9 items-center border border-ink/35 bg-paper px-3 font-mono text-xs font-semibold lg:flex"
                >
                  {user.name}
                </span>
                <button
                  onClick={() => void logout()}
                  aria-label="Log out"
                  title="Log out"
                  className="grid h-9 w-9 cursor-pointer place-items-center border border-ink/35 bg-paper text-ink-soft transition hover:border-ink hover:text-ink"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}

          <button
            onClick={() => openExpenseSheet()}
            className="btn btn-primary btn-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add expense</span>
          </button>
        </div>
      </div>
    </header>
  );
}
