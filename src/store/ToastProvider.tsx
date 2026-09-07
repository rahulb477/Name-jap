import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { Check } from "../components/Icons";

type ToastCtx = (message: string) => void;
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState("Saved successfully");
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const toast = useCallback((message: string) => {
    setMsg(message);
    setVisible(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), 2400);
  }, []);

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed bottom-[max(88px,calc(72px+env(safe-area-inset-bottom)))] left-1/2 z-[60] flex w-[min(92vw,380px)] -translate-x-1/2 items-center gap-3 rounded-xl bg-[#16181D]/95 px-4 py-3 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-500 sm:bottom-6 sm:left-auto sm:right-5 sm:w-auto sm:translate-x-0 sm:px-5 sm:py-3.5",
          visible ? "translate-y-0 opacity-100 sm:translate-y-0" : "translate-y-8 opacity-0",
        )}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-flame">
          <Check className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-medium">{msg}</span>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
