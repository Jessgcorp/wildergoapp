import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing } from "@/constants/theme";

import badgeBear from "../../../assets/images/badges/badge-bear.png";
import badgeEagle from "../../../assets/images/badges/badge-eagle.png";
import badgeWolf from "../../../assets/images/badges/badge-wolf.png";
import badgeCampfire from "../../../assets/images/badges/badge-campfire.png";
import badgeDeer from "../../../assets/images/badges/badge-deer.png";
import badgeCompass from "../../../assets/images/badges/badge-compass.png";
import badgeOwl from "../../../assets/images/badges/badge-owl.png";
import badgeStorm from "../../../assets/images/badges/badge-storm.png";
import badgeCity from "../../../assets/images/badges/badge-city.png";
import badgeApex from "../../../assets/images/badges/badge-apex.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 20;
const GRID_GAP = 12;
const COLUMN_COUNT = 3;
const ITEM_SIZE =
  (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (COLUMN_COUNT - 1)) /
  COLUMN_COUNT;

const CARD_BG = "#FFFFFF";
const SECTION_BG = "#F5EFE6";
const TEXT_PRIMARY = "#2A2A2A";
const TEXT_SECONDARY = "#4A5568";

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  image: any;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const ALL_BADGES: BadgeDefinition[] = [
  {
    id: "1",
    name: "The Spark",
    description:
      "Every journey starts with a single decision. You've officially logged your first mile as a WilderGo nomad.",
    image: badgeBear,
    icon: "flash",
    color: "#F59E0B",
  },
  {
    id: "2",
    name: "Sentinel",
    description:
      "You acted as the eyes of the road. By reporting a hazard, you ensured the nomads behind you travel safely.",
    image: badgeEagle,
    icon: "shield-checkmark",
    color: "#E8634A",
  },
  {
    id: "3",
    name: "Pathfinder",
    description:
      "Master of the route. You navigated through a high-risk zone using our real-time weather-risk engine.",
    image: badgeCompass,
    icon: "compass",
    color: "#4ECDC4",
  },
  {
    id: "4",
    name: "Night Owl",
    description:
      "The road looks different after dark. This marks your commitment to safety during low-visibility night travels.",
    image: badgeOwl,
    icon: "moon",
    color: "#6366F1",
  },
  {
    id: "5",
    name: "Road Sage",
    description:
      "Precision is your signature. You've maintained a perfect safety score over 50 miles of terrain.",
    image: badgeDeer,
    icon: "speedometer",
    color: "#2563EB",
  },
  {
    id: "6",
    name: "Weather Weaver",
    description:
      "You don't just watch the forecast; you conquer it. Earned for completing a trip during an active advisory.",
    image: badgeStorm,
    icon: "thunderstorm",
    color: "#0891B2",
  },
  {
    id: "7",
    name: "The Guardian",
    description:
      "Consistency saves lives. You've verified 5 community-reported hazards, keeping the map accurate.",
    image: badgeWolf,
    icon: "eye",
    color: "#7C3AED",
  },
  {
    id: "8",
    name: "Trailblazer",
    description:
      "An architect of the road. As a Beta founder, you helped us define what it means to be a WilderGo nomad.",
    image: badgeCampfire,
    icon: "flame",
    color: "#EA580C",
  },
  {
    id: "9",
    name: "Urban Legend",
    description:
      "Navigating the chaos. This marks your mastery of high-traffic city routes while maintaining a safe rating.",
    image: badgeCity,
    icon: "business",
    color: "#D97706",
  },
  {
    id: "10",
    name: "Apex Pioneer",
    description:
      "Witness to the Genesis. Awarded to the original nomads present for the WilderGo 2026 results launch.",
    image: badgeApex,
    icon: "diamond",
    color: "#9333EA",
  },
];

interface AchievementGalleryProps {
  earnedBadgeIds?: string[];
  genesisAvailable?: boolean;
}

export function AchievementGallery({
  earnedBadgeIds = ["1", "2", "3", "5", "8"],
  genesisAvailable = true,
}: AchievementGalleryProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(
    null,
  );
  const [selectedEarned, setSelectedEarned] = useState(false);

  const visibleBadges = ALL_BADGES.filter((badge) => {
    if (
      badge.id === "10" &&
      !genesisAvailable &&
      !earnedBadgeIds.includes("10")
    ) {
      return false;
    }
    return true;
  });

  const earnedCount = visibleBadges.filter((b) =>
    earnedBadgeIds.includes(b.id),
  ).length;

  const handleBadgePress = (badge: BadgeDefinition, earned: boolean) => {
    Haptics.selectionAsync();
    setSelectedBadge(badge);
    setSelectedEarned(earned);
  };

  const handleCloseModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBadge(null);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Achievement Gallery</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {earnedCount}/{visibleBadges.length}
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {visibleBadges.map((badge) => {
            const earned = earnedBadgeIds.includes(badge.id);
            return (
              <TouchableOpacity
                key={badge.id}
                style={styles.gridItem}
                onPress={() => handleBadgePress(badge, earned)}
                activeOpacity={0.7}
                testID={`badge-${badge.id}`}
              >
                <View
                  style={[
                    styles.badgeCircle,
                    { borderColor: earned ? badge.color : "#D1D5DB" },
                    !earned && styles.badgeLocked,
                  ]}
                >
                  <Image
                    source={badge.image}
                    style={[
                      styles.badgeImage,
                      !earned && styles.badgeImageLocked,
                    ]}
                    contentFit="contain"
                  />
                  {!earned ? (
                    <View style={styles.lockOverlay}>
                      <Ionicons
                        name="lock-closed"
                        size={18}
                        color="rgba(255,255,255,0.9)"
                      />
                    </View>
                  ) : null}
                </View>
                <Text
                  style={[styles.badgeName, !earned && styles.badgeNameLocked]}
                  numberOfLines={1}
                >
                  {badge.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Modal
        visible={selectedBadge !== null}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={95}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.8)" },
              ]}
            />
          )}
          <TouchableOpacity activeOpacity={1} style={modalStyles.card}>
            {selectedBadge ? (
              <ScrollView
                style={modalStyles.cardScroll}
                contentContainerStyle={modalStyles.cardScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View
                  style={[
                    modalStyles.imageRing,
                    {
                      borderColor: selectedEarned
                        ? selectedBadge.color
                        : "#9CA3AF",
                    },
                  ]}
                >
                  <Image
                    source={selectedBadge.image}
                    style={[
                      modalStyles.badgeImage,
                      !selectedEarned && modalStyles.badgeImageLocked,
                    ]}
                    contentFit="contain"
                  />
                </View>

                {selectedEarned ? (
                  <View
                    style={[
                      modalStyles.earnedTag,
                      { backgroundColor: selectedBadge.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={selectedBadge.color}
                    />
                    <Text
                      style={[
                        modalStyles.earnedTagText,
                        { color: selectedBadge.color },
                      ]}
                    >
                      Earned
                    </Text>
                  </View>
                ) : (
                  <View style={modalStyles.lockedTag}>
                    <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
                    <Text style={modalStyles.lockedTagText}>Locked</Text>
                  </View>
                )}

                <Text
                  style={[
                    modalStyles.badgeName,
                    {
                      color: selectedEarned
                        ? selectedBadge.color
                        : TEXT_PRIMARY,
                    },
                  ]}
                >
                  {selectedBadge.name}
                </Text>

                <Text style={modalStyles.badgeDesc}>
                  {selectedBadge.description}
                </Text>

                <TouchableOpacity
                  style={[
                    modalStyles.closeBtn,
                    {
                      backgroundColor: selectedEarned
                        ? selectedBadge.color
                        : "#6B7280",
                    },
                  ]}
                  onPress={handleCloseModal}
                >
                  <Text style={modalStyles.closeBtnText}>
                    {selectedEarned ? "Got It" : "Keep Exploring"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fontFamily.heading,
    color: TEXT_PRIMARY,
  },
  countBadge: {
    backgroundColor: SECTION_BG,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: TEXT_SECONDARY,
  },
  gridContainer: {
    paddingBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  gridItem: {
    width: ITEM_SIZE,
    alignItems: "center",
    marginBottom: 4,
  },
  badgeCircle: {
    width: ITEM_SIZE - 16,
    height: ITEM_SIZE - 16,
    borderRadius: (ITEM_SIZE - 16) / 2,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SECTION_BG,
    overflow: "hidden",
  },
  badgeLocked: {
    backgroundColor: "#F3F4F6",
  },
  badgeImage: {
    width: ITEM_SIZE - 36,
    height: ITEM_SIZE - 36,
  },
  badgeImageLocked: {
    opacity: 0.25,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(107,114,128,0.35)",
    borderRadius: (ITEM_SIZE - 16) / 2,
  },
  badgeName: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: TEXT_PRIMARY,
    marginTop: 6,
    textAlign: "center",
  },
  badgeNameLocked: {
    color: "#9CA3AF",
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 28,
    padding: 32,
    width: SCREEN_WIDTH - 64,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 12,
  },
  cardScroll: {
    flexGrow: 0,
  },
  cardScrollContent: {
    alignItems: "center",
  },
  imageRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SECTION_BG,
    marginBottom: 12,
    overflow: "hidden",
  },
  badgeImage: {
    width: 64,
    height: 64,
  },
  badgeImageLocked: {
    opacity: 0.3,
  },
  earnedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  earnedTagText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  lockedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginBottom: 10,
  },
  lockedTagText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#9CA3AF",
  },
  badgeName: {
    fontSize: 24,
    fontFamily: typography.fontFamily.heading,
    marginBottom: 10,
    textAlign: "center",
  },
  badgeDesc: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  closeBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  closeBtnText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
});

export default AchievementGallery;
