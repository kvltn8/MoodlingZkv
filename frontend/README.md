# Moodling — frontend

An Expo Router (React Native) app for Moodling: a mood journal that reflects
your feelings back to you and recommends a Surah to sit with, plus a light
task tracker. Built against `backend/moodflow` (Django REST + Djoser JWT) in
this repo.

## Stack

- **Expo Router** (file-based navigation, `app/`)
- **TypeScript**
- **react-native-reanimated** + **react-native-svg** for the animated mood
  mascots, the home scale/gauge, and the "Moodling" wordmark intro
- **expo-av** for in-card Surah audio playback
- **expo-secure-store** for JWT storage
- **Fonts**: Lobster Two (wordmark/headlines) + Dancing Script (accents),
  loaded via `@expo-google-fonts`

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` and point `EXPO_PUBLIC_API_URL` at your running Django backend.
On a physical device or simulator, `localhost` won't reach your dev machine —
use your machine's LAN IP (e.g. `http://192.168.1.42:8000`).

Then, from `backend/`, run the Django server so it's reachable on your LAN:

```bash
python manage.py runserver 0.0.0.0:8000
```

Back in `frontend/`:

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` for a simulator.

> This was hand-written against Expo SDK 51 pins. If your installed Expo CLI
> is newer, run `npx expo install --fix` once after `npm install` to align
> native package versions with your SDK — Expo will rewrite the versions in
> `package.json` for you.

## How it maps to the backend

| Screen | Endpoint(s) |
|---|---|
| Sign in / Register | `POST /auth/jwt/create/`, `POST /auth/users/`, `GET /auth/users/me/` |
| Home (scale, stats) | `GET /moods/`, `GET /tasklists/` |
| Log a mood | `POST /moods/` with `{ mood, description, animations }` |
| Moods list + Surah card | `GET /moods/` (each entry already carries `quran_recommendations` from the serializer, including `audio_url`) |
| Tasks | `GET/POST /tasklists/`, `PATCH /tasklists/:id/` (`is_done`), `DELETE /tasklists/:id/` |
| Profile | `GET /auth/users/me/`, sign-out clears the stored JWT |

Note the `TaskList` serializer uses a capitalized `Task` field (not `task`) —
the frontend's `TaskItem` type and `useTasks` hook match that exactly, so
don't "fix" the casing on just one side if you touch the model later.

`MoodEntry.animations` is a fixed choice of 7 states (`happy`, `calm`,
`focused`, `tired`, `sad`, `anxious`, `excited`) — that's what drives both the
mascot expression and which `MoodSurahRecommendation` rows come back, so the
mood-picker only lets people choose from those 7 rather than free-typing a
mood.

## Design notes

- Palette: warm ivory + deep emerald + muted gold — "quiet luxury," calm
  rather than loud. See `constants/theme.ts` for every token (colors, radii,
  shadows, per-mood palette).
- **Mood mascots** (`components/MoodMascot.tsx`) are hand-built animated SVG
  characters (breathing, blinking, mood-specific expression) rather than
  fetched Lottie files — this keeps the app fully offline-safe for
  animations with no risk of a dead third-party asset link. If you'd rather
  use real Lottie animations from LottieFiles, swap this one component: add
  `lottie-react-native`, drop your `.json` files in `assets/lottie/`, and
  render `<LottieView source={...} autoPlay loop />` in place of the SVG —
  every screen already imports `MoodMascot` by `mood` + `size` props only, so
  nothing else needs to change.
- The intro screen (`app/index.tsx` + `components/AnimatedWordmark.tsx`)
  pops in "Moodling" letter-by-letter in Lobster Two, echoing Apple's
  boot-up "hello" animation, then routes to sign-in or the dashboard.

## Structure

```
frontend/
  app/
    index.tsx              intro / wordmark animation, then redirects
    (auth)/login.tsx, register.tsx
    (tabs)/home.tsx, moods.tsx, tasks.tsx, profile.tsx
    mood/new.tsx            modal — pick a mood, add a note, save
  components/               MoodMascot, MoodScale, MoodCard, TaskRow, Button…
  context/AuthContext.tsx   JWT login/register/refresh/logout
  hooks/useMoods.ts, useTasks.ts
  constants/theme.ts, api.ts
```

## Known gaps / next steps

- The backend's view permission classes are currently commented out
  (`#permission_classes = [IsAuthenticated]`), but `perform_create` still
  sets `user=self.request.user` — that will fail against an anonymous
  request. Uncomment those permission classes so the JWT this app sends is
  actually required; the frontend already sends it on every request.
- No offline cache / retry queue yet — mood and task writes are optimistic
  in the UI but not persisted locally if the request fails offline.
- Icons/splash in `assets/` are solid-color placeholders — swap in real
  artwork before shipping.
