"use client";

import { FormEvent, KeyboardEvent, useLayoutEffect, useRef, useSyncExternalStore } from "react";

import { contact } from "@/data/resume";
import {
  defaultMessageTransport,
  MAX_CONVERSATION_LENGTH,
  MAX_MESSAGE_COUNT,
  MAX_MESSAGE_LENGTH,
  MessageDeliveryUnavailableError,
} from "@/lib/message-transport";
import {
  createMessage,
  getPendingMessages,
  getThreadView,
  isSent,
  makeMailtoHref,
  type ThreadStore,
} from "@/lib/message-thread";

import styles from "./MessagesApp.module.css";

const welcomeMessage =
  "Thanks for visiting! If you want to talk about anything, send me a message with a way to reach you, and I’ll get back to you.";

export default function MessagesApp({ store }: { store: ThreadStore }) {
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  const { dispatch } = store;
  const threadRef = useRef<HTMLDivElement>(null);

  const { messages, composerText, editingMessageId, submission, statusMessage, showEmailFallback } = state;
  const view = getThreadView(state);
  const sending = submission === "sending";
  const showLimitHint =
    Boolean(view.limitError) ||
    view.pending.length >= MAX_MESSAGE_COUNT - 1 ||
    view.conversationLength >= MAX_CONVERSATION_LENGTH * 0.8;
  const lastUnsentId = [...messages].reverse().find((message) => !isSent(state, message.id))?.id;
  const lastSentId = [...messages].reverse().find((message) => isSent(state, message.id))?.id;

  useLayoutEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, submission]);

  async function submitConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const current = store.getState();
    if (current.submission === "sending") return;

    const currentView = getThreadView(current);
    if (currentView.pending.length === 0 || currentView.limitError) {
      dispatch({
        type: "invalid",
        message: currentView.limitError ?? "Write at least one message before sending.",
      });
      return;
    }

    dispatch({ type: "submit-start", draft: createMessage("") });
    const messagesToSubmit = getPendingMessages(store.getState());

    try {
      await defaultMessageTransport({ messages: messagesToSubmit, submittedAt: new Date().toISOString() });
      dispatch({ type: "submit-success", ids: messagesToSubmit.map((message) => message.id) });
    } catch (error) {
      dispatch({
        type: "submit-error",
        showEmailFallback: true,
        message:
          error instanceof MessageDeliveryUnavailableError
            ? "Message delivery is not configured yet. You can still send this conversation by email."
            : error instanceof Error
              ? error.message
              : "Your conversation could not be sent. Please try again.",
      });
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter during IME composition confirms the conversion, not the message.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      dispatch({ type: "commit", draft: createMessage("") });
    } else if (event.key === "Escape" && editingMessageId) {
      event.preventDefault();
      dispatch({ type: "cancel-edit" });
    }
  }

  return (
    <section className={styles.messagesApp} aria-labelledby="messages-heading">
      <header className={styles.header}>
        <p className={styles.windowLabel}>Messages</p>
        <h2 id="messages-heading">Sean Arackal</h2>
        <span className={styles.availability}>Available by email</span>
      </header>

      <div ref={threadRef} data-desktop-scroll className={styles.thread} aria-live="polite">
        <div className={`${styles.bubble} ${styles.incoming}`}>{welcomeMessage}</div>
        {messages.map((message) => {
          const sent = isSent(state, message.id);
          return (
            <div className={styles.outgoingGroup} key={message.id}>
              <div
                className={`${styles.bubble} ${styles.outgoing} ${editingMessageId === message.id ? styles.editing : ""}`}
              >
                {message.text}
              </div>
              {sent ? (
                message.id === lastSentId && <p className={styles.receipt}>Delivered</p>
              ) : (
                !sending && (
                  <div className={styles.messageActions}>
                    {message.id === lastUnsentId && <span className={styles.receipt}>Not sent yet</span>}
                    <button type="button" onClick={() => dispatch({ type: "edit", id: message.id, draft: createMessage("") })}>
                      Edit
                    </button>
                    <button type="button" onClick={() => dispatch({ type: "delete", id: message.id })}>
                      Delete
                    </button>
                  </div>
                )
              )}
            </div>
          );
        })}
        {statusMessage && (
          <p
            className={submission === "error" ? styles.error : styles.status}
            role={submission === "error" ? "alert" : "status"}
          >
            {statusMessage}
          </p>
        )}
        {submission === "error" && showEmailFallback && (
          <a className={styles.emailFallback} href={makeMailtoHref(contact.email, view.pending)}>
            Send this conversation by email instead
          </a>
        )}
      </div>

      <form className={styles.composer} onSubmit={submitConversation}>
        <label className={styles.composerLabel} htmlFor="message-composer">
          Your message
        </label>
        <div className={styles.inputRow}>
          <textarea
            id="message-composer"
            value={composerText}
            onChange={(event) => dispatch({ type: "compose", text: event.target.value })}
            onKeyDown={handleComposerKeyDown}
            placeholder={editingMessageId ? "Edit your message…" : "Message Sean…"}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-describedby={showLimitHint ? "message-limits" : undefined}
            disabled={sending}
          />
          {!view.composerEmpty && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => dispatch({ type: "commit", draft: createMessage("") })}
              disabled={!view.canCommit}
              aria-label={editingMessageId ? "Save message" : "Add message"}
              title={editingMessageId ? "Save message" : "Add message"}
            >
              ↑
            </button>
          )}
        </div>
        {(view.showSend || editingMessageId) && (
          <div className={styles.composerActions}>
            {editingMessageId && (
              <button type="button" className={styles.textButton} onClick={() => dispatch({ type: "cancel-edit" })}>
                Cancel edit
              </button>
            )}
            {view.showSend && (
              <button type="submit" className={styles.sendButton} disabled={!view.canSend}>
                {sending ? "Sending…" : "Send conversation to Sean"}
              </button>
            )}
          </div>
        )}
        {showLimitHint && (
          <p
            className={view.limitError ? styles.limitError : styles.limitHint}
            id="message-limits"
            role={view.limitError ? "alert" : undefined}
          >
            {view.limitError ??
              `${view.pending.length}/${MAX_MESSAGE_COUNT} messages · ${view.conversationLength.toLocaleString()}/${MAX_CONVERSATION_LENGTH.toLocaleString()} characters`}
          </p>
        )}
      </form>
    </section>
  );
}
