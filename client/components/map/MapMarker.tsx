/**
 * WilderGo Custom Map Marker
 * Renders distinctive markers with warm cream base and burnt sienna borders
 * Mode-specific center colors (Red, Blue, Amber, Orange) with white inner borders
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  borderRadius,
  shadows,
  typography,
  markerTypes,
} from "@/constants/theme";
import type { MapMarkerData } from "@/services/map/mapService";
import { getRouteOverlapGlow } from "@/services/map/mapService";

// Mode-specific colors for map pins
const MODE_PIN_COLORS = {
  friends: "#2563EB", // Blue
  builder: "#D97706", // Amber
  help: "#E87A47", // Orange
} as const;

interface MapMarkerProps {
  marker: MapMarkerData;
  onPress?: (marker: MapMarkerData) => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  showLabel?: boolean;
  position?: { top: `${number}%`; left: `${number}%` };
  currentMode?: "friends" | "builder";
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  marker,
  onPress,
  isSelected = false,
  isHighlighted = false,
  showLabel = false,
  position,
  currentMode,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  const config = markerTypes[marker.type] || markerTypes.traveler;
  const isMatch = marker.type === "match";
  const isEvent = marker.type === "campfire";
  const hasHighOverlap = marker.routeOverlap && marker.routeOverlap >= 70;

  // Get glow configuration for route overlap
  const glowConfig = marker.routeOverlap
    ? getRouteOverlapGlow(marker.routeOverlap)
    : { intensity: 0, color: "transparent" };

  useEffect(() => {
    // Pulse animation for events and matches
    if (isEvent || isMatch) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }

    // Glow animation for high route overlap
    if (hasHighOverlap || isMatch) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [pulseAnim, glowAnim, isEvent, isMatch, hasHighOverlap]);

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (marker.type) {
      case "campfire":
        return "flame";
      case "match":
        return "heart";
      case "builder":
        return "construct";
      case "traveler":
      default:
        return "car-sport";
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(marker)}
      activeOpacity={0.8}
      style={[
        styles.container,
        position && {
          position: "absolute" as const,
          top: position.top,
          left: position.left,
        },
      ]}
    >
      {/* Outer Pulse Ring for Events and Matches */}
      {(isEvent || isMatch) && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: config.pulseColor,
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [0.6, 0],
              }),
            },
          ]}
        />
      )}

      {/* Sunset Ember Glow for High Route Overlap */}
      {(hasHighOverlap || isMatch) && (
        <Animated.View
          style={[
            styles.emberGlow,
            {
              opacity: glowAnim,
              shadowColor: colors.ember[500],
              shadowOpacity: glowConfig.intensity,
            },
          ]}
        />
      )}

      {/* Main Marker - Warm cream base with burnt sienna outer border */}
      <View style={styles.markerOuter}>
        {/* Inner marker with mode color and white border */}
        <View
          style={[
            styles.marker,
            {
              backgroundColor: currentMode
                ? MODE_PIN_COLORS[currentMode]
                : config.color,
            },
            isSelected && styles.markerSelected,
            isMatch && styles.markerMatch,
          ]}
        >
          <Ionicons
            name={getIconName()}
            size={isEvent ? 20 : 18}
            color="#FFFFFF"
          />

          {/* Online Indicator for Travelers/Matches */}
          {(marker.type === "traveler" || marker.type === "match") &&
            marker.online && <View style={styles.onlineIndicator} />}

          {/* Verified Badge for Builders */}
          {marker.type === "builder" && marker.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={8} color="#FFFFFF" />
            </View>
          )}
        </View>
      </View>

      {/* Route Overlap Badge */}
      {marker.routeOverlap && marker.routeOverlap > 0 && (
        <View
          style={[
            styles.overlapBadge,
            hasHighOverlap ? styles.overlapBadgeHigh : undefined,
          ]}
        >
          <Text style={styles.overlapText}>{marker.routeOverlap}%</Text>
        </View>
      )}

      {/* Participant Count for Events */}
      {isEvent && marker.participants && (
        <View style={styles.participantBadge}>
          <Ionicons name="people" size={10} color={colors.text.inverse} />
          <Text style={styles.participantText}>{marker.participants}</Text>
        </View>
      )}

      {/* Label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText} numberOfLines={1}>
            {marker.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  emberGlow: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.ember.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 8,
  },
  // Outer container with warm cream base and burnt sienna border
  markerOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5EFE6", // Warm cream base
    borderWidth: 2,
    borderColor: "#C65D3B", // Burnt sienna border
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  // Inner marker with mode color and white border
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF", // White inner border to pop on map
  },
  markerSelected: {
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.1 }],
  },
  markerMatch: {
    backgroundColor: "#4A90E2", // Blue for connection matches
  },
  onlineIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E", // Green online indicator
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22C55E", // Green verified badge
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  overlapBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#E8C5A5", // Desert Sand for badges
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: "#C65D3B", // Burnt sienna border
  },
  overlapBadgeHigh: {
    backgroundColor: "#C65D3B", // Burnt sienna for high overlap
  },
  overlapText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.inverse,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  participantBadge: {
    position: "absolute",
    bottom: -6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bark[800],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 2,
  },
  participantText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.inverse,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  labelContainer: {
    marginTop: 4,
    backgroundColor: colors.glass.dark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    maxWidth: 100,
  },
  labelText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "500",
    color: colors.text.inverse,
    textAlign: "center",
    fontFamily: typography.fontFamily.bodyMedium,
  },
});

export default MapMarker;
