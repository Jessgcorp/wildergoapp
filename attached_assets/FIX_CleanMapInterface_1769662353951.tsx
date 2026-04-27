// FIX: CLUTTERED MAP INTERFACE - Clean Layout + Expandable Map
// ==============================================================

// PROBLEMS:
// 1. Too many elements stacked (Dating/Friends/Builder, Discover banner, Look Ahead, Smart Route, weather)
// 2. Map is too small to see anything
// 3. No way to expand the map
// 4. Everything overlapping and unreadable

// SOLUTION: Clean layout with expandable map and organized overlays

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView from "react-native-maps";

const { width, height } = Dimensions.get("window");

export const CleanMapScreen = () => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
    // Hide controls when expanded for full screen view
    if (!isMapExpanded) {
      setShowControls(false);
    } else {
      setTimeout(() => setShowControls(true), 300);
    }
  };

  return (
    <View style={styles.container}>
      {/* FIXED: Map takes up proper space */}
      <View
        style={[
          styles.mapContainer,
          isMapExpanded && styles.mapContainerExpanded,
        ]}
      >
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 38.5816,
            longitude: -109.5498,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        />

        {/* Expand/Collapse Button - Always Visible */}
        <TouchableOpacity style={styles.expandButton} onPress={toggleMapExpand}>
          <Ionicons
            name={isMapExpanded ? "contract" : "expand"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Weather Badge - Compact, Top Right */}
        {!isMapExpanded && (
          <View style={styles.weatherBadge}>
            <Ionicons name="sunny" size={20} color="#FF6B35" />
            <Text style={styles.weatherTemp}>78°</Text>
          </View>
        )}
      </View>

      {/* FIXED: Controls only show when map is NOT expanded */}
      {!isMapExpanded && showControls && (
        <View style={styles.controlsContainer}>
          {/* Mode Selector - Compact Single Row */}
          <View style={styles.modeSelector}>
            <ModeButton icon="heart" label="Dating" active={false} />
            <ModeButton icon="people" label="Friends" active={true} />
            <ModeButton icon="build" label="Builder" active={false} />
          </View>

          {/* Smart Features - Compact Row */}
          <View style={styles.smartFeaturesRow}>
            <TouchableOpacity style={styles.featureButton}>
              <Ionicons name="radar" size={18} color="#FFFFFF" />
              <Text style={styles.featureText}>Look Ahead</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featureButton, styles.featureButtonPrimary]}
            >
              <Ionicons name="map" size={18} color="#FFFFFF" />
              <Text style={styles.featureText}>Smart Route</Text>
            </TouchableOpacity>
          </View>

          {/* Discover Banner - Single Compact Row */}
          <TouchableOpacity style={styles.discoverBanner}>
            <Ionicons name="compass" size={20} color="#2C2C2C" />
            <Text style={styles.discoverText}>
              Discover travelers and nearby events
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Reusable Mode Button Component
const ModeButton = ({ icon, label, active }) => (
  <TouchableOpacity
    style={[styles.modeButton, active && styles.modeButtonActive]}
  >
    <Ionicons name={icon} size={18} color={active ? "#FFFFFF" : "#4A4A4A"} />
    <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EFE6",
  },

  // MAP SECTION
  mapContainer: {
    height: height * 0.5, // 50% of screen when normal
    width: "100%",
    position: "relative",
  },
  mapContainerExpanded: {
    height: height, // Full screen when expanded
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  map: {
    flex: 1,
  },

  // EXPAND BUTTON - Always visible
  expandButton: {
    position: "absolute",
    top: 60,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2C2C2C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },

  // WEATHER BADGE - Compact
  weatherBadge: {
    position: "absolute",
    top: 60,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherTemp: {
    fontFamily: "Outfit-Bold",
    fontSize: 16,
    color: "#2C2C2C",
  },

  // CONTROLS CONTAINER - Below map
  controlsContainer: {
    padding: 16,
    gap: 12,
  },

  // MODE SELECTOR - Horizontal compact
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 6,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: "#3A6B4A", // Dark green for Friends mode
  },
  modeLabel: {
    fontFamily: "Outfit-Medium",
    fontSize: 13,
    color: "#4A4A4A",
  },
  modeLabelActive: {
    color: "#FFFFFF",
    fontFamily: "Outfit-SemiBold",
  },

  // SMART FEATURES ROW
  smartFeaturesRow: {
    flexDirection: "row",
    gap: 12,
  },
  featureButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B8E7F",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  featureButtonPrimary: {
    backgroundColor: "#3A6B4A",
  },
  featureText: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },

  // DISCOVER BANNER
  discoverBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
  },
  discoverText: {
    fontFamily: "Outfit-Medium",
    fontSize: 14,
    color: "#2C2C2C",
    flex: 1,
  },
});

// KEY IMPROVEMENTS:
// ✅ Map is now 50% of screen (much larger than before)
// ✅ Expand button makes map full screen
// ✅ Controls hide when map expanded
// ✅ All elements organized vertically (no stacking)
// ✅ Compact horizontal mode selector
// ✅ Weather badge is small and unobtrusive
// ✅ Smart features in single row
// ✅ Everything readable with proper spacing
// ✅ Clean visual hierarchy

// LAYOUT BREAKDOWN:
// ┌─────────────────────────┐
// │                         │
// │   MAP (50% height)      │
// │   [Expand Button]       │
// │   [Weather Badge]       │
// │                         │
// ├─────────────────────────┤
// │ [Dating|Friends|Builder]│  <- Mode selector
// ├─────────────────────────┤
// │ [Look Ahead|Smart Route]│  <- Features
// ├─────────────────────────┤
// │ [Discover banner]       │  <- Action
// └─────────────────────────┘

// WHEN EXPANDED:
// ┌─────────────────────────┐
// │                         │
// │                         │
// │   FULL SCREEN MAP       │
// │   [Collapse Button]     │
// │                         │
// │                         │
// └─────────────────────────┘
