import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

type MessagePayload = {
  senderUid: string;
  receiverUid: string;
  content: string;
  messageType?: string;
  senderName?: string;
  receiverName?: string;
  senderAvatar?: string;
  receiverAvatar?: string;
};

export type MessageRecord = MessagePayload & {
  id: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
};

export type ConversationSummary = {
  conversationId: string;
  otherUid: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
};

const STORE_DIR = path.resolve(__dirname, "..", "data");
const STORE_FILE = path.join(STORE_DIR, "messages.json");

async function ensureStoreFile() {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    await fs.access(STORE_FILE);
  } catch {
    await fs.writeFile(STORE_FILE, JSON.stringify([]), "utf-8");
  }
}

async function loadMessages(): Promise<MessageRecord[]> {
  await ensureStoreFile();
  const content = await fs.readFile(STORE_FILE, "utf-8");
  try {
    return JSON.parse(content) as MessageRecord[];
  } catch {
    return [];
  }
}

async function saveMessages(messages: MessageRecord[]) {
  await ensureStoreFile();
  await fs.writeFile(STORE_FILE, JSON.stringify(messages, null, 2), "utf-8");
}

function createConversationId(userA: string, userB: string) {
  return [userA, userB].sort().join("__");
}

export async function sendMessage(
  message: MessagePayload,
): Promise<MessageRecord> {
  const conversationId = createConversationId(
    message.senderUid,
    message.receiverUid,
  );
  const now = new Date().toISOString();
  const newMessage: MessageRecord = {
    id: randomUUID(),
    ...message,
    conversationId,
    isRead: false,
    createdAt: now,
  };

  const messages = await loadMessages();
  messages.unshift(newMessage);
  await saveMessages(messages);

  return newMessage;
}

export async function getConversationThread(
  userUid: string,
  otherUid: string,
): Promise<MessageRecord[]> {
  const conversationId = createConversationId(userUid, otherUid);
  const messages = await loadMessages();

  return messages
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listConversationsForUser(
  userUid: string,
): Promise<ConversationSummary[]> {
  const messages = await loadMessages();
  const summaries = new Map<string, ConversationSummary>();

  messages.forEach((message) => {
    if (message.senderUid !== userUid && message.receiverUid !== userUid) {
      return;
    }

    const conversationId = message.conversationId;
    const otherUid =
      message.senderUid === userUid ? message.receiverUid : message.senderUid;
    const name =
      message.senderUid === userUid
        ? message.receiverName || otherUid
        : message.senderName || otherUid;
    const avatar =
      message.senderUid === userUid
        ? message.receiverAvatar
        : message.senderAvatar;
    const lastMessage = message.content || "";
    const lastTimestamp = message.createdAt;
    const isUnread = !message.isRead && message.receiverUid === userUid;

    const existing = summaries.get(conversationId);
    if (!existing) {
      summaries.set(conversationId, {
        conversationId,
        otherUid,
        name,
        avatar,
        lastMessage,
        lastTimestamp,
        unreadCount: isUnread ? 1 : 0,
      });
      return;
    }

    if (lastTimestamp > existing.lastTimestamp) {
      existing.lastMessage = lastMessage;
      existing.lastTimestamp = lastTimestamp;
      existing.name = name;
      existing.avatar = avatar;
    }

    if (isUnread) {
      existing.unreadCount += 1;
    }
  });

  return Array.from(summaries.values()).sort((a, b) =>
    b.lastTimestamp.localeCompare(a.lastTimestamp),
  );
}

export default {
  sendMessage,
  getConversationThread,
  listConversationsForUser,
};
