import { useState } from "react";
import { cn } from "../../utils/cn";
import { type RangeKey } from "../../lib/data";
import { useJap } from "../../store/JapStore";
import { useI18n, type DictKey } from "../../store/I18n";
import { MalaIcon } from "../../components/Decor";
import { FireIcon } from "../../components/NavIcons";
import { useInView } from "../../hooks/useInView";

const RANGES: { key: RangeKey; label: DictKey }[] = [
  { key: "Daily", label: "rangeDaily" },
  { key: "Weekly", label: "rangeWeekly" },
  { key: "Monthly", label: "rangeMonthly" },
];

export function ProgressScreen() {
  const { chart, todayCount, goal, totalCount, streak } = useJap();
  const { t } = useI18n();
  const [range, setRange] = useState<RangeKey>("Weekly");
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  const { labels, values, highIndex, total } = chart(range);
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const goalPct = Math.min(100, Math.round((todayCount / goal) * 100));
  const suffix = range === "Daily" ? t("today") : range === "Weekly" ? t("thisWeek") : t("sixMonths");

  return (
    <div className="px-3 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5">
      <h2 className="text-center text-lg font-semibold text-ink">{t("progressTitle")}</h2>

      {/* stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <MiniStat icon={<FireIcon className="h-4 w-4" />} value={streak} label={t("dayStreak")} />
        <MiniStat value={todayCount} label={t("today")} />
        <MiniStat value={totalCount} label={t("lifetime")} />
      </div>

      {/* daily goal bar */}
      <div className="mt-4 rounded-xl bg-peach-soft px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">{t("dailyGoal")}</span>
          <span className="font-semibold text-flame">
            {todayCount}/{goal}
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-flame-soft to-flame-deep transition-[width] duration-700"
            style={{ width: `${goalPct}%` }}
          />
        </div>
      </div>

      {/* range tabs */}
      <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-[#F5E9DA] p-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={cn(
              "rounded-lg py-2.5 text-sm font-semibold transition-all duration-300",
              r.key === range
                ? "bg-gradient-to-br from-flame-soft to-flame-deep text-white shadow-[0_8px_18px_rgba(228,87,10,0.35)]"
                : "text-ink/80 hover:bg-white/70",
            )}
          >
            {t(r.label)}
          </button>
        ))}
      </div>

      <p className="mt-5 text-[13px] font-medium text-ink">{t("totalJap")}</p>
      <div className="mt-2 flex items-center justify-between rounded-lg bg-peach-soft px-4 py-3">
        <p>
          <span className="text-2xl font-bold text-flame">{total}</span>{" "}
          <span className="text-sm font-semibold text-flame">{suffix}</span>
        </p>
        <MalaIcon className="h-11 w-9" />
      </div>

      {/* chart */}
      <div ref={ref} className="mt-5 flex h-[min(32dvh,240px)] items-end justify-between gap-1 px-0.5 sm:mt-7 sm:h-[240px] sm:gap-2 sm:px-1">
        {values.map((v, i) => {
          const isHigh = i === highIndex && v > 0;
          const isLow = v === min && !isHigh;
          const h = inView && max > 0 ? (v / max) * 100 : 0;
          return (
            <div key={`${range}-${labels[i]}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              {isHigh ? (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-bold text-flame shadow-[0_6px_16px_rgba(150,90,30,0.18)]">
                  {v}
                </span>
              ) : (
                <span className={cn("text-xs font-semibold", isLow ? "text-[#9CA3AF]" : "text-peach-deep")}>
                  {v}
                </span>
              )}
              <div
                className={cn(
                  "rounded-full transition-[height] duration-[900ms] ease-out",
                  isHigh
                    ? "w-3.5 bg-gradient-to-t from-flame-deep to-flame-soft shadow-[0_10px_22px_rgba(228,87,10,0.35)]"
                    : isLow
                      ? "w-2.5 bg-[#C9CDD3]"
                      : "w-2.5 bg-peach",
                )}
                style={{ height: `${Math.max(h, v > 0 ? 4 : 0)}%`, transitionDelay: `${i * 70}ms` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between gap-2 border-t border-ink/5 px-1 pt-3">
        {labels.map((l, i) => (
          <span key={`${l}-${i}`} className="flex-1 text-center text-xs font-medium text-ink/80">
            {l}
          </span>
        ))}
      </div>

      {total === 0 && (
        <p className="mt-5 text-center text-xs font-medium text-ink/45">{t("noData")}</p>
      )}
    </div>
  );
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon?: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-peach-soft/70 py-3 text-center">
      <p className="flex items-center justify-center gap-1 text-xl font-bold leading-none text-flame">
        {icon}
        {value}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ink/50">{label}</p>
    </div>
  );
}
