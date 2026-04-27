import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  profileImages,
} from "@/constants/theme";
import { ALL_BADGES } from "./AchievementGallery";

type BadgeDefinition = (typeof ALL_BADGES)[number];

const BADGE_MAP: Record<string, BadgeDefinition> = {};
ALL_BADGES.forEach((b) => {
  BADGE_MAP[b.id] = b;
});

const CARD_BG = "#FFFFFF";
const SECTION_BG = "#F5EFE6";
const ACCENT_TEAL = "#4ECDC4";
const ACCENT_MOSS = "#4ADE80";
const TEXT_PRIMARY = "#2A2A2A";
const TEXT_SECONDARY = "#4A5568";

interface UserPassportData {
  displayName: string;
  bio: string;
  rigName: string;
  imageUrl: string;
  patches: number;
  nightsOutside: number;
  yearsNomad: number;
  badges: { id: string; earned: boolean }[];
}

const defaultPassportData: UserPassportData = {
  displayName: "Trail Wanderer",
  bio: "Chasing sunsets and finding freedom on the open road.",
  rigName: "The Dust Runner",
  imageUrl: profileImages.alex,
  patches: 12,
  nightsOutside: 47,
  yearsNomad: 2,
  badges: [
    { id: "1", earned: true },
    { id: "2", earned: true },
    { id: "3", earned: true },
    { id: "4", earned: false },
    { id: "5", earned: true },
  ],
};

interface MiniPassportProps {
  onViewFullPassport?: () => void;
}

export function MiniPassport({ onViewFullPassport }: MiniPassportProps) {
  const [passportData, setPassportData] =
    useState<UserPassportData>(defaultPassportData);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    displayName: passportData.displayName,
    bio: passportData.bio,
    rigName: passportData.rigName,
  });

  const handleSaveEdit = () => {
    setPassportData((prev) => ({
      ...prev,
      displayName: editForm.displayName,
      bio: editForm.bio,
      rigName: editForm.rigName,
    }));
    setEditModalVisible(false);
  };

  const earnedBadges = passportData.badges.filter((b) => b.earned);

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setEditModalVisible(true)}
        activeOpacity={0.9}
      >
        <View style={styles.innerCard}>
          <View style={styles.profileRow}>
            <Image
              source={{ uri: passportData.imageUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>
                  {passportData.displayName}
                </Text>
                <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                  <Feather name="edit-2" size={13} color={TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>
              <Text style={styles.rigName}>{passportData.rigName}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{passportData.patches}</Text>
              <Text style={styles.statLabel}>Patches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{passportData.nightsOutside}</Text>
              <Text style={styles.statLabel}>Nights out</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{passportData.yearsNomad}</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
          </View>

          {earnedBadges.length > 0 ? (
            <View style={styles.badgesRow}>
              <Text style={styles.badgesLabel}>Earned Patches</Text>
              <View style={styles.badgesList}>
                {earnedBadges.slice(0, 5).map((badge) => {
                  const def = BADGE_MAP[badge.id];
                  if (!def) return null;
                  return (
                    <TouchableOpacity
                      key={badge.id}
                      style={styles.badgeItem}
                      onPress={() => setSelectedBadge(def)}
                      activeOpacity={0.7}
                      testID={`badge-${def.name.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      <Image
                        source={def.image}
                        style={styles.badgeImage}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {Platform.OS === "ios" ? (
            <BlurView intensity={80} tint="dark" style={styles.modalContent}>
              <EditPassportContent
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={handleSaveEdit}
                onClose={() => setEditModalVisible(false)}
              />
            </BlurView>
          ) : (
            <View style={[styles.modalContent, styles.modalFallback]}>
              <EditPassportContent
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={handleSaveEdit}
                onClose={() => setEditModalVisible(false)}
              />
            </View>
          )}
        </View>
      </Modal>

      <Modal
        visible={selectedBadge !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedBadge(null)}
      >
        <TouchableOpacity
          style={badgeModalStyles.overlay}
          activeOpacity={1}
          onPress={() => setSelectedBadge(null)}
        >
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={90}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.75)" },
              ]}
            />
          )}
          <TouchableOpacity activeOpacity={1} style={badgeModalStyles.card}>
            {selectedBadge ? (
              <>
                <View
                  style={[
                    badgeModalStyles.iconRing,
                    { borderColor: selectedBadge.color },
                  ]}
                >
                  <Image
                    source={selectedBadge.image}
                    style={badgeModalStyles.badgeImage}
                    contentFit="contain"
                  />
                </View>
                <Text style={badgeModalStyles.badgeName}>
                  {selectedBadge.name}
                </Text>
                <Text style={badgeModalStyles.badgeDesc}>
                  {selectedBadge.description}
                </Text>
                <TouchableOpacity
                  style={[
                    badgeModalStyles.closeBtn,
                    { backgroundColor: selectedBadge.color },
                  ]}
                  onPress={() => setSelectedBadge(null)}
                >
                  <Text style={badgeModalStyles.closeBtnText}>Got It</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

interface EditPassportContentProps {
  editForm: { displayName: string; bio: string; rigName: string };
  setEditForm: React.Dispatch<
    React.SetStateAction<{ displayName: string; bio: string; rigName: string }>
  >;
  onSave: () => void;
  onClose: () => void;
}

function EditPassportContent({
  editForm,
  setEditForm,
  onSave,
  onClose,
}: EditPassportContentProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Edit Your Passport</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Display Name</Text>
        <TextInput
          style={styles.formInput}
          value={editForm.displayName}
          onChangeText={(text) =>
            setEditForm((prev) => ({ ...prev, displayName: text }))
          }
          placeholder="Your trail name"
          placeholderTextColor="rgba(255,255,255,0.7)"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Rig Name</Text>
        <TextInput
          style={styles.formInput}
          value={editForm.rigName}
          onChangeText={(text) =>
            setEditForm((prev) => ({ ...prev, rigName: text }))
          }
          placeholder="What do you call your rig?"
          placeholderTextColor="rgba(255,255,255,0.7)"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Bio</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          value={editForm.bio}
          onChangeText={(text) =>
            setEditForm((prev) => ({ ...prev, bio: text }))
          }
          placeholder="Tell other travelers about yourself..."
          placeholderTextColor="rgba(255,255,255,0.7)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  innerCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SECTION_BG,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  displayName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.heading,
    color: TEXT_PRIMARY,
  },
  rigName: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: typography.fontFamily.heading,
    color: ACCENT_TEAL,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  badgesRow: {
    marginTop: 10,
  },
  badgesLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodyMedium,
    color: TEXT_SECONDARY,
    marginBottom: 6,
  },
  badgesList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeItem: {},
  badgeImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  moreBadges: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: SECTION_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  moreBadgesText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
    color: TEXT_SECONDARY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    paddingBottom: 40,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalFallback: {
    backgroundColor: CARD_BG,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  formTextArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: ACCENT_TEAL,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
});

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const badgeModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 28,
    width: SCREEN_WIDTH - 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SECTION_BG,
    marginBottom: 16,
  },
  badgeImage: {
    width: 52,
    height: 52,
  },
  badgeName: {
    fontSize: 22,
    fontFamily: typography.fontFamily.heading,
    color: TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: "center",
  },
  badgeDesc: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  closeBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 36,
  },
  closeBtnText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
});
