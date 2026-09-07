import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { devanagari } from "../../lib/data";
import { haptic } from "../../lib/feedback";
import { useJap } from "../../store/JapStore";
import { useI18n } from "../../store/I18n";
import { useToast } from "../../store/ToastProvider";
import { useSpeech } from "../../hooks/useSpeech";
import { Sheet } from "../../components/ui/Sheet";
import { Mic } from "../../components/Icons";

const WAVE_HEIGHTS = [10, 20, 30, 16, 36, 22, 12, 28, 34, 14, 24, 12];

/** Keyword variants the recogniser might return for common mantras. */
const KEYWORDS: Record<string, string[]> = {
  "Radhe Radhe": ["radhe", "राधे", "radha"],
  "Om Namah Shivay": ["shivay", "shiva", "namah", "शिवाय", "नमः"],
  "Sita Ram": ["sita ram", "ram", "सीता", "राम"],
  Shiv: ["shiv", "shiva", "शिव"],
  "Hare Krishna": ["krishna", "hare", "कृष्ण", "हरे"],
  "Om Namo Narayanaya": ["narayan", "narayanaya", "नारायण"],
};

function keywordsFor(mantra: string) {
  if (KEYWORDS[mantra]) return KEYWORDS[mantra];
  const lower = mantra.toLowerCase();
  return [lower, ...lower.split(/\s+/).filter((w) => w.length > 2)];
}

type RisingWord = { id: number; x: number; size: number };
type PermState = "unknown" | "prompt" | "granted" | "denied";

function Waveform({ listening, flip }: { listening: boolean; flip?: boolean }) {
  return (
    <div className={cn("flex h-12 items-center gap-[3px]", flip && "flex-row-reverse")} aria-hidden="true">
      {WAVE_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full bg-flame transition-all duration-300", listening && "animate-wave")}
          style={{
            height: listening ? h + 8 : Math.max(6, h * 0.55),
            opacity: listening ? 0.95 : 0.5,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  );
}

export function VoiceScreen() {
  const { mantra, currentMala, addJap, settings } = useJap();
  const { t } = useI18n();
  const toast = useToast();
  const [words, setWords] = useState<RisingWord[]>([]);
  const idRef = useRef(0);
  const simRef = useRef<number | undefined>(undefined);

  /* ---------- microphone permission ---------- */
  const [perm, setPerm] = useState<PermState>("unknown");
  const [askOpen, setAskOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let status: PermissionStatus | undefined;
    try {
      navigator.permissions
        ?.query({ name: "microphone" as PermissionName })
        .then((ps) => {
          status = ps;
          setPerm(ps.state as PermState);
          ps.onchange = () => setPerm(ps.state as PermState);
        })
        .catch(() => {});
    } catch {
      /* permissions API unavailable — we'll ask on first tap */
    }
    return () => {
      if (status) status.onchange = null;
    };
  }, []);

  const requestMic = useCallback(async (): Promise<boolean> => {
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((tr) => tr.stop());
      setPerm("granted");
      return true;
    } catch {
      setPerm("denied");
      return false;
    } finally {
      setRequesting(false);
    }
  }, []);

  /* ---------- counting ---------- */
  const registerJap = useCallback(() => {
    if (settings.haptics) haptic();
    const { completed } = addJap(1);
    const wid = ++idRef.current;
    setWords((w) => [...w.slice(-3), { id: wid, x: 18 + Math.random() * 60, size: 14 + Math.random() * 14 }]);
    window.setTimeout(() => setWords((w) => w.filter((x) => x.id !== wid)), 1600);
    if (completed) toast(t("malaComplete"));
  }, [addJap, toast, t, settings.haptics]);

  const keywords = keywordsFor(mantra);
  const { listening, start, stop, supported } = useSpeech(keywords, registerJap);
  const [simActive, setSimActive] = useState(false);
  const active = listening || simActive;

  const startSim = useCallback(() => {
    setSimActive(true);
    toast(t("demoToast"));
    window.clearInterval(simRef.current);
    simRef.current = window.setInterval(registerJap, 2200);
  }, [registerJap, toast, t]);

  const stopSim = useCallback(() => {
    setSimActive(false);
    window.clearInterval(simRef.current);
  }, []);

  useEffect(() => () => window.clearInterval(simRef.current), []);

  const beginListening = useCallback(() => {
    if (supported) {
      const ok = start();
      if (!ok) startSim();
    } else {
      startSim();
    }
  }, [supported, start, startSim]);

  const toggle = () => {
    if (active) {
      stop();
      stopSim();
      return;
    }
    if (perm === "granted") {
      beginListening();
      return;
    }
    // first time (or previously blocked) → explain & request permission
    setAskOpen(true);
  };

  return (
    <div className="px-3 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5">
      <h2 className="text-center text-lg font-semibold text-ink">{t("tabVoice")}</h2>

      <p className="mt-5 text-xs font-medium text-ink/70">{t("selectMantra")}</p>
      <div className="mt-1.5 rounded-md bg-peach-soft px-4 py-3 text-[15px] font-semibold text-flame">{mantra}</div>

      <div className="relative mt-4 rounded-md bg-peach-soft px-4 pb-5 pt-4 text-center">
        <p className="text-sm font-semibold text-ink">{t("japCount")}</p>
        <p className="mt-1 text-[clamp(48px,16vw,64px)] font-extrabold leading-none text-flame">{currentMala}</p>
        <span className="font-deva absolute bottom-3 left-4 text-xs text-ink/40">{devanagari(currentMala)}</span>
      </div>

      <div className="relative h-16" aria-hidden="true">
        <span className="font-deva animate-bob absolute left-[28%] top-4 text-2xl font-medium text-ember/85">राधे</span>
        <span
          className="font-deva animate-bob absolute right-[16%] top-0 text-sm font-medium text-ember/60"
          style={{ animationDelay: "1.2s" }}
        >
          राधे
        </span>
        {words.map((w) => (
          <span
            key={w.id}
            className="font-deva animate-rise absolute top-6 font-semibold text-flame"
            style={{ left: `${w.x}%`, fontSize: w.size }}
          >
            राधे
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 sm:gap-6">
        <Waveform listening={active} />
        <button
          type="button"
          onClick={toggle}
          aria-pressed={active}
          aria-label={active ? "Stop listening" : "Start listening"}
          className="group relative h-20 w-20 shrink-0 outline-none sm:h-24 sm:w-24"
        >
          <span className={cn("absolute inset-0 rounded-full bg-flame/20", active && "animate-halo")} aria-hidden="true" />
          <span
            className={cn("absolute inset-0 rounded-full bg-flame/15", active && "animate-halo")}
            style={{ animationDelay: "0.7s" }}
            aria-hidden="true"
          />
          <span
            className={cn(
              "relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-flame-soft to-flame-deep text-white shadow-[0_16px_36px_rgba(228,87,10,0.45)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95",
              active && "ring-4 ring-flame/25",
            )}
          >
            <Mic className="h-10 w-10" />
          </span>
        </button>
        <Waveform listening={active} flip />
      </div>

      <div className="mt-6 text-center">
        {active ? (
          <p className="text-[17px] font-medium text-ink">
            {t("listening")}
            <span className="animate-blink">.</span>
            <span className="animate-blink" style={{ animationDelay: "0.2s" }}>.</span>
            <span className="animate-blink" style={{ animationDelay: "0.4s" }}>.</span>
          </p>
        ) : perm === "denied" ? (
          <>
            <p className="mx-auto max-w-[280px] text-sm font-medium leading-relaxed text-red-500">{t("micBlocked")}</p>
            <button
              type="button"
              onClick={startSim}
              className="mt-3 rounded-full bg-peach-soft px-5 py-2 text-sm font-semibold text-flame transition-colors hover:bg-flame hover:text-white"
            >
              {t("useDemo")}
            </button>
          </>
        ) : (
          <p className="text-[17px] font-medium text-ink/60">
            {perm === "granted" ? t("tapMicGranted") : t("tapMicAsk")}
          </p>
        )}
        <p className="mt-1.5 text-[15px] text-ink/80">
          {t("say")} "<span className="font-semibold text-flame">{mantra}</span>"
        </p>
        {!supported && perm === "granted" && (
          <p className="mt-2 text-xs font-medium text-ink/40">
            {t("demoNote")}
          </p>
        )}
      </div>

      {/* ---------- microphone permission sheet ---------- */}
      {askOpen && (
        <Sheet title={t("micTitle")} onClose={() => setAskOpen(false)}>
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-soft to-flame-deep text-white shadow-[0_10px_24px_rgba(228,87,10,0.4)]">
                <Mic className="h-7 w-7" />
              </span>
              <h3 className="text-2xl font-bold text-flame">{t("micTitle")}</h3>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink/60">
              {perm === "denied" ? t("micBlocked") : t("micDesc")}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setAskOpen(false)}
                className="px-4 py-3 text-lg font-semibold text-ink/35 transition-colors hover:text-ink/60"
              >
                {t("notNow")}
              </button>
              {perm === "denied" ? (
                <>
                  <button
                    type="button"
                    onClick={startSim}
                    className="flex-1 rounded-full bg-peach-soft py-4 text-lg font-bold text-flame transition-colors hover:bg-flame hover:text-white"
                  >
                    {t("useDemo")}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await requestMic();
                      if (ok) {
                        setAskOpen(false);
                        beginListening();
                      }
                    }}
                    className="rounded-full bg-gradient-to-br from-flame-soft to-flame-deep px-6 py-4 text-lg font-bold text-white shadow-[0_14px_30px_rgba(228,87,10,0.4)]"
                  >
                    ↻
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={requesting}
                  onClick={async () => {
                    const ok = await requestMic();
                    if (ok) {
                      setAskOpen(false);
                      beginListening();
                      toast(t("micAllowed"));
                    }
                  }}
                  className="flex-1 rounded-full bg-gradient-to-br from-flame-soft to-flame-deep py-4 text-xl font-bold text-white shadow-[0_14px_30px_rgba(228,87,10,0.4)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {requesting ? "…" : t("allowMic")}
                </button>
              )}
            </div>
        </Sheet>
      )}
    </div>
  );
}
