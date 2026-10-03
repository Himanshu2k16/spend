"use client";

import { useEffect, useState } from "react";
import { Database, Download, ShieldCheck, Trash2, Wallet } from "lucide-react";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { Dropdown } from "@/shared/components/dropdown";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { BrandMark } from "@/shared/components/brand-mark";
import { todayISO } from "@/shared/lib/dates";
import { currencyName, currencySymbol, type CurrencyCode } from "@/shared/lib/money";
import { getUsdRates, type RateTable } from "@/shared/lib/rates";
import { cn } from "@/shared/lib/utils";
import { useExpensesStore } from "@/modules/expenses/store";

export function SettingsPanels() {
  const currency = useExpensesStore((s) => s.currency);
  const loadDemoData = useExpensesStore((s) => s.loadDemoData);
  const clearAll = useExpensesStore((s) => s.clearAll);
  const expenses = useExpensesStore((s) => s.expenses);

  const [confirmDemo, setConfirmDemo] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [demoDone, setDemoDone] = useState(false);
  const [converting, setConverting] = useState(false);
  const [ratesInfo, setRatesInfo] = useState<RateTable | null>(null);

  // Load the full currency list (from the free rates API) for the dropdown.
  useEffect(() => {
    let mounted = true;
    getUsdRates().then((table) => {
      if (mounted) setRatesInfo(table);
    });
    return () => {
      mounted = false;
    };
  }, []);

  /** Switch currency: fetch live rates once, then re-denominate every stored amount. */
  async function handleCurrencyChange(next: CurrencyCode) {
    if (converting || next === currency) return;
    setConverting(true);
    try {
      const table = await getUsdRates();
      useExpensesStore.getState().applyCurrency(next, table);
      setRatesInfo(table);
    } finally {
      setConverting(false);
    }
  }

  function exportJSON() {
    const s = useExpensesStore.getState();
    const payload = {
      app: "spend",
      version: 1,
      exportedAt: new Date().toISOString(),
      currency: s.currency,
      overallBudget: s.overallBudget,
      budgets: s.budgets,
      expenses: s.expenses,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spend-export-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <PanelHeader label="Display — currency" />
        <div className="space-y-4 p-5">
          <div>
            <p className="label-mono mb-2">
              Display currency — {ratesInfo ? `${ratesInfo.codes.length} available` : "loading…"}
            </p>
            <Dropdown
              value={currency}
              onChange={handleCurrencyChange}
              searchable
              ariaLabel="Display currency"
              emptyLabel="No currency matches"
              options={
                ratesInfo
                  ? ratesInfo.codes.map((code) => ({
                      value: code,
                      label: `${code}${currencySymbol(code) !== code ? ` ${currencySymbol(code)}` : ""}`,
                      hint: currencyName(code),
                    }))
                  : [{ value: currency, label: currency, hint: "loading currencies…" }]
              }
            />
          </div>

          <div className="flex items-center justify-between gap-3 border border-ink/20 bg-paper px-4 py-3">
            <div className="min-w-0">
              <p className="tnum font-mono text-sm font-semibold">
                {currencySymbol(currency)} {currency}
                <span className="ml-2 font-normal text-ink-faint">· {currencyName(currency)}</span>
              </p>
              {ratesInfo ? (
                <p className="label-mono mt-1">
                  1 USD = {ratesInfo.usdTo[currency]?.toFixed(2) ?? "?"} {currency} ·{" "}
                  {ratesInfo.live ? "live · er-api.com" : "offline estimate"}
                </p>
              ) : null}
            </div>
            {converting && <span className="stamp shrink-0 text-accent">converting…</span>}
          </div>

          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Switching re-denominates every amount — expenses, budgets, limits — using the fetched
            rates. INR is the default.
          </p>
        </div>
      </Panel>

      <Panel>
        <PanelHeader label="Your data — sample, export & wipe" />
        <div className="divide-y divide-ink/12">
          <DataButton
            icon={Database}
            title="Load sample data"
            body="~100 realistic expenses across the last 3 months"
            actionLabel={demoDone ? "Filed" : "Load"}
            done={demoDone}
            onClick={() => setConfirmDemo(true)}
          />
          <DataButton
            icon={Download}
            title="Export as JSON"
            body={`${expenses.length} expenses · budgets · settings`}
            actionLabel="Export"
            onClick={exportJSON}
          />
          <DataButton
            icon={Trash2}
            title="Clear everything"
            body="Deletes all expenses and budgets from this device"
            actionLabel="Clear"
            danger
            onClick={() => setConfirmClear(true)}
          />
        </div>
      </Panel>

      <Panel className="lg:col-span-2">
        <PanelHeader label="About" />
        <div className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
          <BrandMark className="h-14 w-14 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-semibold">
              Spend <span className="font-mono text-sm font-normal text-ink-faint">v1.0.0</span>
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">
              A local-first expense ledger. Everything lives in your browser's storage — nothing
              ever leaves this device. No accounts, no cloud, no telemetry.
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="stamp text-primary">
                <ShieldCheck className="h-3 w-3" /> 100% on-device
              </span>
              {["Next.js", "Tailwind", "Motion", "Zustand"].map((t) => (
                <span
                  key={t}
                  className="border border-ink/25 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden items-center gap-3 border border-ink/25 bg-paper px-4 py-3 md:flex">
            <Wallet className="h-4 w-4 text-primary" />
            <div>
              <p className="tnum font-mono text-sm font-semibold">{expenses.length}</p>
              <p className="label-mono">entries stored</p>
            </div>
          </div>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmDemo}
        title="Load sample data?"
        body="This replaces your current expense history with ~100 demo entries. Budgets are kept."
        confirmLabel="Load sample"
        onClose={() => setConfirmDemo(false)}
        onConfirm={() => {
          loadDemoData();
          setDemoDone(true);
          setTimeout(() => setDemoDone(false), 2500);
        }}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        body="Every expense and budget will be permanently deleted from this device."
        confirmLabel="Delete everything"
        onClose={() => setConfirmClear(false)}
        onConfirm={clearAll}
      />
    </div>
  );
}

function DataButton({
  icon: Icon,
  title,
  body,
  actionLabel,
  onClick,
  danger = false,
  done = false,
}: {
  icon: typeof Database;
  title: string;
  body: string;
  actionLabel: string;
  onClick: () => void;
  danger?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-ink/4 sm:px-5">
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center border",
          danger ? "border-negative/40 text-negative" : "border-ink/25 text-primary"
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="truncate font-mono text-[10px] uppercase tracking-wide text-ink-faint">
          {body}
        </p>
      </div>
      <button
        onClick={onClick}
        className={cn(
          "btn btn-sm shrink-0 cursor-pointer",
          done ? "" : danger ? "btn-ghost text-negative" : "btn-ghost"
        )}
        style={done ? { borderColor: "var(--color-primary)", color: "var(--color-primary)" } : undefined}
      >
        {done ? "Done" : actionLabel}
      </button>
    </div>
  );
}
