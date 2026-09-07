/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Splash / brand logo source (optional). */
  readonly VITE_LOGO_URL?: string;
  /** Support address for Settings → Contact Us (optional). */
  readonly VITE_SUPPORT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
