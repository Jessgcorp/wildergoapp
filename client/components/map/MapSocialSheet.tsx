/**
 * WilderGo Map Social Sheet
 * Enhanced Liquid Sheet for map marker interactions
 * Frosted glass design with organic momentum and Ask to Join flow
 */

import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  ScrollView,
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
} from "@/constants/theme";
import type { MapMarkerData } from "@/services/map/mapService";
import { getRouteOverlapGlow } from "@/services/map/mapService";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MapSocialSheetProps {
  visible: boolean;
  marker: MapMarkerData | null;
  onClose: () => void;
  onAskToJoin?: (marker: MapMarkerData) => void;
  onMessage?: (marker: MapMarkerData) => void;
  onViewProfile?: (marker: MapMarkerData) => void;
  onBookCall?: (marker: MapMarkerData) => void;
  onHire?: (marker: MapMarkerData) => void;
  currentMode?: "friends" | "builder";
}

type JoinStatus = "idle" | "pending" | "accepted" | "declined";

export const MapSocialSheet: React.FC<MapSocialSheetProps> = ({
  visible,
  marker,
  onClose,
  onAskToJoin,
  onMessage,
  onViewProfile,
  onBookCall,
  onHire,
  currentMode,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [joinStatus, setJoinStatus] = useState<JoinStatus>("idle");
  const pendingPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && marker) {
      setJoinStatus("idle");
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
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, marker, translateY, backdropOpacity]);

  // Pending pulse animation
  useEffect(() => {
    if (joinStatus === "pending") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pendingPulse, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pendingPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pendingPulse.setValue(1);
    }
  }, [joinStatus, pendingPulse]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
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

  const handleAskToJoin = () => {
    setJoinStatus("pending");
    onAskToJoin?.(marker!);
    // Simulate response after delay (in production, this would be real-time)
    setTimeout(() => {
      // For demo, randomly accept or keep pending
      if (Math.random() > 0.5) {
        setJoinStatus("accepted");
      }
    }, 3000);
  };

  if (!marker) return null;

  const isEvent = marker.type === "campfire";
  const isBuilder = marker.type === "builder";
  const isTraveler = marker.type === "traveler" || marker.type === "match";
  const glowConfig = marker.routeOverlap
    ? getRouteOverlapGlow(marker.routeOverlap)
    : null;

  const SheetContent = Platform.OS === "ios" ? BlurView : View;
  const sheetProps =
    Platform.OS === "ios" ? { tint: "light" as const, intensity: 90 } : {};

  const renderTravelerContent = () => (
    <>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: marker.imageUrl }}
            style={styles.profileImage}
            contentFit="cover"
          />
          {marker.online && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>
              {marker.name}, {marker.age}
            </Text>
            {marker.routeOverlap && marker.routeOverlap >= 70 && (
              <View style={styles.routeOverlapBadge}>
                <Ionicons
                  name="git-merge"
                  size={12}
                  color={colors.text.inverse}
                />
                <Text style={styles.routeOverlapText}>
                  {marker.routeOverlap}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.profileLocation}>
            {marker.subtitle} → {marker.destination}
          </Text>
          <Text style={styles.profileVehicle}>{marker.vehicle}</Text>
        </View>
      </View>

      {/* Route Overlap Glow Effect */}
      {glowConfig && glowConfig.intensity > 0 && (
        <View
          style={[styles.routeGlowBar, { opacity: glowConfig.intensity }]}
        />
      )}

      {/* Interests */}
      {marker.interests && (
        <View style={styles.interestsContainer}>
          {marker.interests.map((interest, i) => (
            <View key={i} style={styles.interestChip}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Message"
          onPress={() => onMessage?.(marker)}
          variant="outline"
          size="lg"
          style={styles.actionButton}
          icon={
            <Ionicons name="chatbubble" size={18} color={colors.moss[600]} />
          }
        />
        <Button
          title="View Profile"
          onPress={() => onViewProfile?.(marker)}
          variant="ember"
          size="lg"
          style={styles.actionButton}
          icon={
            <Ionicons name="person" size={18} color={colors.text.inverse} />
          }
        />
      </View>
    </>
  );

  const renderEventContent = () => (
    <>
      {/* Event Header */}
      <View style={styles.eventHeader}>
        <Image
          source={{ uri: marker.imageUrl }}
          style={styles.eventImage}
          contentFit="cover"
        />
        <View style={styles.eventOverlay}>
          <View style={styles.eventBadge}>
            <Ionicons name="flame" size={14} color={colors.ember[500]} />
            <Text style={styles.eventBadgeText}>{marker.activity}</Text>
          </View>
        </View>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{marker.eventName}</Text>
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Ionicons name="time" size={16} color={colors.bark[500]} />
            <Text style={styles.eventDetailText}>{marker.eventTime}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Ionicons name="location" size={16} color={colors.bark[500]} />
            <Text style={styles.eventDetailText}>{marker.subtitle}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Ionicons name="people" size={16} color={colors.bark[500]} />
            <Text style={styles.eventDetailText}>
              {marker.participants} attending
            </Text>
          </View>
        </View>
        <Text style={styles.eventHost}>Hosted by {marker.host}</Text>
      </View>

      {/* Ask to Join Button with Pending State */}
      <Animated.View style={{ transform: [{ scale: pendingPulse }] }}>
        {joinStatus === "idle" && (
          <Button
            title="Ask to Join"
            onPress={handleAskToJoin}
            variant="ember"
            size="lg"
            fullWidth
            icon={
              <Ionicons
                name="add-circle"
                size={20}
                color={colors.text.inverse}
              />
            }
          />
        )}
        {joinStatus === "pending" && (
          <GlassCard variant="medium" padding="md" style={styles.pendingCard}>
            <View style={styles.pendingContent}>
              <View style={styles.pendingIcon}>
                <Ionicons
                  name="hourglass"
                  size={24}
                  color={colors.ember[500]}
                />
              </View>
              <View style={styles.pendingTextContainer}>
                <Text style={styles.pendingTitle}>Request Sent!</Text>
                <Text style={styles.pendingSubtitle}>
                  Waiting for {marker.host}&apos;s response...
                </Text>
              </View>
            </View>
          </GlassCard>
        )}
        {joinStatus === "accepted" && (
          <GlassCard variant="medium" padding="md" style={styles.acceptedCard}>
            <View style={styles.pendingContent}>
              <View
                style={[
                  styles.pendingIcon,
                  { backgroundColor: colors.moss[500] + "20" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.moss[500]}
                />
              </View>
              <View style={styles.pendingTextContainer}>
                <Text
                  style={[styles.pendingTitle, { color: colors.moss[600] }]}
                >
                  You&apos;re In!
                </Text>
                <Text style={styles.pendingSubtitle}>
                  See you at the bonfire tonight
                </Text>
              </View>
            </View>
          </GlassCard>
        )}
      </Animated.View>
    </>
  );

  const renderBuilderContent = () => (
    <>
      {/* Builder Header */}
      <View style={styles.builderHeader}>
        <Image
          source={{ uri: marker.imageUrl }}
          style={styles.builderImage}
          contentFit="cover"
        />
        <View style={styles.builderInfo}>
          <View style={styles.builderNameRow}>
            <Text style={styles.builderName}>{marker.name}</Text>
            {marker.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={colors.moss[500]}
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <Text style={styles.builderSpecialty}>{marker.specialty}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.ember[500]} />
            <Text style={styles.ratingText}>{marker.rating}</Text>
            <Text style={styles.reviewCount}>({marker.reviews} reviews)</Text>
          </View>
        </View>
      </View>

      {/* Expertise */}
      {marker.expertise && (
        <View style={styles.expertiseSection}>
          <Text style={styles.expertiseTitle}>Expertise</Text>
          <View style={styles.expertiseChips}>
            {marker.expertise.map((skill, i) => (
              <View key={i} style={styles.expertiseChip}>
                <Text style={styles.expertiseText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Availability */}
      <GlassCard variant="light" padding="md" style={styles.availabilityCard}>
        <View style={styles.availabilityContent}>
          <Ionicons name="calendar" size={18} color={colors.bark[600]} />
          <Text style={styles.availabilityText}>{marker.availability}</Text>
        </View>
      </GlassCard>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Message"
          onPress={() => onMessage?.(marker)}
          variant="outline"
          size="lg"
          style={styles.actionButton}
          icon={
            <Ionicons name="chatbubble" size={18} color={colors.moss[600]} />
          }
        />
        <Button
          title="Book Video Call"
          onPress={() => onBookCall?.(marker)}
          variant="ember"
          size="lg"
          style={styles.actionButton}
          icon={
            <Ionicons name="videocam" size={18} color={colors.text.inverse} />
          }
        />
      </View>
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
            pointerEvents: visible ? "auto" : "none",
          },
        ]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
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
          {...sheetProps}
          style={[styles.sheet, Platform.OS !== "ios" && styles.sheetFallback]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {isTraveler && renderTravelerContent()}
            {isEvent && renderEventContent()}
            {isBuilder && renderBuilderContent()}
          </ScrollView>
        </SheetContent>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30, 24, 20, 0.5)",
    zIndex: 100,
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 101,
  },
  sheet: {
    borderTopLeftRadius: borderRadius["2xl"],
    borderTopRightRadius: borderRadius["2xl"],
    overflow: "hidden",
    minHeight: 300,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  sheetFallback: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.bark[300],
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  // Traveler styles
  profileHeader: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    marginRight: spacing.lg,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: spacing.lg + 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.moss[500],
    borderWidth: 2,
    borderColor: colors.text.inverse,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: "700",
    color: colors.bark[900],
    fontFamily: typography.fontFamily.heading,
  },
  routeOverlapBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ember[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  routeOverlapText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "700",
    color: colors.text.inverse,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  profileLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    marginTop: 2,
    fontFamily: typography.fontFamily.body,
  },
  profileVehicle: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    marginTop: 2,
    fontFamily: typography.fontFamily.body,
  },
  routeGlowBar: {
    height: 4,
    backgroundColor: colors.ember[500],
    borderRadius: 2,
    marginBottom: spacing.lg,
    ...shadows.glow,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  interestChip: {
    backgroundColor: colors.moss[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  interestText: {
    fontSize: typography.fontSize.sm,
    color: colors.moss[700],
    fontWeight: "500",
    fontFamily: typography.fontFamily.bodyMedium,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  // Event styles
  eventHeader: {
    position: "relative",
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  eventImage: {
    width: "100%",
    height: 160,
  },
  eventOverlay: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
  },
  eventBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  eventBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.bark[800],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  eventInfo: {
    marginBottom: spacing.xl,
  },
  eventTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: "700",
    color: colors.bark[900],
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.heading,
  },
  eventDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  eventDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    fontFamily: typography.fontFamily.body,
  },
  eventHost: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    fontStyle: "italic",
    fontFamily: typography.fontFamily.body,
  },
  pendingCard: {
    borderRadius: borderRadius.xl,
  },
  acceptedCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.moss[300],
  },
  pendingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.ember[500] + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  pendingTextContainer: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.ember[600],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  pendingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    marginTop: 2,
    fontFamily: typography.fontFamily.body,
  },
  // Builder styles
  builderHeader: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  builderImage: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    marginRight: spacing.lg,
  },
  builderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  builderNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  builderName: {
    fontSize: typography.fontSize.lg,
    fontWeight: "700",
    color: colors.bark[900],
    fontFamily: typography.fontFamily.heading,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.moss[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  verifiedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "600",
    color: colors.moss[600],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  builderSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    marginTop: 2,
    fontFamily: typography.fontFamily.body,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.bark[800],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  reviewCount: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    fontFamily: typography.fontFamily.body,
  },
  expertiseSection: {
    marginBottom: spacing.lg,
  },
  expertiseTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.bark[700],
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  expertiseChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  expertiseChip: {
    backgroundColor: colors.driftwood[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  expertiseText: {
    fontSize: typography.fontSize.sm,
    color: colors.driftwood[700],
    fontWeight: "500",
    fontFamily: typography.fontFamily.bodyMedium,
  },
  availabilityCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  availabilityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  availabilityText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    fontFamily: typography.fontFamily.body,
  },
});

export default MapSocialSheet;
