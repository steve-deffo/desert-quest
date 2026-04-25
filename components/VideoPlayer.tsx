"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useTranslation } from "@/lib/i18n";
import { Sounds, playSound } from "@/lib/sounds";

type Props = {
  videoUrl: string | null;
  title: string;
};

export default function VideoPlayer({ videoUrl, title }: Props) {
  const { t, isRTL } = useTranslation();

  if (!videoUrl) {
    return <Placeholder label={t("lesson.videoPlaceholder")} isRTL={isRTL} />;
  }

  if (isYouTube(videoUrl)) {
    const id = parseYouTubeId(videoUrl);
    if (!id) {
      return <Placeholder label={t("lesson.videoPlaceholder")} isRTL={isRTL} />;
    }
    return <YouTubeFrame id={id} title={title} />;
  }

  return <NativeVideo src={videoUrl} title={title} isRTL={isRTL} />;
}

/* ────────────────────────────────────────────────────────────── */
/*  Placeholder                                                    */
/* ────────────────────────────────────────────────────────────── */

function Placeholder({ label, isRTL }: { label: string; isRTL: boolean }) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 0 0 color-mix(in srgb, var(--color-gold) 0%, transparent)",
          "0 0 0 6px color-mix(in srgb, var(--color-gold) 25%, transparent)",
          "0 0 0 0 color-mix(in srgb, var(--color-gold) 0%, transparent)",
        ],
      }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      className="grid aspect-video w-full place-items-center rounded-2xl text-center"
      style={{
        background:
          "color-mix(in srgb, var(--bg-secondary) 35%, transparent)",
        border: "2px dashed var(--color-gold)",
        color: "var(--text-primary)",
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <span aria-hidden className="text-5xl">
          🎬
        </span>
        <p
          className="px-4 text-sm font-bold"
          style={{
            color: "var(--text-secondary)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "var(--font-nunito), sans-serif",
          }}
        >
          {label}
        </p>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  YouTube                                                        */
/* ────────────────────────────────────────────────────────────── */

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/");
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    return null;
  } catch {
    return null;
  }
}

function DuneThumbnailBg() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 450"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="dq-vid-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-top)" />
          <stop offset="100%" stopColor="var(--sky-bottom)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#dq-vid-sky)" />
      <path
        d="M0 320 Q200 240 400 300 T800 280 L800 450 L0 450 Z"
        fill="var(--dune-color)"
        opacity="0.85"
      />
      <path
        d="M0 380 Q200 320 400 360 T800 350 L800 450 L0 450 Z"
        fill="var(--dune-color)"
      />
    </svg>
  );
}

function YouTubeFrame({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-2xl"
      style={{
        border: "2px solid var(--color-gold)",
        boxShadow: "0 8px 20px var(--shadow)",
      }}
    >
      {!playing && (
        <button
          type="button"
          onClick={() => {
            playSound(Sounds.buttonClick);
            setPlaying(true);
          }}
          aria-label={`Play: ${title}`}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
        >
          <DuneThumbnailBg />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.45) 100%)",
            }}
          />
          <motion.span
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="relative grid h-20 w-20 place-items-center rounded-full"
            style={{
              background:
                "linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%)",
              boxShadow:
                "0 8px 26px rgba(0,0,0,0.45), 0 0 0 6px color-mix(in srgb, var(--color-gold) 30%, transparent)",
              color: "#1A1208",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden>
              <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
            </svg>
          </motion.span>
          <span
            className="relative max-w-md px-4 text-base font-extrabold"
            style={{
              color: "var(--color-gold-light)",
              textShadow: "0 2px 8px rgba(0,0,0,0.7)",
            }}
          >
            {title}
          </span>
        </button>
      )}
      {playing && (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Native HTML5 video with custom theme controls                  */
/* ────────────────────────────────────────────────────────────── */

function NativeVideo({
  src,
  title,
  isRTL,
}: {
  src: string;
  title: string;
  isRTL: boolean;
}) {
  const setCamelState = useGameStore((s) => s.setCamelState);
  const ref = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      setTime(v.currentTime);
      setProgress(v.duration ? v.currentTime / v.duration : 0);
    };
    const onMeta = () => setDuration(v.duration);
    const onEnded = () => {
      setPlaying(false);
      setCamelState("happy");
      window.setTimeout(() => setCamelState("idle"), 1200);
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnded);
    };
  }, [setCamelState]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    playSound(Sounds.buttonClick);
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = ref.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = Math.max(0, Math.min(1, ratio)) * v.duration;
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        border: "2px solid var(--color-gold)",
        boxShadow: "0 8px 20px var(--shadow)",
      }}
    >
      <video
        ref={ref}
        src={src}
        className="aspect-video w-full bg-black"
        preload="metadata"
        playsInline
        muted={muted}
      />
      <div
        className="flex items-center gap-2 p-2"
        style={{
          background:
            "color-mix(in srgb, var(--bg-card) 90%, transparent)",
        }}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="grid h-10 w-10 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-gold), var(--color-gold-light))",
            color: "#1A1208",
          }}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <rect x="6" y="5" width="4" height="14" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
            </svg>
          )}
        </button>

        <div
          onClick={seek}
          className="relative h-2 flex-1 cursor-pointer overflow-hidden rounded-full"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div
            className="absolute inset-y-0"
            style={{
              insetInlineStart: 0,
              width: `${Math.round(progress * 100)}%`,
              background:
                "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
              transition: "width 0.1s linear",
            }}
          />
        </div>

        <span
          className="min-w-[68px] text-right text-xs tabular-nums"
          style={{
            color: "var(--text-secondary)",
            fontFamily: isRTL
              ? "var(--font-amiri), serif"
              : "inherit",
          }}
        >
          {fmtTime(time)} / {fmtTime(duration)}
        </span>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="grid h-10 w-10 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          style={{
            color: "var(--color-gold)",
            background:
              "color-mix(in srgb, var(--color-gold) 14%, transparent)",
          }}
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function fmtTime(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
