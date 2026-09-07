import type { RangeKey } from "./data";

/** Pure, UI-free statistics helpers derived from the timestamped jap log. */

const DAY = 86_400_000;

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export type ChartResult = {
  labels: string[];
  values: number[];
  highIndex: number;
  total: number;
};

/** Bucket a timestamp log into Daily / Weekly / Monthly series. */
export function buildChart(log: number[], range: RangeKey): ChartResult {
  const now = new Date();
  const buckets: { label: string; from: number; to: number }[] = [];

  if (range === "Daily") {
    const base = startOfDay(now).getTime();
    const slots = [
      ["6a", 6, 9],
      ["9a", 9, 12],
      ["12p", 12, 15],
      ["3p", 15, 18],
      ["6p", 18, 21],
      ["9p", 21, 24],
    ] as const;
    for (const [label, h1, h2] of slots) {
      buckets.push({ label, from: base + h1 * 3_600_000, to: base + h2 * 3_600_000 });
    }
  } else if (range === "Weekly") {
    const base = startOfDay(now).getTime();
    for (let i = 6; i >= 0; i--) {
      const from = base - i * DAY;
      buckets.push({ label: WEEKDAY[new Date(from).getDay()], from, to: from + DAY });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const from = d.getTime();
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime();
      buckets.push({ label: MONTH[d.getMonth()], from, to });
    }
  }

  const values = buckets.map((b) => log.filter((t) => t >= b.from && t < b.to).length);
  const total = values.reduce((a, b) => a + b, 0);
  let highIndex = 0;
  values.forEach((v, i) => {
    if (v >= values[highIndex]) highIndex = i;
  });

  return { labels: buckets.map((b) => b.label), values, highIndex, total };
}

/** "07:30" → "7:30 AM" */
export function formatTime(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  let h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${suffix}`;
}
