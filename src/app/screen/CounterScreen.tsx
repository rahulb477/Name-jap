import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { MANTRAS } from "../../lib/data";
import { quoteInLang, thoughtForToday, type ThoughtLang } from "../../lib/gita";
import { playJapFeedback } from "../../lib/feedback";
import { AUTO_MS, useJap } from "../../store/JapStore";
import { useI18n } from "../../store/I18n";
import { useToast } from "../../store/ToastProvider";
import { Check, ChevronDown, Pause, Play, Reset } from "../../components/Icons";
import { Tassel } from "../../components/Decor";

const BEADS = 40;

export function CounterScreen() {
  const {
    mantra,
    setMantra,
    currentMala,
    malaSize,
    malasCompleted,
    todayCount,
    addJap,
    resetMala,
    settings,
    customMantras,
  } = useJap();
  const { t } = useI18n();
  const toast = useToast();
  const [auto, setAuto] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const filled = Math.round((currentMala / malaSize) * BEADS);

  const feedback = () => {
    playJapFeedback({ haptics: settings.haptics, speak: settings.speakMantra, mantra });
  };

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      const { completed } = addJap(1);
      feedback();
      if (completed) {
        setAuto(false);
        toast(t("malaComplete"));
      }
    }, AUTO_MS[settings.autoSpeed]);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, settings.autoSpeed, settings.haptics, settings.speakMantra, addJap, toast]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const tap = () => {
    const { completed } = addJap(1);
    feedback();
    if (completed) toast(t("malaComplete"));
  };

  return (
    <div className="px-3 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5">
      {/* today's thought — always Hindi, auto-picked from भगवद्गीता each day */}
      <TodayThought />

      {/* mantra dropdown */}
      <div ref={menuRef} className="relative mx-auto mt-4 w-full max-w-[360px] sm:mt-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex w-full items-center justify-between rounded-lg bg-gradient-to-br from-flame-soft to-flame-deep px-5 py-3.5 text-left text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(228,87,10,0.35)] transition-all duration-300 hover:-translate-y-0.5"
        >
          {mantra}
          <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", open && "rotate-180")} />
        </button>
        <div
          className={cn(
            "absolute z-30 mt-2 w-full origin-top rounded-xl border border-orange-100 bg-white p-1.5 shadow-[0_22px_50px_rgba(120,70,20,0.18)] transition-all duration-200",
            open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
          )}
          role="listbox"
        >
          {[...MANTRAS, ...customMantras].map((m) => (
            <button
              key={m}
              type="button"
              role="option"
              aria-selected={m === mantra}
              onClick={() => {
                setMantra(m);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors",
                m === mantra ? "bg-peach-soft font-semibold text-flame" : "text-ink/80 hover:bg-peach-soft/70",
              )}
            >
              {m}
              {m === mantra && <Check className="h-4 w-4 text-flame" />}
            </button>
          ))}
        </div>
      </div>

      {/* bead ring */}
      <button
        type="button"
        onClick={tap}
        aria-label={`Count one jap. ${currentMala} of ${malaSize}`}
        className="group relative mx-auto mt-5 block aspect-square w-[min(280px,78vw)] max-w-full cursor-pointer rounded-full outline-none transition-transform duration-200 active:scale-[0.97] sm:mt-7 sm:w-[min(300px,70vw)]"
      >
        {Array.from({ length: BEADS }).map((_, i) => {
          const a = ((90 + (i * 360) / BEADS) * Math.PI) / 180;
          const left = 50 + 45 * Math.cos(a);
          const top = 50 + 45 * Math.sin(a);
          const isFilled = i < filled;
          return (
            <span
              key={i}
              className={cn(
                "bead absolute h-[7%] w-[7%] max-h-[22px] max-w-[22px] rounded-full transition-all duration-300",
                isFilled ? "opacity-100" : "opacity-25 saturate-50",
                i === filled - 1 && "animate-beadpop",
              )}
              style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
            />
          );
        })}
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[clamp(42px,14vw,66px)] font-extrabold leading-none text-flame drop-shadow-[0_2px_0_rgba(255,255,255,0.9)] transition-transform duration-200 group-active:scale-110">
            {currentMala}
          </span>
          <span className="mt-3 h-px w-14 bg-flame/25" />
          <span className="mt-2 text-[22px] font-bold leading-none text-ember">{malaSize}</span>
          <span className="mt-2 text-[12px] font-semibold tracking-[0.35em] text-flame">CHANT</span>
        </span>
        <Tassel className="absolute -bottom-[22%] left-1/2 h-[28%] w-[18%] -translate-x-1/2" />
      </button>

      {/* stat row */}
      <div className="mt-[18%] grid grid-cols-3 gap-2 text-center sm:mt-24 sm:gap-3">
        <Stat label={t("today")} value={todayCount} />
        <Stat label={t("malas")} value={malasCompleted} />
        <Stat label={t("inMala")} value={currentMala} />
      </div>

      {/* controls */}
      <div className="mx-auto mt-4 grid w-full max-w-[360px] grid-cols-2 gap-3 sm:mt-5 sm:gap-4">
        <button
          type="button"
          onClick={() => setAuto((a) => !a)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl py-3.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5",
            auto
              ? "bg-flame/15 text-flame-deep shadow-[inset_0_0_0_1.5px_rgba(244,113,31,0.4)]"
              : "bg-[#F1F2F4] text-ink hover:bg-peach-soft",
          )}
        >
          {auto ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 text-ember" />}
          {auto ? t("pause") : t("auto")}
        </button>
        <button
          type="button"
          onClick={() => {
            setAuto(false);
            resetMala();
            toast(t("toastMalaReset"));
          }}
          className="flex flex-col items-center gap-1.5 rounded-xl bg-[#F1F2F4] py-3.5 text-sm font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-peach-soft"
        >
          <Reset className="h-5 w-5 text-flame-deep" />
          {t("reset")}
        </button>
      </div>

      <p className="mt-4 text-center text-xs font-medium text-ink/45">{t("tapHint")}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-peach-soft/70 py-3">
      <p className="text-2xl font-bold leading-none text-flame">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink/50">{label}</p>
    </div>
  );
}

/**
 * Thought card matching the reference: white panel, orange rail,
 * title + quoted line + Krishna attribution. Quote follows app language.
 */
function TodayThought() {
  const { t, lang } = useI18n();
  const [verse, setVerse] = useState(() => thoughtForToday());

  useEffect(() => {
    const tick = () => setVerse(thoughtForToday());
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const wait = Math.max(1_000, nextMidnight - now.getTime() + 250);
    const timer = window.setTimeout(tick, wait);
    const id = window.setInterval(tick, 60_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(id);
    };
  }, []);

  const quote = quoteInLang(verse, lang as ThoughtLang);
  const indic = lang !== "en";

  return (
    <div className="relative overflow-hidden rounded-[22px] bg-white px-5 pb-4 pt-4 shadow-[0_8px_28px_rgba(150,90,30,0.08)]">
      <span
        className="absolute bottom-5 left-[18px] top-5 w-[5px] rounded-full bg-[#F5A623]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-5 top-3 select-none text-[52px] font-serif leading-none text-[#F5A623]/90"
        aria-hidden="true"
      >
        ”
      </span>
      <p className="pl-5 pr-10 text-[17px] font-semibold text-[#F5A623]">{t("thoughtLabel")}</p>
      <p
        className={`${indic ? "font-deva" : ""} mt-2 pl-5 pr-8 text-[16.5px] font-medium leading-[1.45] text-[#1A1A1A]`}
      >
        “{quote}”
      </p>
      <p className={`${indic ? "font-deva" : ""} mt-5 pr-1 text-right text-[16px] font-semibold text-[#F5A623]`}>
        {t("thoughtAttr")}
      </p>
    </div>
  );
}
