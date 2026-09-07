import { useEffect, useState } from "react";
import { useI18n } from "../store/I18n";
import { BRAND_LOGO_URL, IMAGES } from "../lib/assets";

const SPLASH_MS = 7000;

export function Splash({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(6);
  const [logoSrc, setLogoSrc] = useState(BRAND_LOGO_URL);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(94));
    const done = window.setTimeout(onDone, SPLASH_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#F3EDE3] px-4 py-[max(16px,env(safe-area-inset-top))]">
      <div className="w-full max-w-[320px] rounded-[28px] border border-white/80 bg-gradient-to-b from-[#F7EADA] to-[#F2E3CF] px-6 pb-8 pt-8 text-center shadow-[0_30px_70px_rgba(150,100,40,0.18)] sm:px-8 sm:pb-12 sm:pt-12">
        <img
          src={logoSrc}
          alt="Naam Jap — राधे"
          onError={() => setLogoSrc(IMAGES.logo)}
          className="mx-auto h-[min(176px,38vw)] w-[min(176px,38vw)] rounded-[28%] object-cover shadow-[0_18px_44px_rgba(180,110,30,0.35)]"
        />

        <div className="mx-auto mt-7 h-px w-14 bg-[#B98D5F] sm:mt-9" />

        <p className="mt-4 text-[11px] font-medium tracking-[0.28em] text-[#8A5A33] sm:mt-5 sm:text-sm sm:tracking-[0.3em]">
          {t("splashTag")}
        </p>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#E4D6C2]">
          <div
            className="h-full rounded-full bg-flame transition-[width] ease-out"
            style={{ width: `${progress}%`, transitionDuration: `${SPLASH_MS - 600}ms` }}
          />
        </div>
        <p className="mt-3 text-[10px] font-medium tracking-[0.22em] text-[#8A5A33] sm:text-xs sm:tracking-[0.25em]">
          {t("splashInit")}
        </p>
      </div>
    </div>
  );
}
