import { useEffect } from "react";
import { JapProvider } from "./store/JapStore";
import { ToastProvider } from "./store/ToastProvider";
import { I18nProvider } from "./store/I18n";
import { AppShell } from "./app/AppShell";
import { useDailyReminder } from "./hooks/useDailyReminder";

function ReminderHost() {
  useDailyReminder();
  return null;
}

/**
 * Naam Jap Counter — the app.
 * Boots straight into the app shell: splash → (first run) language → tabs.
 */
export default function App() {
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  return (
    <ToastProvider>
      <I18nProvider>
        <JapProvider>
          <ReminderHost />
          <AppShell />
        </JapProvider>
      </I18nProvider>
    </ToastProvider>
  );
}
