import handTap from "../assets/hand-tap.png";
import logo from "../assets/logo.jpg";

/**
 * Raster artwork is imported (not served from /public) so the production
 * build inlines it into the single release HTML file.
 */
export const IMAGES = {
  handTap,
  logo,
} as const;

/** Official brand logo (hosted, overridable via VITE_LOGO_URL). Cached by the
 *  service worker after first visit; the bundled `IMAGES.logo` is used as an
 *  offline fallback. */
export const BRAND_LOGO_URL: string =
  (import.meta.env.VITE_LOGO_URL as string | undefined) ||
  "https://i.ibb.co/XkVjBZgS/file-0000000029a08211b003c9183bac1fef.png";
