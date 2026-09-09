"use client";

import { type ReactNode, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { type DesktopAppId, type Viewport, createWindowState, getViewportScale, windowReducer } from "@/lib/window-manager";
import BrowserApp from "@/components/browser/BrowserApp";
import styles from "./DesktopShell.module.css";

type Props = {
  portfolio: ReactNode;
  files: ReactNode;
  messages: ReactNode;
  photos?: ReactNode;
  onRestoreGame: () => void;
  onBackToDesk: () => void;
  reducedMotion: boolean;
  onReducedMotionChange: (value: boolean) => void;
  wallpaperUrl: string;
  initialApp?: "chrome" | "files" | "messages" | "settings" | "photos" | null;
};

const appLabels: Record<DesktopAppId | "slippi", string> = {
  chrome: "Portfolio in Chrome",
  files: "Files",
  photos: "Photos",
  messages: "Message Sean",
  settings: "Settings",
  slippi: "Slippi: restore Melee",
};

const clampViewport = (element: HTMLDivElement | null): Viewport => ({
  width: Math.max(1, element?.clientWidth ?? 1000),
  height: Math.max(1, element?.clientHeight ?? 720),
});

function Icon({ app }: { app: DesktopAppId | "slippi" }) {
  if (app === "chrome") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#f6c451"/><path d="M12 2a10 10 0 0 1 8.7 5H12z" fill="#e6533c"/><path d="m7 20 5-8h8.7A10 10 0 0 1 7 20" fill="#4c9f70"/><circle cx="12" cy="12" r="4.6" fill="#4f83cc" stroke="#e8edf7" strokeWidth="1.4"/></svg>;
  if (app === "photos") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="20" height="18" rx="4" fill="#e8ddd0"/><circle cx="16" cy="8" r="2" fill="#dfb94d"/><path d="m4 17 5-7 4 5 3-3 4 5" fill="#7b9c69"/></svg>;
  if (app === "files") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l1.7 2H20a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 4 6.5Z" fill="#d6a644"/><path d="M3 10h18.5v8.3c0 .9-.7 1.7-1.7 1.7H4.7A1.7 1.7 0 0 1 3 18.3Z" fill="#f2c95c"/></svg>;
  if (app === "messages") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12.3A2.7 2.7 0 0 1 17.3 19H9l-4.5 3v-3.5A2.7 2.7 0 0 1 2 15.8V6.5A2.5 2.5 0 0 1 4.5 4Z" fill="#5294e2"/><circle cx="8" cy="11.5" r="1.2" fill="white"/><circle cx="12" cy="11.5" r="1.2" fill="white"/><circle cx="16" cy="11.5" r="1.2" fill="white"/></svg>;
  if (app === "settings") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.4 2 .7 2.4a7.5 7.5 0 0 1 1.5.9l2.4-.7 2.2 3.8-1.8 1.8c.1.6.1 1.1 0 1.7l1.8 1.8-2.2 3.8-2.4-.7c-.5.4-1 .7-1.5.9l-.7 2.4H9l-.7-2.4a7.5 7.5 0 0 1-1.5-.9l-2.4.7-2.2-3.8L4 12c-.1-.6-.1-1.1 0-1.7L2.2 8.5 4.4 4.7l2.4.7c.5-.4 1-.7 1.5-.9L9 2Z" fill="#bdc3cc"/><circle cx="11.2" cy="11.2" r="3.3" fill="#5d6270"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8.2C7 5.5 9.3 4 12 4s5 1.5 5 4.2c1.6.5 2.5 1.6 2.5 3.2 0 2.3-1.7 4.1-3.8 4.1-.6 2.8-2 4.5-3.7 4.5s-3.1-1.7-3.7-4.5c-2.1 0-3.8-1.8-3.8-4.1 0-1.6.9-2.7 2.5-3.2Z" fill="#69c46e"/><path d="M8.2 10.7c.7-.8 1.6-1.1 2.5-1.1h2.6c.9 0 1.8.3 2.5 1.1M9.8 13.1h.1m4.2 0h.1" fill="none" stroke="#163c29" strokeLinecap="round" strokeWidth="1.25"/><path d="M10.3 15c.9.6 2.5.6 3.4 0" fill="none" stroke="#163c29" strokeLinecap="round" strokeWidth="1.2"/></svg>;
}

function useClock() {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setDate(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }).format(date);
}

export default function DesktopShell({ portfolio, files, messages, photos, onRestoreGame, onBackToDesk, reducedMotion, onReducedMotionChange, wallpaperUrl, initialApp = null }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [windows, dispatch] = useReducer(windowReducer, undefined, createWindowState);
  const [viewport, setViewport] = useState<Viewport>({ width: 1000, height: 720 });
  const lastInitialApp = useRef<string | null>(null);
  const clock = useClock();

  useEffect(() => {
    const measure = () => {
      const next = clampViewport(rootRef.current);
      setViewport(next);
      dispatch({ type: "reflow", viewport: next });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (initialApp && lastInitialApp.current !== initialApp) {
      dispatch({ type: "open", app: initialApp, viewport });
    }
    lastInitialApp.current = initialApp;
  }, [initialApp, viewport]);

  const openApp = (app: DesktopAppId) => dispatch({ type: "open", app, viewport });
  const windowContent = useMemo(() => ({
    chrome: <BrowserApp portfolio={portfolio} />,
    files: <div className={styles.appContent}>{files}</div>,
    photos: <div className={styles.appContent}>{photos}</div>,
    messages: <div className={styles.messageContent}>{messages}</div>,
    settings: <div className={styles.settingsContent}><h2>Settings</h2><p>Accessibility</p><label className={styles.motionControl}><span><strong>Reduce motion</strong><small>Keep desktop movement minimal</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => onReducedMotionChange(event.target.checked)} aria-label="Reduce motion"/><span className={styles.switch} aria-hidden="true"/></label></div>,
  }), [files, messages, photos, onReducedMotionChange, portfolio, reducedMotion]);

  return <section ref={rootRef} data-desktop-root className={styles.desktop} style={{ backgroundImage: `linear-gradient(180deg, rgba(12, 13, 31, .22), rgba(8, 7, 26, .1)), url("${wallpaperUrl}")` }} aria-label="Sean's desktop">
    <header className={styles.topBar}><div className={styles.activities}>Activities</div><div className={styles.clock}>{clock}</div><div className={styles.status} aria-label="System status"><span aria-hidden="true">◔</span><span aria-hidden="true">⌁</span><span aria-hidden="true">▰</span><button type="button" aria-label="Back to the desk" onClick={onBackToDesk}>×</button></div></header>
    <aside className={styles.dock} aria-label="Desktop applications">
      {(["chrome", "files", ...(photos ? ["photos"] : []), "messages", "settings"] as DesktopAppId[]).map((app) => <button type="button" className={styles.dockButton} key={app} onClick={() => openApp(app)} aria-label={appLabels[app]} title={appLabels[app]}><Icon app={app}/><span>{app === "chrome" ? "Chrome" : app === "messages" ? "Messages" : app[0].toUpperCase() + app.slice(1)}</span></button>)}
      <div className={styles.dockDivider}/>
      <button type="button" className={styles.dockButton} data-dock-app="slippi" onClick={onRestoreGame} aria-label={appLabels.slippi} title={appLabels.slippi}><Icon app="slippi"/><span>Slippi</span></button>
    </aside>
    <div className={styles.desktopHint}>Click an app to begin</div>
    {(Object.keys(windows) as DesktopAppId[]).map((app) => {
      const frame = windows[app];
      if (!frame.mounted) return null;
      return <DesktopWindow key={app} app={app} title={app === "chrome" ? "Sean Arackal • Google Chrome" : app === "messages" ? "Message Sean" : app[0].toUpperCase() + app.slice(1)} frame={frame} viewport={viewport} onAction={dispatch}>{windowContent[app]}</DesktopWindow>;
    })}
  </section>;
}

function DesktopWindow({ app, title, frame, viewport, onAction, children }: { app: DesktopAppId; title: string; frame: ReturnType<typeof createWindowState>[DesktopAppId]; viewport: Viewport; onAction: (action: Parameters<typeof windowReducer>[1]) => void; children: ReactNode }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const scrollable = (element: HTMLElement) => element.clientHeight > 0 && element.scrollHeight > element.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(element).overflowY);
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      let target = event.target instanceof HTMLElement ? event.target : null;
      while (target && body.contains(target) && !scrollable(target)) target = target.parentElement;
      if (!target || !body.contains(target)) target = Array.from(body.querySelectorAll<HTMLElement>("*")).find(scrollable) ?? (scrollable(body) ? body : null);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? target.clientHeight : 1;
      target.scrollTop += event.deltaY * unit;
      target.scrollLeft += event.deltaX * unit;
    };
    body.addEventListener("wheel", onWheel, { passive: false });
    return () => body.removeEventListener("wheel", onWheel);
  }, []);
  const dragRef = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const resizeRef = useRef<{ pointerX: number; pointerY: number; width: number; height: number } | null>(null);
  const style = { display: frame.status === "open" || frame.status === "maximized" ? undefined : "none", left: frame.x, top: frame.y, width: frame.width, height: frame.height, zIndex: frame.z };
  const pointerScale = (element: Element) => {
    const root = element.closest("[data-desktop-root]") as HTMLDivElement | null;
    const rect = root?.getBoundingClientRect();
    return root && rect ? getViewportScale({ clientWidth: root.clientWidth, clientHeight: root.clientHeight, renderedWidth: rect.width, renderedHeight: rect.height }) : { x: 1, y: 1 };
  };
  const stop = (event: React.PointerEvent) => event.stopPropagation();
  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (frame.status !== "open") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, x: frame.x, y: frame.y };
    onAction({ type: "focus", app });
  };
  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const scale = pointerScale(event.currentTarget);
    onAction({ type: "move", app, x: drag.x + (event.clientX - drag.pointerX) * scale.x, y: drag.y + (event.clientY - drag.pointerY) * scale.y, viewport });
  };
  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = { pointerX: event.clientX, pointerY: event.clientY, width: frame.width, height: frame.height };
    onAction({ type: "focus", app });
  };
  const moveResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    const resize = resizeRef.current;
    if (!resize) return;
    const scale = pointerScale(event.currentTarget);
    onAction({ type: "resize", app, width: resize.width + (event.clientX - resize.pointerX) * scale.x, height: resize.height + (event.clientY - resize.pointerY) * scale.y, viewport });
  };
  return <article className={styles.window} style={style} onPointerDown={() => onAction({ type: "focus", app })} aria-label={title}>
    <div className={styles.titleBar} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }}>
      <span className={styles.windowTitle}>{title}</span><div className={styles.windowControls} onPointerDown={stop}>
        <button type="button" onClick={() => onAction({ type: "minimize", app })} aria-label={`Minimize ${title}`}>−</button>
        <button type="button" onClick={() => onAction({ type: "toggle-maximize", app, viewport })} aria-label={`${frame.status === "maximized" ? "Restore" : "Maximize"} ${title}`}>□</button>
        <button type="button" onClick={() => onAction({ type: "close", app })} aria-label={`Close ${title}`}>×</button>
      </div>
    </div>
    <div ref={bodyRef} className={styles.windowBody}>{children}</div>
    {frame.status === "open" && <button type="button" className={styles.resizeHandle} aria-label={`Resize ${title}`} onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={() => { resizeRef.current = null; }} onPointerCancel={() => { resizeRef.current = null; }} onKeyDown={(event) => { const amount = event.shiftKey ? 32 : 12; if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); onAction({ type: "resize", app, width: frame.width + (event.key === "ArrowRight" ? amount : 0), height: frame.height + (event.key === "ArrowDown" ? amount : 0), viewport }); } if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); onAction({ type: "resize", app, width: frame.width - (event.key === "ArrowLeft" ? amount : 0), height: frame.height - (event.key === "ArrowUp" ? amount : 0), viewport }); } }} />}
  </article>;
}
