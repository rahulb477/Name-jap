import { useState } from "react";
import { cn } from "../../utils/cn";
import { MANTRAS } from "../../lib/data";
import { useJap } from "../../store/JapStore";
import { useI18n } from "../../store/I18n";
import { useToast } from "../../store/ToastProvider";
import { Check, ChevronRight } from "../../components/Icons";
import { Sheet } from "../../components/ui/Sheet";
import { OmArc } from "../../components/Decor";

export function MantraScreen() {
  const { mantra, setMantra, customMantras, addCustomMantra, removeCustomMantra } = useJap();
  const { t } = useI18n();
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const saveCustom = () => {
    const clean = draft.trim();
    if (!clean) return;
    const added = addCustomMantra(clean);
    setMantra(clean);
    setSheetOpen(false);
    setDraft("");
    toast(added ? `${t("toastMantraAdded")} — ${clean}` : `${t("toastMantraSet")} — ${clean}`);
  };

  const renderRow = (m: string, custom: boolean) => {
    const active = m === mantra;
    return (
      <li key={m} className="relative">
        <button
          type="button"
          onClick={() => {
            setMantra(m);
            toast(`${t("toastMantraSet")} — ${m}`);
          }}
          aria-pressed={active}
          className={cn(
            "group flex w-full items-center justify-between text-left transition-all duration-300",
            active
                    ? "-mx-3 mb-2 rounded-xl bg-gradient-to-br from-flame-soft to-flame-deep px-5 py-3.5 pr-12 text-[16px] font-semibold text-white shadow-[0_16px_34px_rgba(228,87,10,0.4)] sm:-mx-5 sm:px-7 sm:py-4 sm:pr-14 sm:text-[17px]"
              : "border-b border-ink/5 px-1 py-[18px] pr-12 text-[15px] font-medium text-ink hover:pl-3 hover:text-flame",
          )}
        >
          <span className="flex items-center gap-2">
            {m}
            {custom && !active && (
              <span className="rounded-full bg-peach-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-flame">
                {t("customChip")}
              </span>
            )}
          </span>
          {active ? (
            <Check className="h-6 w-6 shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 shrink-0 text-ink/55 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>
        {custom && (
          <button
            type="button"
            aria-label={`Remove ${m}`}
            onClick={() => {
              removeCustomMantra(m);
              toast(`${t("toastRemoved")} — ${m}`);
            }}
            className={cn(
              "absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/35 transition-colors hover:bg-red-50 hover:text-red-500",
              active ? "top-[26px] text-white/70 hover:bg-white/15 hover:text-white" : "",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </li>
    );
  };

  return (
    <div className="px-3 pb-2 pt-4 sm:px-5 sm:pt-5">
      <h2 className="text-center text-lg font-semibold text-ink">{t("selectMantra")}</h2>

      <ul className="mt-6">
        {MANTRAS.map((m) => renderRow(m, false))}
        {customMantras.map((m) => renderRow(m, true))}
        <li className="mt-4">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-flame/40 bg-peach-soft/40 py-4 text-[15px] font-semibold text-flame transition-all duration-300 hover:-translate-y-0.5 hover:border-flame hover:bg-peach-soft"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            {t("addCustom")}
          </button>
        </li>
      </ul>

      <OmArc className="-mx-5 h-32" />

      {/* add custom mantra sheet */}
      {sheetOpen && (
        <Sheet title={t("addCustom")} onClose={() => setSheetOpen(false)}>
            <h3 className="text-2xl font-bold text-ink">{t("addCustom")}</h3>
            <p className="mt-2 text-sm text-ink/55">{t("customDesc")}</p>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveCustom()}
              placeholder={t("customPlaceholder")}
              maxLength={40}
              autoFocus
              className="mt-5 w-full rounded-xl border border-flame/30 bg-white px-4 py-4 text-lg font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink/35 focus:border-flame"
            />
            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="px-4 py-3 text-lg font-semibold text-ink/35 transition-colors hover:text-ink/60"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={saveCustom}
                disabled={!draft.trim()}
                className="flex-1 rounded-full bg-gradient-to-br from-flame-soft to-flame-deep py-4 text-xl font-bold text-white shadow-[0_14px_30px_rgba(228,87,10,0.4)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:shadow-none"
              >
                {t("save")}
              </button>
            </div>
        </Sheet>
      )}
    </div>
  );
}
