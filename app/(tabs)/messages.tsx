/**
 * WilderGo Messages Screen
 * Convoy messaging experience for nomadic coordination
 * Features: Live pins, member statuses
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  Modal,
} from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";
import { ConvoyThread } from "@/components/convoy/ConvoyThread";
import { ConvoyStatusHeader } from "@/components/convoy/ConvoyMemberStatus";
import { NomadicPulseBadge } from "@/components/convoy/NomadicPulseBadge";
import { useAuth } from "@/contexts/AuthContext";
import { fetchConversations } from "@/services/messages/messageService";
import {
  Convoy,
  ConvoyMember,
  convoyService,
  getMemberStatusColor,
  getMemberStatusLabel,
} from "@/services/convoy/convoyService";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  isConvoy?: boolean;
  isBuilder?: boolean;
  routeOverlap?: number;
  avatar?: string;
  members?: ConvoyMember[];
  convoyData?: Convoy;
  nomadicPulse?:
    | "off_grid"
    | "stealth_camping"
    | "rv_park"
    | "urban_discovery"
    | "boondocking"
    | "national_park";
}

const initialConversations: Conversation[] = [
  {
    id: "conv1",
    name: "Pacific Coast Convoy",
    lastMessage: "Alex shared a location: Amazing campspot with cell signal!",
    timestamp: "25m ago",
    unread: 3,
    online: true,
    isConvoy: true,
    convoyData: convoyService.getConvoyById("conv1"),
    members: convoyService.getConvoyById("conv1")?.members,
  },
  {
    id: "1",
    name: "Alex",
    lastMessage: "Hey! Are you heading to Glacier too?",
    timestamp: "2m ago",
    unread: 2,
    online: true,
    routeOverlap: 85,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    nomadicPulse: "boondocking",
  },
  {
    id: "conv2",
    name: "Desert Nomads",
    lastMessage: "Jordan is now En Route",
    timestamp: "1h ago",
    unread: 1,
    online: true,
    isConvoy: true,
    convoyData: convoyService.getConvoyById("conv2"),
    members: convoyService.getConvoyById("conv2")?.members,
  },
  {
    id: "3",
    name: "Sarah Solar Solutions",
    lastMessage: "Your panel setup looks great! I can help...",
    timestamp: "1h ago",
    unread: 0,
    online: false,
    isBuilder: true,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  },
  {
    id: "4",
    name: "Jordan",
    lastMessage: "That hot spring was amazing!",
    timestamp: "3h ago",
    unread: 0,
    online: true,
    routeOverlap: 62,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    nomadicPulse: "national_park",
  },
  {
    id: "5",
    name: "Sam",
    lastMessage: "See you at the bonfire tonight!",
    timestamp: "Yesterday",
    unread: 0,
    online: false,
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
    nomadicPulse: "stealth_camping",
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "convoys"
  >("all");
  const [selectedConvoy, setSelectedConvoy] = useState<Convoy | null>(null);
  const [showConvoyThread, setShowConvoyThread] = useState(false);
  const [showNewConvoyModal, setShowNewConvoyModal] = useState(false);
  const [conversationsList, setConversationsList] =
    useState<Conversation[]>(initialConversations);
  const [newConvoyName, setNewConvoyName] = useState("");

  useEffect(() => {
    if (!user?.uid) return;

    fetchConversations(user.uid)
      .then((conversations) => {
        if (conversations.length > 0) {
          setConversationsList(
            conversations.map((conversation) => ({
              id: conversation.otherUid,
              name: conversation.name,
              lastMessage: conversation.lastMessage,
              timestamp: new Date(
                conversation.lastTimestamp,
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              unread: conversation.unreadCount,
              online: true,
              avatar: conversation.avatar,
            })),
          );
        }
      })
      .catch((error) => {
        console.error("Failed to fetch conversations:", error);
      });
  }, [user?.uid]);

  const filteredConversations = conversationsList.filter((conv) => {
    const matchesSearch =
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "unread") return conv.unread > 0;
    if (activeFilter === "convoys") return conv.isConvoy;
    return true;
  });

  const handleConversationPress = useCallback(
    (conv: Conversation) => {
      if (conv.isConvoy && conv.convoyData) {
        setSelectedConvoy(conv.convoyData);
        setShowConvoyThread(true);
      } else {
        router.push("/dm-chat", {
          id: conv.id,
          name: conv.name,
          avatar: conv.avatar || "",
        });
      }
    },
    [router],
  );

  const getAvatarColor = (item: Conversation) => {
    if (item.isConvoy) return colors.moss[500];
    if (item.isBuilder) return colors.driftwood[500];
    return colors.ember[500];
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleConversationPress(item)}
    >
      <GlassCard variant="light" padding="md" style={styles.conversationCard}>
        <View style={styles.conversationItem}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: getAvatarColor(item) + "25" },
                ]}
              >
                <Ionicons
                  name={
                    item.isConvoy
                      ? "people"
                      : item.isBuilder
                        ? "construct"
                        : "person"
                  }
                  size={24}
                  color={getAvatarColor(item)}
                />
              </View>
            )}
            {item.online && <View style={styles.onlineIndicator} />}

            {/* Convoy member count badge */}
            {item.isConvoy && item.members && (
              <View style={styles.memberCountBadge}>
                <Text style={styles.memberCountText}>
                  {item.members.length}
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <View style={styles.nameContainer}>
                <Text
                  style={[
                    styles.conversationName,
                    item.unread > 0 && styles.unreadName,
                  ]}
                >
                  {item.name}
                </Text>
                {item.isBuilder && (
                  <View style={styles.builderBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={12}
                      color={colors.driftwood[500]}
                    />
                  </View>
                )}
                {item.isConvoy && (
                  <View style={styles.convoyBadge}>
                    <Ionicons
                      name="car-sport"
                      size={10}
                      color={colors.moss[500]}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>

            {/* Convoy member status header */}
            {item.isConvoy && item.members && (
              <View style={styles.convoyStatusContainer}>
                <ConvoyStatusHeader members={item.members} />
              </View>
            )}

            <View style={styles.messageRow}>
              <Text
                style={[
                  styles.lastMessage,
                  item.unread > 0 && styles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>

            {/* Meta badges row */}
            <View style={styles.badgesRow}>
              {item.routeOverlap && (
                <View style={styles.routeOverlapBadge}>
                  <Ionicons
                    name="navigate"
                    size={10}
                    color={colors.text.inverse}
                  />
                  <Text style={styles.routeOverlapText}>
                    {item.routeOverlap}%
                  </Text>
                </View>
              )}
              {item.nomadicPulse && (
                <NomadicPulseBadge
                  pulse={item.nomadicPulse}
                  size="small"
                  showLabel={false}
                  animated={false}
                />
              )}
            </View>
          </View>

          {/* Unread Badge */}
          {item.unread > 0 && (
            <View style={styles.unreadBadgeContainer}>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unread}</Text>
              </View>
              <View style={styles.unreadGlow} />
            </View>
          )}

          {/* Convoy arrow */}
          {item.isConvoy && (
            <Ionicons name="chevron-forward" size={20} color={"#4A5568"} />
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  const SearchBarContent = () => (
    <View style={styles.searchBarInner}>
      <Ionicons name="search" size={18} color={colors.bark[400]} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search conversations..."
        placeholderTextColor={colors.bark[400]}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Ionicons name="close-circle" size={18} color={colors.bark[400]} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background.primary },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Convoy Threads</Text>
        </View>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => {
            // Open new convoy creation modal
            setShowNewConvoyModal(true);
          }}
        >
          {Platform.OS === "ios" ? (
            <BlurView intensity={80} tint="light" style={styles.composeBlur}>
              <Ionicons name="add" size={24} color={colors.moss[600]} />
            </BlurView>
          ) : (
            <View style={[styles.composeBlur, styles.composeFallback]}>
              <Ionicons name="add" size={24} color={colors.moss[600]} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={60} tint="light" style={styles.searchBar}>
            <SearchBarContent />
          </BlurView>
        ) : (
          <View style={[styles.searchBar, styles.searchBarFallback]}>
            <SearchBarContent />
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(["all", "unread", "convoys"] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            {activeFilter === filter && Platform.OS === "ios" ? (
              <BlurView intensity={80} tint="light" style={styles.filterBlur}>
                <Ionicons
                  name={
                    filter === "convoys"
                      ? "car-sport"
                      : filter === "unread"
                        ? "mail-unread"
                        : "chatbubbles"
                  }
                  size={14}
                  color={colors.moss[600]}
                  style={{ marginRight: spacing.xs }}
                />
                <Text style={styles.filterTextActive}>
                  {filter === "all"
                    ? "All"
                    : filter === "unread"
                      ? "Unread"
                      : "Convoys"}
                </Text>
              </BlurView>
            ) : (
              <View
                style={
                  activeFilter === filter
                    ? styles.filterBlurFallback
                    : undefined
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter === "all"
                    ? "All"
                    : filter === "unread"
                      ? "Unread"
                      : "Convoys"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <GlassCard variant="medium" padding="xl" style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color={colors.moss[500]}
                />
              </View>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Start a conversation by matching with someone on the Discovery
                tab or join a convoy!
              </Text>
            </View>
          </GlassCard>
        }
      />

      {/* Convoy Thread Modal */}
      <Modal
        visible={showConvoyThread}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowConvoyThread(false)}
      >
        {selectedConvoy && (
          <ConvoyThread
            convoy={selectedConvoy}
            currentUserId="current-user"
            onBack={() => setShowConvoyThread(false)}
            onOpenMap={(lat, lng) => {
              setShowConvoyThread(false);
              setTimeout(() => {
                navigation.navigate("Map", { latitude: lat, longitude: lng });
              }, 300);
            }}
            onViewMember={(member) => {
              console.log("View member profile:", member.name);
            }}
          />
        )}
      </Modal>

      {/* New Convoy Modal */}
      <Modal
        visible={showNewConvoyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewConvoyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowNewConvoyModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Convoy</Text>
              <TouchableOpacity onPress={() => setShowNewConvoyModal(false)}>
                <Ionicons name="close" size={24} color={colors.bark[600]} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Convoy Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter convoy name..."
              placeholderTextColor={colors.bark[400]}
              value={newConvoyName}
              onChangeText={setNewConvoyName}
              testID="input-convoy-name"
            />

            <Text style={styles.modalDescription}>
              Create a convoy to coordinate travel with other nomads. You can
              invite friends and share locations in real-time.
            </Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                !newConvoyName.trim() && styles.modalButtonDisabled,
              ]}
              onPress={() => {
                if (newConvoyName.trim()) {
                  const newConvoy: Conversation = {
                    id: `conv-${Date.now()}`,
                    name: newConvoyName.trim(),
                    lastMessage: "Convoy created! Invite friends to join.",
                    timestamp: "Just now",
                    unread: 0,
                    online: true,
                    isConvoy: true,
                  };
                  setConversationsList((prev) => [newConvoy, ...prev]);
                  setShowNewConvoyModal(false);
                  setNewConvoyName("");
                }
              }}
              disabled={!newConvoyName.trim()}
              testID="button-create-convoy"
            >
              <Ionicons name="people" size={18} color={colors.text.inverse} />
              <Text style={styles.modalButtonText}>Create Convoy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[900],
    marginLeft: spacing.sm,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    marginTop: 2,
  },
  composeButton: {
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  composeBlur: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  composeFallback: {
    backgroundColor: colors.bark[100],
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  searchBar: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  searchBarFallback: {
    backgroundColor: colors.bark[100],
  },
  searchBarInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.bark[900],
    paddingVertical: spacing.xs,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterTab: {
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  filterTabActive: {
    ...shadows.glass,
  },
  filterBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  filterBlurFallback: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bark[100],
    borderRadius: borderRadius.full,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "500",
    color: colors.bark[700],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  filterTextActive: {
    color: colors.moss[600],
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: spacing.xl,
  },
  conversationCard: {
    marginVertical: 0,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.moss[500],
    borderWidth: 2,
    borderColor: colors.glass.whiteLight,
  },
  memberCountBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.moss[500],
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.glass.whiteLight,
  },
  memberCountText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.text.inverse,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  conversationName: {
    fontSize: typography.fontSize.base,
    fontWeight: "500",
    color: colors.bark[800],
  },
  unreadName: {
    fontWeight: "700",
    color: colors.bark[900],
  },
  builderBadge: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    backgroundColor: colors.driftwood[500] + "25",
    justifyContent: "center",
    alignItems: "center",
  },
  convoyBadge: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    backgroundColor: colors.moss[500] + "25",
    justifyContent: "center",
    alignItems: "center",
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: "#4A5568",
  },
  convoyStatusContainer: {
    marginVertical: spacing.xs,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  lastMessage: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: "#4A5568",
  },
  unreadMessage: {
    color: colors.bark[700],
    fontWeight: "500",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  routeOverlapBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ember[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 2,
  },
  routeOverlapText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "600",
    color: colors.text.inverse,
  },
  unreadBadgeContainer: {
    position: "relative",
    marginLeft: spacing.sm,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.ember[500],
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    zIndex: 1,
  },
  unreadGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.ember[500],
    opacity: 0.3,
    zIndex: 0,
  },
  unreadCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  separator: {
    height: spacing.sm,
  },
  emptyCard: {
    marginTop: spacing["2xl"],
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.moss[500] + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
    color: colors.bark[800],
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
  },
  modalLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[600],
    marginBottom: spacing.xs,
  },
  modalInput: {
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[800],
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: spacing.md,
  },
  modalDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.moss[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  modalButtonDisabled: {
    backgroundColor: colors.bark[300],
  },
  modalButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
});
