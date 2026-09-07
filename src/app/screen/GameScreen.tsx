import { useState } from "react";
import { cn } from "../../utils/cn";
import { BUBBLE_COLORS } from "../../lib/data";
import { IMAGES } from "../../lib/assets";
import { playJapFeedback } from "../../lib/feedback";
import { useJap } from "../../store/JapStore";
import { useI18n } from "../../store/I18n";
import { useToast } from "../../store/ToastProvider";

type Bubble = {
  id: number;
  color: number;
  size: number;
  x: number;
  y: number;
  dur: number;
  delay: number;
  popping: boolean;
};

const INITIAL: Bubble[] = [
  { id: 0, color: 0, size: 72, x: 8, y: 6, dur: 5.2, delay: 0, popping: false },
  { id: 1, color: 1, size: 50, x: 46, y: 2, dur: 4.4, delay: 0.6, popping: false },
  { id: 2, color: 2, size: 64, x: 70, y: 10, dur: 5.8, delay: 1.1, popping: false },
  { id: 3, color: 3, size: 78, x: 32, y: 28, dur: 4.8, delay: 0.3, popping: false },
  { id: 4, color: 4, size: 92, x: 58, y: 46, dur: 5.5, delay: 0.9, popping: false },
  { id: 5, color: 5, size: 68, x: 12, y: 52, dur: 4.6, delay: 1.4, popping: false },
  { id: 6, color: 6, size: 46, x: 6, y: 76, dur: 5.0, delay: 0.2, popping: false },
  { id: 7, color: 7, size: 70, x: 44, y: 76, dur: 5.6, delay: 0.7, popping: false },
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function GameScreen() {
  const { addJap, todayCount, settings, mantra } = useJap();
  const { t } = useI18n();
  const toast = useToast();
  const [bubbles, setBubbles] = useState<Bubble[]>(INITIAL);
  const [glowId, setGlowId] = useState(4);
  const [combo, setCombo] = useState(0);

  const pop = (id: number) => {
    setBubbles((bs) => bs.map((b) => (b.id === id ? { ...b, popping: true } : b)));
    setGlowId(id);
    playJapFeedback({ haptics: settings.haptics, speak: settings.speakMantra, mantra });
    const { completed } = addJap(1);
    setCombo((c) => c + 1);
    if (completed) toast(t("malaComplete"));
    window.setTimeout(() => {
      setBubbles((bs) =>
        bs.map((b) =>
          b.id === id
            ? {
                ...b,
                popping: false,
                x: rand(6, 72),
                y: rand(2, 78),
                size: rand(46, 92),
                color: Math.floor(rand(0, BUBBLE_COLORS.length)),
                dur: rand(4.4, 6),
              }
            : b,
        ),
      );
    }, 260);
  };

  return (
    <div className="flex min-h-full flex-col px-3 pb-4 pt-4 sm:px-4 sm:pt-5">
      <h2 className="text-center text-lg font-semibold text-ink">{t("tabGame")}</h2>

      <div className="mt-3 flex items-center justify-center gap-3">
        <span className="rounded-lg bg-gradient-to-br from-flame-soft to-flame-deep px-7 py-2.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(228,87,10,0.35)]">
          {t("japCount")} : {todayCount}
        </span>
        {combo > 1 && (
          <span className="animate-beadpop rounded-full bg-peach-soft px-3 py-1 text-xs font-bold text-flame">
            x{combo}
          </span>
        )}
      </div>

      <div className="relative mt-3 min-h-[min(52dvh,420px)] flex-1 overflow-hidden rounded-2xl sm:mt-4 sm:min-h-[460px]">
        {bubbles.map((b) => {
          const c = BUBBLE_COLORS[b.color];
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => !b.popping && pop(b.id)}
              aria-label={t("gameHint")}
              className={cn(
                "group absolute rounded-full outline-none transition-[left,top,width,height] duration-500 ease-out",
                !b.popping && "animate-bob",
              )}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.dur}s`,
              }}
            >
              <span
                className={cn(
                  "flex h-full w-full items-center justify-center rounded-full transition-transform duration-200",
                  b.popping ? "bubble-pop" : "group-hover:scale-110 group-focus-visible:scale-110",
                  glowId === b.id && !b.popping && "animate-glowpulse",
                )}
                style={{
                  background: `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.9), rgba(255,255,255,0) 44%), radial-gradient(circle at 68% 80%, ${c.dark}, ${c.base} 72%)`,
                  boxShadow: `inset 0 -7px 14px rgba(0,0,0,0.2), 0 12px 22px ${c.base}44`,
                }}
              >
                <span
                  className="pointer-events-none absolute left-[16%] top-[10%] h-[20%] w-[38%] -rotate-[18deg] rounded-full bg-white/70 blur-[1.5px]"
                  aria-hidden="true"
                />
                <span
                  className="font-deva pointer-events-none relative font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                  style={{ color: c.text, fontSize: Math.max(15, b.size * 0.3) }}
                >
                  राधे
                </span>
              </span>
            </button>
          );
        })}
        <img
          src={IMAGES.handTap}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="animate-tap pointer-events-none absolute -bottom-3 right-[4%] w-20 mix-blend-multiply sm:w-36"
        />
      </div>

      <p className="mt-2 text-center text-xs font-medium text-ink/45">{t("gameHint")}</p>
    </div>
  );
}
