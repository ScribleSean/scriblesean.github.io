"use client";

import { FormEvent, KeyboardEvent, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  defaultMessageTransport,
  formatConversation,
  getMessageLimitError,
  getMessageTextLength,
  MAX_CONVERSATION_LENGTH,
  MAX_MESSAGE_COUNT,
  MAX_MESSAGE_LENGTH,
  Message,
  MessageDeliveryUnavailableError,
  MessageSubmission,
  MessageTransport,
} from "@/lib/message-transport";

import styles from "./MessagesApp.module.css";

const welcomeMessage =
  "Thank you for visiting my website! If you find this cool or want to talk about anything with me, I’d be happy to reach out! Just send me a way to contact you, and you’ll hear back from me!";

type SubmissionState = "draft" | "sending" | "sent" | "error";

export type MessagesAppProps = {
  transport?: MessageTransport;
};

function createMessage(text: string): Message {
  return {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };
}

function makeMailtoHref(messages: Message[]): string {
  const submission: MessageSubmission = {
    messages,
    submittedAt: new Date().toISOString(),
  };
  const subject = "Portfolio conversation";
  return `mailto:sean.arackal@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formatConversation(submission))}`;
}

export default function MessagesApp({
  transport = defaultMessageTransport,
}: MessagesAppProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [composerText, setComposerText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("draft");
  const [statusMessage, setStatusMessage] = useState("");
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const isSubmittingRef = useRef(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, submissionState]);

  const isComposerEmpty = !composerText.trim();
  const messagesWithComposer = useMemo(() => {
    if (isComposerEmpty) {
      return messages;
    }

    if (editingMessageId) {
      return messages.map((message) =>
        message.id === editingMessageId ? { ...message, text: composerText } : message,
      );
    }

    return [...messages, { id: "composer", text: composerText, createdAt: new Date().toISOString() }];
  }, [composerText, editingMessageId, isComposerEmpty, messages]);
  const composerLimitError = getMessageLimitError(messagesWithComposer);
  const conversationLength = getMessageTextLength(messagesWithComposer);
  const showLimitHint =
    Boolean(composerLimitError) ||
    messagesWithComposer.length >= MAX_MESSAGE_COUNT - 1 ||
    conversationLength >= MAX_CONVERSATION_LENGTH * 0.8;
  const canAddOrUpdateMessage = !isComposerEmpty && !composerLimitError;
  const fallbackHref = useMemo(
    () =>
      messagesWithComposer.length
        ? makeMailtoHref(messagesWithComposer)
        : "mailto:sean.arackal@gmail.com",
    [messagesWithComposer],
  );

  function resetStatus() {
    if (!isSubmittingRef.current) {
      setSubmissionState("draft");
      setStatusMessage("");
      setShowEmailFallback(false);
    }
  }

  function addOrUpdateMessage() {
    if (
      !canAddOrUpdateMessage ||
      isSubmittingRef.current
    ) {
      return;
    }

    const text = composerText;
    if (editingMessageId) {
      setMessages((current) =>
        current.map((message) =>
          message.id === editingMessageId ? { ...message, text } : message,
        ),
      );
      setEditingMessageId(null);
    } else {
      setMessages((current) => [...current, createMessage(text)]);
    }
    setComposerText("");
    resetStatus();
  }

  function editMessage(message: Message) {
    if (isSubmittingRef.current) {
      return;
    }

    setComposerText(message.text);
    setEditingMessageId(message.id);
    resetStatus();
  }

  function deleteMessage(id: string) {
    if (isSubmittingRef.current) {
      return;
    }

    setMessages((current) => current.filter((message) => message.id !== id));
    if (editingMessageId === id) {
      setEditingMessageId(null);
      setComposerText("");
    }
    resetStatus();
  }

  async function submitConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmittingRef.current) {
      return;
    }

    const messagesToSubmit = messagesWithComposer;
    if (messagesToSubmit.length === 0 || composerLimitError) {
      setSubmissionState("error");
      setShowEmailFallback(false);
      setStatusMessage(
        composerLimitError ?? "Write at least one message before sending.",
      );
      return;
    }

    const submission: MessageSubmission = {
      messages: messagesToSubmit,
      submittedAt: new Date().toISOString(),
    };
    isSubmittingRef.current = true;
    setSubmissionState("sending");
    setShowEmailFallback(false);
    setStatusMessage("Sending conversation…");

    try {
      await transport(submission);
      setMessages(messagesToSubmit);
      setComposerText("");
      setEditingMessageId(null);
      setSubmissionState("sent");
      setStatusMessage("Sent to Sean. He’ll reply using any contact details you included.");
    } catch (error) {
      setSubmissionState("error");
      setShowEmailFallback(true);
      setStatusMessage(
        error instanceof MessageDeliveryUnavailableError
          ? "Message delivery is not configured yet. You can still send this conversation by email."
          : error instanceof Error
            ? error.message
          : "Your conversation could not be sent. Please try again.",
      );
    } finally {
      isSubmittingRef.current = false;
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      addOrUpdateMessage();
    }
  }

  return (
    <section className={styles.messagesApp} aria-labelledby="messages-heading">
      <header className={styles.header}>
        <p className={styles.windowLabel}>Messages</p>
        <h2 id="messages-heading">Sean Arackal</h2>
        <span className={styles.availability}>Available by email</span>
      </header>

      <div ref={threadRef} className={styles.thread} aria-live="polite">
        <div className={`${styles.bubble} ${styles.incoming}`}>{welcomeMessage}</div>
        {messages.map((message) => (
          <div className={styles.outgoingGroup} key={message.id}>
            <div className={`${styles.bubble} ${styles.outgoing}`}>{message.text}</div>
            {submissionState !== "sending" && (
              <div className={styles.messageActions}>
                <button type="button" onClick={() => editMessage(message)}>
                  Edit
                </button>
                <button type="button" onClick={() => deleteMessage(message.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form className={styles.composer} onSubmit={submitConversation}>
        <label className={styles.composerLabel} htmlFor="message-composer">
          Your message
        </label>
        <textarea
          id="message-composer"
          value={composerText}
          onChange={(event) => {
            setComposerText(event.target.value);
            resetStatus();
          }}
          onKeyDown={handleComposerKeyDown}
          placeholder="Message Sean…"
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          aria-describedby={showLimitHint ? "message-limits" : undefined}
          disabled={submissionState === "sending"}
        />
        <div className={styles.composerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={addOrUpdateMessage}
            disabled={!canAddOrUpdateMessage || submissionState === "sending"}
            aria-label={editingMessageId ? "Save message" : "Add message"}
            title={editingMessageId ? "Save message" : "Add message"}
          >
            ↑
          </button>
          {messages.length > 0 && (
            <button
              type="submit"
              className={styles.sendButton}
              disabled={
                Boolean(composerLimitError) ||
                submissionState === "sending"
              }
            >
              {submissionState === "sending" ? "Sending…" : "Send conversation to Sean"}
            </button>
          )}
        </div>
        {showLimitHint && (
          <p
            className={composerLimitError ? styles.limitError : styles.limitHint}
            id="message-limits"
            role={composerLimitError ? "alert" : undefined}
          >
            {composerLimitError ??
              `${messagesWithComposer.length}/${MAX_MESSAGE_COUNT} messages · ${conversationLength.toLocaleString()}/${MAX_CONVERSATION_LENGTH.toLocaleString()} characters`}
          </p>
        )}
        {statusMessage && (
          <p
            className={submissionState === "error" ? styles.error : styles.status}
            role={submissionState === "error" ? "alert" : "status"}
          >
            {statusMessage}
          </p>
        )}
        {submissionState === "error" && showEmailFallback && (
          <a className={styles.emailFallback} href={fallbackHref}>
            Send this conversation by email instead
          </a>
        )}
      </form>
    </section>
  );
}
