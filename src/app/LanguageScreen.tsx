import { useState } from "react";
import { cn } from "../utils/cn";
import { LANGUAGES, useI18n, type LangCode } from "../store/I18n";

export function LanguageScreen({ onDone }: { onDone: () => void }) {
  const { lang, setLang, t } = useI18n();
  const [selected, setSelected] = useState<LangCode>(lang);

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-white">
      <header className="shrink-0 bg-cream px-4 pb-5 pt-[max(20px,calc(env(safe-area-inset-top)+16px))] text-center sm:px-5 sm:py-7">
        <h1 className="text-xl font-bold text-ink sm:text-2xl">{t("selectLanguage")}</h1>
      </header>

      <ul className="flex-1 divide-y divide-black/5 overflow-y-auto bg-[#F8F9FB]">
        {LANGUAGES.map((l) => {
          const active = selected === l.code;
          return (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => setSelected(l.code)}
                aria-pressed={active}
                className="flex w-full items-center justify-between px-6 py-6 text-left transition-colors hover:bg-peach-soft/50"
              >
                <span>
                  <span className="font-deva block text-2xl font-bold leading-tight text-ink">{l.native}</span>
                  <span className="mt-1 block text-base text-ink/45">{l.english}</span>
                </span>
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-flame transition-all",
                    active ? "bg-white" : "bg-transparent",
                  )}
                  aria-hidden="true"
                >
                  <span
                    className={cn(
                      "h-3.5 w-3.5 rounded-full bg-flame transition-transform duration-200",
                      active ? "scale-100" : "scale-0",
                    )}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="shrink-0 bg-cream px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:p-5">
        <button
          type="button"
          onClick={() => {
            setLang(selected);
            onDone();
          }}
          className="w-full rounded-2xl bg-[#F79A1C] py-3.5 text-xl font-bold text-white shadow-[0_14px_30px_rgba(247,154,28,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-flame-deep sm:py-4 sm:text-2xl"
        >
          {t("continueBtn")}
        </button>
      </div>
    </div>
  );
}
