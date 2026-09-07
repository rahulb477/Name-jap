# Radha Naam — 108 Jap Counter · Release v1.0.0

## The release file

Run the production build:

```bash
npm run build
```

The complete, shippable app is emitted as a **single self-contained file**:

```
dist/index.html
```

Everything is inlined into that one HTML document:

- the full application JavaScript (React 19 bundle),
- the complete stylesheet (Tailwind v4 + custom design system),
- both raster artworks (`hero-mala.jpg`, `hand-tap.png`) as base64 data-URIs,
  because images live in `src/assets/` and are imported through the bundler
  (`src/lib/assets.ts`) rather than served from `public/`.

No other files are required. You can:

- open `dist/index.html` directly from disk (double-click),
- email / AirDrop / WhatsApp the single file,
- upload it to any static host (Netlify, Vercel, GitHub Pages, S3, cPanel…),
- wrap it in Capacitor / Cordova / a WebView for store distribution.

The only optional network dependency is Google Fonts (Poppins + Noto Sans
Devanagari); if offline, the app degrades gracefully to system fonts.

## What's inside the app

| Area | Behaviour |
| --- | --- |
| Splash & onboarding | Splash screen on every start; first-run Select Language page (5 languages); the entire UI is localised. |
| App shell | Mobile-first device frame on desktop, full-screen on phones; header with mantra + streak; 5-tab bottom navigation. |
| Jap tab | Tap the rudraksha ring to count; beads fill clockwise from the tassel; Auto / Pause and Reset; 108 completes a mala and rolls over. |
| Game tab | Pop floating "राधे" bubbles — each pop is a real jap with combo feedback. |
| Stats tab | Daily / Weekly / Monthly charts computed from the real timestamped jap log, daily-goal bar, streak / today / lifetime tiles. |
| Mantra tab | Six mantras; selection syncs across counter, voice, header and landing demos. |
| Voice tab | Web Speech API listens for the mantra (hi-IN) and counts each utterance; graceful demo fallback where unsupported. |
| Get the app | Settings → **Download App** packages the running app into one standalone `.html` file (`NaamJap-Counter-v1.3.0.html`) and downloads it; **Install App** fires the native PWA install prompt (or shows home-screen steps). |

## Persistence

All state (mantra, custom mantras, current mala, completed malas, daily goal,
settings, timestamped jap log capped at 5 000 entries) and the chosen language
are stored in `localStorage` and survive reloads. The app boots straight into
the shell: splash → language (first run only) → tabs.

## Data & privacy

100 % on-device. No analytics, no network calls, no accounts.

## Versioning

Bump the version string in `src/components/Footer.tsx` and in this file when
shipping a new release.
