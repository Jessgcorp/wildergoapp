import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
  profileImages,
  eventImages,
} from "@/constants/theme";
import { Button } from "./Button";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type SheetContentType = "profile" | "event" | "builder";

interface ProfileData {
  id: string;
  name: string;
  age?: number;
  location: string;
  destination?: string;
  vehicle: string;
  interests: string[];
  routeOverlap?: number;
  imageUrl?: string;
  online?: boolean;
}

interface EventData {
  id: string;
  title: string;
  type: "social" | "activity" | "convoy";
  host: string;
  attendees: number;
  maxAttendees?: number;
  time: string;
  location: string;
  description?: string;
  imageUrl?: string;
}

interface BuilderData {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  verified: boolean;
  imageUrl?: string;
  availability?: string;
}

interface LiquidSheetProps {
  visible: boolean;
  onClose: () => void;
  contentType: SheetContentType;
  data: ProfileData | EventData | BuilderData;
  onAction?: (
    action: string,
    data: ProfileData | EventData | BuilderData,
  ) => void;
}

export const LiquidSheet: React.FC<LiquidSheetProps> = ({
  visible,
  onClose,
  contentType,
  data,
  onAction,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const renderProfileContent = () => {
    const profile = data as ProfileData;
    const imageSource = profile.imageUrl || profileImages.alex;

    return (
      <View style={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: imageSource }}
              style={styles.profileImage}
              contentFit="cover"
            />
            {profile.online && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{profile.name}</Text>
              {profile.age && (
                <Text style={styles.profileAge}>, {profile.age}</Text>
              )}
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark"
                  size={10}
                  color={colors.text.inverse}
                />
              </View>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.moss[500]} />
              <Text style={styles.locationText}>{profile.location}</Text>
              {profile.destination && (
                <>
                  <Ionicons
                    name="arrow-forward"
                    size={12}
                    color={colors.bark[400]}
                  />
                  <Text style={styles.destinationText}>
                    {profile.destination}
                  </Text>
                </>
              )}
            </View>
            <Text style={styles.vehicleText}>{profile.vehicle}</Text>
          </View>
        </View>

        {/* Route Overlap Badge */}
        {profile.routeOverlap && profile.routeOverlap > 0 && (
          <View style={styles.routeOverlapContainer}>
            <View style={styles.routeOverlapGlow} />
            <View style={styles.routeOverlapBadge}>
              <Ionicons
                name="git-merge"
                size={16}
                color={colors.text.inverse}
              />
              <Text style={styles.routeOverlapText}>
                {profile.routeOverlap}% Route Overlap
              </Text>
            </View>
          </View>
        )}

        {/* Interests */}
        <View style={styles.interestsContainer}>
          {profile.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title="Message"
            onPress={() => onAction?.("message", profile)}
            variant="primary"
            size="lg"
            fullWidth
            icon={
              <Ionicons
                name="chatbubble"
                size={18}
                color={colors.text.inverse}
              />
            }
          />
        </View>
      </View>
    );
  };

  const renderEventContent = () => {
    const event = data as EventData;
    const imageSource = event.imageUrl || eventImages.bonfire;

    return (
      <View style={styles.contentContainer}>
        {/* Event Image */}
        <View style={styles.eventImageContainer}>
          <Image
            source={{ uri: imageSource }}
            style={styles.eventImage}
            contentFit="cover"
          />
          <View style={styles.eventImageOverlay} />
          <View style={styles.eventTypeBadge}>
            <Ionicons
              name={
                event.type === "social"
                  ? "flame"
                  : event.type === "activity"
                    ? "walk"
                    : "car"
              }
              size={14}
              color={colors.text.inverse}
            />
            <Text style={styles.eventTypeText}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.eventMetaRow}>
            <Ionicons name="person" size={14} color={colors.bark[500]} />
            <Text style={styles.eventMetaText}>Hosted by {event.host}</Text>
          </View>

          <View style={styles.eventMetaRow}>
            <Ionicons name="time" size={14} color={colors.bark[500]} />
            <Text style={styles.eventMetaText}>{event.time}</Text>
          </View>

          <View style={styles.eventMetaRow}>
            <Ionicons name="location" size={14} color={colors.bark[500]} />
            <Text style={styles.eventMetaText}>{event.location}</Text>
          </View>

          <View style={styles.eventMetaRow}>
            <Ionicons name="people" size={14} color={colors.moss[500]} />
            <Text style={[styles.eventMetaText, { color: colors.moss[600] }]}>
              {event.attendees}
              {event.maxAttendees ? `/${event.maxAttendees}` : ""} attending
            </Text>
          </View>

          {event.description && (
            <Text style={styles.eventDescription}>{event.description}</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title="Ask to Join"
            onPress={() => onAction?.("join", event)}
            variant="ember"
            size="lg"
            fullWidth
            icon={
              <Ionicons
                name="hand-right"
                size={18}
                color={colors.text.inverse}
              />
            }
          />
        </View>
      </View>
    );
  };

  const renderBuilderContent = () => {
    const builder = data as BuilderData;
    const imageSource = builder.imageUrl || profileImages.sarah;

    return (
      <View style={styles.contentContainer}>
        {/* Builder Header */}
        <View style={styles.builderHeader}>
          <View style={styles.builderImageContainer}>
            <Image
              source={{ uri: imageSource }}
              style={styles.builderImage}
              contentFit="cover"
            />
            {builder.verified && (
              <View style={styles.builderVerifiedBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={colors.text.inverse}
                />
              </View>
            )}
          </View>
          <View style={styles.builderInfo}>
            <Text style={styles.builderName}>{builder.name}</Text>
            <Text style={styles.builderSpecialty}>{builder.specialty}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={colors.ember[500]} />
              <Text style={styles.ratingText}>{builder.rating}</Text>
              <Text style={styles.reviewsText}>
                ({builder.reviews} reviews)
              </Text>
            </View>
            {builder.availability && (
              <View style={styles.availabilityRow}>
                <View style={styles.availabilityDot} />
                <Text style={styles.availabilityText}>
                  {builder.availability}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title="Book Video Call"
            onPress={() => onAction?.("book", builder)}
            variant="primary"
            size="lg"
            fullWidth
            icon={
              <Ionicons name="videocam" size={18} color={colors.text.inverse} />
            }
          />
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (contentType) {
      case "profile":
        return renderProfileContent();
      case "event":
        return renderEventContent();
      case "builder":
        return renderBuilderContent();
      default:
        return null;
    }
  };

  if (!visible) return null;

  const SheetContent = Platform.OS === "ios" ? BlurView : View;
  const sheetProps =
    Platform.OS === "ios"
      ? { tint: "light" as const, intensity: blur.heavy }
      : {};

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [{ translateY }],
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <SheetContent
          style={[styles.sheet, Platform.OS !== "ios" && styles.sheetFallback]}
          {...sheetProps}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.bark[600]} />
          </TouchableOpacity>

          {/* Content */}
          {renderContent()}
        </SheetContent>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: borderRadius["2xl"],
    borderTopRightRadius: borderRadius["2xl"],
    overflow: "hidden",
    ...shadows.glassFloat,
  },
  sheet: {
    borderTopLeftRadius: borderRadius["2xl"],
    borderTopRightRadius: borderRadius["2xl"],
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.glass.border,
    minHeight: 300,
    overflow: "hidden",
  },
  sheetFallback: {
    backgroundColor: colors.glass.white,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bark[300],
  },
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteLight,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  // Profile Styles
  profileHeader: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: spacing.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.moss[500],
    borderWidth: 2,
    borderColor: colors.glass.white,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: "700",
    color: colors.bark[900],
  },
  profileAge: {
    fontSize: typography.fontSize.lg,
    color: colors.bark[600],
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    backgroundColor: colors.moss[500],
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  locationText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
    fontWeight: "500",
  },
  destinationText: {
    fontSize: typography.fontSize.sm,
    color: colors.moss[600],
    fontWeight: "500",
  },
  vehicleText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
  },
  routeOverlapContainer: {
    position: "relative",
    alignSelf: "flex-start",
    marginBottom: spacing.lg,
  },
  routeOverlapGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: borderRadius.lg + 4,
    backgroundColor: colors.ember[500],
    opacity: 0.3,
  },
  routeOverlapBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ember[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  routeOverlapText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.text.inverse,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  interestTag: {
    backgroundColor: colors.glass.whiteSubtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  interestText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
    fontWeight: "500",
  },
  actionsRow: {
    gap: spacing.md,
  },
  // Event Styles
  eventImageContainer: {
    height: 160,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  eventTypeBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ember[500],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  eventTypeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "600",
    color: colors.text.inverse,
  },
  eventDetails: {
    marginBottom: spacing.lg,
  },
  eventTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: "700",
    color: colors.bark[900],
    marginBottom: spacing.md,
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  eventMetaText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
  },
  eventDescription: {
    fontSize: typography.fontSize.base,
    color: colors.bark[600],
    marginTop: spacing.md,
    lineHeight: 22,
  },
  // Builder Styles
  builderHeader: {
    flexDirection: "row",
    marginBottom: spacing.xl,
  },
  builderImageContainer: {
    position: "relative",
    marginRight: spacing.lg,
  },
  builderImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
  },
  builderVerifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.moss[500],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.glass.white,
  },
  builderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  builderName: {
    fontSize: typography.fontSize.xl,
    fontWeight: "700",
    color: colors.bark[900],
    marginBottom: spacing.xs,
  },
  builderSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  ratingText: {
    fontSize: typography.fontSize.base,
    fontWeight: "600",
    color: colors.bark[800],
    marginLeft: spacing.xs,
  },
  reviewsText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    marginLeft: spacing.xs,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.moss[500],
  },
  availabilityText: {
    fontSize: typography.fontSize.sm,
    color: colors.moss[600],
    fontWeight: "500",
  },
});

export default LiquidSheet;
