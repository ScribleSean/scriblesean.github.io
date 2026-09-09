export type DesktopAppId = "chrome" | "files" | "messages" | "settings";

export type Viewport = { width: number; height: number };

export type WindowFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  status: "closed" | "open" | "minimized" | "maximized";
  restoreFrame?: Pick<WindowFrame, "x" | "y" | "width" | "height">;
};

export type WindowState = Record<DesktopAppId, WindowFrame>;

const MIN_WIDTH = 330;
const MIN_HEIGHT = 240;
const EDGE_GAP = 12;

const defaults: Record<DesktopAppId, Omit<WindowFrame, "z">> = {
  chrome: { x: 86, y: 72, width: 760, height: 510, status: "closed" },
  files: { x: 142, y: 112, width: 570, height: 410, status: "closed" },
  messages: { x: 226, y: 92, width: 430, height: 500, status: "closed" },
  settings: { x: 280, y: 130, width: 390, height: 330, status: "closed" },
};

export function createWindowState(): WindowState {
  return Object.fromEntries(
    Object.entries(defaults).map(([id, frame]) => [id, { ...frame, z: 1 }]),
  ) as WindowState;
}

export function clampFrame(frame: Pick<WindowFrame, "x" | "y" | "width" | "height">, viewport: Viewport) {
  const maxWidth = Math.max(1, viewport.width - EDGE_GAP * 2);
  const maxHeight = Math.max(1, viewport.height - EDGE_GAP * 2);
  const width = Math.min(Math.max(MIN_WIDTH, frame.width), maxWidth);
  const height = Math.min(Math.max(MIN_HEIGHT, frame.height), maxHeight);
  return {
    x: Math.min(Math.max(EDGE_GAP, frame.x), Math.max(EDGE_GAP, viewport.width - width - EDGE_GAP)),
    y: Math.min(Math.max(EDGE_GAP, frame.y), Math.max(EDGE_GAP, viewport.height - height - EDGE_GAP)),
    width,
    height,
  };
}

function nextZ(state: WindowState) {
  return Math.max(...Object.values(state).map((frame) => frame.z), 0) + 1;
}

export type WindowAction =
  | { type: "open"; app: DesktopAppId; viewport: Viewport }
  | { type: "focus"; app: DesktopAppId }
  | { type: "minimize"; app: DesktopAppId }
  | { type: "close"; app: DesktopAppId }
  | { type: "move"; app: DesktopAppId; x: number; y: number; viewport: Viewport }
  | { type: "resize"; app: DesktopAppId; width: number; height: number; viewport: Viewport }
  | { type: "toggle-maximize"; app: DesktopAppId; viewport: Viewport }
  | { type: "reflow"; viewport: Viewport };

export function windowReducer(state: WindowState, action: WindowAction): WindowState {
  const update = (app: DesktopAppId, frame: WindowFrame): WindowState => ({ ...state, [app]: frame });

  switch (action.type) {
    case "open": {
      const active = state[action.app];
      const base = active.status === "closed" ? { ...defaults[action.app], z: nextZ(state) } : active;
      const frame = clampFrame(base, action.viewport);
      return update(action.app, { ...base, ...frame, status: "open", z: nextZ(state) });
    }
    case "focus": {
      const active = state[action.app];
      return active.status === "open" || active.status === "maximized"
        ? update(action.app, { ...active, z: nextZ(state) })
        : state;
    }
    case "minimize": {
      const active = state[action.app];
      return update(action.app, { ...active, status: "minimized" });
    }
    case "close": {
      const active = state[action.app];
      return update(action.app, { ...active, status: "closed", restoreFrame: undefined });
    }
    case "move": {
      const active = state[action.app];
      if (active.status !== "open") return state;
      const frame = clampFrame({ ...active, x: action.x, y: action.y }, action.viewport);
      return update(action.app, { ...active, ...frame });
    }
    case "resize": {
      const active = state[action.app];
      if (active.status !== "open") return state;
      const frame = clampFrame({ ...active, width: action.width, height: action.height }, action.viewport);
      return update(action.app, { ...active, ...frame });
    }
    case "toggle-maximize": {
      const active = state[action.app];
      if (active.status === "maximized") {
        const restore = active.restoreFrame ?? defaults[action.app];
        return update(action.app, { ...active, ...clampFrame(restore, action.viewport), status: "open", restoreFrame: undefined, z: nextZ(state) });
      }
      if (active.status !== "open") return state;
      const frame = clampFrame({ x: EDGE_GAP, y: EDGE_GAP, width: action.viewport.width - EDGE_GAP * 2, height: action.viewport.height - EDGE_GAP * 2 }, action.viewport);
      return update(action.app, {
        ...active,
        ...frame,
        status: "maximized",
        restoreFrame: { x: active.x, y: active.y, width: active.width, height: active.height },
        z: nextZ(state),
      });
    }
    case "reflow":
      return Object.fromEntries(Object.entries(state).map(([app, frame]) => {
        if (frame.status === "maximized") {
          return [app, { ...frame, ...clampFrame({ x: EDGE_GAP, y: EDGE_GAP, width: action.viewport.width - EDGE_GAP * 2, height: action.viewport.height - EDGE_GAP * 2 }, action.viewport) }];
        }
        return [app, { ...frame, ...clampFrame(frame, action.viewport) }];
      })) as WindowState;
  }
}
