"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api, ApiError } from "@/shared/lib/api";
import { springSnappy } from "@/shared/lib/motion";
import { BrandMark } from "@/shared/components/brand-mark";
import { useAuthStore } from "@/shared/store/auth-store";
import { cn } from "@/shared/lib/utils";

type Mode = "login" | "register";

/** Ledger-styled sign-in / create-account gate. */
export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUser = useAuthStore((s) => s.setUser);
  const bumpRefresh = useAuthStore((s) => s.bumpRefresh);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login" ? { email, password } : { name: name.trim(), email, password };
      const data = await api.post<{ user: { id: string; email: string; name: string; currency: string } }>(
        path,
        body
      );
      setUser(data.user);
      bumpRefresh(); // Providers re-runs the boot: loads the fresh ledger.
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not reach the server — is the backend running?"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSnappy}
        className="w-full max-w-sm border-2 border-ink bg-surface p-7 shadow-lift"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <BrandMark className="h-12 w-12" />
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">Spend</p>
            <p className="label-mono mt-1">your ledger, on any device</p>
          </div>
        </div>

        <div className="mb-5 flex border border-ink/40">
          {(
            [
              ["login", "Sign in"],
              ["register", "Create account"],
            ] as Array<[Mode, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setError(null);
              }}
              className={cn(
                "flex-1 cursor-pointer py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                mode === value ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <form
          className="space-y-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              maxLength={60}
              className="field"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="field"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "Password (min 8 characters)" : "Password"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className="field"
          />

          {error && (
            <p role="alert" className="font-mono text-xs font-medium text-negative">
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={busy}
            className={cn("btn btn-primary w-full", busy && "cursor-wait opacity-70")}
          >
            {busy ? "Opening the ledger…" : mode === "login" ? "Sign in" : "Create account"}
          </motion.button>
        </form>

        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          First account seeds a sample ledger
        </p>
      </motion.div>
    </div>
  );
}
