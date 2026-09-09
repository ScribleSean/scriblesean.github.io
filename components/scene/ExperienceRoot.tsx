"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { initialSceneState, sceneReducer, shouldPlayGame } from "@/lib/scene-state";
import { getMotionPreference, getVisibility, setMotionPreference, subscribeMotion, subscribeVisibility } from "@/lib/browser-preferences";
import MeleePlayer from "./MeleePlayer";
import styles from "./Scene.module.css";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });
const DesktopShell = dynamic(() => import("@/components/desktop/DesktopShell"), { ssr: false });
const PortfolioContent = dynamic(() => import("@/components/portfolio/PortfolioContent"), { loading: () => <AppLoading /> });
const SafariShell = dynamic(() => import("@/components/portfolio/SafariShell"));
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

function AppLoading() { return <div className={styles.loadingApp} role="status">Opening…</div>; }

function subscribeMedia(callback: () => void) {
  const query = window.matchMedia("(max-width: 760px) and (pointer: coarse)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getMobileSnapshot = () => window.matchMedia("(max-width: 760px) and (pointer: coarse)").matches;
const getServerSnapshot = () => null;

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function ExperienceRoot() {
  const [state, dispatch] = useReducer(sceneReducer, initialSceneState);
  const mobile = useSyncExternalStore(subscribeMedia, getMobileSnapshot, getServerSnapshot);
  const scenePointer = useRef({ x: 0, y: 0, hit: false });
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotionPreference, () => true);
  const documentVisible = useSyncExternalStore(subscribeVisibility, getVisibility, () => true);
  const [desktopOpened, setDesktopOpened] = useState(false);
  const [initialApp, setInitialApp] = useState<"messages" | null>(null);
  const [mobileApp, setMobileApp] = useState<"portfolio" | "files" | "messages">("portfolio");
  const [mobileVisited, setMobileVisited] = useState({ files: false, messages: false });

  useEffect(() => {
    const section = window.location.hash.slice(1);
    if (["work", "experience", "education", "skills", "contact", "top"].includes(section)) window.location.replace(`/portfolio/#${section}`);
    const onPop = () => { dispatch({ type: "back" }); setMobileApp("portfolio"); };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const onReady = useCallback(() => setSceneReady(true), []);
  const backToDesk = useCallback(() => {
    setCameraResetKey((key) => key + 1);
    setInitialApp(null);
    setMobileApp("portfolio");
    if (window.history.state?.seanMobile) window.history.back();
    else dispatch({ type: "back" });
  }, []);

  function openMobileApp(app: "portfolio" | "files" | "messages") {
    setMobileApp(app);
    if (app !== "portfolio") setMobileVisited((current) => ({ ...current, [app]: true }));
  }

  function approach() {
    warmDesktop();
    dispatch({ type: "approach" });
  }

  function enter(contact = false) {
    warmDesktop();
    const isMobile = mobile === true || degraded;
    setInitialApp(contact ? "messages" : null);
    setDesktopOpened(true);
    openMobileApp(contact ? "messages" : "portfolio");
    if (isMobile && !state.mobileOpen) window.history.pushState({ seanMobile: true }, "", "?view=portfolio");
    dispatch({ type: contact ? "contact" : "enter", mobile: isMobile });
  }

  function activateScreen() {
    if (mobile) enter();
    else if (state.camera === "room") approach();
    else if (state.camera === "entered") dispatch({ type: "minimize-game" });
    else enter();
  }

  const fallback = <div className={styles.fallback}>
    <button type="button" onClick={() => enter()} aria-label="Enter Sean's portfolio through the CRT">
      {/* This 54 KB approved still keeps phones out of the WebGL bundle. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/scene/mobile-setup.webp" alt="A beige CRT, indigo GameCube, green Slippi controller and Fox figurine" width="960" height="640" fetchPriority="high" />
      <p>{mobile ? "tap the CRT to enter" : "enter the portfolio"}</p>
    </button>
  </div>;

  const screen = <div onClick={(event) => event.stopPropagation()} className={`${styles.screen} ${reducedMotion ? styles.reduceMotion : ""}`}>
    <div className={styles.desktopLayer} inert={state.screen === "game"}>
      {desktopOpened && <DesktopShell
        portfolio={<PortfolioContent embedded onContact={() => { setInitialApp(null); window.requestAnimationFrame(() => setInitialApp("messages")); }} />}
        files={<FilesApp />}
        messages={<MessagesApp />}
        wallpaperUrl="/scene/sassy-sunset.png"
        initialApp={initialApp}
        onRestoreGame={() => dispatch({ type: "restore-game" })}
        onBackToDesk={backToDesk}
        reducedMotion={reducedMotion}
        onReducedMotionChange={setMotionPreference}
      />}
    </div>
    <div className={`${styles.gameLayer} ${state.screen === "desktop" ? styles.minimized : ""}`} inert={state.screen === "desktop"}>
      <MeleePlayer playing={shouldPlayGame(state, documentVisible)} />
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

  return <main data-camera={state.camera} data-camera-reset={cameraResetKey} className={styles.experience} aria-label="Sean Arackal's interactive portfolio">
    <h1 className={styles.srOnly}>Sean Arackal</h1>
    {mobile !== false || degraded ? fallback : <SceneBoundary fallback={fallback} onFailure={() => setDegraded(true)}>
      {!sceneReady && fallback}
      <div className={styles.canvas}
        onPointerDownCapture={(event) => { scenePointer.current = { x: event.clientX, y: event.clientY, hit: false }; }}
        onClick={(event) => {
          const pointer = scenePointer.current;
          if (!pointer.hit && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 5) backToDesk();
        }}>
        <SceneCanvas resetKey={cameraResetKey} view={state.camera} reducedMotion={reducedMotion} screen={screen} onReady={onReady} onApproach={() => { scenePointer.current.hit = true; approach(); }} onBack={backToDesk} />
      </div>
    </SceneBoundary>}
    {!state.mobileOpen && <footer className={styles.footer}>
      <Link href="/" prefetch={false} aria-label="Sean Arackal, home">sean arackal</Link><span aria-hidden="true">·</span>
      <button type="button" onClick={() => enter(true)}>contact</button><span aria-hidden="true">·</span>
      <a href="/portfolio/">skip to portfolio</a>
    </footer>}
    {mobile === false && state.camera === "room" && <button type="button" className={styles.entryButton} onClick={approach}>click to approach · drag to rotate · scroll to zoom</button>}
    {mobile === false && state.camera !== "room" && <button type="button" className={styles.back} onClick={backToDesk}>↖ back to desk</button>}
    {state.mobileOpen && <div className={styles.mobilePanel}>
      <SafariShell onBack={backToDesk} onContact={() => openMobileApp("messages")} onFiles={() => openMobileApp("files")} title="scriblesean.github.io">
        {mobileApp !== "portfolio" && <div className={styles.mobileAppHeader}><span>{mobileApp === "messages" ? "Message Sean" : "Files"}</span><button type="button" onClick={() => openMobileApp("portfolio")}>Back to portfolio</button></div>}
        <div className={styles.mobileApp} hidden={mobileApp !== "portfolio"}><PortfolioContent embedded onContact={() => openMobileApp("messages")} /></div>
        {mobileVisited.files && <div hidden={mobileApp !== "files"}><FilesApp /></div>}
        {mobileVisited.messages && <div hidden={mobileApp !== "messages"}><MessagesApp /></div>}
      </SafariShell>
    </div>}
  </main>;
}
