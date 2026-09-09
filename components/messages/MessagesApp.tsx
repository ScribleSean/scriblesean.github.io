"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";

import {
  defaultMessageTransport,
  formatConversation,
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
    text: text.trim(),
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

  const isComposerEmpty = !composerText.trim();
  const fallbackHref = useMemo(
    () => (messages.length ? makeMailtoHref(messages) : "mailto:sean.arackal@gmail.com"),
    [messages],
  );

  function resetStatus() {
    if (submissionState !== "sending") {
      setSubmissionState("draft");
      setStatusMessage("");
    }
  }

  function addOrUpdateMessage() {
    if (isComposerEmpty || submissionState === "sending" || submissionState === "sent") {
      return;
    }

    const text = composerText.trim();
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
    if (submissionState !== "draft" && submissionState !== "error") {
      return;
    }

    setComposerText(message.text);
    setEditingMessageId(message.id);
    resetStatus();
  }

  function deleteMessage(id: string) {
    if (submissionState !== "draft" && submissionState !== "error") {
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
    if (submissionState === "sending" || messages.length === 0) {
      return;
    }

    const submission: MessageSubmission = {
      messages,
      submittedAt: new Date().toISOString(),
    };
    setSubmissionState("sending");
    setStatusMessage("Sending conversation…");

    try {
      await transport(submission);
      setSubmissionState("sent");
      setStatusMessage("Sent to Sean. He’ll reply using any contact details you included.");
    } catch (error) {
      setSubmissionState("error");
      setStatusMessage(
        error instanceof MessageDeliveryUnavailableError
          ? "Message delivery is not configured yet. You can still send this conversation by email."
          : error instanceof Error
            ? error.message
            : "Your conversation could not be sent. Please try again.",
      );
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

      <div className={styles.thread} aria-live="polite">
        <div className={`${styles.bubble} ${styles.incoming}`}>{welcomeMessage}</div>
        {messages.map((message) => (
          <div className={styles.outgoingGroup} key={message.id}>
            <div className={`${styles.bubble} ${styles.outgoing}`}>{message.text}</div>
            {(submissionState === "draft" || submissionState === "error") && (
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
          placeholder="Type anything. Include an email or handle if you want a reply."
          rows={3}
          disabled={submissionState === "sending" || submissionState === "sent"}
        />
        <div className={styles.composerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={addOrUpdateMessage}
            disabled={isComposerEmpty || submissionState === "sending" || submissionState === "sent"}
          >
            {editingMessageId ? "Save message" : "Add message"}
          </button>
          <button
            type="submit"
            className={styles.sendButton}
            disabled={messages.length === 0 || submissionState === "sending" || submissionState === "sent"}
          >
            {submissionState === "sending" ? "Sending…" : "Send conversation to Sean"}
          </button>
        </div>
      </form>

      {statusMessage && (
        <p className={submissionState === "error" ? styles.error : styles.status} role="status">
          {statusMessage}
        </p>
      )}
      {submissionState === "error" && (
        <a className={styles.emailFallback} href={fallbackHref}>
          Send this conversation by email instead
        </a>
      )}
    </section>
  );
}
