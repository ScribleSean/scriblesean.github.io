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

type FetchResponse = {
  ok: boolean;
  status: number;
};

type FetchImplementation = (
  input: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
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

export function validateMessageSubmission(
  submission: MessageSubmission,
): MessageSubmission {
  const messages = submission.messages.map((message) => ({
    ...message,
    text: message.text.trim(),
  }));

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
        !message.text ||
        !message.createdAt ||
        Number.isNaN(Date.parse(message.createdAt)),
    )
  ) {
    throw new MessageDeliveryError("Each message needs text and a valid timestamp.");
  }

  return { ...submission, messages };
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

  return lines.join("\n").trimEnd();
}

export function createMessageTransport(
  endpoint: string | undefined,
  fetchImplementation: FetchImplementation = fetch,
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

    let response: FetchResponse;
    try {
      response = await fetchImplementation(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: formBody.toString(),
      });
    } catch {
      throw new MessageDeliveryError(
        "Your conversation could not be sent. Check your connection and try again.",
      );
    }

    if (!response.ok) {
      throw new MessageDeliveryError(
        `Your conversation could not be sent (status ${response.status}). Please try again.`,
      );
    }
  };
}

export const defaultMessageTransport = createMessageTransport(
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT,
);
