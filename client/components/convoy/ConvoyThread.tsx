/**
 * WilderGo Convoy Thread Component
 * Full messaging experience with live pins, member statuses, and AI icebreakers
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Switch,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Convoy,
  ConvoyMessage,
  ConvoyMember,
  getMemberStatusColor,
  getMemberStatusLabel,
  generateIcebreakerContext,
} from "@/services/convoy/convoyService";
import { ConvoyStatusHeader } from "./ConvoyMemberStatus";
import { LivePinCard } from "./LivePinCard";
import { NomadicPulseBadge } from "./NomadicPulseBadge";

// Stub hook for text generation (AI disabled in this environment)
function useTextGeneration(_options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) {
  const [isLoading] = useState(false);
  const [data] = useState<string | null>(null);
  const generateText = useCallback(async (_prompt: string): Promise<string> => {
    return "Welcome to the convoy!";
  }, []);
  return { generateText, data, isLoading };
}

interface ConvoyThreadProps {
  convoy: Convoy;
  currentUserId: string;
  onBack: () => void;
  onOpenMap?: (latitude: number, longitude: number) => void;
  onViewMember?: (member: ConvoyMember) => void;
}

export const ConvoyThread: React.FC<ConvoyThreadProps> = ({
  convoy,
  currentUserId,
  onBack,
  onOpenMap,
  onViewMember,
}) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [showPinSelector, setShowPinSelector] = useState(false);
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // AI Icebreaker integration
  const {
    generateText,
    data: icebreakerText,
    isLoading: icebreakerLoading,
  } = useTextGeneration({
    onSuccess: () => {
      setIsGeneratingIcebreaker(false);
    },
    onError: () => {
      setIsGeneratingIcebreaker(false);
    },
  });

  const handleGenerateIcebreaker = useCallback(
    async (newMember: ConvoyMember) => {
      setIsGeneratingIcebreaker(true);
      const context = generateIcebreakerContext(
        newMember,
        convoy.members.filter((m) => m.id !== newMember.id),
      );
      await generateText(context);
    },
    [convoy.members, generateText],
  );

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;
    // In a real app, this would send the message to the backend
    console.log("Sending message:", message);
    setMessage("");
  }, [message]);

  const handlePinPress = useCallback(
    (latitude: number, longitude: number) => {
      onOpenMap?.(latitude, longitude);
    },
    [onOpenMap],
  );

  const renderMessage = ({ item }: { item: ConvoyMessage }) => {
    const isOwnMessage = item.senderId === currentUserId;
    const isSystem = item.type === "system";

    // System messages
    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }

    // Status update messages
    if (item.type === "status_update" && item.statusUpdate) {
      const newStatusColor = getMemberStatusColor(item.statusUpdate.newStatus);
      const newStatusLabel = getMemberStatusLabel(item.statusUpdate.newStatus);

      return (
        <View style={styles.statusUpdateMessage}>
          <View
            style={[
              styles.statusUpdateDot,
              { backgroundColor: newStatusColor },
            ]}
          />
          <Text style={styles.statusUpdateText}>
            <Text style={styles.statusUpdateName}>{item.senderName}</Text>
            {" is now "}
            <Text
              style={[styles.statusUpdateStatus, { color: newStatusColor }]}
            >
              {newStatusLabel}
            </Text>
          </Text>
        </View>
      );
    }

    // Live pin messages
    if (item.type === "live_pin" && item.livePin) {
      return (
        <View
          style={[
            styles.messageContainer,
            isOwnMessage && styles.messageContainerOwn,
          ]}
        >
          {!isOwnMessage && (
            <TouchableOpacity
              onPress={() => {
                const member = convoy.members.find(
                  (m) => m.id === item.senderId,
                );
                if (member) onViewMember?.(member);
              }}
            >
              {item.senderAvatar ? (
                <Image
                  source={{ uri: item.senderAvatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={16} color={colors.bark[400]} />
                </View>
              )}
            </TouchableOpacity>
          )}
          <View style={styles.messageContentWide}>
            {!isOwnMessage && (
              <Text style={styles.senderName}>{item.senderName}</Text>
            )}
            <LivePinCard
              pin={item.livePin}
              onPress={(pin) => handlePinPress(pin.latitude, pin.longitude)}
            />
            <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      );
    }

    // AI Icebreaker messages
    if (item.type === "icebreaker") {
      return (
        <View style={styles.icebreakerContainer}>
          <GlassCard variant="frost" padding="md" style={styles.icebreakerCard}>
            <View style={styles.icebreakerHeader}>
              <View style={styles.icebreakerIconContainer}>
                <Ionicons name="sparkles" size={16} color={colors.ember[500]} />
              </View>
              <Text style={styles.icebreakerLabel}>AI Icebreaker</Text>
            </View>
            <Text style={styles.icebreakerText}>{item.content}</Text>
            <TouchableOpacity style={styles.useIcebreakerButton}>
              <Text style={styles.useIcebreakerText}>Use This</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      );
    }

    // Regular text messages
    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage && styles.messageContainerOwn,
        ]}
      >
        {!isOwnMessage && (
          <TouchableOpacity
            onPress={() => {
              const member = convoy.members.find((m) => m.id === item.senderId);
              if (member) onViewMember?.(member);
            }}
          >
            {item.senderAvatar ? (
              <Image
                source={{ uri: item.senderAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color={colors.bark[400]} />
              </View>
            )}
          </TouchableOpacity>
        )}
        <View style={styles.messageContent}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <View
            style={[
              styles.messageBubble,
              isOwnMessage
                ? styles.messageBubbleOwn
                : styles.messageBubbleOther,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isOwnMessage && styles.messageTextOwn,
              ]}
            >
              {item.content}
            </Text>
          </View>
          <Text
            style={[styles.messageTime, isOwnMessage && styles.messageTimeOwn]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={blur.heavy}
            tint="light"
            style={styles.headerBlur}
          >
            <HeaderContent
              convoy={convoy}
              onBack={onBack}
              onViewMember={onViewMember}
              onOptionsPress={() => setShowOptionsModal(true)}
            />
          </BlurView>
        ) : (
          <View style={[styles.headerBlur, styles.headerFallback]}>
            <HeaderContent
              convoy={convoy}
              onBack={onBack}
              onViewMember={onViewMember}
              onOptionsPress={() => setShowOptionsModal(true)}
            />
          </View>
        )}
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={convoy.messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* AI Icebreaker Loading */}
      {isGeneratingIcebreaker && (
        <View style={styles.icebreakerLoading}>
          <Ionicons name="sparkles" size={16} color={colors.ember[500]} />
          <Text style={styles.icebreakerLoadingText}>
            Generating icebreaker...
          </Text>
        </View>
      )}

      {/* Input Area */}
      <View
        style={[
          styles.inputContainer,
          { paddingBottom: insets.bottom + spacing.sm },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={blur.heavy}
            tint="light"
            style={styles.inputBlur}
          >
            <InputContent
              message={message}
              setMessage={setMessage}
              onSend={handleSendMessage}
              onPinPress={() => setShowPinSelector(!showPinSelector)}
            />
          </BlurView>
        ) : (
          <View style={[styles.inputBlur, styles.inputFallback]}>
            <InputContent
              message={message}
              setMessage={setMessage}
              onSend={handleSendMessage}
              onPinPress={() => setShowPinSelector(!showPinSelector)}
            />
          </View>
        )}
      </View>

      {/* Convoy Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowOptionsModal(false)}
          />
          <View style={styles.optionsModalContent}>
            <Text style={styles.optionsTitle}>{convoy.name}</Text>
            <Text style={styles.optionsSubtitle}>
              {convoy.members.length} members
            </Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowOptionsModal(false);
                setShowMembersModal(true);
              }}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: colors.moss[100] },
                ]}
              >
                <Ionicons name="people" size={20} color={colors.moss[600]} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>View Members</Text>
                <Text style={styles.optionDescription}>
                  See all convoy members and their status
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.bark[300]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowOptionsModal(false);
                setShowSettingsModal(true);
              }}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: colors.bark[100] },
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={colors.bark[600]}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>Convoy Settings</Text>
                <Text style={styles.optionDescription}>
                  Notifications, privacy, and more
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.bark[300]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionRow, styles.optionRowDestructive]}
              onPress={() => {
                setShowOptionsModal(false);
                onBack();
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="exit-outline" size={20} color="#DC2626" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionLabel, { color: "#DC2626" }]}>
                  Leave Convoy
                </Text>
                <Text style={styles.optionDescription}>
                  You can rejoin later
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCancelBtn}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text style={styles.optionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={styles.membersModalContainer}>
          <View style={styles.membersModalContent}>
            <View style={styles.membersModalHandle} />
            <View style={styles.membersModalHeader}>
              <Text style={styles.membersModalTitle}>Convoy Members</Text>
              <TouchableOpacity onPress={() => setShowMembersModal(false)}>
                <Ionicons name="close" size={24} color={colors.bark[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {convoy.members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberRow}
                  onPress={() => {
                    setShowMembersModal(false);
                    onViewMember?.(member);
                  }}
                >
                  {member.avatar ? (
                    <Image
                      source={{ uri: member.avatar }}
                      style={styles.memberRowAvatar}
                    />
                  ) : (
                    <View style={styles.memberRowAvatarPlaceholder}>
                      <Ionicons
                        name="person"
                        size={20}
                        color={colors.bark[400]}
                      />
                    </View>
                  )}
                  <View style={styles.memberRowInfo}>
                    <Text style={styles.memberRowName}>{member.name}</Text>
                    <View style={styles.memberRowStatus}>
                      <View
                        style={[
                          styles.memberRowStatusDot,
                          {
                            backgroundColor: getMemberStatusColor(
                              member.status,
                            ),
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.memberRowStatusText,
                          { color: getMemberStatusColor(member.status) },
                        ]}
                      >
                        {getMemberStatusLabel(member.status)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Pin Selector Popup */}
      {showPinSelector ? (
        <View style={styles.pinSelectorContainer}>
          <View style={styles.pinSelectorContent}>
            <View style={styles.pinSelectorHeader}>
              <Text style={styles.pinSelectorTitle}>Share Location Pin</Text>
              <TouchableOpacity onPress={() => setShowPinSelector(false)}>
                <Ionicons name="close" size={20} color={colors.bark[600]} />
              </TouchableOpacity>
            </View>
            {[
              {
                icon: "location" as const,
                label: "Current Location",
                desc: "Share where you are now",
                color: colors.moss[500],
              },
              {
                icon: "car" as const,
                label: "Camp Spot",
                desc: "Mark a campsite or parking spot",
                color: colors.sunsetOrange[500],
              },
              {
                icon: "water" as const,
                label: "Water Source",
                desc: "Fresh water fill-up point",
                color: colors.moss[400],
              },
              {
                icon: "warning" as const,
                label: "Hazard",
                desc: "Road closure or danger zone",
                color: "#DC2626",
              },
              {
                icon: "restaurant" as const,
                label: "Food/Services",
                desc: "Restaurant, gas, supplies",
                color: colors.ember[500],
              },
            ].map((pinType) => (
              <TouchableOpacity
                key={pinType.label}
                style={styles.pinOption}
                onPress={() => {
                  setShowPinSelector(false);
                  setMessage(`[${pinType.label}] `);
                }}
              >
                <View
                  style={[
                    styles.pinOptionIcon,
                    { backgroundColor: pinType.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={pinType.icon}
                    size={20}
                    color={pinType.color}
                  />
                </View>
                <View style={styles.pinOptionText}>
                  <Text style={styles.pinOptionLabel}>{pinType.label}</Text>
                  <Text style={styles.pinOptionDesc}>{pinType.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {/* Convoy Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.membersModalContainer}>
          <View style={styles.membersModalContent}>
            <View style={styles.membersModalHandle} />
            <View style={styles.membersModalHeader}>
              <Text style={styles.membersModalTitle}>Convoy Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={24} color={colors.bark[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Notifications</Text>
                <View style={styles.settingsRow}>
                  <View style={styles.settingsRowLeft}>
                    <Ionicons
                      name="notifications-outline"
                      size={20}
                      color={colors.bark[600]}
                    />
                    <Text style={styles.settingsRowLabel}>
                      Push Notifications
                    </Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{
                      false: colors.bark[200],
                      true: colors.moss[400],
                    }}
                    thumbColor={
                      notificationsEnabled ? colors.moss[600] : colors.bark[400]
                    }
                  />
                </View>
              </View>

              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Privacy</Text>
                <View style={styles.settingsRow}>
                  <View style={styles.settingsRowLeft}>
                    <Ionicons
                      name="navigate-outline"
                      size={20}
                      color={colors.bark[600]}
                    />
                    <Text style={styles.settingsRowLabel}>
                      Share My Location
                    </Text>
                  </View>
                  <Switch
                    value={locationSharing}
                    onValueChange={setLocationSharing}
                    trackColor={{
                      false: colors.bark[200],
                      true: colors.moss[400],
                    }}
                    thumbColor={
                      locationSharing ? colors.moss[600] : colors.bark[400]
                    }
                  />
                </View>
              </View>

              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Convoy Info</Text>
                <View style={styles.settingsInfoRow}>
                  <Text style={styles.settingsInfoLabel}>Name</Text>
                  <Text style={styles.settingsInfoValue}>{convoy.name}</Text>
                </View>
                <View style={styles.settingsInfoRow}>
                  <Text style={styles.settingsInfoLabel}>Destination</Text>
                  <Text style={styles.settingsInfoValue}>
                    {convoy.destination}
                  </Text>
                </View>
                <View style={styles.settingsInfoRow}>
                  <Text style={styles.settingsInfoLabel}>Members</Text>
                  <Text style={styles.settingsInfoValue}>
                    {convoy.members.length}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Header content component
interface HeaderContentProps {
  convoy: Convoy;
  onBack: () => void;
  onViewMember?: (member: ConvoyMember) => void;
  onOptionsPress?: () => void;
}

const HeaderContent: React.FC<HeaderContentProps> = ({
  convoy,
  onBack,
  onViewMember,
  onOptionsPress,
}) => (
  <View style={headerStyles.content}>
    <TouchableOpacity onPress={onBack} style={headerStyles.backButton}>
      <Ionicons name="chevron-back" size={24} color={colors.bark[700]} />
    </TouchableOpacity>

    <View style={headerStyles.titleContainer}>
      <Text style={headerStyles.title} numberOfLines={1}>
        {convoy.name}
      </Text>
      <Text style={headerStyles.subtitle}>
        {convoy.members.length} members • {convoy.destination}
      </Text>
    </View>

    {/* Member avatars */}
    <View style={headerStyles.avatarStack}>
      {convoy.members.slice(0, 3).map((member, index) => (
        <TouchableOpacity
          key={member.id}
          style={[
            headerStyles.stackedAvatar,
            { marginLeft: index > 0 ? -10 : 0 },
          ]}
          onPress={() => onViewMember?.(member)}
        >
          {member.avatar ? (
            <Image
              source={{ uri: member.avatar }}
              style={headerStyles.memberAvatar}
            />
          ) : (
            <View style={headerStyles.memberAvatarPlaceholder}>
              <Ionicons name="person" size={12} color={colors.bark[400]} />
            </View>
          )}
          <View
            style={[
              headerStyles.statusDot,
              { backgroundColor: getMemberStatusColor(member.status) },
            ]}
          />
        </TouchableOpacity>
      ))}
      {convoy.members.length > 3 && (
        <View style={[headerStyles.moreMembers, { marginLeft: -10 }]}>
          <Text style={headerStyles.moreMembersText}>
            +{convoy.members.length - 3}
          </Text>
        </View>
      )}
    </View>

    <TouchableOpacity style={headerStyles.menuButton} onPress={onOptionsPress}>
      <Ionicons name="ellipsis-vertical" size={20} color={colors.bark[600]} />
    </TouchableOpacity>
  </View>
);

// Input content component
interface InputContentProps {
  message: string;
  setMessage: (msg: string) => void;
  onSend: () => void;
  onPinPress: () => void;
}

const InputContent: React.FC<InputContentProps> = ({
  message,
  setMessage,
  onSend,
  onPinPress,
}) => (
  <View style={inputStyles.content}>
    <TouchableOpacity
      style={inputStyles.pinButton}
      onPress={() => {
        onPinPress();
      }}
    >
      <Ionicons name="location" size={22} color={colors.moss[500]} />
    </TouchableOpacity>

    <TextInput
      style={inputStyles.input}
      placeholder="Message the convoy..."
      placeholderTextColor={colors.bark[400]}
      value={message}
      onChangeText={setMessage}
      multiline
      maxLength={1000}
    />

    <TouchableOpacity
      style={[
        inputStyles.sendButton,
        message.trim() && inputStyles.sendButtonActive,
      ]}
      onPress={onSend}
      disabled={!message.trim()}
    >
      <Ionicons
        name="send"
        size={18}
        color={message.trim() ? colors.text.inverse : colors.bark[400]}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.driftwood[100],
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  headerFallback: {
    backgroundColor: colors.glass.white,
  },
  messagesList: {
    paddingTop: 140,
    paddingHorizontal: spacing.md,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: spacing.md,
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  messageContainerOwn: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass.whiteLight,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContent: {
    maxWidth: "75%",
  },
  messageContentWide: {
    maxWidth: "85%",
    minWidth: 240,
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#2A2A2A",
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.glassSubtle,
  },
  messageBubbleOwn: {
    backgroundColor: colors.moss[500],
    borderBottomRightRadius: spacing.xs,
  },
  messageBubbleOther: {
    backgroundColor: colors.glass.white,
    borderBottomLeftRadius: spacing.xs,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: "#2A2A2A",
    lineHeight: 20,
  },
  messageTextOwn: {
    color: colors.text.inverse,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  messageTimeOwn: {
    textAlign: "right",
    marginRight: spacing.sm,
    marginLeft: 0,
  },
  systemMessage: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  systemMessageText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    backgroundColor: colors.glass.whiteSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusUpdateMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  statusUpdateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusUpdateText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  statusUpdateName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#2A2A2A",
  },
  statusUpdateStatus: {
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  icebreakerContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  icebreakerCard: {
    maxWidth: "90%",
  },
  icebreakerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icebreakerIconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    backgroundColor: colors.ember[500] + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  icebreakerLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.ember[600],
  },
  icebreakerText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: "#2A2A2A",
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  useIcebreakerButton: {
    backgroundColor: colors.ember[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignSelf: "flex-start",
  },
  useIcebreakerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  icebreakerLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  icebreakerLoadingText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.ember[500],
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputBlur: {
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  inputFallback: {
    backgroundColor: colors.glass.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  optionsModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  optionsTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
    marginBottom: spacing.xxs,
  },
  optionsSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    marginBottom: spacing.xl,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  optionRowDestructive: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bark[100],
    paddingTop: spacing.lg,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  optionDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
    marginTop: 2,
  },
  optionCancelBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: colors.bark[50],
    borderRadius: borderRadius.lg,
  },
  optionCancelText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[600],
  },
  membersModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  membersModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: "80%",
  },
  membersModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.bark[200],
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  membersModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  membersModalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[50],
  },
  memberRowAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberRowAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bark[100],
    justifyContent: "center",
    alignItems: "center",
  },
  memberRowInfo: {
    flex: 1,
  },
  memberRowName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
    marginBottom: 2,
  },
  memberRowStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  memberRowStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  memberRowStatusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
  },
  leaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.sunsetOrange[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  leaderBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.sunsetOrange[600],
  },
  pinSelectorContainer: {
    position: "absolute",
    bottom: 80,
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
  },
  pinSelectorContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pinSelectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[100],
  },
  pinSelectorTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
  },
  pinOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pinOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  pinOptionText: {
    flex: 1,
  },
  pinOptionLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[800],
  },
  pinOptionDesc: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  settingsSection: {
    marginBottom: spacing.lg,
  },
  settingsSectionTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[100],
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  settingsRowLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[700],
  },
  settingsInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[100],
  },
  settingsInfoLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  settingsInfoValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[700],
  },
});

const headerStyles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginTop: 2,
  },
  avatarStack: {
    flexDirection: "row",
    marginRight: spacing.md,
  },
  stackedAvatar: {
    position: "relative",
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.glass.white,
  },
  memberAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 2,
    borderColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.glass.white,
  },
  moreMembers: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bark[200],
    borderWidth: 2,
    borderColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
  },
  moreMembersText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[600],
  },
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});

const inputStyles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.md,
    gap: spacing.sm,
  },
  pinButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.moss[500] + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[800],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.bark[200],
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: colors.moss[500],
  },
});

export default ConvoyThread;
