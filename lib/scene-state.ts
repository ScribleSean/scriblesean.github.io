export type CameraView = "room" | "desk" | "focus" | "entered";
export type ScreenView = "game" | "desktop";
export type SceneState = { camera: CameraView; screen: ScreenView; mobileOpen: boolean };
export type SceneAction =
  | { type: "approach" }
  | { type: "hover"; over: boolean }
  | { type: "enter"; mobile: boolean }
  | { type: "restore-game" }
  | { type: "minimize-game" }
  | { type: "contact"; mobile: boolean }
  | { type: "back" };

export const initialSceneState: SceneState = { camera: "room", screen: "game", mobileOpen: false };

export function sceneReducer(state: SceneState, action: SceneAction): SceneState {
  switch (action.type) {
    case "approach": return state.camera === "room" ? { ...state, camera: "desk" } : state;
    case "hover":
      if (state.camera !== "desk" && state.camera !== "focus") return state;
      return { ...state, camera: action.over ? "focus" : "desk" };
    case "enter": return { camera: "entered", screen: "desktop", mobileOpen: action.mobile };
    case "contact": return { camera: "entered", screen: "desktop", mobileOpen: action.mobile };
    case "restore-game": return { ...state, screen: "game" };
    case "minimize-game": return { ...state, screen: "desktop" };
    case "back": return { ...initialSceneState };
  }
}

export function shouldPlayGame(state: SceneState, documentVisible: boolean): boolean {
  return documentVisible && !state.mobileOpen && state.screen === "game";
}
