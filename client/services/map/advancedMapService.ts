/**
 * WilderGo Advanced Map Service
 * Handles Weather Layer, Campfire Clustering, and Liquid Ripple effects
 */

import {
  colors,
  socialLayer,
  mapboxConfig,
  animations,
  markerTypes,
} from "@/constants/theme";
import { MapMarkerData, getMarkersForMode, AppMode } from "./mapService";

// ============================================
// WEATHER LAYER TYPES & DATA
// ============================================

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "windy"
  | "fog";

export interface WeatherData {
  id: string;
  latitude: number;
  longitude: number;
  condition: WeatherCondition;
  temperature: number; // Fahrenheit
  humidity: number; // Percentage
  windSpeed: number; // mph
  windDirection: string;
  feelsLike: number;
  uvIndex: number;
  visibility: number; // miles
  timestamp: string;
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  precipChance: number;
}

export interface WeatherAlert {
  id: string;
  type: "warning" | "advisory" | "watch";
  title: string;
  description: string;
  severity: "minor" | "moderate" | "severe" | "extreme";
  affectedArea: { latitude: number; longitude: number; radius: number };
  expiresAt: string;
}

// Weather condition configuration
export const weatherConditionConfig: Record<
  WeatherCondition,
  {
    icon: string;
    color: string;
    overlayColor: string;
    label: string;
  }
> = {
  clear: {
    icon: "sunny",
    color: colors.sunsetOrange[400],
    overlayColor: "rgba(232, 122, 71, 0.1)",
    label: "Clear",
  },
  cloudy: {
    icon: "cloudy",
    color: colors.bark[400],
    overlayColor: "rgba(122, 110, 100, 0.15)",
    label: "Cloudy",
  },
  rain: {
    icon: "rainy",
    color: colors.deepTeal[400],
    overlayColor: "rgba(27, 75, 82, 0.2)",
    label: "Rain",
  },
  storm: {
    icon: "thunderstorm",
    color: colors.bark[700],
    overlayColor: "rgba(58, 48, 40, 0.3)",
    label: "Storm",
  },
  snow: {
    icon: "snow",
    color: colors.bark[200],
    overlayColor: "rgba(220, 214, 208, 0.25)",
    label: "Snow",
  },
  windy: {
    icon: "leaf",
    color: colors.forestGreen[400],
    overlayColor: "rgba(45, 90, 61, 0.1)",
    label: "Windy",
  },
  fog: {
    icon: "cloud",
    color: colors.bark[300],
    overlayColor: "rgba(154, 142, 132, 0.3)",
    label: "Fog",
  },
};

// Mock weather data
const mockWeatherData: WeatherData[] = [
  {
    id: "weather-moab",
    latitude: 38.5733,
    longitude: -109.5498,
    condition: "clear",
    temperature: 78,
    humidity: 25,
    windSpeed: 8,
    windDirection: "NW",
    feelsLike: 76,
    uvIndex: 8,
    visibility: 10,
    timestamp: new Date().toISOString(),
    forecast: [
      { day: "Today", high: 82, low: 55, condition: "clear", precipChance: 0 },
      {
        day: "Tomorrow",
        high: 85,
        low: 58,
        condition: "clear",
        precipChance: 5,
      },
      { day: "Wed", high: 79, low: 54, condition: "cloudy", precipChance: 20 },
      { day: "Thu", high: 72, low: 50, condition: "rain", precipChance: 60 },
      { day: "Fri", high: 75, low: 52, condition: "clear", precipChance: 10 },
    ],
  },
  {
    id: "weather-arches",
    latitude: 38.7833,
    longitude: -109.5925,
    condition: "cloudy",
    temperature: 75,
    humidity: 30,
    windSpeed: 12,
    windDirection: "W",
    feelsLike: 73,
    uvIndex: 6,
    visibility: 8,
    timestamp: new Date().toISOString(),
  },
  {
    id: "weather-monument",
    latitude: 37.0042,
    longitude: -110.0987,
    condition: "windy",
    temperature: 82,
    humidity: 18,
    windSpeed: 22,
    windDirection: "SW",
    feelsLike: 80,
    uvIndex: 9,
    visibility: 10,
    timestamp: new Date().toISOString(),
  },
];

const mockWeatherAlerts: WeatherAlert[] = [
  {
    id: "alert-1",
    type: "advisory",
    title: "High Wind Advisory",
    description: "Winds 25-35 mph with gusts up to 50 mph expected.",
    severity: "moderate",
    affectedArea: { latitude: 37.0042, longitude: -110.0987, radius: 30 },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// CAMPFIRE CLUSTERING TYPES & LOGIC
// ============================================

export interface CampfireCluster {
  id: string;
  latitude: number;
  longitude: number;
  markers: MapMarkerData[];
  count: number;
  type: "small" | "medium" | "large";
  color: string;
  pulseIntensity: number;
  label: string;
}

// Cluster thresholds and colors
const clusterConfig = {
  minPins: socialLayer.clustering.minPins,
  maxRadius: socialLayer.clustering.maxRadius,
  colors: mapboxConfig.cluster.colors,
  thresholds: {
    small: 5,
    medium: 10,
    large: 15,
  },
};

/**
 * Calculate distance between two coordinates in miles
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Cluster nearby markers into campfire clusters
 */
export function clusterMarkers(
  markers: MapMarkerData[],
  zoomLevel: number = 10,
): { clusters: CampfireCluster[]; unclustered: MapMarkerData[] } {
  // Adjust radius based on zoom level
  const adjustedRadius = clusterConfig.maxRadius * (14 / zoomLevel);

  const clusters: CampfireCluster[] = [];
  const unclustered: MapMarkerData[] = [];
  const processed = new Set<string>();

  // Sort markers by latitude for consistent clustering
  const sortedMarkers = [...markers].sort(
    (a, b) => (b.latitude ?? b.lat ?? 0) - (a.latitude ?? a.lat ?? 0),
  );

  for (const marker of sortedMarkers) {
    if (processed.has(marker.id)) continue;

    const markerLat = marker.latitude ?? marker.lat ?? 0;
    const markerLng = marker.longitude ?? marker.lng ?? 0;

    // Find nearby markers
    const nearby = sortedMarkers.filter((m) => {
      if (processed.has(m.id) || m.id === marker.id) return false;
      const mLat = m.latitude ?? m.lat ?? 0;
      const mLng = m.longitude ?? m.lng ?? 0;
      return (
        haversineDistance(markerLat, markerLng, mLat, mLng) <= adjustedRadius
      );
    });

    if (nearby.length >= clusterConfig.minPins - 1) {
      // Create cluster
      const clusterMarkers = [marker, ...nearby];
      clusterMarkers.forEach((m) => processed.add(m.id));

      // Calculate cluster center (centroid)
      const centerLat =
        clusterMarkers.reduce((sum, m) => sum + (m.latitude ?? m.lat ?? 0), 0) /
        clusterMarkers.length;
      const centerLng =
        clusterMarkers.reduce(
          (sum, m) => sum + (m.longitude ?? m.lng ?? 0),
          0,
        ) / clusterMarkers.length;

      // Determine cluster size
      const count = clusterMarkers.length;
      let type: CampfireCluster["type"] = "small";
      let color = clusterConfig.colors.small;
      let pulseIntensity = 0.4;

      if (count >= clusterConfig.thresholds.large) {
        type = "large";
        color = clusterConfig.colors.large;
        pulseIntensity = 0.8;
      } else if (count >= clusterConfig.thresholds.medium) {
        type = "medium";
        color = clusterConfig.colors.medium;
        pulseIntensity = 0.6;
      }

      clusters.push({
        id: `cluster-${marker.id}`,
        latitude: centerLat,
        longitude: centerLng,
        markers: clusterMarkers,
        count,
        type,
        color,
        pulseIntensity,
        label: `${count} Nomads`,
      });
    } else {
      processed.add(marker.id);
      unclustered.push(marker);
    }
  }

  return { clusters, unclustered };
}

// ============================================
// LIQUID RIPPLE MODE TRANSITIONS
// ============================================

export interface ModeTransitionConfig {
  fromMode: AppMode;
  toMode: AppMode;
  color: string;
  duration: number;
  rippleCount: number;
}

export function getModeTransitionConfig(
  fromMode: AppMode,
  toMode: AppMode,
): ModeTransitionConfig {
  const modeColors = {
    friends: colors.forestGreen[600],
    builder: colors.deepTeal[600],
  };

  return {
    fromMode,
    toMode,
    color: modeColors[toMode],
    duration: animations.liquidRipple.duration,
    rippleCount: 2,
  };
}

// ============================================
// SERVICE EXPORTS
// ============================================

// Weather functions
export function getWeatherForLocation(
  latitude: number,
  longitude: number,
): WeatherData | null {
  // Find nearest weather data point
  let nearest: WeatherData | null = null;
  let minDistance = Infinity;

  for (const weather of mockWeatherData) {
    const distance = haversineDistance(
      latitude,
      longitude,
      weather.latitude,
      weather.longitude,
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = weather;
    }
  }

  return nearest;
}

export function getWeatherAlerts(
  latitude: number,
  longitude: number,
  radiusMiles: number = 50,
): WeatherAlert[] {
  return mockWeatherAlerts.filter((alert) => {
    const distance = haversineDistance(
      latitude,
      longitude,
      alert.affectedArea.latitude,
      alert.affectedArea.longitude,
    );
    return distance <= radiusMiles;
  });
}

export function getWeatherOverlayStyle(condition: WeatherCondition): {
  overlayColor: string;
  icon: string;
  label: string;
} {
  const config = weatherConditionConfig[condition];
  return {
    overlayColor: config.overlayColor,
    icon: config.icon,
    label: config.label,
  };
}

// Campfire clustering functions
export function getCampfireClusters(
  mode: AppMode,
  zoomLevel: number = 10,
): { clusters: CampfireCluster[]; unclustered: MapMarkerData[] } {
  const markers = getMarkersForMode(mode);
  return clusterMarkers(markers, zoomLevel);
}

// Get all mock weather data
export function getAllWeatherData(): WeatherData[] {
  return mockWeatherData;
}

export const advancedMapService = {
  // Weather
  getWeatherForLocation,
  getWeatherAlerts,
  getWeatherOverlayStyle,
  getAllWeatherData,
  weatherConditionConfig,
  // Clustering
  clusterMarkers,
  getCampfireClusters,
  // Mode transitions
  getModeTransitionConfig,
};

export default advancedMapService;
