import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "@/hooks/useRouterCompat";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchConversationThread,
  sendMessage as sendChatMessage,
} from "@/services/messages/messageService";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      text: "Hey! Are you heading to Glacier too?",
      sender: "them",
      timestamp: "2:30 PM",
    },
    {
      id: "m2",
      text: "Yes! Planning to be there by Thursday",
      sender: "me",
      timestamp: "2:32 PM",
    },
    {
      id: "m3",
      text: "Amazing! I found a great boondocking spot near the west entrance",
      sender: "them",
      timestamp: "2:33 PM",
    },
    {
      id: "m4",
      text: "Send me the coords? My Starlink should work there",
      sender: "me",
      timestamp: "2:35 PM",
    },
  ],
  "2": [
    {
      id: "m1",
      text: "Your van build looks incredible!",
      sender: "them",
      timestamp: "11:00 AM",
    },
    {
      id: "m2",
      text: "Thanks! Took about 6 months. Happy to share the build list",
      sender: "me",
      timestamp: "11:05 AM",
    },
  ],
  "3": [
    {
      id: "m1",
      text: "The stargazing at Big Bend was unreal last night",
      sender: "them",
      timestamp: "Yesterday",
    },
  ],
  "4": [
    {
      id: "m1",
      text: "Just finished my solar setup - 400W panels with a 200Ah battery",
      sender: "them",
      timestamp: "2 days ago",
    },
    {
      id: "m2",
      text: "Nice! What charge controller did you go with?",
      sender: "me",
      timestamp: "2 days ago",
    },
  ],
};

export default function DMChatScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    avatar: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const mapChatToMessage = useCallback(
    (chatMessage: {
      id: string;
      content: string;
      senderUid: string;
      createdAt: string;
    }): Message => ({
      id: chatMessage.id,
      text: chatMessage.content,
      sender: chatMessage.senderUid === user?.uid ? "me" : "them",
      timestamp: new Date(chatMessage.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }),
    [user?.uid],
  );

  useEffect(() => {
    const otherUid = params.id;
    if (!user?.uid || !otherUid) {
      setMessages(MOCK_MESSAGES[otherUid || "1"] || []);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchConversationThread(user.uid, otherUid)
      .then((records) => {
        if (records.length === 0) {
          setMessages(MOCK_MESSAGES[otherUid] || []);
        } else {
          setMessages(records.map(mapChatToMessage));
        }
      })
      .catch((error) => {
        console.error("Failed to load conversation thread:", error);
        setMessages(MOCK_MESSAGES[otherUid] || []);
      })
      .finally(() => setIsLoading(false));
  }, [params.id, user?.uid, mapChatToMessage]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !user?.uid || !params.id) return;

    setIsSending(true);
    try {
      const sent = await sendChatMessage({
        senderUid: user.uid,
        receiverUid: params.id,
        content: inputText.trim(),
        senderName: user.displayName || user.email,
        receiverName: params.name,
        senderAvatar: user.photoURL,
        receiverAvatar: params.avatar,
      });

      const newMsg: Message = {
        id: sent.id,
        text: sent.content,
        sender: "me",
        timestamp: new Date(sent.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [newMsg, ...prev]);
      setInputText("");
    } catch (error: any) {
      console.error("Send message failed:", error);
    } finally {
      setIsSending(false);
    }
  }, [inputText, params.id, params.name, params.avatar, user]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isMe = item.sender === "me";
    return (
      <View style={[msgStyles.row, isMe ? msgStyles.rowMe : null]}>
        <View
          style={[
            msgStyles.bubble,
            isMe ? msgStyles.bubbleMe : msgStyles.bubbleThem,
          ]}
        >
          <Text style={[msgStyles.text, isMe ? msgStyles.textMe : null]}>
            {item.text}
          </Text>
          <Text style={[msgStyles.time, isMe ? msgStyles.timeMe : null]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  }, []);

  const contactName = params.name || "Chat";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={80} tint="light" style={styles.headerBlur}>
            <HeaderContent
              name={contactName}
              avatar={params.avatar}
              onBack={() => router.back()}
            />
          </BlurView>
        ) : (
          <View style={styles.headerFallback}>
            <HeaderContent
              name={contactName}
              avatar={params.avatar}
              onBack={() => router.back()}
            />
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted={messages.length > 0}
          contentContainerStyle={[styles.messagesList, { paddingBottom: 80 }]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={48}
                color={colors.bark[300]}
              />
              <Text style={styles.emptyText}>
                Start a conversation with {contactName}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <View
          style={[
            styles.inputWrapper,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={colors.bark[400]}
              multiline
              maxLength={500}
              testID="input-dm-message"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() ? styles.sendBtnDisabled : null,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              testID="button-send-dm"
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  inputText.trim() ? colors.text.inverse : colors.bark[400]
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function HeaderContent({
  name,
  avatar,
  onBack,
}: {
  name: string;
  avatar?: string;
  onBack: () => void;
}) {
  return (
    <View style={headerStyles.content}>
      <TouchableOpacity
        onPress={onBack}
        style={headerStyles.backBtn}
        testID="button-dm-back"
      >
        <Ionicons name="chevron-back" size={24} color={colors.bark[800]} />
      </TouchableOpacity>
      {avatar ? (
        <Image source={{ uri: avatar }} style={headerStyles.avatar} />
      ) : (
        <View style={headerStyles.avatarPlaceholder}>
          <Ionicons name="person" size={20} color={colors.bark[500]} />
        </View>
      )}
      <View style={headerStyles.info}>
        <Text style={headerStyles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={headerStyles.statusRow}>
          <View style={headerStyles.onlineDot} />
          <Text style={headerStyles.statusText}>Online</Text>
        </View>
      </View>
      <TouchableOpacity style={headerStyles.moreBtn}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.bark[600]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.driftwood[50],
  },
  flex: {
    flex: 1,
  },
  header: {
    zIndex: 10,
  },
  headerBlur: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  headerFallback: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[100],
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
    textAlign: "center",
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.bark[100],
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.bark[50],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[900],
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.moss[500],
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: colors.bark[100],
  },
});

const msgStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  rowMe: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  bubbleMe: {
    backgroundColor: colors.moss[500],
    borderBottomRightRadius: spacing.xs,
  },
  bubbleThem: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.bark[100],
  },
  text: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[800],
    lineHeight: 22,
  },
  textMe: {
    color: colors.text.inverse,
  },
  time: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
    marginTop: 4,
  },
  timeMe: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
});

const headerStyles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bark[100],
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.moss[500],
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.moss[600],
  },
  moreBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
