import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { typography, spacing, borderRadius } from "@/constants/theme";

import sceneRedwood from "../../../assets/images/scenes/scene-redwood-forest.png";
import sceneMountain from "../../../assets/images/scenes/scene-mountain-lake.png";
import sceneWaterfall from "../../../assets/images/scenes/scene-waterfall.png";
import sceneTwilight from "../../../assets/images/scenes/scene-twilight-mountains.png";
import sceneCoastal from "../../../assets/images/scenes/scene-coastal-road.png";

const sceneImages = [
  sceneRedwood,
  sceneMountain,
  sceneWaterfall,
  sceneTwilight,
  sceneCoastal,
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_BG = "#FFFFFF";
const SECTION_BG = "#F5EFE6";
const ACCENT_MOSS = "#4ADE80";
const ACCENT_TEAL = "#4ECDC4";
const TEXT_PRIMARY = "#2A2A2A";
const TEXT_SECONDARY = "#4A5568";

interface ActivityWithLevel {
  name: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
}

interface FriendsProfile {
  id: string;
  name: string;
  age?: number;
  imageUrl: string;
  currentLocation: string;
  rigType: string;
  activities: ActivityWithLevel[];
  availableFor: string[];
  bio?: string;
  online?: boolean;
  verified?: boolean;
  travelStyle?: string;
  pets?: string;
}

const skillColors: Record<string, string> = {
  beginner: "#4ADE80",
  intermediate: "#F59E0B",
  advanced: "#E8634A",
};

const activityIcons: Record<string, string> = {
  Hiking: "trending-up",
  Climbing: "triangle",
  Coffee: "coffee",
  Convoy: "truck",
  Stargazing: "star",
  Camping: "sun",
  "Co-working": "monitor",
  Photography: "camera",
  Surfing: "wind",
  Music: "music",
  "Photo Convoys": "camera",
  "Camp Meetups": "sun",
  "Ski Convoys": "triangle",
  "Winter Camping": "cloud-snow",
  "Sled Adventures": "zap",
  "Fishing Trips": "anchor",
  Boondocking: "compass",
  "Campfire Hangs": "sun",
  "Dark Sky Camping": "moon",
  "Van Meetups": "truck",
  "Sunrise Yoga": "sunrise",
  "Group Rides": "activity",
  "Trail Camping": "map",
  "Rig Tours": "eye",
};

interface FriendsProfileCardProps {
  profile: FriendsProfile;
  onConnect?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
  compact?: boolean;
}

export const FriendsProfileCard: React.FC<FriendsProfileCardProps> = ({
  profile,
  onConnect,
  onMessage,
  onViewProfile,
  compact = false,
}) => {
  const sceneIndex = parseInt(profile.id, 10) % sceneImages.length;

  if (compact) {
    return (
      <TouchableOpacity
        style={compactStyles.container}
        onPress={onViewProfile}
        activeOpacity={0.9}
      >
        <View style={compactStyles.imageContainer}>
          <Image
            source={{ uri: profile.imageUrl }}
            style={compactStyles.image}
            contentFit="cover"
          />
          {profile.online ? (
            <View style={compactStyles.onlineIndicator} />
          ) : null}
        </View>
        <View style={compactStyles.info}>
          <Text style={compactStyles.name}>{profile.name}</Text>
          <Text style={compactStyles.location} numberOfLines={1}>
            {profile.currentLocation}
          </Text>
          <View style={compactStyles.tagContainer}>
            {profile.availableFor.slice(0, 2).map((activity, i) => (
              <View key={i} style={compactStyles.tag}>
                <Text style={compactStyles.tagText}>{activity}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.sceneHeader}>
        <Image
          source={sceneImages[sceneIndex]}
          style={styles.sceneImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", CARD_BG]}
          style={styles.sceneGradient}
        />
        {profile.online ? <View style={styles.onlineIndicator} /> : null}
        {profile.verified ? (
          <View style={styles.verifiedBadge}>
            <Feather name="check" size={10} color="#FFF" />
          </View>
        ) : null}
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: profile.imageUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {profile.name}
            {profile.age ? `, ${profile.age}` : ""}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color={TEXT_SECONDARY} />
            <Text style={styles.location}>{profile.currentLocation}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.rigRow}>
          <Feather name="truck" size={14} color={ACCENT_TEAL} />
          <Text style={styles.rigType}>{profile.rigType}</Text>
          {profile.pets ? (
            <View style={styles.petsBadge}>
              <Text style={styles.petsText}>{profile.pets}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AVAILABLE FOR</Text>
          <View style={styles.availabilityGrid}>
            {profile.availableFor.map((activity, i) => (
              <View key={i} style={styles.availabilityChip}>
                <Feather
                  name={(activityIcons[activity] || "circle") as any}
                  size={12}
                  color={ACCENT_MOSS}
                />
                <Text style={styles.availabilityText}>{activity}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVITIES</Text>
          <View style={styles.activitiesContainer}>
            {profile.activities.map((activity, i) => (
              <View key={i} style={styles.activityChip}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <View
                  style={[
                    styles.skillBadge,
                    { backgroundColor: skillColors[activity.skillLevel] },
                  ]}
                >
                  <Text style={styles.skillText}>{activity.skillLevel}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {profile.bio ? (
          <Text style={styles.bio} numberOfLines={2}>
            {profile.bio}
          </Text>
        ) : null}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={onMessage}
            activeOpacity={0.8}
          >
            <Feather name="message-circle" size={16} color={ACCENT_TEAL} />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={onConnect}
            activeOpacity={0.8}
          >
            <Feather name="users" size={16} color="#FFF" />
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: CARD_BG,
  },
  sceneHeader: {
    height: 120,
    position: "relative",
  },
  sceneImage: {
    width: "100%",
    height: "100%",
  },
  sceneGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  onlineIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ACCENT_MOSS,
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT_TEAL,
    justifyContent: "center",
    alignItems: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: -24,
    gap: 12,
    marginBottom: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: CARD_BG,
  },
  profileInfo: {
    flex: 1,
    paddingTop: 24,
  },
  name: {
    fontSize: 20,
    fontFamily: typography.fontFamily.heading,
    color: TEXT_PRIMARY,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rigRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  rigType: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  petsBadge: {
    backgroundColor: "rgba(74,222,128,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  petsText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
    color: ACCENT_MOSS,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: TEXT_SECONDARY,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  availabilityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  availabilityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(74,222,128,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.2)",
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
    color: ACCENT_MOSS,
  },
  activitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  activityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: SECTION_BG,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activityName: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
    color: TEXT_PRIMARY,
  },
  skillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  skillText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFF",
    textTransform: "uppercase",
  },
  bio: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
    lineHeight: 19,
    marginBottom: 14,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(78,205,196,0.3)",
    backgroundColor: "rgba(78,205,196,0.08)",
  },
  messageButtonText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: ACCENT_TEAL,
  },
  connectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ACCENT_MOSS,
  },
  connectButtonText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
});

const compactStyles = StyleSheet.create({
  container: {
    width: 140,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: "hidden",
  },
  imageContainer: {
    height: 130,
    position: "relative",
    backgroundColor: SECTION_BG,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  onlineIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT_MOSS,
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: TEXT_PRIMARY,
  },
  location: {
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  tag: {
    backgroundColor: "rgba(74,222,128,0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.body,
    color: ACCENT_MOSS,
  },
});

export default FriendsProfileCard;
