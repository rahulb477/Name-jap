import { useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { AUTO_LABEL, useJap, type AutoSpeed, type ResetScope } from "../../store/JapStore";
import { formatTime } from "../../lib/stats";
import { haptic, speakMantra } from "../../lib/feedback";
import { requestNotifPermission } from "../../hooks/useDailyReminder";
import { APP_VERSION, SUPPORT_EMAIL } from "../../lib/config";
import { LANGUAGES, useI18n } from "../../store/I18n";
import { useToast } from "../../store/ToastProvider";
import { Sheet } from "../../components/ui/Sheet";
import { Toggle } from "../../components/ui/Toggle";
import { ChevronRight, Reset as ResetIcon } from "../../components/Icons";

/* ---------------- row icons ---------------- */
type IconProps = { className?: string };
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const HapticsIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M10 8.5v7L6.8 13H4v-2h2.8z" fill="currentColor" />
    <path d="M14.5 9c1.2 1.7 1.2 4.3 0 6M17.5 7c2 2.8 2 7.2 0 10" {...stroke} />
  </svg>
);
const LangIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M4 6h8M8 4v2M6.5 6c.4 4 3 7.4 5.5 8.8M10.5 6c-.6 4-3.4 7.6-6 9" {...stroke} />
    <path d="M13 20l3.6-8.4L20.2 20M14.4 17h4.4" {...stroke} />
  </svg>
);
const BellIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 4a5.5 5.5 0 0 1 5.5 5.5c0 3.4.9 4.9 1.7 5.8H4.8c.8-.9 1.7-2.4 1.7-5.8A5.5 5.5 0 0 1 12 4z" {...stroke} />
    <path d="M10 18.5a2 2 0 0 0 4 0" {...stroke} />
  </svg>
);
const TargetIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="7.5" {...stroke} />
    <circle cx="12" cy="12" r="3" {...stroke} />
    <path d="M12 12l6-6M18 6h-3M18 6v3" {...stroke} />
  </svg>
);
const GaugeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M4.5 16a8 8 0 1 1 15 0" {...stroke} />
    <path d="M12 15l3.4-4.4" {...stroke} />
    <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
  </svg>
);
const SpeakIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M11 8v8l-3.4-2.4H4.5v-3.2h3.1z" fill="currentColor" />
    <path d="M14.5 9.2c1.2 1.6 1.2 4 0 5.6M17.2 7.2c2 2.7 2 6.9 0 9.6" {...stroke} />
  </svg>
);
const WidgetIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" fill="currentColor" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" fill="currentColor" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" fill="currentColor" />
    <path d="M16.75 13.5v6.5M13.5 16.75H20" {...stroke} />
  </svg>
);
const StarIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" fill="currentColor" />
  </svg>
);
const ShareIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="6.5" cy="12" r="2.6" fill="currentColor" />
    <circle cx="17" cy="6" r="2.6" fill="currentColor" />
    <circle cx="17" cy="18" r="2.6" fill="currentColor" />
    <path d="M8.8 10.8l5.9-3.4M8.8 13.2l5.9 3.4" {...stroke} />
  </svg>
);
const SupportIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M5 13a7 7 0 0 1 14 0" {...stroke} />
    <rect x="3.5" y="12.5" width="4" height="6" rx="1.6" fill="currentColor" />
    <rect x="16.5" y="12.5" width="4" height="6" rx="1.6" fill="currentColor" />
    <path d="M18.5 18.5c0 1.8-2.4 2.6-4.5 2.6" {...stroke} />
  </svg>
);
const ShieldIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 3.5l7 2.6v5.4c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6.1z" fill="currentColor" />
    <circle cx="12" cy="10.5" r="1.5" fill="#FBE7CF" />
    <path d="M12 12v3" stroke="#FBE7CF" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/* ---------------- primitives ---------------- */
function Row({
  icon,
  label,
  right,
  onClick,
  chevron,
}: {
  icon: ReactNode;
  label: string;
  right?: ReactNode;
  onClick?: () => void;
  chevron?: boolean;
}) {
  const interactive = Boolean(onClick || chevron);
  const cls = cn(
    "flex w-full items-center gap-3 border-b border-black/5 px-4 py-4 text-left transition-colors sm:gap-4 sm:px-5 sm:py-5",
    interactive && "hover:bg-white/60 active:bg-peach-soft/60",
  );
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FBE7CF] text-flame sm:h-14 sm:w-14">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink sm:text-[17px]">{label}</span>
      {right}
      {chevron && <ChevronRight className="h-5 w-5 shrink-0 text-ink/25" />}
    </>
  );
  if (!interactive) {
    return <div className={cls}>{inner}</div>;
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="max-w-[46%] shrink-0 truncate rounded-full bg-[#FBE7CF] px-3 py-2 text-[12px] font-bold text-flame sm:max-w-none sm:px-5 sm:py-2.5 sm:text-[15px]">
      {children}
    </span>
  );
}

/* ---------------- reset sheet (reference) ---------------- */
const RESET_OPTIONS: { id: ResetScope; key: "optBead" | "optToday" | "optMalas" | "optAll" }[] = [
  { id: "bead", key: "optBead" },
  { id: "today", key: "optToday" },
  { id: "malas", key: "optMalas" },
  { id: "all", key: "optAll" },
];

function ResetSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { resetScope } = useJap();
  const toast = useToast();
  const [scope, setScope] = useState<ResetScope>("today");

  return (
    <Sheet title={t("resetTitle")} onClose={onClose}>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F79A1C] text-white shadow-[0_10px_24px_rgba(247,154,28,0.4)]">
          <ResetIcon className="h-7 w-7" />
        </span>
        <h3 className="text-2xl font-bold text-flame">{t("resetTitle")}</h3>
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-ink/60">{t("resetDesc")}</p>

      <div className="mt-5 space-y-3">
        {RESET_OPTIONS.map((o) => {
          const active = scope === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setScope(o.id)}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border px-5 py-5 text-left transition-all duration-200",
                active
                  ? "border-flame bg-[#FBF7EC] shadow-[0_6px_18px_rgba(244,113,31,0.12)]"
                  : "border-black/5 bg-[#EDECE8] hover:bg-[#E7E6E1]",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-flame",
                  active && "bg-white",
                )}
                aria-hidden="true"
              >
                <span className={cn("h-3 w-3 rounded-full bg-flame transition-transform", active ? "scale-100" : "scale-0")} />
              </span>
              <span className="text-[17px] font-semibold text-ink">{t(o.key)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-red-500" aria-hidden="true">
          <path d="M12 3.5L22 20H2z" fill="currentColor" />
          <path d="M12 10v4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="17.2" r="1.1" fill="#fff" />
        </svg>
        <p className="text-[15px] font-medium leading-snug text-red-500">{t("warnText")}</p>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={onClose} className="px-4 py-3 text-lg font-semibold text-ink/35 transition-colors hover:text-ink/60">
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={() => {
            resetScope(scope);
            onClose();
            toast(t("toastReset"));
          }}
          className="flex-1 rounded-full bg-[#D9534F] py-4 text-xl font-bold text-white shadow-[0_14px_30px_rgba(217,83,79,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c4433f]"
        >
          {t("confirmReset")}
        </button>
      </div>
    </Sheet>
  );
}

/* ---------------- main screen ---------------- */
type SheetId = "reset" | "privacy" | "contact" | "rate" | "widget" | null;

const SPEED_CYCLE: AutoSpeed[] = ["slow", "normal", "fast"];

export function SettingsScreen({ onOpenLanguage }: { onOpenLanguage: () => void }) {
  const { t, lang } = useI18n();
  const currentLang = LANGUAGES.find((l) => l.code === lang);
  const { settings, updateSettings, goal, setGoal, mantra } = useJap();
  const toast = useToast();
  const [sheet, setSheet] = useState<SheetId>(null);
  const [expanded, setExpanded] = useState<"notif" | "goal" | null>(null);
  const [rating, setRating] = useState(0);

  const cycleSpeed = () => {
    const next = SPEED_CYCLE[(SPEED_CYCLE.indexOf(settings.autoSpeed) + 1) % SPEED_CYCLE.length];
    updateSettings({ autoSpeed: next });
    toast(`Auto jap speed — ${AUTO_LABEL[next]}`);
  };

  const share = async () => {
    const url = window.location.href;
    const text = "Naam Jap Counter — 108 Jap. Count your jap with beads, bubbles and voice. 🙏";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Naam Jap Counter", text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast(t("toastShareCopied"));
    } catch {
      toast(t("toastShareCancelled"));
    }
  };

  return (
    <div className="relative overflow-x-hidden bg-[#F7F4EC] pb-8">
      <h2 className="px-4 pb-2 pt-5 text-xl font-bold text-ink sm:px-5 sm:pt-6 sm:text-2xl">{t("settingsTitle")}</h2>

      <Row
        icon={<HapticsIcon className="h-7 w-7" />}
        label={t("haptics")}
        right={
          <Toggle
            on={settings.haptics}
            onChange={(v) => {
              updateSettings({ haptics: v });
              if (v) haptic([20, 30, 40]);
              toast(v ? t("hapticOn") : t("hapticOff"));
            }}
          />
        }
      />
      <Row
        icon={<LangIcon className="h-7 w-7" />}
        label={t("language")}
        right={<Pill>{currentLang ? currentLang.english.replace(" (System Default)", "") : "English"}</Pill>}
        onClick={onOpenLanguage}
      />
      <Row
        icon={<BellIcon className="h-7 w-7" />}
        label={t("notifTime")}
        right={<Pill>{formatTime(settings.notifTime)}</Pill>}
        onClick={async () => {
          const opening = expanded !== "notif";
          setExpanded(opening ? "notif" : null);
          if (opening) {
            const perm = await requestNotifPermission();
            if (perm === "granted") toast(t("notifGranted"));
            else if (perm === "denied") toast(t("notifDenied"));
            else toast(t("notifUnsupported"));
          }
        }}
      />
      {expanded === "notif" && (
        <div className="border-b border-black/5 bg-white/70 px-6 py-4">
          <input
            type="time"
            value={settings.notifTime}
            onChange={async (e) => {
              if (!e.target.value) return;
              updateSettings({ notifTime: e.target.value });
              const perm = await requestNotifPermission();
              if (perm === "granted") toast(`${t("notifGranted")} · ${formatTime(e.target.value)}`);
              else if (perm === "denied") toast(t("notifDenied"));
            }}
            className="w-full rounded-xl border border-flame/30 bg-white px-4 py-3 text-lg font-semibold text-flame outline-none"
          />
          <p className="mt-2 text-xs text-ink/50">{t("notifHint")}</p>
        </div>
      )}
      <Row
        icon={<TargetIcon className="h-7 w-7" />}
        label={t("dailyGoal")}
        right={
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FBE7CF] text-xl font-bold text-flame">
            {goal}
          </span>
        }
        onClick={() => setExpanded((e) => (e === "goal" ? null : "goal"))}
      />
      {expanded === "goal" && (
        <div className="flex items-center justify-between border-b border-black/5 bg-white/70 px-6 py-4">
          <button
            type="button"
            onClick={() => setGoal(Math.max(1, goal - 27))}
            className="h-11 w-11 rounded-full bg-[#FBE7CF] text-2xl font-bold text-flame transition-transform hover:scale-110"
          >
            −
          </button>
          <div className="flex gap-2">
            {[27, 54, 108, 216].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  goal === g ? "bg-flame text-white" : "bg-[#FBE7CF] text-flame hover:bg-flame hover:text-white",
                )}
              >
                {g}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setGoal(goal + 27)}
            className="h-11 w-11 rounded-full bg-[#FBE7CF] text-2xl font-bold text-flame transition-transform hover:scale-110"
          >
            +
          </button>
        </div>
      )}
      <Row icon={<GaugeIcon className="h-7 w-7" />} label={t("autoSpeed")} right={<Pill>{AUTO_LABEL[settings.autoSpeed]}</Pill>} onClick={cycleSpeed} />
      <Row
        icon={<SpeakIcon className="h-7 w-7" />}
        label={t("speakMantra")}
        right={
          <Toggle
            on={settings.speakMantra}
            onChange={(v) => {
              updateSettings({ speakMantra: v });
              if (v) speakMantra(mantra);
              toast(v ? t("speakOn") : t("speakOff"));
            }}
          />
        }
      />
      <Row icon={<WidgetIcon className="h-7 w-7" />} label={t("addWidget")} chevron onClick={() => setSheet("widget")} />

      <p className="px-4 pb-2 pt-7 text-xl text-ink/35 sm:px-5">{t("otherOptions")}</p>

      <Row
        icon={<StarIcon className="h-7 w-7" />}
        label={t("rateUs")}
        chevron
        onClick={() => setSheet("rate")}
      />
      <Row icon={<ShareIcon className="h-7 w-7" />} label={t("shareApp")} chevron onClick={share} />
      <Row icon={<SupportIcon className="h-7 w-7" />} label={t("contactUs")} chevron onClick={() => setSheet("contact")} />
      <Row icon={<ShieldIcon className="h-7 w-7" />} label={t("privacyPolicy")} chevron onClick={() => setSheet("privacy")} />
      <Row icon={<ResetIcon className="h-7 w-7" />} label={t("resetProgress")} chevron onClick={() => setSheet("reset")} />

      <p className="px-5 pt-6 text-center text-xs text-ink/35">Naam Jap Counter · v{APP_VERSION}</p>

      {/* ---------- sheets ---------- */}
      {sheet === "reset" && <ResetSheet onClose={() => setSheet(null)} />}

      {sheet === "rate" && (
        <Sheet title={t("rateUs")} onClose={() => setSheet(null)}>
          <h3 className="text-center text-2xl font-bold text-ink">{t("rateUs")}</h3>
          <p className="mt-2 text-center text-sm text-ink/55">{t("rateDesc")}</p>
          <div className="mt-6 flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`${s} stars`}
                onClick={() => {
                  setRating(s);
                  toast(s >= 4 ? t("thanksLove") : t("thanksFeedback"));
                }}
                className="transition-transform hover:scale-125"
              >
                <StarIcon className={cn("h-10 w-10", s <= rating ? "text-flame" : "text-black/15")} />
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {sheet === "contact" && (
        <Sheet title={t("contactUs")} onClose={() => setSheet(null)}>
          <h3 className="text-2xl font-bold text-ink">{t("contactUs")}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{t("contactDesc")}</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Naam%20Jap%20Counter`}
            className="mt-5 block rounded-full bg-gradient-to-br from-flame-soft to-flame-deep py-4 text-center text-lg font-bold text-white shadow-[0_12px_28px_rgba(228,87,10,0.4)] transition-transform hover:-translate-y-0.5"
          >
            {SUPPORT_EMAIL}
          </a>
        </Sheet>
      )}

      {sheet === "widget" && (
        <Sheet title={t("addWidget")} onClose={() => setSheet(null)}>
          <h3 className="text-2xl font-bold text-ink">{t("addWidget")}</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/65">{t("widgetDesc")}</p>
          <ol className="mt-3 list-decimal space-y-3 pl-6 text-[15px] leading-relaxed text-ink/65">
            <li>{t("widgetStep1")}</li>
            <li>{t("widgetStep2")}</li>
          </ol>
        </Sheet>
      )}

      {sheet === "privacy" && (
        <Sheet title={t("privacyPolicy")} onClose={() => setSheet(null)}>
          <h3 className="text-2xl font-bold text-ink">{t("privacyPolicy")}</h3>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink/65">
            <p>{t("priv1")}</p>
            <p>{t("priv2")}</p>
          </div>
        </Sheet>
      )}
    </div>
  );
}
