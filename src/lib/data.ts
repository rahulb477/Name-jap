export const MANTRAS: string[] = [
  "Radhe Radhe",
  "Om Namah Shivay",
  "Sita Ram",
  "Shiv",
  "Hare Krishna",
  "Om Namo Narayanaya",
];

export type Mantra = string;

export type RangeKey = "Daily" | "Weekly" | "Monthly";

export const CHART_DATA: Record<
  RangeKey,
  { labels: string[]; values: number[]; suffix: string }
> = {
  Daily: {
    labels: ["6a", "9a", "12p", "3p", "6p", "9p", "11p"],
    values: [14, 22, 18, 34, 48, 26, 6],
    suffix: "Today",
  },
  Weekly: {
    labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    values: [105, 98, 85, 120, 70, 30, 101],
    suffix: "This Week",
  },
  Monthly: {
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [388, 452, 301, 510, 465, 240, 609],
    suffix: "This Month",
  },
};

const DEVA_DIGITS = "०१२३४५६७८९";

/** Convert a number to Devanagari numerals (102 -> १०२) */
export function devanagari(n: number): string {
  return String(n).replace(/\d/g, (d) => DEVA_DIGITS[Number(d)]);
}

export type BubbleColor = {
  base: string;
  dark: string;
  text: string;
};

export const BUBBLE_COLORS: BubbleColor[] = [
  { base: "#F6C214", dark: "#D89A00", text: "#FFFFFF" },
  { base: "#8A7B72", dark: "#6B5D54", text: "#FFFFFF" },
  { base: "#1795A8", dark: "#0E6E7E", text: "#FFFFFF" },
  { base: "#2E9BE6", dark: "#1673C0", text: "#FFFFFF" },
  { base: "#E8481C", dark: "#B93210", text: "#FFE066" },
  { base: "#2E9E44", dark: "#1E7A31", text: "#FFFFFF" },
  { base: "#2BA8A0", dark: "#1D7F78", text: "#FFFFFF" },
  { base: "#8E6A86", dark: "#6E4E68", text: "#FFFFFF" },
];
