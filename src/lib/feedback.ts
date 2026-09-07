/** Device feedback used by the counter, game, voice and settings. */

export function haptic(ms: number | number[] = [18, 12, 18]) {
  try {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
    return navigator.vibrate(ms);
  } catch {
    return false;
  }
}

export function speakMantra(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const phrase = text.trim();
  if (!phrase) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(phrase);
    u.lang = /[\u0900-\u097F]/.test(phrase) ? "hi-IN" : "en-IN";
    u.rate = 0.88;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((v) => v.lang.toLowerCase().startsWith(u.lang.toLowerCase())) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (match) u.voice = match;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function playJapFeedback(opts: { haptics: boolean; speak: boolean; mantra: string }) {
  if (opts.haptics) haptic();
  if (opts.speak) speakMantra(opts.mantra);
}
