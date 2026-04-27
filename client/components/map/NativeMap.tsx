import React, { forwardRef, useMemo } from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

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
  region: Region;
  onRegionChange: (region: Region) => void;
  markers: MapMarkerData[];
  onMarkerPress: (marker: MapMarkerData) => void;
  showUserLocation: boolean;
  ghostModeMarker?: {
    latitude: number;
    longitude: number;
  } | null;
  userLocation?: { latitude: number; longitude: number } | null;
}

function getMarkerIcon(type: string): {
  name: string;
  color: string;
  bg: string;
} {
  switch (type) {
    case "match":
      return { name: "heart", color: "#FFFFFF", bg: "#DC2626" };
    case "campfire":
      return { name: "flame", color: "#FFFFFF", bg: "#E87A47" };
    case "builder":
      return { name: "construct", color: "#FFFFFF", bg: "#D97706" };
    case "traveler":
      return { name: "car-sport", color: "#FFFFFF", bg: "#2563EB" };
    case "pin":
      return { name: "pin", color: "#FFFFFF", bg: "#E74C3C" };
    default:
      return { name: "location", color: "#FFFFFF", bg: "#4ECDC4" };
  }
}

const COMMUNITY_SEED = [
  {
    id: "community-1",
    initials: "WA",
    color: "#FF5733",
    name: "Wilder Alice",
    subtitle: "Van lifer since 2021",
    latOff: 0.005,
    lngOff: 0.005,
  },
  {
    id: "community-2",
    initials: "BT",
    color: "#33FF57",
    name: "Beta Tom",
    subtitle: "Overlander & trail guide",
    latOff: -0.008,
    lngOff: 0.002,
  },
  {
    id: "community-3",
    initials: "SG",
    color: "#3357FF",
    name: "Safe Gus",
    subtitle: "Boondocking enthusiast",
    latOff: 0.003,
    lngOff: -0.006,
  },
];

function getCommunityMarkers(centerLat: number, centerLng: number) {
  return COMMUNITY_SEED.map((s) => ({
    id: s.id,
    initials: s.initials,
    color: s.color,
    name: s.name,
    subtitle: s.subtitle,
    latitude: centerLat + s.latOff,
    longitude: centerLng + s.lngOff,
  }));
}

export const NativeMap = forwardRef<MapView, NativeMapProps>(
  (
    {
      region,
      onRegionChange,
      markers,
      onMarkerPress,
      showUserLocation,
      ghostModeMarker,
      userLocation,
    },
    ref,
  ) => {
    const DEFAULT_LOCATION = { latitude: 40.0502, longitude: -105.0498 };
    const centerLat = userLocation?.latitude ?? DEFAULT_LOCATION.latitude;
    const centerLng = userLocation?.longitude ?? DEFAULT_LOCATION.longitude;
    const communityMarkers = useMemo(
      () => getCommunityMarkers(centerLat, centerLng),
      [Math.round(centerLat * 100) / 100, Math.round(centerLng * 100) / 100],
    );

    return (
      <MapView
        ref={ref}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        mapType="terrain"
      >
        {communityMarkers.map((cm) => (
          <Marker
            key={cm.id}
            coordinate={{ latitude: cm.latitude, longitude: cm.longitude }}
            title={cm.name}
            description={cm.subtitle}
          >
            <View
              style={[communityStyles.circle, { backgroundColor: cm.color }]}
            >
              <Text style={communityStyles.initials}>{cm.initials}</Text>
            </View>
          </Marker>
        ))}

        {markers.map((marker) => {
          const lat = marker.latitude ?? marker.lat ?? 0;
          const lng = marker.longitude ?? marker.lng ?? 0;
          const icon = getMarkerIcon(marker.isDroppedPin ? "pin" : marker.type);

          return (
            <Marker
              key={marker.id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={marker.name}
              description={marker.subtitle}
              onPress={() => onMarkerPress(marker)}
            >
              <View
                style={[markerStyles.container, { backgroundColor: icon.bg }]}
              >
                <Ionicons
                  name={icon.name as any}
                  size={18}
                  color={icon.color}
                />
              </View>
              <View style={markerStyles.pointer} />
            </Marker>
          );
        })}

        {ghostModeMarker && (
          <Marker
            coordinate={ghostModeMarker}
            title="You (Ghost Mode)"
            pinColor="#666666"
            opacity={0.5}
          />
        )}
      </MapView>
    );
  },
);

NativeMap.displayName = "NativeMap";

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

const markerStyles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
    alignSelf: "center",
    marginTop: -1,
  },
});

const communityStyles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  initials: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default NativeMap;
