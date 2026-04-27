import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";

import sceneDesert from "../../../assets/images/scenes/scene-desert-sunset.png";
import sceneMountain from "../../../assets/images/scenes/scene-mountain-lake.png";
import sceneCoastal from "../../../assets/images/scenes/scene-coastal-road.png";
import sceneRedwood from "../../../assets/images/scenes/scene-redwood-forest.png";

const sceneImages = [sceneDesert, sceneMountain, sceneCoastal, sceneRedwood];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_BG = "#FFFFFF";
const SECTION_BG = "#F5EFE6";
const ACCENT_EMBER = "#E8634A";
const ACCENT_TEAL = "#4ECDC4";
const TEXT_PRIMARY = "#2A2A2A";
const TEXT_SECONDARY = "#4A5568";

interface DatingProfile {
  id: string;
  name: string;
  age: number;
  imageUrl: string;
  currentLocation: string;
  nextDestination: string;
  arrivalDate: string;
  routeOverlap: number;
  travelTimeline: string;
  rigType: string;
  rigName?: string;
  interests: string[];
  bio?: string;
  verified?: boolean;
  online?: boolean;
}

interface DatingProfileCardProps {
  profile: DatingProfile;
  onLike?: () => void;
  onPass?: () => void;
  onSuperLike?: () => void;
  onViewProfile?: () => void;
  compact?: boolean;
}

export const DatingProfileCard: React.FC<DatingProfileCardProps> = ({
  profile,
  onLike,
  onPass,
  onSuperLike,
  onViewProfile,
  compact = false,
}) => {
  const overlapGlow = useRef(new Animated.Value(0.4)).current;
  const sceneIndex = parseInt(profile.id, 10) % sceneImages.length;

  useEffect(() => {
    if (profile.routeOverlap >= 70) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(overlapGlow, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(overlapGlow, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    }
  }, [profile.routeOverlap, overlapGlow]);

  const getOverlapColor = () => {
    if (profile.routeOverlap >= 70) return ACCENT_EMBER;
    if (profile.routeOverlap >= 40) return ACCENT_TEAL;
    return "#8888AA";
  };

  const getOverlapLabel = () => {
    if (profile.routeOverlap >= 70) return "High Match";
    if (profile.routeOverlap >= 40) return "Good Overlap";
    return "Different Routes";
  };

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
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.85)"]}
            style={compactStyles.overlay}
          />
          <View
            style={[
              compactStyles.overlapBadge,
              { backgroundColor: getOverlapColor() },
            ]}
          >
            <Text style={compactStyles.overlapText}>
              {profile.routeOverlap}%
            </Text>
          </View>
          {profile.online ? (
            <View style={compactStyles.onlineIndicator} />
          ) : null}
        </View>
        <View style={compactStyles.info}>
          <Text style={compactStyles.name}>
            {profile.name}, {profile.age}
          </Text>
          <View style={compactStyles.locationRow}>
            <Feather name="map-pin" size={11} color={TEXT_SECONDARY} />
            <Text style={compactStyles.location} numberOfLines={1}>
              {profile.currentLocation}
            </Text>
          </View>
          <View style={compactStyles.locationRow}>
            <Feather name="arrow-right" size={11} color={ACCENT_EMBER} />
            <Text style={compactStyles.nextStop} numberOfLines={1}>
              {profile.nextDestination}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
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
        <Animated.View
          style={[
            styles.routeOverlapBadge,
            {
              backgroundColor: getOverlapColor(),
              shadowColor: getOverlapColor(),
              shadowOpacity: overlapGlow,
            },
          ]}
        >
          <Feather name="git-merge" size={13} color="#FFF" />
          <Text style={styles.routeOverlapText}>{profile.routeOverlap}%</Text>
          <Text style={styles.routeOverlapLabel}>{getOverlapLabel()}</Text>
        </Animated.View>
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: profile.imageUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
          {profile.online ? <View style={styles.onlineDot} /> : null}
          {profile.verified ? (
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={10} color="#FFF" />
            </View>
          ) : null}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {profile.name}, {profile.age}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color={TEXT_SECONDARY} />
            <Text style={styles.location}>{profile.currentLocation}</Text>
          </View>
        </View>
      </View>

      <View style={styles.routeCard}>
        <View style={styles.routeRow}>
          <View style={styles.routeIconWrap}>
            <Feather name="navigation" size={14} color={ACCENT_EMBER} />
          </View>
          <View style={styles.routeTextCol}>
            <Text style={styles.routeLabel}>NEXT STOP</Text>
            <Text style={styles.routeValue}>{profile.nextDestination}</Text>
          </View>
        </View>
        <View style={styles.routeRow}>
          <View style={styles.routeIconWrap}>
            <Feather name="calendar" size={14} color={ACCENT_EMBER} />
          </View>
          <View style={styles.routeTextCol}>
            <Text style={styles.routeLabel}>ARRIVING</Text>
            <Text style={styles.routeValue}>{profile.arrivalDate}</Text>
          </View>
        </View>
        <View style={styles.routeRow}>
          <View style={styles.routeIconWrap}>
            <Feather name="clock" size={14} color={ACCENT_EMBER} />
          </View>
          <View style={styles.routeTextCol}>
            <Text style={styles.routeLabel}>TIMELINE</Text>
            <Text style={styles.routeValue}>{profile.travelTimeline}</Text>
          </View>
        </View>
      </View>

      <View style={styles.rigRow}>
        <Feather name="truck" size={14} color={ACCENT_TEAL} />
        <Text style={styles.rigText}>{profile.rigType}</Text>
        {profile.rigName ? (
          <Text style={styles.rigName}>"{profile.rigName}"</Text>
        ) : null}
      </View>

      <View style={styles.interestsContainer}>
        {profile.interests.slice(0, 4).map((interest, i) => (
          <View key={i} style={styles.interestChip}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.passBtn]}
          onPress={onPass}
          activeOpacity={0.8}
        >
          <Feather name="x" size={28} color="#FF6B6B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.superBtn]}
          onPress={onSuperLike}
          activeOpacity={0.8}
        >
          <Feather name="star" size={22} color={ACCENT_EMBER} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={onLike}
          activeOpacity={0.8}
        >
          <Feather name="heart" size={28} color={ACCENT_EMBER} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    maxHeight: SCREEN_HEIGHT * 0.78,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: CARD_BG,
  },
  sceneHeader: {
    height: 140,
    position: "relative",
  },
  sceneImage: {
    width: "100%",
    height: "100%",
  },
  sceneGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  routeOverlapBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  routeOverlapText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyBold,
    color: "#FFF",
  },
  routeOverlapLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255,255,255,0.85)",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 0,
    marginTop: -30,
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: CARD_BG,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4ADE80",
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  verifiedBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT_TEAL,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
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
  routeCard: {
    marginHorizontal: 16,
    backgroundColor: SECTION_BG,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(232,99,74,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  routeTextCol: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: TEXT_SECONDARY,
    letterSpacing: 1,
  },
  routeValue: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: TEXT_PRIMARY,
    marginTop: 1,
  },
  rigRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rigText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
    color: TEXT_SECONDARY,
  },
  rigName: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
    color: ACCENT_TEAL,
    fontStyle: "italic",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  interestChip: {
    backgroundColor: "rgba(78,205,196,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(78,205,196,0.25)",
  },
  interestText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
    color: ACCENT_TEAL,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  passBtn: {
    backgroundColor: "rgba(255,107,107,0.08)",
    borderColor: "rgba(255,107,107,0.3)",
  },
  superBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(232,99,74,0.08)",
    borderColor: "rgba(232,99,74,0.3)",
  },
  likeBtn: {
    backgroundColor: "rgba(232,99,74,0.1)",
    borderColor: "rgba(232,99,74,0.4)",
  },
});

const compactStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: CARD_BG,
  },
  imageContainer: {
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlapBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overlapText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFF",
  },
  onlineIndicator: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ADE80",
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 17,
    fontFamily: typography.fontFamily.heading,
    color: TEXT_PRIMARY,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  location: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
  },
  nextStop: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
    color: ACCENT_EMBER,
  },
});

export default DatingProfileCard;
