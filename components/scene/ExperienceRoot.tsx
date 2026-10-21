"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { initialSceneState, sceneReducer, shouldPlayGame } from "@/lib/scene-state";
import { getMotionPreference, getVisibility, setMotionPreference, subscribeMotion, subscribeVisibility } from "@/lib/browser-preferences";
import { createThreadStore } from "@/lib/message-thread";
import type { AppOpenRequest } from "@/components/desktop/DesktopShell";
import MeleePlayer from "./MeleePlayer";
import styles from "./Scene.module.css";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });
const DesktopShell = dynamic(() => import("@/components/desktop/DesktopShell"), { ssr: false });
const PortfolioContent = dynamic(() => import("@/components/portfolio/PortfolioContent"), { loading: () => <AppLoading /> });
const PrototypePortfolio = dynamic(() => import("@/components/prototype/PrototypePortfolio"), { loading: () => <AppLoading /> });
const PhotosApp = dynamic(() => import("@/components/photos/PhotosApp"), { loading: () => <AppLoading /> });
const FilesApp = dynamic(() => import("@/components/files/FilesApp"), { loading: () => <AppLoading /> });
const MessagesApp = dynamic(() => import("@/components/messages/MessagesApp"), { loading: () => <AppLoading /> });
let desktopWarmup: Promise<unknown> | undefined;
function warmDesktop() {
  desktopWarmup ??= Promise.all([
    import("@/components/desktop/DesktopShell"),
    import("@/components/portfolio/PortfolioContent"),
    import("@/components/files/FilesApp"),
    import("@/components/messages/MessagesApp"),
  ]).catch(() => { desktopWarmup = undefined; });
}

// The CRT screen is rendered once, into this detached node, and the node is
// moved between the 3D canvas and the flat fallback. Switching modes then
// keeps the desktop, its windows and any message drafts mounted.
function createScreenHost() {
  if (typeof document === "undefined") return null;
  const host = document.createElement("div");
  host.style.display = "contents";
  return host;
}

type SlotState = { count: number; generation: number };
const slotReducer = (state: SlotState, change: 1 | -1): SlotState =>
  ({ count: state.count + change, generation: change === 1 ? state.generation + 1 : state.generation });

function ScreenSlot({ host, onSlotChange }: { host: HTMLElement; onSlotChange: (change: 1 | -1) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const slot = ref.current;
    if (!slot) return;
    slot.appendChild(host);
    onSlotChange(1);
    return () => {
      if (host.parentNode === slot) slot.removeChild(host);
      onSlotChange(-1);
    };
  }, [host, onSlotChange]);
  return <div ref={ref} style={{ display: "contents" }} />;
}

function AppLoading() { return <div className={styles.loadingApp} role="status">Opening…</div>; }

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

class DesktopBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className={styles.loadingDesk} role="alert" style={{ height: "100%", background: "#e7dece" }}><p>The desktop couldn’t load. Reload to get the latest version.</p><button type="button" onClick={() => window.location.reload()}>Reload website</button></div>;
    return this.props.children;
  }
}

export default function ExperienceRoot({ prototype = false }: { prototype?: boolean }) {
  const Portfolio = prototype ? PrototypePortfolio : PortfolioContent;
  const [state, dispatch] = useReducer(sceneReducer, initialSceneState);
  const scenePointer = useRef({ x: 0, y: 0, hit: false });
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotionPreference, () => true);
  const documentVisible = useSyncExternalStore(subscribeVisibility, getVisibility, () => true);
  const [desktopOpened, setDesktopOpened] = useState(false);
  const [openRequest, setOpenRequest] = useState<AppOpenRequest | null>(null);
  const openRequestCount = useRef(0);
  const [videoPaused, setVideoPaused] = useState<boolean | null>(null);
  const gamePaused = videoPaused ?? reducedMotion;
  const [screenHost] = useState(createScreenHost);
  const [slot, onSlotChange] = useReducer(slotReducer, { count: 0, generation: 0 });
  const [messageStore] = useState(() => createThreadStore());

  const requestApp = useCallback((app: AppOpenRequest["app"]) => {
    openRequestCount.current += 1;
    setOpenRequest({ app, id: openRequestCount.current });
  }, []);

  useEffect(() => {
    const section = window.location.hash.slice(1);
    if (["work", "experience", "education", "skills", "contact", "top"].includes(section)) window.location.replace(`/portfolio/#${section}`);
    // A reload of ?view=portfolio starts in the room, so drop the stale entry
    // marker; otherwise "back to desk" would call history.back() off the page.
    if (window.history.state?.seanMobile) window.history.replaceState(null, "", window.location.pathname);
    const onPop = () => {
      // Forward into the flat desktop re-opens it; anything else goes back.
      if (window.history.state?.seanMobile) {
        setDesktopOpened(true);
        dispatch({ type: "enter", mobile: true });
      } else dispatch({ type: "back" });
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const onReady = useCallback(() => setSceneReady(true), []);
  const recoverDesktop = useCallback(() => {
    setDegraded(true);
    setDesktopOpened(true);
    // Same history entry as enter(), so Back returns to the room, not off the site.
    if (!window.history.state?.seanMobile) window.history.pushState({ seanMobile: true }, "", "?view=portfolio");
    dispatch({ type: "enter", mobile: true });
  }, []);
  const backToDesk = useCallback(() => {
    setCameraResetKey((key) => key + 1);
    setOpenRequest(null);
    if (window.history.state?.seanMobile) window.history.back();
    else dispatch({ type: "back" });
  }, []);

  function approach() {
    if (state.camera !== "room") return;
    warmDesktop();
    dispatch({ type: "approach" });
  }

  function enter(contact = false) {
    warmDesktop();
    const useFallback = degraded || !sceneReady;
    if (contact) requestApp("messages");
    else setOpenRequest(null);
    setDesktopOpened(true);
    if (useFallback && !state.mobileOpen) window.history.pushState({ seanMobile: true }, "", "?view=portfolio");
    dispatch({ type: contact ? "contact" : "enter", mobile: useFallback });
  }

  function activateScreen() {
    if (state.camera === "room") approach();
    else if (state.camera === "entered") dispatch({ type: "minimize-game" });
    else enter();
  }

  const fallback = <div className={styles.fallback}>
    <div className={styles.loadingDesk}>
      <span className={styles.loadingMark} aria-hidden="true" />
      <p role="status">{degraded ? "The desktop is ready." : "Opening the desk…"}</p>
      <button type="button" onClick={() => enter()} aria-label="Open Sean's desktop">open desktop</button>
    </div>
  </div>;

  const portfolio = useMemo(() => <Portfolio embedded {...(prototype ? { onPhotos: () => requestApp("photos") } : {})} onContact={() => requestApp("messages")} />, [Portfolio, prototype, requestApp]);
  const files = useMemo(() => <FilesApp />, []);
  const photos = useMemo(() => prototype ? <PhotosApp /> : undefined, [prototype]);
  const messages = useMemo(() => <MessagesApp store={messageStore} />, [messageStore]);

  const screen = <div onClick={(event) => event.stopPropagation()} className={`${styles.screen} ${reducedMotion ? styles.reduceMotion : ""}`}>
    <div className={styles.desktopLayer} inert={state.screen === "game"}>
      {desktopOpened && <DesktopBoundary><DesktopShell
        portfolio={portfolio}
        files={files}
        photos={photos}
        messages={messages}
        wallpaperUrl="/scene/sassy-sunset.png"
        openRequest={openRequest}
        onRestoreGame={() => { dispatch({ type: "restore-game" }); }}
        onBackToDesk={backToDesk}
        reducedMotion={reducedMotion}
        onReducedMotionChange={setMotionPreference}
      /></DesktopBoundary>}
    </div>
    <div className={`${styles.gameLayer} ${state.screen === "desktop" ? styles.minimized : ""}`} inert={state.screen === "desktop"}>
      {/* Moving the screen reloads the YouTube iframe, so start a fresh player. */}
      <MeleePlayer key={slot.generation} playing={shouldPlayGame(state, documentVisible, gamePaused)} />
    </div>
    {state.screen === "game" && <button type="button" className={styles.screenHit}
      aria-label={state.camera === "entered" ? "Minimize Melee to desktop" : "Enter the CRT"}
      onPointerEnter={() => dispatch({ type: "hover", over: true })}
      onPointerLeave={() => dispatch({ type: "hover", over: false })}
      onFocus={() => dispatch({ type: "hover", over: true })}
      onBlur={() => dispatch({ type: "hover", over: false })}
      onClick={(event) => { event.stopPropagation(); activateScreen(); }}
    ><span className={styles.screenHint}>{state.camera === "entered" ? "minimize to desktop" : "click to enter"}</span></button>}
    <div className={styles.glass} />
  </div>;

  const screenSlot = screenHost ? <ScreenSlot host={screenHost} onSlotChange={onSlotChange} /> : null;

  return <main data-camera={state.camera} data-camera-reset={cameraResetKey} className={styles.experience} aria-label="Sean Arackal's interactive portfolio">
    <h1 className={styles.srOnly}>Sean Arackal</h1>
    {degraded || state.mobileOpen ? fallback : <SceneBoundary fallback={fallback} onFailure={recoverDesktop}>
      {!sceneReady && fallback}
      <div className={styles.canvas} data-ready={sceneReady}
        onPointerDownCapture={(event) => { scenePointer.current = { x: event.clientX, y: event.clientY, hit: false }; }}
        onClick={(event) => {
          const pointer = scenePointer.current;
          if (!pointer.hit && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 5) backToDesk();
        }}>
        {/* Clicks on empty floor reach this handler; the scene does not also call backToDesk. */}
        <SceneCanvas resetKey={cameraResetKey} view={state.camera} reducedMotion={reducedMotion} screen={screenSlot} onReady={onReady} onApproach={() => { scenePointer.current.hit = true; approach(); }} onFailure={recoverDesktop} />
      </div>
    </SceneBoundary>}
    {!state.mobileOpen && <footer className={styles.footer}>
      <Link href="/" prefetch={false} aria-label="Sean Arackal, home">sean arackal</Link><span aria-hidden="true">·</span>
      <button type="button" onClick={() => enter(true)}>contact</button><span aria-hidden="true">·</span>
      <a href={prototype ? "/prototype/" : "/portfolio/"}>skip to portfolio</a><span aria-hidden="true">·</span>
      <button type="button" onClick={() => setVideoPaused(!gamePaused)}>{gamePaused ? "play video" : "pause video"}</button>
    </footer>}
    {!degraded && state.camera === "room" && <button type="button" className={styles.entryButton} onClick={approach}>click to approach · drag to rotate · scroll to zoom</button>}
    {!degraded && state.camera !== "room" && <button type="button" className={styles.back} onClick={backToDesk}>↖ back to desk</button>}
    {state.mobileOpen && <div className={styles.fallbackDesktop}>{screenSlot}</div>}
    {screenHost && slot.count > 0 && createPortal(screen, screenHost)}
  </main>;
}
