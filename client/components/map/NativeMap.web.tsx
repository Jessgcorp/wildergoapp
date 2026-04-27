import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, mapboxConfig } from "@/constants/theme";

export interface MapMarkerData {
  id: string;
  type: "traveler" | "campfire" | "match" | "builder" | "pin";
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  name: string;
  subtitle?: string;
  isDroppedPin?: boolean;
}

interface NativeMapProps {
  region: any;
  onRegionChange: (region: any) => void;
  markers: MapMarkerData[];
  onMarkerPress: (marker: MapMarkerData) => void;
  showUserLocation: boolean;
  ghostModeMarker?: {
    latitude: number;
    longitude: number;
  } | null;
}

export const NativeMap = forwardRef<any, NativeMapProps>(({ markers }, ref) => {
  const droppedPins = markers.filter((m) => m.isDroppedPin || m.type === "pin");

  return (
    <LinearGradient
      colors={[
        mapboxConfig.style.land,
        mapboxConfig.style.landLight,
        mapboxConfig.style.land,
      ]}
      style={styles.container}
    >
      <View style={styles.fallbackMessage}>
        <Ionicons name="map" size={48} color={colors.forestGreen[500]} />
        <Text style={styles.title}>Interactive Map</Text>
        <Text style={styles.subtitle}>
          Scan the QR code with Expo Go to see the full Google Maps experience
          on your mobile device
        </Text>
      </View>

      <View
        style={[
          styles.terrainFeature,
          {
            top: "8%",
            left: "5%",
            backgroundColor: mapboxConfig.style.forest,
            width: 70,
            height: 45,
          },
        ]}
      />
      <View
        style={[
          styles.terrainFeature,
          {
            top: "18%",
            right: "8%",
            backgroundColor: mapboxConfig.style.water,
            width: 90,
            height: 55,
          },
        ]}
      />
      <View
        style={[
          styles.terrainFeature,
          {
            bottom: "35%",
            left: "12%",
            backgroundColor: mapboxConfig.style.park,
            width: 80,
            height: 50,
          },
        ]}
      />
      <View
        style={[
          styles.terrainFeature,
          {
            bottom: "18%",
            right: "18%",
            backgroundColor: mapboxConfig.style.forest,
            width: 65,
            height: 40,
          },
        ]}
      />

      <Text style={[styles.regionLabel, { top: "12%", left: "55%" }]}>
        Nevada
      </Text>
      <Text style={[styles.regionLabel, { top: "32%", left: "22%" }]}>
        Utah
      </Text>
      <Text style={[styles.regionLabel, { bottom: "22%", right: "12%" }]}>
        Arizona
      </Text>

      {droppedPins.length > 0 ? (
        <View style={styles.pinsIndicator}>
          <View style={styles.pinsBadge}>
            <Ionicons name="location" size={14} color="#FFFFFF" />
            <Text style={styles.pinsText}>
              {droppedPins.length} pin{droppedPins.length > 1 ? "s" : ""}{" "}
              dropped
            </Text>
          </View>
        </View>
      ) : null}
    </LinearGradient>
  );
});

NativeMap.displayName = "NativeMap";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  fallbackMessage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -120 }, { translateY: -60 }],
    width: 240,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 18,
  },
  terrainFeature: {
    position: "absolute",
    borderRadius: borderRadius.xl,
    opacity: 0.5,
  },
  regionLabel: {
    position: "absolute",
    fontSize: 12,
    color: "rgba(0,0,0,0.3)",
    fontWeight: "300",
  },
  pinsIndicator: {
    position: "absolute",
    bottom: 16,
    left: 16,
    zIndex: 20,
  },
  pinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E74C3C",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  pinsText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default NativeMap;
