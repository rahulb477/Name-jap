import { useEffect, useRef } from "react";
import { haptic } from "../lib/feedback";
import { useJap } from "../store/JapStore";
import { useToast } from "../store/ToastProvider";
import { useI18n } from "../store/I18n";

const LAST_KEY = "radha-last-notif-day";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function nextAt(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const next = new Date();
  next.setHours(h || 0, m || 0, 0, 0);
  if (next.getTime() <= Date.now() + 1500) next.setDate(next.getDate() + 1);
  return next;
}

function showNotification(title: string, body: string) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
    const n = new Notification(title, {
      body,
      tag: "naam-jap-daily",
      icon: "./icon-512.png",
      silent: false,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}

/**
 * Fires a once-a-day reminder at `settings.notifTime` while the app is open
 * (or in a background tab). Requests nothing on its own — Settings asks
 * for Notification permission when the user picks a time.
 */
export function useDailyReminder() {
  const { settings, mantra } = useJap();
  const toast = useToast();
  const { t } = useI18n();
  const fired = useRef(false);

  useEffect(() => {
    fired.current = localStorage.getItem(LAST_KEY) === todayKey();

    const fire = () => {
      if (fired.current) return;
      fired.current = true;
      try {
        localStorage.setItem(LAST_KEY, todayKey());
      } catch {
        /* ignore */
      }
      haptic([40, 30, 80, 30, 40]);
      const title = t("notifTitle");
      const body = `${mantra} — ${t("notifBody")}`;
      showNotification(title, body);
      toast(title);
    };

    const arm = () => {
      const wait = nextAt(settings.notifTime).getTime() - Date.now();
      return window.setTimeout(fire, Math.max(1000, wait));
    };

    const timer = arm();
    // backup poll — mobile browsers throttle long timeouts in background tabs
    const poll = window.setInterval(() => {
      if (fired.current) return;
      const now = new Date();
      const [h, m] = settings.notifTime.split(":").map(Number);
      if (now.getHours() === h && now.getMinutes() === m) fire();
    }, 20_000);

    const onVis = () => {
      if (document.visibilityState === "visible") {
        fired.current = localStorage.getItem(LAST_KEY) === todayKey();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [settings.notifTime, mantra, t, toast]);
}

export async function requestNotifPermission(): Promise<"granted" | "denied" | "unsupported"> {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    const res = await Notification.requestPermission();
    return res === "granted" ? "granted" : "denied";
  } catch {
    return "denied";
  }
}
