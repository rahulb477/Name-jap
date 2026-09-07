# Naam Jap Counter — 108 Jap

A production-ready, offline-first **jap (mantra chanting) counter** built as a
mobile-style web app with React 19, TypeScript, Vite and Tailwind CSS v4.

Count your 108 jap by bead, by bubble or by voice. Everything is stored
on-device — no accounts, no analytics, no server.

---

## Quick start

```bash
npm install       # install dependencies
npm run dev       # start dev server (http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # preview the production build
```

Node 18+ recommended. No environment variables are required — see
[Configuration](#configuration) for optional ones.

## Features

| Area | Description |
| --- | --- |
| Splash | Brand logo splash on **every** start (7 s) with progress bar. |
| Onboarding | First-run **Select Language** page (English, Assamese, Dogri, Gujarati, Hindi). Full UI localisation. |
| Home (Counter) | Tap the rudraksha bead ring to count; beads fill clockwise from the tassel; Auto/Pause with configurable speed; Reset; Today's Thought; mala rolls over at 108. |
| Game | Pop floating "राधे" bubbles — each pop counts a real jap; combo feedback; haptics. |
| Stats | Daily / Weekly / Monthly charts computed from the timestamped jap log; daily-goal bar; streak, today and lifetime tiles. |
| Mantra | Six preset mantras + **custom mantras** (add / select / remove), synced app-wide. |
| Voice | Web Speech API listens for the chosen mantra and counts utterances; **microphone permission flow** on first use; demo fallback where unsupported. |
| Settings | Haptics, language, notification time, daily goal, auto speed, speak-mantra (TTS), widget/install/**download app**, rate, share, contact, privacy, and a scoped **Reset Jap Progress** sheet. |
| PWA | Installable (manifest + icons), offline via service worker, single-file release build. |

## Project structure

```
├── index.html                  # Vite entry (meta, manifest, icons, logo preload)
├── package.json                # scripts + dependencies
├── vite.config.ts              # Vite + Tailwind v4 + singlefile plugin
├── tsconfig.json               # TypeScript config
├── .env.example                # optional env vars (copy to .env)
├── .gitignore
├── public/                     # served as-is; copied into dist/
│   ├── icon-512.png            # PWA / home-screen icon (brand logo)
│   ├── manifest.webmanifest    # install manifest
│   └── sw.js                   # offline service worker
└── src/
    ├── main.tsx                # bootstrap + service-worker registration
    ├── App.tsx                 # provider composition → AppShell
    ├── index.css               # Tailwind v4 theme, fonts, keyframes
    ├── vite-env.d.ts           # Vite client types + ImportMetaEnv
    ├── app/                    # application shell & navigation
    │   ├── AppShell.tsx        # header, tab router, splash/language phases
    │   ├── routes.ts           # tab ↔ hash route definitions
    │   ├── Splash.tsx          # 7-second boot screen with brand logo
    │   ├── LanguageScreen.tsx  # first-run language picker
    │   └── screens/            # one file per tab
    │       ├── CounterScreen.tsx
    │       ├── GameScreen.tsx
    │       ├── ProgressScreen.tsx
    │       ├── MantraScreen.tsx
    │       ├── VoiceScreen.tsx
    │       └── SettingsScreen.tsx
    ├── components/
    │   ├── Icons.tsx           # general-purpose inline SVG icons
    │   ├── NavIcons.tsx        # tab-bar / header icons
    │   ├── Decor.tsx           # app ornaments (Tassel, MalaIcon, OmArc)
    │   └── ui/                 # reusable UI primitives
    │       ├── Sheet.tsx       # bottom sheet (dialog) primitive
    │       └── Toggle.tsx      # accessible switch primitive
    ├── hooks/
    │   ├── useInView.ts        # IntersectionObserver reveal hook
    │   ├── useSpeech.ts        # Web Speech recognition hook
    │   └── useInstallPrompt.ts # PWA beforeinstallprompt hook
    ├── lib/                    # framework-free logic & config
    │   ├── config.ts           # app version, support email (env-driven)
    │   ├── data.ts             # mantras, bubble palette, Devanagari utils
    │   ├── stats.ts            # chart bucketing + time formatting
    │   ├── assets.ts           # bundled images + brand logo URL
    │   └── downloadApp.ts      # packages the app into one .html file
    ├── store/                  # state containers (context providers)
    │   ├── JapStore.tsx        # counts, malas, goal, settings, resets
    │   ├── I18n.tsx            # 5-language dictionary + provider
    │   └── ToastProvider.tsx   # global toast queue
    ├── assets/                 # bundled (inlined) artwork
    │   ├── logo.jpg            # brand logo (splash)
    │   └── hand-tap.png        # tapping-hand artwork (game)
    └── utils/cn.ts             # clsx + tailwind-merge helper
```

## Architecture notes

- **State** lives in three providers (`JapProvider`, `I18nProvider`,
  `ToastProvider`) composed in `src/App.tsx`. Screens consume them through
  `useJap()`, `useI18n()`, `useToast()` — no prop drilling, no global
  singletons.
- **Persistence**: `JapStore` serialises to `localStorage`
  (`radha-jap-store-v1`); the language choice to `radha-lang-v1`. The jap log
  is a capped array of epoch timestamps (5 000 entries) from which every stat
  and chart is derived.
- **Domain logic is UI-free**: chart bucketing (`lib/stats.ts`), mantra data
  (`lib/data.ts`) and app packaging (`lib/downloadApp.ts`) contain no JSX and
  are unit-testable as-is.
- **Navigation**: tab routes are declared once in `src/app/routes.ts` and
  mirrored to the URL hash (`#/home`, `#/stats`, …) so tabs are deep-linkable
  and the browser back button works.
- **i18n**: add a key to the `en` dictionary in `src/store/I18n.tsx`, then to
  each language dictionary (TypeScript enforces completeness). Add a language
  by extending `LANGUAGES`.
- **Offline / release**: `vite-plugin-singlefile` inlines JS, CSS and bundled
  images into `dist/index.html`; `public/sw.js` caches the shell plus the
  hosted brand logo for offline launches.

## Configuration

All variables are optional; the app runs with zero configuration.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_LOGO_URL` | hosted brand logo | Splash-screen logo source (bundled copy is the offline fallback). |
| `VITE_SUPPORT_EMAIL` | `seva@naamjap.app` | Contact address in Settings → Contact Us. |

Copy `.env.example` to `.env` and override. Never commit real secrets — this
project needs none.

## Extending

- **New screen**: create `src/app/screens/XScreen.tsx`, add an entry to
  `TABS`/`TITLES` in `AppShell.tsx` and a hash in `routes.ts`.
- **New mantra preset**: append to `MANTRAS` in `src/lib/data.ts`.
- **New language**: add a dictionary + entry in `LANGUAGES`
  (`src/store/I18n.tsx`); the compiler lists every missing key.
- **New setting**: extend `Settings` in `src/store/JapStore.tsx` (persisted
  automatically) and add a `Row` in `SettingsScreen.tsx`.

## Release

`npm run build` emits `dist/`:

- `index.html` — the complete app in one self-contained file (shareable,
  runnable offline),
- `sw.js`, `manifest.webmanifest`, `icon-512.png` — install/offline support
  when hosted as a folder.

Inside the app, **Settings → Download App** packages the same single-file app
for end users. See `RELEASE.md` for the release checklist.

## License

Proprietary / all rights reserved by the project owner unless stated
otherwise in a separate LICENSE file.
