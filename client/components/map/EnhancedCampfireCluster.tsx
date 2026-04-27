/**
 * WilderGo Enhanced Campfire Clustering
 * Visual clustering of 5+ nearby nomads into animated campfire icons
 * Features:
 * - Slow warm pulse animation
 * - "Gathering Vibe" determined by collective interests
 * - Liquid glass panel with nomad listings
 * - 30px+ rounded corners for premium feel
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  colors,
  borderRadius,
  spacing,
  typography,
  shadows,
  blur,
} from "@/constants/theme";
import { MapMarkerData, AppMode } from "@/services/map/mapService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Gathering Vibe types determined by collective interests
export type GatheringVibe =
  | "Quiet Camp"
  | "Music Jam"
  | "Build Party"
  | "Social Hangout"
  | "Adventure Crew"
  | "Work Session"
  | "Sunset Chill";

export interface EnhancedCluster {
  id: string;
  latitude: number;
  longitude: number;
  markers: MapMarkerData[];
  count: number;
  vibe: GatheringVibe;
  vibeIcon: string;
  vibeColor: string;
  pulseIntensity: number;
}

// Vibe configuration
const VIBE_CONFIG: Record<
  GatheringVibe,
  { icon: string; color: string; description: string }
> = {
  "Quiet Camp": {
    icon: "moon",
    color: colors.deepTeal[500],
    description: "Peaceful atmosphere for rest and reflection",
  },
  "Music Jam": {
    icon: "musical-notes",
    color: colors.ember[500],
    description: "Guitars, songs, and good vibes around the fire",
  },
  "Build Party": {
    icon: "construct",
    color: colors.driftwood[500],
    description: "Makers helping makers with rig projects",
  },
  "Social Hangout": {
    icon: "people",
    color: colors.moss[500],
    description: "Friendly gathering for new connections",
  },
  "Adventure Crew": {
    icon: "compass",
    color: colors.forestGreen[500],
    description: "Outdoor enthusiasts planning the next adventure",
  },
  "Work Session": {
    icon: "laptop",
    color: colors.sage[500],
    description: "Digital nomads focused on remote work",
  },
  "Sunset Chill": {
    icon: "sunny",
    color: colors.sunsetOrange[500],
    description: "Relaxed vibes watching the sky paint itself",
  },
};

/**
 * Determine the gathering vibe based on collective interests
 */
function determineGatheringVibe(markers: MapMarkerData[]): GatheringVibe {
  const interests: Record<string, number> = {};

  // Collect all interests from markers
  markers.forEach((marker) => {
    const markerInterests =
      marker.interests || marker.activity?.split(", ") || [];
    markerInterests.forEach((interest: string) => {
      const normalized = interest.toLowerCase();
      interests[normalized] = (interests[normalized] || 0) + 1;
    });
  });

  // Check for dominant themes
  const hasMusicInterest = ["music", "guitar", "jam", "singing"].some(
    (key) => interests[key] > 0,
  );
  const hasBuildInterest = [
    "building",
    "construction",
    "mechanic",
    "solar",
    "electrical",
  ].some((key) => interests[key] > 0);
  const hasAdventureInterest = [
    "hiking",
    "climbing",
    "biking",
    "kayaking",
    "adventure",
  ].some((key) => interests[key] > 0);
  const hasWorkInterest = ["remote work", "coding", "design", "writing"].some(
    (key) => interests[key] > 0,
  );

  // Determine vibe based on dominant interest
  if (hasMusicInterest && markers.length >= 5) return "Music Jam";
  if (hasBuildInterest && markers.length >= 4) return "Build Party";
  if (hasAdventureInterest && markers.length >= 5) return "Adventure Crew";
  if (hasWorkInterest && markers.length >= 3) return "Work Session";
  if (markers.length >= 8) return "Social Hangout";
  if (markers.length <= 4) return "Quiet Camp";

  return "Sunset Chill";
}

interface EnhancedCampfireMarkerProps {
  cluster: EnhancedCluster;
  position: { top: `${number}%`; left: `${number}%` };
  onPress: (cluster: EnhancedCluster) => void;
}

/**
 * Animated Campfire Cluster Marker with warm pulse effect
 */
export const EnhancedCampfireMarker: React.FC<EnhancedCampfireMarkerProps> = ({
  cluster,
  position,
  onPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const baseSize = cluster.count >= 15 ? 72 : cluster.count >= 10 ? 62 : 52;
  const vibeConfig = VIBE_CONFIG[cluster.vibe];

  // Slow warm pulse animation (2.5s cycle)
  // Note: useNativeDriver must be false because pulseAnim shares components with glowAnim
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15 + cluster.pulseIntensity * 0.1,
          duration: 1250,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1250,
          useNativeDriver: false,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [cluster.pulseIntensity, pulseAnim]);

  // Warm glow animation
  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6 + cluster.pulseIntensity * 0.2,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]),
    );
    glow.start();
    return () => glow.stop();
  }, [cluster.pulseIntensity, glowAnim]);

  // Subtle fire flicker
  // Note: useNativeDriver must be false for consistency with other animations on shared components
  useEffect(() => {
    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: 0.9,
          duration: 150 + Math.random() * 100,
          useNativeDriver: false,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: 150 + Math.random() * 100,
          useNativeDriver: false,
        }),
      ]),
    );
    flicker.start();
    return () => flicker.stop();
  }, [flickerAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.clusterContainer,
        {
          top: position.top,
          left: position.left,
          transform: [
            { translateX: -baseSize / 2 },
            { translateY: -baseSize / 2 },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Outer warm glow ring */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            width: baseSize * 2.2,
            height: baseSize * 2.2,
            borderRadius: baseSize * 1.1,
            backgroundColor: colors.sunsetOrange[400] + "30",
            transform: [{ scale: pulseAnim }],
            opacity: glowAnim,
          },
        ]}
      />

      {/* Inner warm glow */}
      <Animated.View
        style={[
          styles.innerGlow,
          {
            width: baseSize * 1.5,
            height: baseSize * 1.5,
            borderRadius: baseSize * 0.75,
            backgroundColor: colors.ember[400] + "50",
            opacity: flickerAnim,
          },
        ]}
      />

      {/* Main campfire button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(cluster)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[
            colors.ember[400],
            colors.burntSienna[500],
            colors.burntSienna[600],
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.clusterButton,
            {
              width: baseSize,
              height: baseSize,
              borderRadius: baseSize / 2,
            },
          ]}
        >
          <Animated.View style={{ opacity: flickerAnim }}>
            <Ionicons name="bonfire" size={baseSize * 0.45} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.clusterCount}>{cluster.count}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Vibe label */}
      <View
        style={[styles.vibeLabel, { backgroundColor: vibeConfig.color + "EE" }]}
      >
        <Ionicons
          name={vibeConfig.icon as keyof typeof Ionicons.glyphMap}
          size={10}
          color="#FFFFFF"
        />
        <Text style={styles.vibeLabelText}>{cluster.vibe}</Text>
      </View>
    </Animated.View>
  );
};

interface ClusterVibeSheetProps {
  visible: boolean;
  cluster: EnhancedCluster | null;
  onClose: () => void;
  onMemberPress: (member: MapMarkerData) => void;
  currentMode: AppMode;
}

/**
 * Liquid Glass Vibe Panel showing all nomads at gathering
 */
export const ClusterVibeSheet: React.FC<ClusterVibeSheetProps> = ({
  visible,
  cluster,
  onClose,
  onMemberPress,
  currentMode,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  if (!cluster) return null;

  const vibeConfig = VIBE_CONFIG[cluster.vibe];

  const PanelWrapper = Platform.OS === "ios" ? BlurView : View;

  return (
    <Modal visible={visible} animationType="none" transparent>
      <View style={styles.sheetOverlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
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
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <PanelWrapper
            {...(Platform.OS === "ios"
              ? { tint: "light" as const, intensity: blur.heavy }
              : {})}
            style={[
              styles.sheetPanel,
              Platform.OS === "android" && styles.sheetPanelAndroid,
            ]}
          >
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Vibe Header */}
            <View style={styles.vibeHeader}>
              <LinearGradient
                colors={[vibeConfig.color, vibeConfig.color + "DD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.vibeHeaderGradient}
              >
                <View style={styles.vibeIconContainer}>
                  <Ionicons
                    name={vibeConfig.icon as keyof typeof Ionicons.glyphMap}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.vibeHeaderText}>
                  <Text style={styles.vibeTitle}>{cluster.vibe}</Text>
                  <Text style={styles.vibeDescription}>
                    {vibeConfig.description}
                  </Text>
                </View>
                <View style={styles.vibeCountBadge}>
                  <Text style={styles.vibeCountText}>{cluster.count}</Text>
                  <Text style={styles.vibeCountLabel}>nomads</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.bark[500]} />
            </TouchableOpacity>

            {/* Nomads List */}
            <ScrollView
              style={styles.nomadsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.nomadsListContent}
            >
              {cluster.markers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.nomadCard}
                  onPress={() => onMemberPress(member)}
                  activeOpacity={0.8}
                >
                  {/* Avatar */}
                  <View style={styles.nomadAvatar}>
                    {member.imageUrl ? (
                      <Image
                        source={{ uri: member.imageUrl }}
                        style={styles.nomadImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.nomadImagePlaceholder,
                          { backgroundColor: vibeConfig.color + "20" },
                        ]}
                      >
                        <Ionicons
                          name="person"
                          size={22}
                          color={vibeConfig.color}
                        />
                      </View>
                    )}
                    {member.online && <View style={styles.onlineIndicator} />}
                  </View>

                  {/* Info */}
                  <View style={styles.nomadInfo}>
                    <Text style={styles.nomadName}>
                      {member.name || member.title}
                      {member.age && `, ${member.age}`}
                    </Text>
                    <Text style={styles.nomadVehicle} numberOfLines={1}>
                      {member.vehicle || member.subtitle || "Nomad"}
                    </Text>
                    {false && (
                      <View style={styles.overlapBadge}>
                        <Ionicons
                          name="git-merge"
                          size={11}
                          color={colors.ember[500]}
                        />
                        <Text style={styles.overlapText}>
                          {member.routeOverlap}% route overlap
                        </Text>
                      </View>
                    )}
                    {member.interests && member.interests.length > 0 && (
                      <View style={styles.interestsTags}>
                        {member.interests.slice(0, 3).map((interest, idx) => (
                          <View key={idx} style={styles.interestTag}>
                            <Text style={styles.interestTagText}>
                              {interest}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Action */}
                  <TouchableOpacity style={styles.messageBtn}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color={colors.moss[500]}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Join Gathering CTA */}
            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.joinButton} activeOpacity={0.85}>
                <LinearGradient
                  colors={[colors.ember[400], colors.burntSienna[500]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.joinButtonGradient}
                >
                  <Ionicons name="bonfire" size={20} color="#FFFFFF" />
                  <Text style={styles.joinButtonText}>Join This Gathering</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </PanelWrapper>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Hook for enhanced clustering with vibe detection
 */
export function useEnhancedClustering(
  markers: MapMarkerData[],
  zoomLevel: number = 10,
  minClusterSize: number = 5,
) {
  const [clusters, setClusters] = useState<EnhancedCluster[]>([]);
  const [unclustered, setUnclustered] = useState<MapMarkerData[]>([]);

  useEffect(() => {
    if (markers.length === 0) {
      setClusters([]);
      setUnclustered([]);
      return;
    }

    // Clustering radius based on zoom
    const clusterRadius = 0.5 * (14 / zoomLevel);
    const processed = new Set<string>();
    const newClusters: EnhancedCluster[] = [];
    const newUnclustered: MapMarkerData[] = [];

    // Sort by latitude for consistent clustering
    const sorted = [...markers].sort(
      (a, b) => (b.latitude ?? b.lat ?? 0) - (a.latitude ?? a.lat ?? 0),
    );

    for (const marker of sorted) {
      if (processed.has(marker.id)) continue;

      const markerLat = marker.latitude ?? marker.lat ?? 0;
      const markerLng = marker.longitude ?? marker.lng ?? 0;

      // Find nearby markers
      const nearby = sorted.filter((m) => {
        if (processed.has(m.id) || m.id === marker.id) return false;
        const mLat = m.latitude ?? m.lat ?? 0;
        const mLng = m.longitude ?? m.lng ?? 0;
        const distance = Math.sqrt(
          Math.pow(markerLat - mLat, 2) + Math.pow(markerLng - mLng, 2),
        );
        return distance <= clusterRadius;
      });

      if (nearby.length >= minClusterSize - 1) {
        // Create cluster
        const clusterMarkers = [marker, ...nearby];
        clusterMarkers.forEach((m) => processed.add(m.id));

        // Calculate center
        const centerLat =
          clusterMarkers.reduce(
            (sum, m) => sum + (m.latitude ?? m.lat ?? 0),
            0,
          ) / clusterMarkers.length;
        const centerLng =
          clusterMarkers.reduce(
            (sum, m) => sum + (m.longitude ?? m.lng ?? 0),
            0,
          ) / clusterMarkers.length;

        // Determine vibe
        const vibe = determineGatheringVibe(clusterMarkers);
        const vibeConfig = VIBE_CONFIG[vibe];

        // Pulse intensity based on size
        const count = clusterMarkers.length;
        const pulseIntensity = Math.min(1, count / 20);

        newClusters.push({
          id: `cluster-${marker.id}`,
          latitude: centerLat,
          longitude: centerLng,
          markers: clusterMarkers,
          count,
          vibe,
          vibeIcon: vibeConfig.icon,
          vibeColor: vibeConfig.color,
          pulseIntensity,
        });
      } else {
        processed.add(marker.id);
        newUnclustered.push(marker);
      }
    }

    setClusters(newClusters);
    setUnclustered(newUnclustered);
  }, [markers, zoomLevel, minClusterSize]);

  return { clusters, unclustered };
}

const styles = StyleSheet.create({
  // Cluster Marker
  clusterContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  outerGlow: {
    position: "absolute",
  },
  innerGlow: {
    position: "absolute",
  },
  clusterButton: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...shadows.lg,
  },
  clusterCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
    marginTop: -2,
  },
  vibeLabel: {
    position: "absolute",
    bottom: -20,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  vibeLabelText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },

  // Sheet Styles
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheetContainer: {
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  sheetPanel: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  sheetPanelAndroid: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.bark[300],
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
  },
  vibeHeader: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  vibeHeaderGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  vibeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  vibeHeaderText: {
    flex: 1,
  },
  vibeTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  vibeDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
  },
  vibeCountBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  vibeCountText: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
  },
  vibeCountLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.75)",
  },
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass.whiteSubtle,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.sm,
  },

  // Nomads List
  nomadsList: {
    maxHeight: SCREEN_HEIGHT * 0.45,
    marginTop: spacing.md,
  },
  nomadsListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  nomadCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[100],
    gap: spacing.md,
  },
  nomadAvatar: {
    position: "relative",
  },
  nomadImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  nomadImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.moss[500],
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nomadInfo: {
    flex: 1,
    gap: 2,
  },
  nomadName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  nomadVehicle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  overlapBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  overlapText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.ember[600],
  },
  interestsTags: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  interestTag: {
    backgroundColor: colors.bark[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  interestTagText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
  },
  messageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.moss[100],
    justifyContent: "center",
    alignItems: "center",
  },

  // Footer
  sheetFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.bark[100],
  },
  joinButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  joinButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  joinButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

export default EnhancedCampfireMarker;
