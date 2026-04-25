# 🐪 Desert Quest — رحلة الصحراء

> Gamified Math Learning Platform for UAE Grade 4 & 8 Students
> Built for the ADEK Gamified UI Challenge — April 2026

## 🌐 Live Demo

[Live URL] — replace with Vercel URL after deployment

## 📁 Repository

[GitHub URL] — replace with your public repo URL

## ✨ Features

- 🎓 **Grade Selection** — Grade 4 (ages 9–10) and Grade 8 (ages 13–14) with grade-aware difficulty, timers, badge styles, and copy
- 📖 **Lesson Screen** — Structured lesson with objective, key points, and a worked example revealed step-by-step before each quiz
- 🎬 **Video Player** — YouTube and direct MP4 video support with a UAE-branded play overlay; placeholder card when no video is available
- 🧩 **Gamified Quiz** — 5 questions per level with hourglass timer, hint system, and animated feedback (correct/wrong, screen shake, dirham burst)
- 🗺️ **Desert Map** — Animated UAE journey across 5 iconic landmarks with a parallax camel that walks the trail
- 🌐 **Bilingual** — Full English / Arabic with proper RTL layout, Amiri body font in Arabic, Arabic-Hindu numerals everywhere
- ☀️🌙 **Day / Night Theme** — Smooth theme switching with daytime sky vs. starfield + moon backdrops
- 🔊 **Sound Effects** — Web Audio API programmatic sounds (correct, wrong, level-complete, page transition, etc.) with master sound toggle
- 🐪 **Animated Camel** — Noura (G4) and Zayed (G8) with 4 articulated motion states (idle, walking, happy, sad)
- 💰 **Dirham Rewards** — Virtual currency system with animated counter and per-level scoring
- ⬅️ **Back Buttons** — Consistent back navigation on every learning screen, RTL-aware
- 📱 **Mobile First** — Responsive from 375px to 1280px+, all touch targets ≥ 44px

## 🛠️ Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + CSS Custom Properties (theming via `data-theme`)
- Framer Motion (animations + page transitions)
- Zustand + localStorage persist (state)
- Web Audio API (sound effects, no audio files required)
- canvas-confetti (celebrations, dynamically imported)

## 🚀 Local Setup

```bash
git clone [your-repo-url]
cd desert-quest
npm install
npm run dev
# Open http://localhost:3000
```

## 📱 User Journey

```
Grade Select  →  Home  →  Map  →  Lesson  →  Quiz  →  Reward  →  Map (loop)
     /            /home    /map    /lesson/[n]  /quiz/[n]  /reward/[n]
```

## 🗂️ Project Structure

```
app/                        Next.js routes (App Router)
  ├─ page.tsx               Grade Select onboarding
  ├─ home/                  Home / hero screen
  ├─ map/                   Desert Map hub
  ├─ lesson/[level]/        Lesson before each quiz
  ├─ quiz/[level]/          Quiz screen
  ├─ reward/[level]/        Reward / level complete
  ├─ scoreboard/            Champions' Souk leaderboard
  ├─ icon.svg               Camel emoji favicon
  └─ globals.css            Theme tokens + global styles

components/
  ├─ AnimatedCamel.tsx      Articulated camel SVG (4 states)
  ├─ DesertMap.tsx          UAE map + path + nodes + walking camel
  ├─ LessonCard.tsx         Lesson layout
  ├─ VideoPlayer.tsx        YouTube / MP4 / placeholder
  ├─ QuizCard.tsx           Quiz logic + UI
  ├─ HourglassTimer.tsx     SVG hourglass with sand animation
  ├─ RewardScreen.tsx       Confetti + landmark + dirham counter + badge
  ├─ Scoreboard.tsx         Souk-styled scoreboard
  ├─ ChangeGradeModal.tsx   Grade-change confirmation modal
  ├─ Starfield.tsx          Night-mode twinkling stars
  ├─ SandTransition.tsx     Sand sweep between routes
  ├─ ClientLayout.tsx       html dir/data-theme sync + page transitions
  ├─ BismillahCalligraphy.tsx
  └─ ui/
       ├─ NavBar.tsx
       ├─ ThemeToggle.tsx
       ├─ LanguageToggle.tsx
       ├─ SoundToggle.tsx
       └─ BackButton.tsx

store/useGameStore.ts       Zustand store (persisted)

data/
  ├─ landmarks.json         5 UAE landmarks (bilingual)
  ├─ lessons.json           10 lessons (5 levels × 2 grades, bilingual)
  └─ questions/
       ├─ grade4.json       25 G4 questions
       └─ grade8.json       25 G8 questions

lib/
  ├─ i18n/                  Custom bilingual hook + en/ar JSON
  ├─ sounds.ts              Web Audio API sound bank
  ├─ types.ts               LessonData / QuestionData / Landmark
  └─ utils.ts               toArabicNumerals, starsFromScore, cn
```

## 🏛️ UAE Landmarks Featured

Dubai · Abu Dhabi · Al Ain · Liwa · Rub' al Khali

## 📋 Submission Notes

- No login required
- All data is mock (no backend)
- Progress persists in localStorage (per browser)
- Sounds require a user gesture to unlock the AudioContext (browser default)
- Tested on Chrome, Safari, and mobile browsers (375px / 768px / 1280px)
