import { apiRequest } from "@/lib/query-client";

export interface ChatMessage {
  id: string;
  senderUid: string;
  receiverUid: string;
  content: string;
  messageType: string;
  senderName?: string;
  receiverName?: string;
  senderAvatar?: string;
  receiverAvatar?: string;
  conversationId: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationSummary {
  conversationId: string;
  otherUid: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export async function fetchConversations(
  userUid: string,
): Promise<ConversationSummary[]> {
  const response = await apiRequest(
    "GET",
    `/api/messages/conversations/${encodeURIComponent(userUid)}`,
  );
  const data = await response.json();
  return data.conversations || [];
}

export async function fetchConversationThread(
  userUid: string,
  otherUid: string,
): Promise<ChatMessage[]> {
  const response = await apiRequest(
    "GET",
    `/api/messages/thread/${encodeURIComponent(userUid)}/${encodeURIComponent(otherUid)}`,
  );
  const data = await response.json();
  return data.messages || [];
}

export async function sendMessage(params: {
  senderUid: string;
  receiverUid: string;
  content: string;
  messageType?: string;
  senderName?: string;
  receiverName?: string;
  senderAvatar?: string;
  receiverAvatar?: string;
}): Promise<ChatMessage> {
  const response = await apiRequest("POST", "/api/messages/send", params);
  const data = await response.json();
  return data.message;
}
