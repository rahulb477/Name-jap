/**
 * Build-time configuration. Every value has a safe default so the app
 * runs with zero environment variables (see .env.example).
 */
export const APP_VERSION = "1.3.0";

export const SUPPORT_EMAIL: string =
  (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) ?? "seva@naamjap.app";
