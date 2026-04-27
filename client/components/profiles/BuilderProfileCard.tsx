import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { typography, spacing, borderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_BG = "#FFFFFF";
const SECTION_BG = "#F5EFE6";
const ACCENT_AMBER = "#F59E0B";
const ACCENT_TEAL = "#4ECDC4";
const ACCENT_MOSS = "#4ADE80";
const TEXT_PRIMARY = "#2A2A2A";
const TEXT_SECONDARY = "#4A5568";

interface BuilderProfile {
  id: string;
  name?: string;
  businessName: string;
  ownerName?: string;
  imageUrl: string;
  coverImageUrl?: string;
  location: string;
  expertise: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  yearsExperience?: number;
  buildsCompleted?: number;
  consultationRate: number;
  availability?: string;
  portfolioImages?: string[];
  specialties: {
    name: string;
    icon: string;
  }[];
  bio?: string;
  certifications?: string[];
  responseTime?: string;
}

interface BuilderProfileCardProps {
  profile: BuilderProfile;
  onBookCall?: () => void;
  onBookConsult?: () => void;
  onViewPortfolio?: () => void;
  onMessage?: () => void;
  featured?: boolean;
}

const specialtyIconMap: Record<string, string> = {
  Solar: "sun",
  Electrical: "zap",
  Plumbing: "droplet",
  HVAC: "thermometer",
  "Diesel Heaters": "wind",
  Insulation: "layers",
  Flooring: "grid",
  Cabinetry: "box",
  Windows: "square",
  "Roof Raises": "arrow-up",
  "Custom Builds": "tool",
  Conversions: "refresh-cw",
  "Full Build": "tool",
  Woodwork: "box",
  Design: "pen-tool",
  Lithium: "battery-charging",
  "Off-Grid": "zap",
};

export const BuilderProfileCard: React.FC<BuilderProfileCardProps> = ({
  profile,
  onBookConsult,
  onViewPortfolio,
  onMessage,
  featured = false,
}) => {
  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Feather
          key={star}
          name={star <= rating ? "star" : "star"}
          size={13}
          color={star <= rating ? ACCENT_AMBER : "rgba(0,0,0,0.15)"}
        />
      ))}
    </View>
  );

  return (
    <View
      style={[styles.container, featured ? styles.featuredContainer : null]}
    >
      {featured ? (
        <View style={styles.featuredBadge}>
          <Feather name="award" size={11} color="#FFF" />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      ) : null}

      {profile.coverImageUrl ? (
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: profile.coverImageUrl }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <View style={styles.coverOverlay} />
        </View>
      ) : null}

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: profile.imageUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
          {profile.verified ? (
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={10} color="#FFF" />
            </View>
          ) : null}
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.businessName}>{profile.businessName}</Text>
            {profile.verified ? (
              <View style={styles.verifiedTag}>
                <Feather name="shield" size={10} color={ACCENT_MOSS} />
                <Text style={styles.verifiedTagText}>Verified</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.ownerName}>
            by {profile.ownerName || profile.name}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={11} color={TEXT_SECONDARY} />
            <Text style={styles.location}>{profile.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.ratingContainer}>
            {renderStars(profile.rating)}
            <Text style={styles.ratingText}>{profile.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.statLabel}>{profile.reviewCount} reviews</Text>
        </View>
        <View style={styles.statDivider} />
        {profile.yearsExperience ? (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.yearsExperience}+</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
            <View style={styles.statDivider} />
          </>
        ) : null}
        {profile.buildsCompleted ? (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.buildsCompleted}</Text>
            <Text style={styles.statLabel}>Builds</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EXPERTISE</Text>
        <View style={styles.expertiseGrid}>
          {profile.specialties.map((specialty, i) => (
            <View key={i} style={styles.expertiseChip}>
              <Feather
                name={(specialtyIconMap[specialty.name] || "tool") as any}
                size={12}
                color={ACCENT_AMBER}
              />
              <Text style={styles.expertiseText}>{specialty.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {profile.certifications && profile.certifications.length > 0 ? (
        <View style={styles.certificationsRow}>
          <Feather name="award" size={13} color={ACCENT_MOSS} />
          <Text style={styles.certificationsText}>
            {profile.certifications.slice(0, 2).join(" / ")}
          </Text>
        </View>
      ) : null}

      {profile.bio ? (
        <Text style={styles.bio} numberOfLines={2}>
          {profile.bio}
        </Text>
      ) : null}

      <View style={styles.availabilitySection}>
        <View style={styles.availabilityRow}>
          {profile.availability ? (
            <View style={styles.availabilityItem}>
              <Feather name="calendar" size={13} color={TEXT_SECONDARY} />
              <Text style={styles.availabilityText}>
                {profile.availability}
              </Text>
            </View>
          ) : null}
          {profile.responseTime ? (
            <View style={styles.availabilityItem}>
              <Feather name="clock" size={13} color={TEXT_SECONDARY} />
              <Text style={styles.availabilityText}>
                {profile.responseTime}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.communityBadge}>
          <Feather name="users" size={12} color={ACCENT_MOSS} />
          <Text style={styles.communityText}>Community Helper</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.portfolioButton}
          onPress={onViewPortfolio}
          activeOpacity={0.8}
        >
          <Feather name="image" size={16} color={ACCENT_AMBER} />
          <Text style={styles.portfolioButtonText}>Portfolio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={onMessage}
          activeOpacity={0.8}
        >
          <Feather name="message-circle" size={16} color={ACCENT_TEAL} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={onBookConsult}
          activeOpacity={0.8}
        >
          <Feather name="message-square" size={16} color="#FFF" />
          <Text style={styles.bookButtonText}>Ask for Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const BuilderCompactCard: React.FC<{
  profile: BuilderProfile;
  onPress?: () => void;
  onBook?: () => void;
}> = ({ profile, onPress, onBook }) => (
  <TouchableOpacity
    style={compactStyles.container}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <Image
      source={{ uri: profile.imageUrl }}
      style={compactStyles.image}
      contentFit="cover"
    />
    {profile.verified ? (
      <View style={compactStyles.verifiedBadge}>
        <Feather name="check" size={8} color={ACCENT_MOSS} />
      </View>
    ) : null}
    <View style={compactStyles.info}>
      <Text style={compactStyles.name} numberOfLines={1}>
        {profile.businessName}
      </Text>
      <View style={compactStyles.ratingRow}>
        <Feather name="star" size={10} color={ACCENT_AMBER} />
        <Text style={compactStyles.rating}>{profile.rating.toFixed(1)}</Text>
        <Text style={compactStyles.reviews}>({profile.reviewCount})</Text>
      </View>
      <TouchableOpacity
        style={compactStyles.bookButton}
        onPress={() => {
          if (onBook) onBook();
          else if (onPress) onPress();
        }}
      >
        <Text style={compactStyles.bookButtonText}>Ask for Help</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: CARD_BG,
  },
  featuredContainer: {
    borderWidth: 1.5,
    borderColor: "rgba(245,158,11,0.4)",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: ACCENT_AMBER,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  featuredText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFF",
  },
  coverContainer: {
    height: 90,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  profileSection: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 12,
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: SECTION_BG,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT_MOSS,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  businessName: {
    fontSize: 18,
    fontFamily: typography.fontFamily.heading,
    color: TEXT_PRIMARY,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(74,222,128,0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedTagText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: ACCENT_MOSS,
  },
  ownerName: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  location: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  statItem: {
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 1,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyBold,
    color: TEXT_PRIMARY,
  },
  statValue: {
    fontSize: 20,
    fontFamily: typography.fontFamily.heading,
    color: TEXT_PRIMARY,
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
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: TEXT_SECONDARY,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  expertiseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  expertiseChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245,158,11,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.2)",
  },
  expertiseText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
    color: ACCENT_AMBER,
  },
  certificationsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  certificationsText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    color: ACCENT_MOSS,
  },
  bio: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
    lineHeight: 19,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  availabilitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  availabilityRow: {
    gap: 6,
  },
  availabilityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
  },
  communityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(74,222,128,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.2)",
  },
  communityText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: ACCENT_MOSS,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  portfolioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(245,158,11,0.3)",
    backgroundColor: "rgba(245,158,11,0.08)",
  },
  portfolioButtonText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: ACCENT_AMBER,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(78,205,196,0.3)",
    backgroundColor: "rgba(78,205,196,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: ACCENT_AMBER,
  },
  bookButtonText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFF",
  },
});

const compactStyles = StyleSheet.create({
  container: {
    width: 150,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 100,
  },
  verifiedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: CARD_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: TEXT_PRIMARY,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 3,
  },
  rating: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: TEXT_PRIMARY,
  },
  reviews: {
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
    color: TEXT_SECONDARY,
  },
  bookButton: {
    marginTop: 8,
    backgroundColor: ACCENT_AMBER,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFF",
  },
});

export default BuilderProfileCard;
