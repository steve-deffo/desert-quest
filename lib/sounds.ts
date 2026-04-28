"use client";

import { useGameStore } from "@/store/useGameStore";

/*
  Web Audio API sound effects — generated programmatically.
  AudioContext is created lazily on first call, after a user gesture.
  All calls are wrapped in try/catch so they fail silently in unsupported environments.
*/

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    type WebKitWindow = Window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as WebKitWindow).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.18,
  startOffset = 0
) {
  try {
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime + startOffset;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + Math.min(0.015, duration / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch {
    // ignore
  }
}

function sweep(
  fromFreq: number,
  toFreq: number,
  duration: number,
  gain = 0.18
) {
  try {
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(fromFreq, t0);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, toFreq),
      t0 + duration
    );
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch {
    // ignore
  }
}

function noise(duration: number, gain = 0.05, freq = 1000) {
  try {
    const c = getCtx();
    if (!c) return;
    const t0 = c.currentTime;
    const buffer = c.createBuffer(
      1,
      Math.max(1, Math.floor(c.sampleRate * duration)),
      c.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = 1.4;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  } catch {
    // ignore
  }
}

export const Sounds = {
  correct: () => {
    // Happy ascending two-tone chime: C5 then E5
    tone(523.25, 0.18, "sine", 0.22, 0);
    tone(659.25, 0.22, "sine", 0.22, 0.1);
  },

  wrong: () => {
    // Low dull thud
    tone(150, 0.25, "sawtooth", 0.18);
  },

  levelComplete: () => {
    // Ascending arpeggio: C4-E4-G4-C5
    const notes = [261.63, 329.63, 392, 523.25];
    notes.forEach((f, i) => tone(f, 0.22, "sine", 0.22, i * 0.18));
  },

  buttonClick: () => {
    // Subtle short tick
    tone(800, 0.05, "sine", 0.08);
  },

  timerWarning: () => {
    // Two quick pulses at 600Hz
    tone(600, 0.1, "square", 0.18, 0);
    tone(600, 0.1, "square", 0.18, 0.13);
  },

  camelHappy: () => {
    // Rising whistle 400 → 800
    sweep(400, 800, 0.3, 0.18);
  },

  camelSad: () => {
    // Descending wah 400 → 200
    sweep(400, 200, 0.4, 0.18);
  },

  pageTransition: () => {
    // Soft filtered whoosh
    noise(0.22, 0.05, 900);
  },

  gradeSelect: () => {
    // Magical sparkle: 5 random pings
    for (let i = 0; i < 5; i++) {
      const f = 1000 + Math.random() * 1000;
      tone(f, 0.1, "sine", 0.12, i * 0.09 + Math.random() * 0.03);
    }
  },

  dirhamsEarned: () => {
    // Three quick coin pings
    for (let i = 0; i < 3; i++) {
      tone(1200, 0.08, "sine", 0.16, i * 0.06);
    }
  },

  dragStart: () => {
    // Soft short whoosh
    noise(0.18, 0.04, 1100);
  },

  dropClick: () => {
    // Slightly heavier click than buttonClick
    tone(540, 0.07, "sine", 0.16);
    tone(720, 0.05, "sine", 0.12, 0.04);
  },
};

/**
 * Play a sound only when the user has sound enabled in the store.
 * Safe to call from any client event handler.
 */
export function playSound(soundFn: () => void) {
  try {
    const enabled = useGameStore.getState().soundEnabled;
    if (!enabled) return;
    soundFn();
  } catch {
    // ignore
  }
}
