"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniPlayerProps {
  className?: string;
  src: string;
  poster?: string;
  loop?: boolean;
  autoPlay?: boolean;
  /** Disable the custom controls (uses native ones instead). */
  nativeControls?: boolean;
  /** Show a label beside the buffering spinner. */
  loadingLabel?: string;
  /** Custom action injected into the controls bar (e.g. a "watch" CTA). */
  actions?: ReactNode;
}

const formatTime = (t: number) => {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const s = Math.floor(t % 60);
  const m = Math.floor((t / 60) % 60);
  const h = Math.floor(t / 3600);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

export function MiniPlayer({
  className,
  src,
  poster,
  loop = false,
  autoPlay = false,
  nativeControls = false,
  actions,
}: MiniPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(autoPlay);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // ---- media event wiring ------------------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlaying = () => {
      setPlaying(true);
      setBuffering(false);
    };
    const onPause = () => setPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onEnded = () => {
      setPlaying(false);
      setBuffering(false);
    };

    const updateTime = () => {
      const d = video.duration || 0;
      setCurrentTime(video.currentTime);
      setDuration(d);
      setProgress(d ? (video.currentTime / d) * 100 : 0);
    };
    const onProgress = () => {
      const d = video.duration || 0;
      if (video.buffered.length > 0 && d) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / d) * 100);
      }
    };
    const onLoaded = () => updateTime();

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("progress", onProgress);
    video.addEventListener("loadedmetadata", onLoaded);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  // ---- fullscreen --------------------------------------------------------
  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // ---- control auto-hide ---------------------------------------------------
  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, 2600);
  }, []);

  useEffect(() => {
    if (playing) revealControls();
    else setControlsVisible(true);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [playing, revealControls]);

  // ---- actions -------------------------------------------------------------
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      void video.play();
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, []);

  const seek = useCallback((clientX: number, target: HTMLElement) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = target.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = ratio * video.duration;
  }, []);

  // ---- render ---------------------------------------------------------------
  const showCenter = !playing && !buffering && !nativeControls;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-video w-full select-none overflow-hidden bg-black",
        controlsVisible ? "cursor-auto" : "cursor-none",
        className
      )}
      onMouseMove={revealControls}
      onMouseLeave={() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        if (!videoRef.current?.paused) setControlsVisible(false);
      }}
    >
      <video
        ref={videoRef}
        className="size-full object-contain"
        src={src}
        poster={poster}
        loop={loop}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        onClick={nativeControls ? undefined : togglePlay}
        onDoubleClick={toggleFullscreen}
        {...(nativeControls ? { controls: true } : {})}
      />

      {/* buffering spinner */}
      {buffering && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Loader2 className="size-10 animate-spin text-white/70" />
        </div>
      )}

      {/* center play overlay */}
      {showCenter && (
        <button
          type="button"
          aria-label={videoRef.current?.ended ? "Replay" : "Play"}
          onClick={togglePlay}
          className="absolute inset-0 grid place-items-center bg-black/10 transition-colors duration-300 hover:bg-black/30"
        >
          <span className="grid size-16 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 sm:size-20">
            <span className="grid size-11 place-items-center rounded-full bg-white text-black sm:size-14">
              <Play className="ml-1 size-5 fill-current sm:size-6" />
            </span>
          </span>
        </button>
      )}

      {/* bottom gradient + controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-4 pb-3 pt-14 transition-opacity duration-300 sm:px-5",
          controlsVisible || !playing ? "opacity-100" : "opacity-0"
        )}
        onClick={nativeControls ? undefined : (e) => e.stopPropagation()}
      >
        <div
          className="group/bar relative h-1.5 w-full cursor-pointer rounded-full bg-white/20"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            seek(e.clientX, e.currentTarget);
          }}
          onPointerMove={(e) => {
            if (e.buttons & 1) seek(e.clientX, e.currentTarget);
          }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-white/25"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute -top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={togglePlay}
            className="rounded p-1 transition-colors hover:text-white/70"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </button>

          <span className="font-mono text-xs tabular-nums text-white/80">
            {formatTime(currentTime)}
            <span className="mx-1 text-white/40">/</span>
            {formatTime(duration)}
          </span>

          <span className="flex-1" />

          {actions}

          <button
            type="button"
            onClick={toggleMute}
            className="rounded p-1 transition-colors hover:text-white/70"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="size-5" />
            ) : (
              <Volume2 className="size-5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded p-1 transition-colors hover:text-white/70"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <Minimize className="size-5" />
            ) : (
              <Maximize className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}