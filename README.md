# 🐪 Desert Quest — رحلة الصحراء

> Gamified Math Learning Platform for UAE Grade 4 & 8 Students  
> Built for the ADEK Gamified UI Challenge — April 2026

## 🌐 Live Demo  https://desert-quest.vercel.app 

## 📁 Repository
https://github.com/steve-deffo/desert-quest

## ✨ Features
- 🎓 Grade Selection — Grade 4 (ages 9–10) and Grade 8 (ages 13–14)
- 📖 Lesson Screen — Structured lesson with worked examples before each quiz
- 🎬 Video Player — YouTube and MP4 video support with UAE-branded overlay
- 🧩 Gamified Quiz — 5 questions per level with animated feedback
- 🗺️ Desert Map — Animated UAE journey across 5 iconic landmarks
- 🌐 Bilingual — Full English / Arabic with RTL layout support
- ☀️🌙 Day / Night Theme — Smooth theme switching with desert visuals
- 🔊 Sound Effects — Web Audio API programmatic sounds
- 🐪 Animated Camel — Noura (G4) and Zayed (G8) with 4 motion states
- 💰 Dirham Rewards — Virtual currency system with animated counter
- 📱 Mobile First — Responsive from 375px to 1280px+

## 🛠️ Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + CSS Custom Properties (theming)
- Framer Motion (animations)
- Zustand + localStorage persist (state)
- Web Audio API (sound effects)
- canvas-confetti (celebrations)

## 🚀 Local Setup
```bash
git clone https://github.com/steve-deffo/desert-quest.git
cd desert-quest
npm install
npm run dev
# Open http://localhost:3000
```

## 📱 User Journey
Grade Select → Home → Map → Lesson → Quiz → Reward → Map (loop)

## 🗂️ Project Structure
```text
app/          → Next.js routes
components/   → UI components (AnimatedCamel, DesertMap, QuizCard...)
store/        → Zustand state management
data/         → Mock data (questions, lessons, landmarks)
lib/i18n/     → Bilingual translation system
```

## 🏛️ UAE Landmarks Featured
Dubai · Abu Dhabi · Al Ain · Liwa · Rub' al Khali
