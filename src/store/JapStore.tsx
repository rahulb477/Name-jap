import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MANTRAS, type RangeKey } from "../lib/data";
import { buildChart, type ChartResult } from "../lib/stats";

const STORAGE_KEY = "radha-jap-store-v1";
const MALA_SIZE = 108;
const LOG_CAP = 5000;

export type AutoSpeed = "slow" | "normal" | "fast";
export const AUTO_MS: Record<AutoSpeed, number> = { slow: 2500, normal: 1500, fast: 800 };
export const AUTO_LABEL: Record<AutoSpeed, string> = {
  slow: "Slow (2.5s)",
  normal: "Normal (1.5s)",
  fast: "Fast (0.8s)",
};

export type Settings = {
  haptics: boolean;
  speakMantra: boolean;
  notifTime: string; // "07:30"
  autoSpeed: AutoSpeed;
};

export type ResetScope = "bead" | "today" | "malas" | "all";

type Persisted = {
  mantra: string;
  currentMala: number;
  malasCompleted: number;
  japLog: number[];
  goal: number;
  settings: Settings;
  customMantras: string[];
};

const DEFAULT_STATE: Persisted = {
  mantra: MANTRAS[0],
  currentMala: 0,
  malasCompleted: 0,
  japLog: [],
  goal: 108,
  settings: { haptics: true, speakMantra: false, notifTime: "07:30", autoSpeed: "normal" },
  customMantras: [],
};

function load(): Persisted {
  if (typeof localStorage === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const p = JSON.parse(raw) as Partial<Persisted>;
    const custom = Array.isArray(p.customMantras)
      ? p.customMantras.filter((m): m is string => typeof m === "string" && m.trim().length > 0).slice(-12)
      : [];
    const known: string[] = [...MANTRAS, ...custom];
    return {
      ...DEFAULT_STATE,
      ...p,
      customMantras: custom,
      mantra: typeof p.mantra === "string" && known.includes(p.mantra) ? p.mantra : MANTRAS[0],
      japLog: Array.isArray(p.japLog) ? p.japLog.slice(-LOG_CAP) : [],
      settings: { ...DEFAULT_STATE.settings, ...(p.settings ?? {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/* ---------------- date helpers ---------------- */
const DAY = 86_400_000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/* ---------------- context ---------------- */
type JapContext = {
  mantra: string;
  currentMala: number;
  malasCompleted: number;
  malaSize: number;
  goal: number;
  settings: Settings;
  customMantras: string[];
  todayCount: number;
  totalCount: number;
  streak: number;
  setMantra: (m: string) => void;
  addCustomMantra: (name: string) => boolean;
  removeCustomMantra: (name: string) => void;
  addJap: (n?: number) => { completed: boolean };
  resetMala: () => void;
  resetScope: (scope: ResetScope) => void;
  setGoal: (g: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  chart: (range: RangeKey) => ChartResult;
};

const Ctx = createContext<JapContext | null>(null);

export function JapProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const setMantra = useCallback((m: string) => setState((s) => ({ ...s, mantra: m })), []);

  const addCustomMantra = useCallback((name: string) => {
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) return false;
    let added = false;
    setState((s) => {
      if (s.customMantras.includes(clean) || MANTRAS.includes(clean)) return s;
      added = true;
      return { ...s, customMantras: [...s.customMantras, clean].slice(-12) };
    });
    return added;
  }, []);

  const removeCustomMantra = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      customMantras: s.customMantras.filter((m) => m !== name),
      mantra: s.mantra === name ? MANTRAS[0] : s.mantra,
    }));
  }, []);
  const setGoal = useCallback((g: number) => setState((s) => ({ ...s, goal: Math.max(1, g) })), []);
  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
    [],
  );

  const addJap = useCallback((n = 1) => {
    let completed = false;
    setState((s) => {
      const now = Date.now();
      const stamps = Array.from({ length: n }, () => now);
      let mala = s.currentMala + n;
      let malas = s.malasCompleted;
      while (mala >= MALA_SIZE) {
        mala -= MALA_SIZE;
        malas += 1;
        completed = true;
      }
      return { ...s, currentMala: mala, malasCompleted: malas, japLog: [...s.japLog, ...stamps].slice(-LOG_CAP) };
    });
    return { completed };
  }, []);

  const resetMala = useCallback(() => setState((s) => ({ ...s, currentMala: 0 })), []);

  const resetScope = useCallback((scope: ResetScope) => {
    setState((s) => {
      if (scope === "bead") return { ...s, currentMala: 0 };
      if (scope === "malas") return { ...s, malasCompleted: 0 };
      if (scope === "today") {
        const base = startOfDay(new Date()).getTime();
        return { ...s, japLog: s.japLog.filter((t) => t < base), currentMala: 0 };
      }
      return { ...s, currentMala: 0, malasCompleted: 0, japLog: [] };
    });
  }, []);

  const todayCount = useMemo(() => {
    const base = startOfDay(new Date()).getTime();
    return state.japLog.filter((t) => t >= base).length;
  }, [state.japLog]);

  const streak = useMemo(() => {
    if (state.japLog.length === 0) return 0;
    const days = new Set(state.japLog.map((t) => startOfDay(new Date(t)).getTime()));
    let s = 0;
    let cursor = startOfDay(new Date()).getTime();
    if (!days.has(cursor)) cursor -= DAY;
    while (days.has(cursor)) {
      s += 1;
      cursor -= DAY;
    }
    return s;
  }, [state.japLog]);

  const chart = useCallback((range: RangeKey) => buildChart(state.japLog, range), [state.japLog]);

  const value: JapContext = {
    mantra: state.mantra,
    currentMala: state.currentMala,
    malasCompleted: state.malasCompleted,
    malaSize: MALA_SIZE,
    goal: state.goal,
    settings: state.settings,
    customMantras: state.customMantras,
    todayCount,
    totalCount: state.japLog.length,
    streak,
    setMantra,
    addCustomMantra,
    removeCustomMantra,
    addJap,
    resetMala,
    resetScope,
    setGoal,
    updateSettings,
    chart,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJap() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useJap must be used within JapProvider");
  return ctx;
}
