"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Scene.module.css";

interface YoutubePlayer {
  getCurrentTime(): number;
  mute(): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
}
interface YoutubeApi {
  Player: new (element: HTMLElement, options: {
    videoId: string;
    host: string;
    width: string;
    height: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady: (event: { target: YoutubePlayer }) => void;
      onStateChange: (event: { data: number; target: YoutubePlayer }) => void;
      onError: () => void;
      onAutoplayBlocked: () => void;
    };
  }) => YoutubePlayer;
}
declare global {
  interface Window { YT?: YoutubeApi; onYouTubeIframeAPIReady?: () => void }
}

const MATCH_START_SECONDS = 17;
const MATCH_END_SECONDS = 68;

let youtubePromise: Promise<YoutubeApi> | undefined;
function loadYoutube(): Promise<YoutubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubePromise) {
    youtubePromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        if (window.YT) resolve(window.YT);
      };
      let script = document.getElementById("youtube-player-api") as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = "youtube-player-api";
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("error", () => reject(new Error("Video unavailable")), { once: true });
    });
  }
  return youtubePromise;
}

export default function MeleePlayer({ playing }: { playing: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const player = useRef<YoutubePlayer | null>(null);
  const wantsPlayback = useRef(playing);
  const [status, setStatus] = useState<"loading" | "playing" | "blocked" | "error">("loading");

  useEffect(() => {
    wantsPlayback.current = playing;
    if (player.current) {
      player.current.mute();
      if (playing) player.current.playVideo();
      else player.current.pauseVideo();
    }
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    // YouTube can clear its end bound after a seek. Keep our segment bounded
    // without a render loop, and stop polling whenever the game is hidden.
    const timer = window.setInterval(() => {
      const active = player.current;
      if (active && active.getCurrentTime() >= MATCH_END_SECONDS) {
        active.seekTo(MATCH_START_SECONDS, true);
        active.playVideo();
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    let disposed = false;
    let instance: YoutubePlayer | undefined;
    const timeout = window.setTimeout(() => {
      if (!player.current && !disposed) setStatus("error");
    }, 14000);
    loadYoutube().then((api) => {
      if (disposed || !container.current) return;
      const mount = document.createElement("div");
      container.current.appendChild(mount);
      instance = new api.Player(mount, {
        host: "https://www.youtube-nocookie.com",
        videoId: "TFmpEWb0Nqk",
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0, mute: 1, controls: 0, disablekb: 1, playsinline: 1,
          start: MATCH_START_SECONDS, end: MATCH_END_SECONDS, rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: ({ target }) => {
            if (disposed) return;
            window.clearTimeout(timeout);
            player.current = target;
            target.mute();
            target.seekTo(MATCH_START_SECONDS, true);
            if (wantsPlayback.current) target.playVideo();
          },
          onStateChange: ({ data, target }) => {
            if (disposed) return;
            target.mute();
            if (data === 1) {
              if (!wantsPlayback.current) target.pauseVideo();
              else setStatus("playing");
            }
            if (data === 0 && wantsPlayback.current) {
              target.seekTo(MATCH_START_SECONDS, true);
              target.playVideo();
            }
          },
          onError: () => { if (!disposed) setStatus("error"); },
          onAutoplayBlocked: () => { if (!disposed) setStatus("blocked"); },
        },
      });
    }).catch(() => { if (!disposed) setStatus("error"); });
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      player.current = null;
      instance?.destroy();
    };
  }, []);

  return (
    <div className={styles.melee} aria-label="Silent Falco versus Marth TAS video">
      {/* An ordinary poster remains visible until the embedded player is ready. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.videoPoster} src="/scene/melee-poster.jpg" alt="Marth versus Falco TAS match" />
      <div className={styles.youtube} ref={container} style={{ opacity: status === "playing" ? 1 : 0 }} />
      {(status === "error" || status === "blocked") && (
        <div className={styles.videoNotice}>
          <span>{status === "blocked" ? "Video paused by your browser" : "Video unavailable here"}</span>
          <a href="https://youtu.be/TFmpEWb0Nqk?t=17" target="_blank" rel="noreferrer">Watch the original ↗</a>
        </div>
      )}
    </div>
  );
}
