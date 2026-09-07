import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal typings for the Web Speech API (not in standard TS lib DOM). */
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export const speechSupported =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

/**
 * Listens to the microphone and fires `onMatch` each time any of the
 * provided keywords is heard. Falls back gracefully if unsupported.
 */
export function useSpeech(keywords: string[], onMatch: () => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const wantRef = useRef(false);
  const seenRef = useRef(0);
  const matchRef = useRef(onMatch);
  matchRef.current = onMatch;
  const kwRef = useRef(keywords);
  kwRef.current = keywords;

  const stop = useCallback(() => {
    wantRef.current = false;
    setListening(false);
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(() => {
    const rec = getRecognition();
    if (!rec) {
      setListening(false);
      return false;
    }
    recRef.current = rec;
    rec.lang = "hi-IN";
    rec.continuous = true;
    rec.interimResults = true;
    seenRef.current = 0;

    rec.onresult = (e) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      const lower = transcript.toLowerCase();
      let hits = 0;
      for (const kw of kwRef.current) {
        const parts = lower.split(kw.toLowerCase());
        hits += parts.length - 1;
      }
      if (hits > seenRef.current) {
        for (let i = seenRef.current; i < hits; i++) matchRef.current();
        seenRef.current = hits;
      }
    };
    rec.onerror = () => {
      /* keep going; onend will restart if wanted */
    };
    rec.onend = () => {
      if (wantRef.current) {
        seenRef.current = 0;
        try {
          rec.start();
        } catch {
          /* ignore */
        }
      } else {
        setListening(false);
      }
    };

    wantRef.current = true;
    try {
      rec.start();
      setListening(true);
      return true;
    } catch {
      setListening(false);
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      wantRef.current = false;
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { listening, start, stop, supported: speechSupported };
}
