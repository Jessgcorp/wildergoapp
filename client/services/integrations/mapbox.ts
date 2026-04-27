/**
 * Mapbox Integration Stub
 * Real maps integration for WilderGo
 *
 * To activate:
 * 1. Get Mapbox access token from https://account.mapbox.com/
 * 2. Set MAPBOX_ACCESS_TOKEN in environment
 * 3. Install @rnmapbox/maps package
 */

export interface MapboxConfig {
  accessToken: string;
  style: "streets" | "outdoors" | "satellite" | "dark";
  defaultCenter: {
    latitude: number;
    longitude: number;
  };
  defaultZoom: number;
}

export interface MapboxMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  icon?: "pin" | "user" | "convoy" | "campsite" | "weather";
}

export interface MapboxRoute {
  id: string;
  coordinates: { latitude: number; longitude: number }[];
  color?: string;
  width?: number;
}

const defaultConfig: MapboxConfig = {
  accessToken: "",
  style: "outdoors",
  defaultCenter: { latitude: 38.5733, longitude: -109.5498 },
  defaultZoom: 10,
};

let currentConfig = { ...defaultConfig };

export const MapboxService = {
  initialize: (config: Partial<MapboxConfig>) => {
    currentConfig = { ...currentConfig, ...config };
    console.log("[Mapbox] Initialized with config:", currentConfig.style);
    return true;
  },

  isConfigured: () => {
    return !!currentConfig.accessToken;
  },

  getConfig: () => currentConfig,

  addMarker: (marker: MapboxMarker) => {
    console.log("[Mapbox] Adding marker:", marker.id);
    return marker;
  },

  removeMarker: (markerId: string) => {
    console.log("[Mapbox] Removing marker:", markerId);
    return true;
  },

  drawRoute: (route: MapboxRoute) => {
    console.log("[Mapbox] Drawing route:", route.id);
    return route;
  },

  clearRoute: (routeId: string) => {
    console.log("[Mapbox] Clearing route:", routeId);
    return true;
  },

  centerOnLocation: (latitude: number, longitude: number, zoom?: number) => {
    console.log("[Mapbox] Centering on:", { latitude, longitude, zoom });
    return true;
  },

  setStyle: (style: MapboxConfig["style"]) => {
    currentConfig.style = style;
    console.log("[Mapbox] Style changed to:", style);
    return true;
  },

  getDistanceBetween: (
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number },
  ): number => {
    const R = 3959;
    const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.latitude * Math.PI) / 180) *
        Math.cos((point2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};
