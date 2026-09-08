import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { hashFor, tabFromHash, type TabId } from "./routes";
import { useJap } from "../store/JapStore";
import { useI18n, type DictKey } from "../store/I18n";
import {
  BeadIcon,
  GameIcon,
  ChartIcon,
  ListIcon,
  MicNavIcon,
  FireIcon,
  HomeIcon,
  GearIcon,
} from "../components/NavIcons";
import { CounterScreen } from "./screen/CounterScreen";
import { GameScreen } from "./screen/GameScreen";
import { ProgressScreen } from "./screen/ProgressScreen";
import { MantraScreen } from "./screen/MantraScreen";
import { VoiceScreen } from "./screen/VoiceScreen";
import { SettingsScreen } from "./screen/SettingsScreen";
import { Splash } from "./Splash";
import { LanguageScreen } from "./LanguageScreen";

type Phase = "splash" | "lang" | "main";

const TABS: { id: TabId; labelKey: DictKey; Icon: typeof BeadIcon }[] = [
  { id: "counter", labelKey: "tabHome", Icon: HomeIcon },
  { id: "progress", labelKey: "tabStats", Icon: ChartIcon },
  { id: "mantra", labelKey: "tabMantra", Icon: ListIcon },
  { id: "voice", labelKey: "tabVoice", Icon: MicNavIcon },
  { id: "game", labelKey: "tabGame", Icon: GameIcon },
  { id: "settings", labelKey: "tabSettings", Icon: GearIcon },
];

const TITLES: Record<TabId, DictKey> = {
  counter: "appTitle",
  game: "tabGame",
  progress: "tabStats",
  mantra: "tabMantra",
  voice: "tabVoice",
  settings: "tabSettings",
};

export function AppShell() {
  const { mantra, streak, todayCount } = useJap();
  const { t, isSet } = useI18n();
  const [tab, setTab] = useState<TabId>(() => tabFromHash(window.location.hash));
  const [phase, setPhase] = useState<Phase>("splash");

  // mirror the active tab to the URL hash (deep links + back button)
  useEffect(() => {
    if (window.location.hash !== hashFor(tab)) {
      history.replaceState(null, "", hashFor(tab));
    }
  }, [tab]);

  useEffect(() => {
    const onHash = () => setTab(tabFromHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="flex min-h-dvh justify-center bg-gradient-to-b from-[#F6DCAE] via-[#F3CE93] to-[#EBB871]">
      {/* app column — full-bleed on phones, capped on large tablets/desktop */}
      <div className="relative flex h-dvh min-h-dvh w-full max-w-[520px] flex-col overflow-hidden bg-white shadow-[0_0_90px_rgba(120,70,20,0.28)]">
        {phase !== "splash" && (
          <>
            {/* header */}
            <header className="relative z-20 shrink-0 bg-gradient-to-b from-cream to-[#FDF3E0] px-3 pb-3 pt-[calc(env(safe-area-inset-top,0px)+12px)] sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="font-deva flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-flame-soft to-flame-deep text-lg font-semibold text-white shadow-[0_6px_16px_rgba(228,87,10,0.35)]">
                    ॐ
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold leading-tight text-ink">{t(TITLES[tab])}</p>
                    <p className="font-deva truncate text-xs font-medium text-flame">{mantra}</p>
                  </div>
                </div>

                <div
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-flame/25 bg-flame/10 px-3.5 text-flame"
                  aria-label={`${streak} day streak`}
                >
                  <FireIcon className="h-4 w-4" />
                  <span className="text-sm font-bold">
                    {streak} {t("dayStreak").split(" ")[0]}
                  </span>
                </div>
              </div>
            </header>

            {/* screen */}
            <main className="relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-white">
              <div key={tab} className="reveal in-view min-h-full w-full max-w-full">
                {tab === "counter" && <CounterScreen />}
                {tab === "game" && <GameScreen />}
                {tab === "progress" && <ProgressScreen />}
                {tab === "mantra" && <MantraScreen />}
                {tab === "voice" && <VoiceScreen />}
                {tab === "settings" && (
                  <SettingsScreen onOpenLanguage={() => setPhase("lang")} />
                )}
              </div>
            </main>

            {/* bottom nav */}
            <nav className="relative z-20 grid shrink-0 grid-cols-6 border-t border-black/5 bg-white/95 px-0.5 pt-1 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur sm:px-1">
              {TABS.map(({ id, labelKey, Icon }) => {
                const activeTab = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    aria-current={activeTab ? "page" : undefined}
                    className="group relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 outline-none"
                  >
                    <span
                      className={cn(
                        "relative flex h-8 w-11 items-center justify-center rounded-full transition-all duration-300",
                        activeTab
                          ? "bg-gradient-to-br from-flame-soft to-flame-deep text-white shadow-[0_8px_18px_rgba(228,87,10,0.4)]"
                          : "text-ink/45 group-hover:text-flame",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {id === "game" && todayCount > 0 && !activeTab && (
                        <span className="absolute right-1.5 top-0.5 h-1.5 w-1.5 rounded-full bg-flame" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "max-w-full truncate px-0.5 text-[9px] font-semibold leading-tight transition-colors sm:text-[10px]",
                        activeTab ? "text-flame" : "text-ink/45",
                      )}
                    >
                      {t(labelKey)}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* language page (first run or from settings) */}
            {phase === "lang" && <LanguageScreen onDone={() => setPhase("main")} />}
          </>
        )}

        {/* splash on every app start */}
        {phase === "splash" && (
          <Splash onDone={() => setPhase(isSet ? "main" : "lang")} />
        )}
      </div>
    </div>
  );
}
