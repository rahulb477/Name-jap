import { cn } from "../utils/cn";

/* ---------------- saffron tassel hanging under the mala ---------------- */
export function Tassel({ className }: { className?: string }) {
  const strands = [-16, -11, -6, 0, 6, 11, 16];
  return (
    <svg viewBox="0 0 60 92" className={className} aria-hidden="true">
      <circle cx="30" cy="9" r="7" fill="#E8891B" />
      <rect x="23.5" y="13" width="13" height="11" rx="5" fill="#D97706" />
      {strands.map((t, i) => (
        <path
          key={t}
          d={`M30 23 C ${30 + t * 0.5} 44, ${30 + t} 60, ${30 + t * 1.5} 86`}
          stroke={i % 2 === 0 ? "#F5A623" : "#E8891B"}
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  );
}

/* ---------------- tiny dotted mala icon (progress card) ---------------- */
export function MalaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 46" className={className} aria-hidden="true">
      <path
        d="M20 9c9.5 4 14.5 13.5 9.5 21.5-5 8-17.5 8-21.5 0C3.5 21.5 10.5 13 20 9"
        fill="none"
        stroke="#8A4520"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="0.1 6.6"
      />
      <path d="M20 3.5v4" stroke="#C4271C" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="20" cy="8.5" r="3.6" fill="#C4271C" />
    </svg>
  );
}

/* ---------------- arc of faint Om symbols ---------------- */
export function OmArc({ className }: { className?: string }) {
  const arcs = [
    { r: 46, n: 5, size: 15, o: 0.55 },
    { r: 78, n: 7, size: 17, o: 0.45 },
    { r: 112, n: 9, size: 19, o: 0.36 },
    { r: 148, n: 11, size: 21, o: 0.28 },
  ];
  return (
    <div className={cn("pointer-events-none relative overflow-hidden", className)} aria-hidden="true">
      {arcs.map((arc, ai) =>
        Array.from({ length: arc.n }).map((_, i) => {
          const angle = Math.PI - (i / (arc.n - 1)) * Math.PI; // 180deg -> 0deg
          const x = Math.cos(angle) * arc.r;
          const y = Math.sin(angle) * arc.r;
          return (
            <span
              key={`${ai}-${i}`}
              className="font-deva absolute text-[#D98E5F]"
              style={{
                left: `calc(50% + ${x}px - ${arc.size / 2}px)`,
                bottom: `${y - 24}px`,
                fontSize: `${arc.size}px`,
                opacity: arc.o,
                transform: `rotate(${(angle * 180) / Math.PI - 90}deg)`,
              }}
            >
              ॐ
            </span>
          );
        }),
      )}
    </div>
  );
}
