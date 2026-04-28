# 🐪 Desert Quest — رحلة الصحراء

> A gamified math learning platform for UAE Grade 4 & 8 students
> Built for the ADEK Gamified UI Challenge — April 2026

## 🌐 Live Demo

**https://desert-quest.vercel.app**

## 📁 Repository

**https://github.com/steve-deffo/desert-quest**

---

## ✨ Features

### 🎓 Learning

- Grade 4 & Grade 8 adaptive math curriculum
- Structured lesson screen with worked examples before every quiz
- YouTube video integration per lesson topic
- Wrong-answer review with AI-generated explanations
- Infinite practice mode with AI question generation

### 🧠 AI-Powered (Claude `claude-haiku-4-5-20251001`)

- Smart hints that adapt to the student's specific mistake
- "Ask the Sage" math tutoring chatbot (Zayed the camel)
- AI-written personalized parent progress reports
- Adaptive difficulty based on performance history

### 🎮 Gamification

- Desert map journey across 5 UAE landmarks
- Virtual Dirham reward system
- 15 unlockable badges with animated reveal
- Daily streak tracking with 7-day activity grid
- Leaderboard with UAE student profiles

### 🌐 Accessibility & UX

- Full bilingual support: English / Arabic
- Complete RTL layout in Arabic mode
- Day / Night desert theme
- Text-to-speech for questions and lessons
- Mobile-first responsive design (375px → 1280px+)
- Web Audio API sound effects

### 📊 Progress Tracking

- Dashboard with personalized greeting and recommendations
- Quiz history timeline with performance data
- Parent progress report with PDF export
- Adaptive learning engine (easy / medium / hard)

---

## 🗺️ UAE Landmarks Featured

Dubai · Abu Dhabi · Al Ain · Liwa · Rub' al Khali

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Animation | Framer Motion |
| State | Zustand + localStorage persist |
| AI | Anthropic Claude `claude-haiku-4-5-20251001` |
| Sound | Web Audio API |
| Speech | Web Speech API |
| Deploy | Vercel |

---

## 🚀 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/steve-deffo/desert-quest
cd desert-quest

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 4. Run development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

> All AI features fall back to static content if `ANTHROPIC_API_KEY`
> is missing — the app remains fully usable offline.

---

## 📱 User Journey

```
GradeSelect  →  Login  →  Dashboard  →  Map  →  Lesson
                                                  ↓
                          Reward  ←  Review  ←  Quiz
                            ↓
                          Map (loop)
```

| Route | Purpose |
|---|---|
| `/` | Grade selection (G4 / G8) |
| `/login` | Profile creation (name + avatar) |
| `/dashboard` | Streak, recommendation, continue-learning |
| `/map` | UAE landmark map + walking camel |
| `/lesson/[level]` | Objective · video · explanation · worked example |
| `/quiz/[level]` | 5 questions (MCQ + drag-drop) with AI hints |
| `/quiz/[level]/review` | Wrong-answer cards with retry modal |
| `/reward/[level]` | Confetti · landmark reveal · dirham counter · badge |
| `/practice` | AI-generated extra practice for any completed topic |
| `/scoreboard` | Champions' Souk — replay any level |
| `/leaderboard` | Top 10 with the student inserted at their rank |
| `/history` | Per-quiz timeline with score & time-spent |
| `/report` | Printable AI-written progress report for parents |

---

## 🗂️ Project Structure

```
app/                        Next.js routes (App Router)
  ├─ api/ai/{hint,questions,report,chat}/route.ts
  ├─ {dashboard,map,lesson,quiz,reward,practice}/...
  ├─ {scoreboard,leaderboard,history,report,login}/...
  └─ globals.css

components/                 17+ React components
  ├─ AnimatedCamel.tsx      Articulated 4-state camel
  ├─ DesertMap.tsx          UAE map with walking-camel path
  ├─ LessonCard.tsx         Lesson layout + speech buttons
  ├─ QuizCard.tsx           Quiz logic + AI hints
  ├─ DragDropQuestion.tsx   Drag-and-drop answer mode
  ├─ SageChatbot.tsx        Floating AI chatbot
  ├─ Dashboard.tsx          Hero · streak · recommendation
  ├─ Leaderboard.tsx        Podium + grade tabs
  ├─ ProgressReport.tsx     AI-written parent report
  ├─ PracticeRunner.tsx     AI question generator UI
  └─ ui/{NavBar,BackButton,ThemeToggle,SoundToggle,...}

store/useGameStore.ts       Zustand store (persisted)

data/
  ├─ landmarks.json         5 UAE landmarks (bilingual)
  ├─ lessons.json           10 lessons with YouTube URLs
  ├─ badges.json            15 badges with conditions
  ├─ mockLeaderboard.json   9 fake students for leaderboard
  └─ questions/grade{4,8}.json  25 + 25 questions

lib/
  ├─ anthropic.ts           Server-side Claude API helper
  ├─ adaptiveLearning.ts    Difficulty engine
  ├─ auth.ts                Profile in localStorage
  ├─ i18n/                  Bilingual translation hook
  ├─ sounds.ts              Web Audio API sound bank
  ├─ speech.ts              Text-to-speech wrapper
  ├─ types.ts               LessonData / QuestionData / etc.
  ├─ useHydration.ts        Persist-rehydration gate
  └─ useReducedMotion.ts    Accessibility hook
```

---

## 🚢 Deployment

This app deploys to Vercel out of the box.

```bash
# Once
npx vercel link

# Subsequent deploys
npx vercel --prod
```

Set `ANTHROPIC_API_KEY` in the Vercel project's environment
variables (Settings → Environment Variables → Production).

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | For AI hints, chatbot, report generation |

---

## 📋 Submission Notes

- No login required to explore (demo credentials not needed)
- All progress saved in browser localStorage
- AI features require valid `ANTHROPIC_API_KEY` on Vercel
- Tested on Chrome, Safari, Firefox, iOS Safari, Android Chrome

---

## 🎨 Design Decisions

- **UAE-first narrative**: every math problem uses local context
  (souks, camels, dirhams, landmarks) — not generic word problems
- **Bilingual by design**: Arabic is not a translation afterthought —
  RTL layout, Amiri font, and Arabic-Hindu numerals built from day one
- **No backend required**: Zustand + localStorage handles all
  persistence — deployable anywhere instantly

---

*Submitted for ADEK Gamified UI Challenge — April 2026*

