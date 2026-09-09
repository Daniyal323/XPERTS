# XPERTS — Expert Marketplace for SMEs

Mobile-first marketplace connecting small/medium enterprises (SMEs) with independent
industry experts for project-based consulting engagements. Production build.

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite, Tailwind v4 (design tokens), React Router 7
- **Backend:** Firebase — Auth, Firestore (system of record), FCM-ready. Runs on the
  free **Spark** plan: profile images are compressed client-side and stored in Firestore
  (no Cloud Storage / Blaze upgrade required).
- **Mobile:** Capacitor (iOS + Android)
- **i18n:** react-i18next (English + German, German-first)
- **Data fetching:** typed service layer over Firestore + @tanstack/react-query

## Architecture

```
src/
  app/
    types/         Domain model (single source of truth)
    services/
      firebaseConfig.ts   Firebase init (ignoreUndefinedProperties on)
      matching.ts         Unified expert↔project match scorer (used by both sides)
      data/               Typed Firestore layer (realtime subscriptions + CRUD)
                          users · projects · applications · ratings · messages · storage
    context/       AuthContext (realtime profile), ProjectContext (wizard draft), LoadingContext
    i18n/          i18next setup + en/de locale resources + useLocale()
    lib/           format · validation · authErrors · categories · conversation · googleMaps
    components/
      shared/      Screen · AppHeader · BottomNav · FormField · TagInput · StateViews
                   StatusBadge · MatchScoreBadge · WizardProgress · RatingDialog · LanguageToggle
      ui/          shadcn/ui primitives
    screens/       onboarding · sme · expert · shared
```

**Data flow:** components never touch Firestore directly — they call `services/data/*`,
which returns typed entities and exposes `subscribe*` (realtime) + one-shot fetches.
All reads/subscriptions surface errors (no infinite spinners).

### Firestore collections

- `users/{uid}` — account + embedded `expert` / `sme` profile
- `projects/{id}` — SME consulting requests
- `applications/{id}` — expert applications (denormalized project + expert snapshots)
- `ratings/{id}` — SME→expert reviews (expert aggregate maintained transactionally)
- `conversations/{id}` + `messages` subcollection — realtime chat

## Setup

```bash
npm install
cp .env.example .env   # fill in Firebase + Google Maps keys
npm run dev            # http://localhost:5173
```

Required env vars: `VITE_FIREBASE_*` (web config), `VITE_GOOGLE_MAPS_API_KEY` (map view).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build (`dist/`) |
| `npm run typecheck` | `tsc --noEmit` (must be clean) |

## Firebase deployment

Rules and indexes live in this repo and deploy via the Firebase CLI:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

- `firestore.rules` — role/owner-based access control
- `firestore.indexes.json` — composite indexes

> Firebase Cloud Storage is intentionally **not** used (it requires the paid Blaze
> plan). Profile photos/logos are downscaled to ~256px JPEGs client-side
> (`lib/image.ts`) and stored as data URLs on the Firestore user document. If the
> project is upgraded to Blaze later, swap `services/data/storage.ts` for real
> Storage uploads.

## Mobile (Capacitor)

```bash
npm run build
npx cap sync
npx cap open ios      # or android
```

## Conventions

- No hardcoded colors — use design tokens (`bg-brand-700`, `text-muted-foreground`, …) from `styles/theme.css`.
- No hardcoded strings — everything via `t()`; add keys to **both** `en.json` and `de.json`.
- No direct Firestore in components — go through `services/data/*`.
- Keep `npm run typecheck` clean.
