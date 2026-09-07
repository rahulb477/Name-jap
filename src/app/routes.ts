/**
 * Single source of truth for in-app navigation.
 * Each tab is mirrored to a URL hash so screens are deep-linkable
 * (`#/stats`, `#/settings`, …) and the browser back button works.
 */
export type TabId = "counter" | "progress" | "mantra" | "voice" | "game" | "settings";

export const TAB_HASHES: Record<TabId, string> = {
  counter: "#/home",
  progress: "#/stats",
  mantra: "#/mantra",
  voice: "#/voice",
  game: "#/game",
  settings: "#/settings",
};

export const DEFAULT_TAB: TabId = "counter";

export function hashFor(tab: TabId): string {
  return TAB_HASHES[tab];
}

export function tabFromHash(hash: string): TabId {
  const found = (Object.keys(TAB_HASHES) as TabId[]).find((k) => TAB_HASHES[k] === hash);
  return found ?? DEFAULT_TAB;
}
