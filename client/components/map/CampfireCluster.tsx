/**
 * WilderGo Campfire Clustering
 * Visual clustering of nearby nomads with animated campfire effect
 * Features:
 * - Animated campfire glow based on cluster size
 * - Expandable cluster to show individual members
 * - Pulse animation for active clusters
 * - Liquid ripple on tap
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
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
  animations,
  markerTypes,
} from "@/constants/theme";
import {
  CampfireCluster,
  getCampfireClusters,
} from "@/services/map/advancedMapService";
import { MapMarkerData, AppMode } from "@/services/map/mapService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CampfireClusterMarkerProps {
  cluster: CampfireCluster;
  position: { top: `${number}%`; left: `${number}%` };
  onPress: (cluster: CampfireCluster) => void;
  currentMode: AppMode;
}

// Single cluster marker with animated campfire effect
export const CampfireClusterMarker: React.FC<CampfireClusterMarkerProps> = ({
  cluster,
  position,
  onPress,
  currentMode,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Cluster size determines animation intensity
  const { pulseIntensity, color, type, count } = cluster;

  // Base size based on cluster type
  const baseSize = type === "large" ? 64 : type === "medium" ? 54 : 44;

  // Campfire pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1 + pulseIntensity * 0.3,
          duration: 1500 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500 + Math.random() * 500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseIntensity, pulseAnim]);

  // Glow animation
  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.3 + pulseIntensity * 0.4,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5 + pulseIntensity * 0.3,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    );
    glow.start();
    return () => glow.stop();
  }, [pulseIntensity, glowAnim]);

  // Flicker animation for fire effect
  useEffect(() => {
    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: 0.85,
          duration: 100 + Math.random() * 200,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: 100 + Math.random() * 200,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: 0.9,
          duration: 100 + Math.random() * 200,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: 100 + Math.random() * 200,
          useNativeDriver: true,
        }),
      ]),
    );
    flicker.start();
    return () => flicker.stop();
  }, [flickerAnim]);

  // Press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
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
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: baseSize * 2,
            height: baseSize * 2,
            borderRadius: baseSize,
            backgroundColor: color + "30",
            transform: [{ scale: pulseAnim }],
            opacity: glowAnim,
          },
        ]}
      />

      {/* Inner glow */}
      <Animated.View
        style={[
          styles.innerGlow,
          {
            width: baseSize * 1.4,
            height: baseSize * 1.4,
            borderRadius: baseSize * 0.7,
            backgroundColor: color + "50",
            opacity: flickerAnim,
          },
        ]}
      />

      {/* Main cluster button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(cluster)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[
            color,
            type === "large"
              ? colors.burntSienna[600]
              : type === "medium"
                ? colors.sunsetOrange[600]
                : colors.forestGreen[600],
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
            <Ionicons
              name="bonfire"
              size={type === "large" ? 28 : type === "medium" ? 24 : 20}
              color={colors.text.inverse}
            />
          </Animated.View>
          <Text style={styles.clusterCount}>{count}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Cluster label */}
      <View style={styles.clusterLabel}>
        <Text style={styles.clusterLabelText}>{cluster.label}</Text>
      </View>
    </Animated.View>
  );
};

// Expanded cluster view showing all members
interface ClusterDetailSheetProps {
  visible: boolean;
  cluster: CampfireCluster | null;
  onClose: () => void;
  onMemberPress: (member: MapMarkerData) => void;
  currentMode: AppMode;
}

export const ClusterDetailSheet: React.FC<ClusterDetailSheetProps> = ({
  visible,
  cluster,
  onClose,
  onMemberPress,
  currentMode,
}) => {
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 400,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible, slideAnim]);

  if (!cluster) return null;

  return (
    <Modal visible={visible} animationType="none" transparent>
      <View style={styles.sheetBackdrop}>
        <TouchableOpacity
          style={styles.sheetBackdropTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={[cluster.color + "20", colors.background.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.3 }}
            style={styles.sheetContent}
          >
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderLeft}>
                <View
                  style={[
                    styles.clusterIcon,
                    { backgroundColor: cluster.color + "20" },
                  ]}
                >
                  <Ionicons name="bonfire" size={24} color={cluster.color} />
                </View>
                <View>
                  <Text style={styles.sheetTitle}>{cluster.label}</Text>
                  <Text style={styles.sheetSubtitle}>
                    {cluster.type.charAt(0).toUpperCase() +
                      cluster.type.slice(1)}{" "}
                    gathering
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.bark[500]} />
              </TouchableOpacity>
            </View>

            {/* Members list */}
            <ScrollView
              style={styles.membersList}
              showsVerticalScrollIndicator={false}
            >
              {cluster.markers.map((member) => {
                const isTraveler = member.type === "traveler";
                const isMatch = member.type === "match";
                const isEvent = member.type === "campfire";

                return (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.memberCard}
                    onPress={() => onMemberPress(member)}
                    activeOpacity={0.8}
                  >
                    {/* Member avatar */}
                    <View style={styles.memberAvatar}>
                      {member.imageUrl ? (
                        <Image
                          source={{ uri: member.imageUrl }}
                          style={styles.memberImage}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.memberImagePlaceholder,
                            {
                              backgroundColor: isEvent
                                ? colors.sunsetOrange[100]
                                : isMatch
                                  ? colors.sunsetOrange[100]
                                  : colors.forestGreen[100],
                            },
                          ]}
                        >
                          <Ionicons
                            name={
                              isEvent ? "flame" : isMatch ? "heart" : "person"
                            }
                            size={20}
                            color={
                              isEvent
                                ? colors.sunsetOrange[500]
                                : isMatch
                                  ? colors.sunsetOrange[500]
                                  : colors.forestGreen[500]
                            }
                          />
                        </View>
                      )}
                      {/* Online indicator */}
                      {member.online && <View style={styles.onlineIndicator} />}
                    </View>

                    {/* Member info */}
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>
                        {member.name || member.title}
                        {member.age && `, ${member.age}`}
                      </Text>
                      <Text style={styles.memberSubtitle}>
                        {member.vehicle || member.subtitle || member.activity}
                      </Text>
                      {false && (
                        <View style={styles.overlapBadge}>
                          <Ionicons
                            name="git-merge-outline"
                            size={12}
                            color={colors.sunsetOrange[500]}
                          />
                          <Text style={styles.overlapText}>
                            {member.routeOverlap}% route overlap
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Action button */}
                    <View style={styles.memberAction}>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.bark[400]}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Join gathering CTA */}
            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.joinGatheringButton}>
                <LinearGradient
                  colors={[cluster.color, colors.forestGreen[600]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.joinGatheringGradient}
                >
                  <Ionicons
                    name="flame"
                    size={20}
                    color={colors.text.inverse}
                  />
                  <Text style={styles.joinGatheringText}>
                    Join This Gathering
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Clustering toggle button
interface ClusteringToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  clusterCount?: number;
}

export const ClusteringToggle: React.FC<ClusteringToggleProps> = ({
  isEnabled,
  onToggle,
  clusterCount = 0,
}) => {
  return (
    <TouchableOpacity
      style={[styles.toggleButton, isEnabled && styles.toggleButtonActive]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Ionicons
        name="bonfire"
        size={20}
        color={isEnabled ? colors.text.inverse : colors.bark[500]}
      />
      {clusterCount > 0 && isEnabled && (
        <View style={styles.clusterCountBadge}>
          <Text style={styles.clusterCountBadgeText}>{clusterCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Hook for managing cluster state
export function useCampfireClusters(mode: AppMode, zoomLevel: number = 10) {
  const [clusteringEnabled, setClusteringEnabled] = useState(true);

  const { clusters, unclustered } = useMemo(() => {
    if (!clusteringEnabled) {
      return { clusters: [], unclustered: [] };
    }
    return getCampfireClusters(mode, zoomLevel);
  }, [mode, zoomLevel, clusteringEnabled]);

  return {
    clusters,
    unclustered,
    clusteringEnabled,
    setClusteringEnabled,
    toggleClustering: () => setClusteringEnabled(!clusteringEnabled),
  };
}

const styles = StyleSheet.create({
  // Cluster marker
  clusterContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  glowRing: {
    position: "absolute",
  },
  innerGlow: {
    position: "absolute",
  },
  clusterButton: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.glass.white,
    ...shadows.lg,
  },
  clusterCount: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
    marginTop: -2,
  },
  clusterLabel: {
    position: "absolute",
    bottom: -18,
    backgroundColor: colors.glass.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  clusterLabelText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  // Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  sheetBackdropTouchable: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: "80%",
  },
  sheetContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.bark[300],
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[200],
  },
  sheetHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  clusterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
  },
  sheetSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginTop: 2,
  },
  // Members list
  membersList: {
    maxHeight: 350,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[100],
  },
  memberAvatar: {
    position: "relative",
    marginRight: spacing.md,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.forestGreen[500],
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  memberSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginTop: 2,
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
    color: colors.sunsetOrange[600],
  },
  memberAction: {
    padding: spacing.sm,
  },
  // Footer
  sheetFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.bark[200],
  },
  joinGatheringButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  joinGatheringGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  joinGatheringText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  // Toggle button
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.sunsetOrange[500],
    borderColor: colors.sunsetOrange[600],
  },
  clusterCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.forestGreen[500],
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxs,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  clusterCountBadgeText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
});

export default CampfireClusterMarker;
