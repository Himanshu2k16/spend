import { create } from "zustand";
import { api } from "@/shared/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  currency: string;
}

export type AuthStatus = "loading" | "authed" | "anon" | "error";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  bootError: string | null;
  /** Bumping this re-runs the boot sequence in Providers. */
  refreshKey: number;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  setBootError: (message: string | null) => void;
  bumpRefresh: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "loading",
  bootError: null,
  refreshKey: 0,
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  setBootError: (bootError) => set({ bootError }),
  bumpRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // clear locally regardless — the cookie may already be gone
    }
    set({ user: null, status: "anon" });
  },
}));
