"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { initialSceneState, sceneReducer, shouldPlayGame } from "@/lib/scene-state";
import { getMotionPreference, getPhone, getVisibility, setMotionPreference, subscribeMotion, subscribePhone, subscribeVisibility } from "@/lib/browser-preferences";
import { phoneDesktop } from "@/lib/site";
import { createThreadStore } from "@/lib/message-thread";
import type { AppOpenRequest } from "@/components/desktop/DesktopShell";
import MeleePlayer from "./MeleePlayer";
import TimeToggle from "@/components/TimeToggle";
import AssembleName from "@/components/AssembleName";
import { currentPhase, subscribeTime, type Phase } from "@/lib/time-of-day";
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
  const phone = useSyncExternalStore(subscribePhone, getPhone, () => false);
  const phase = useSyncExternalStore(subscribeTime, currentPhase, (): Phase => "day");
  // With the "fullscreen" setting, touch phones open the desktop flat and full size instead of inside the CRT.
  const phoneFull = phoneDesktop === "fullscreen" && phone;
  const phoneFullRef = useRef(phoneFull);
  useEffect(() => { phoneFullRef.current = phoneFull; }, [phoneFull]);
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

  const phoneOpen = phoneFull && state.mobileOpen;

  useEffect(() => {
    const section = window.location.hash.slice(1);
    if (["work", "experience", "education", "skills", "contact", "top"].includes(section)) window.location.replace(`/portfolio/#${section}`);
    if (window.history.state?.seanMobile) {
      const url = new URL(window.location.href);
      url.searchParams.delete("view");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    const onPop = () => {
      if (window.history.state?.seanMobile) {
        if (phoneFullRef.current) setSceneReady(false);
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
    const useFallback = degraded || !sceneReady || phoneFull;
    if (contact) requestApp("messages");
    else setOpenRequest(null);
    setDesktopOpened(true);
    // The 3D room unmounts behind the full-screen phone desktop; show the loader until it redraws on the way back.
    if (phoneFull) setSceneReady(false);
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
      <button type="button" onClick={() => enter()} aria-label="Open Sean's desktop">Open desktop</button>
    </div>
  </div>;

  const portfolio = useMemo(() => <Portfolio embedded {...(prototype ? { onPhotos: () => requestApp("photos") } : {})} onContact={() => requestApp("messages")} />, [Portfolio, prototype, requestApp]);
  const files = useMemo(() => <FilesApp />, []);
  const photos = useMemo(() => prototype ? <PhotosApp /> : undefined, [prototype]);
  const messages = useMemo(() => <MessagesApp store={messageStore} />, [messageStore]);

  const screen = <div onClick={(event) => event.stopPropagation()} className={`${styles.screen} ${phoneOpen ? styles.phoneScreen : ""} ${reducedMotion ? styles.reduceMotion : ""}`}>
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
      {/* Moving the screen reloads the YouTube iframe. */}
      <MeleePlayer key={slot.generation} playing={shouldPlayGame(state, documentVisible, gamePaused)} />
    </div>
    {state.screen === "game" && <button type="button" className={styles.screenHit}
      aria-label={state.camera === "entered" ? "Minimize Melee to desktop" : "Enter the CRT"}
      onPointerEnter={() => dispatch({ type: "hover", over: true })}
      onPointerLeave={() => dispatch({ type: "hover", over: false })}
      onFocus={() => dispatch({ type: "hover", over: true })}
      onBlur={() => dispatch({ type: "hover", over: false })}
      onClick={(event) => { event.stopPropagation(); activateScreen(); }}
    ><span className={styles.screenHint}>{state.camera === "entered" ? "Minimize to desktop" : "Open the desktop"}</span></button>}
    <div className={styles.glass} />
  </div>;

  const screenSlot = screenHost ? <ScreenSlot host={screenHost} onSlotChange={onSlotChange} /> : null;

  return <main data-phone-desktop={phoneDesktop} data-camera={state.camera} data-camera-reset={cameraResetKey} className={styles.experience} aria-label="Sean Arackal's interactive portfolio">
    {!state.mobileOpen && <header className={styles.identity} data-hidden={state.camera !== "room"}>
      <h1><AssembleName text="Sean Arackal" /></h1>
      <p>I build AI agents and the tools around them.</p>
    </header>}
    {!state.mobileOpen && state.camera === "room" && <TimeToggle className={styles.time} />}
    {degraded || state.mobileOpen ? fallback : <SceneBoundary fallback={fallback} onFailure={recoverDesktop}>
      {!sceneReady && fallback}
      <div className={styles.canvas} data-ready={sceneReady}
        onPointerDownCapture={(event) => { scenePointer.current = { x: event.clientX, y: event.clientY, hit: false }; }}
        onClick={(event) => {
          const pointer = scenePointer.current;
          if (!pointer.hit && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 5) backToDesk();
        }}>
        <SceneCanvas phase={phase} resetKey={cameraResetKey} view={state.camera} reducedMotion={reducedMotion} screen={screenSlot} onReady={onReady} onApproach={() => { scenePointer.current.hit = true; approach(); }} onFailure={recoverDesktop} />
      </div>
    </SceneBoundary>}
    {!state.mobileOpen && <div className={styles.bottom}>
      {!degraded && state.camera === "room" && <button type="button" className={styles.entryButton} onClick={approach}>Go to the desk</button>}
      {state.camera !== "entered" && <footer className={styles.footer}>
        <a href={prototype ? "/prototype/" : "/portfolio/"}>Portfolio</a>
        <a href="/resume/sean-arackal-resume.pdf" target="_blank" rel="noreferrer">Résumé</a>
        <button type="button" onClick={() => enter(true)}>Contact</button>
        <button type="button" onClick={() => setVideoPaused(!gamePaused)}>{gamePaused ? "Play video" : "Pause video"}</button>
      </footer>}
    </div>}
    {!degraded && !phoneOpen && state.camera !== "room" && <button type="button" className={styles.back} onClick={backToDesk}>↖ Back to desk</button>}
    {state.mobileOpen && <div className={`${styles.fallbackDesktop} ${phoneOpen ? styles.phoneDesktop : ""}`}>{screenSlot}</div>}
    {screenHost && slot.count > 0 && createPortal(<DesktopBoundary>{screen}</DesktopBoundary>, screenHost)}
  </main>;
}
