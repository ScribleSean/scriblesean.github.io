export type Message = {
  id: string;
  text: string;
  createdAt: string;
};

export type MessageSubmission = {
  messages: Message[];
  submittedAt: string;
};

export type MessageTransport = (
  submission: MessageSubmission,
) => Promise<void>;

export const MAX_MESSAGE_COUNT = 40;
export const MAX_MESSAGE_LENGTH = 2_000;
export const MAX_CONVERSATION_LENGTH = 20_000;
export const MESSAGE_DELIVERY_TIMEOUT_MS = 12_000;

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type FetchImplementation = (
  input: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
    signal: AbortSignal;
  },
) => Promise<FetchResponse>;

export class MessageDeliveryUnavailableError extends Error {
  constructor(message = "Message delivery has not been configured yet.") {
    super(message);
    this.name = "MessageDeliveryUnavailableError";
  }
}

export class MessageDeliveryError extends Error {
  constructor(message = "Your conversation could not be sent. Please try again.") {
    super(message);
    this.name = "MessageDeliveryError";
  }
}

export function getMessageTextLength(messages: Message[]): number {
  return messages.reduce((length, message) => length + message.text.length, 0);
}

export function getMessageLimitError(messages: Message[]): string | null {
  if (messages.length > MAX_MESSAGE_COUNT) {
    return `A conversation can contain up to ${MAX_MESSAGE_COUNT} messages.`;
  }

  if (messages.some((message) => message.text.length > MAX_MESSAGE_LENGTH)) {
    return `Each message can contain up to ${MAX_MESSAGE_LENGTH.toLocaleString()} characters.`;
  }

  if (getMessageTextLength(messages) > MAX_CONVERSATION_LENGTH) {
    return `A conversation can contain up to ${MAX_CONVERSATION_LENGTH.toLocaleString()} characters.`;
  }

  return null;
}

export function validateMessageSubmission(
  submission: MessageSubmission,
): MessageSubmission {
  const messages = submission.messages;

  if (!submission.submittedAt || Number.isNaN(Date.parse(submission.submittedAt))) {
    throw new MessageDeliveryError("The conversation has an invalid submitted time.");
  }

  if (messages.length === 0) {
    throw new MessageDeliveryError("Write at least one message before sending.");
  }

  if (
    messages.some(
      (message) =>
        !message.id ||
        !message.text.trim() ||
        !message.createdAt ||
        Number.isNaN(Date.parse(message.createdAt)),
    )
  ) {
    throw new MessageDeliveryError("Each message needs text and a valid timestamp.");
  }

  const limitError = getMessageLimitError(messages);
  if (limitError) {
    throw new MessageDeliveryError(limitError);
  }

  return submission;
}

export function formatConversation(submission: MessageSubmission): string {
  const validSubmission = validateMessageSubmission(submission);
  const lines = [
    "Conversation from Sean Arackal's portfolio",
    `Submitted: ${validSubmission.submittedAt}`,
    "",
  ];

  for (const message of validSubmission.messages) {
    lines.push(`Visitor · ${message.createdAt}`, message.text, "");
  }

  return lines.join("\n");
}

function hasSuccessfulProviderResponse(data: unknown): boolean {
  if (
    typeof data !== "object" ||
    data === null ||
    !Object.prototype.hasOwnProperty.call(data, "success")
  ) {
    return false;
  }

  const success = (data as { success?: unknown }).success;
  return success === true || success === "true";
}

export function createMessageTransport(
  endpoint: string | undefined,
  fetchImplementation: FetchImplementation = fetch,
  timeoutMs = MESSAGE_DELIVERY_TIMEOUT_MS,
): MessageTransport {
  return async (submission) => {
    if (!endpoint) {
      throw new MessageDeliveryUnavailableError();
    }

    const conversation = formatConversation(submission);
    const formBody = new URLSearchParams({
      _subject: "New portfolio conversation",
      conversation,
      submitted_at: submission.submittedAt,
    });

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMs);
    let response: FetchResponse;
    try {
      response = await fetchImplementation(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: formBody.toString(),
        signal: abortController.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        const timeoutSeconds = Math.ceil(timeoutMs / 1_000);
        throw new MessageDeliveryError(
          `Your conversation timed out after ${timeoutSeconds} ${timeoutSeconds === 1 ? "second" : "seconds"}. Please try again.`,
        );
      }
      throw new MessageDeliveryError(
        "Your conversation could not be sent. Check your connection and try again.",
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new MessageDeliveryError(
        `Your conversation could not be sent (status ${response.status}). Please try again.`,
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new MessageDeliveryError(
        "The delivery service returned an invalid response. Please try again.",
      );
    }

    if (!hasSuccessfulProviderResponse(data)) {
      throw new MessageDeliveryError(
        "The delivery service could not accept your conversation. Please try again.",
      );
    }
  };
}

export const defaultMessageTransport = createMessageTransport(
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT,
);
