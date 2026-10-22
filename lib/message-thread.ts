import {
  getMessageLimitError,
  getMessageTextLength,
  type Message,
} from "./message-transport";


export type SubmissionState = "draft" | "sending" | "sent" | "error";

export type ThreadState = {
  messages: Message[];
  sentIds: string[];
  composerText: string;
  editingMessageId: string | null;
  submission: SubmissionState;
  statusMessage: string;
  showEmailFallback: boolean;
};

export type ThreadAction =
  | { type: "compose"; text: string }
  | { type: "commit"; draft: Message }
  | { type: "edit"; id: string; draft: Message }
  | { type: "cancel-edit" }
  | { type: "delete"; id: string }
  | { type: "submit-start"; draft: Message }
  | { type: "submit-success"; ids: string[] }
  | { type: "submit-error"; message: string; showEmailFallback: boolean }
  | { type: "invalid"; message: string };

export const COMPOSER_ID = "composer";

export const initialThreadState: ThreadState = {
  messages: [],
  sentIds: [],
  composerText: "",
  editingMessageId: null,
  submission: "draft",
  statusMessage: "",
  showEmailFallback: false,
};

export function isSent(state: ThreadState, id: string): boolean {
  return state.sentIds.includes(id);
}

export function getPendingMessages(state: ThreadState): Message[] {
  const unsent = state.messages.filter((message) => !isSent(state, message.id));
  if (!state.composerText.trim()) return unsent;
  if (state.editingMessageId) {
    return unsent.map((message) =>
      message.id === state.editingMessageId ? { ...message, text: state.composerText } : message,
    );
  }
  return [
    ...unsent,
    { id: COMPOSER_ID, text: state.composerText, createdAt: new Date(0).toISOString() },
  ];
}

export function getThreadView(state: ThreadState) {
  const pending = getPendingMessages(state);
  const limitError = getMessageLimitError(pending);
  const composerEmpty = !state.composerText.trim();
  const sending = state.submission === "sending";
  return {
    pending,
    limitError,
    conversationLength: getMessageTextLength(pending),
    composerEmpty,
    canCommit: !composerEmpty && !limitError && !sending,
    canSend: pending.length > 0 && !limitError && !sending,
    showSend: pending.length > 0 || sending,
  };
}

const clearStatus = (state: ThreadState): ThreadState =>
  state.submission === "sending"
    ? state
    : { ...state, submission: "draft", statusMessage: "", showEmailFallback: false };

function commitComposer(state: ThreadState, draft: Message): ThreadState {
  const text = state.composerText;
  if (!text.trim()) return { ...state, composerText: "", editingMessageId: null };
  if (state.editingMessageId) {
    return {
      ...state,
      messages: state.messages.map((message) =>
        message.id === state.editingMessageId ? { ...message, text } : message,
      ),
      composerText: "",
      editingMessageId: null,
    };
  }
  return {
    ...state,
    messages: [...state.messages, { ...draft, text }],
    composerText: "",
  };
}

export function threadReducer(state: ThreadState, action: ThreadAction): ThreadState {
  const sending = state.submission === "sending";
  switch (action.type) {
    case "compose": {
      if (sending) return state;
      const next = { ...state, composerText: action.text };
      if (state.editingMessageId && !action.text.trim()) next.editingMessageId = null;
      return clearStatus(next);
    }
    case "commit": {
      if (!getThreadView(state).canCommit) return state;
      return clearStatus(commitComposer(state, action.draft));
    }
    case "edit": {
      if (sending || isSent(state, action.id) || state.editingMessageId === action.id) return state;
      const target = state.messages.find((message) => message.id === action.id);
      if (!target) return state;
      let next = state;
      if (state.composerText.trim()) {
        if (getThreadView(state).limitError) return state;
        next = commitComposer(state, action.draft);
      }
      const current = next.messages.find((message) => message.id === action.id) ?? target;
      return clearStatus({ ...next, composerText: current.text, editingMessageId: action.id });
    }
    case "cancel-edit": {
      if (!state.editingMessageId) return state;
      return clearStatus({ ...state, composerText: "", editingMessageId: null });
    }
    case "delete": {
      if (sending || isSent(state, action.id)) return state;
      const next = {
        ...state,
        messages: state.messages.filter((message) => message.id !== action.id),
      };
      if (state.editingMessageId === action.id) {
        next.editingMessageId = null;
        next.composerText = "";
      }
      return clearStatus(next);
    }
    case "submit-start": {
      if (sending) return state;
      const committed = commitComposer(state, action.draft);
      return {
        ...committed,
        submission: "sending",
        statusMessage: "Sending conversation…",
        showEmailFallback: false,
      };
    }
    case "submit-success":
      return {
        ...state,
        sentIds: [...state.sentIds, ...action.ids.filter((id) => !state.sentIds.includes(id))],
        submission: "sent",
        statusMessage: "Sent to Sean.",
        showEmailFallback: false,
      };
    case "submit-error":
      return {
        ...state,
        submission: "error",
        statusMessage: action.message,
        showEmailFallback: action.showEmailFallback,
      };
    case "invalid":
      if (sending) return state;
      return { ...state, submission: "error", statusMessage: action.message, showEmailFallback: false };
  }
}

export type ThreadStore = {
  getState: () => ThreadState;
  dispatch: (action: ThreadAction) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createThreadStore(initial: ThreadState = initialThreadState): ThreadStore {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    dispatch(action) {
      const next = threadReducer(state, action);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// Outlook and Windows cut mailto links off at about 2,000 characters.
export const MAILTO_BODY_LIMIT = 1_800;

export function makeMailtoHref(email: string, messages: Message[]): string {
  const subject = "Portfolio conversation";
  const lines = ["Conversation from Sean Arackal's portfolio", ""];
  for (const message of messages) {
    if (message.text.trim()) lines.push(message.text, "");
  }
  let body = lines.join("\n");
  if (body.length > MAILTO_BODY_LIMIT) {
    body = `${body.slice(0, MAILTO_BODY_LIMIT).trimEnd()}\n\n[Trimmed to fit an email link. Paste the rest here.]`;
  }
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function createMessageId(): string {
  // randomUUID only exists on secure origins (HTTPS or localhost).
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createMessage(text: string): Message {
  return { id: createMessageId(), text, createdAt: new Date().toISOString() };
}
