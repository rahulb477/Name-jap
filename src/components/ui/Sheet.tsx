import type { ReactNode } from "react";

/**
 * Bottom-sheet dialog primitive: dimmed backdrop, grab handle,
 * scrollable rounded panel. Used by Settings, Voice and Mantra screens.
 */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-end bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative max-h-[min(86dvh,86%)] w-full overflow-y-auto rounded-t-[28px] bg-[#F5F4F0] px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(0,0,0,0.25)] sm:px-5 sm:pb-7">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-black/15" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
