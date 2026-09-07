import { cn } from "../../utils/cn";

/** Accessible on/off switch. Real <button> so it works even inside a row. */
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!on);
      }}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300",
        on ? "bg-flame" : "bg-[#D8D8D8]",
      )}
    >
      <span
        className={cn(
          "absolute h-7 w-7 rounded-full bg-white shadow transition-all duration-300",
          on ? "left-6" : "left-0.5",
        )}
      />
    </button>
  );
}
