/**
 * Location Tracking Service
 * Real GPS location tracking for WilderGo
 *
 * Uses expo-location for:
 * - Current location
 * - Background tracking
 * - Geofencing
 */

import * as Location from "expo-location";

export interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface LocationSubscription {
  remove: () => void;
}

export interface GeofenceRegion {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

let watchSubscription: Location.LocationSubscription | null = null;
let lastKnownLocation: LocationPoint | null = null;

export const LocationService = {
  requestPermissions: async (): Promise<{
    foreground: boolean;
    background: boolean;
  }> => {
    try {
      const foreground = await Location.requestForegroundPermissionsAsync();
      const background = await Location.requestBackgroundPermissionsAsync();
      return {
        foreground: foreground.status === "granted",
        background: background.status === "granted",
      };
    } catch (error) {
      console.log("[Location] Permission error:", error);
      return { foreground: false, background: false };
    }
  },

  checkPermissions: async (): Promise<{
    foreground: boolean;
    background: boolean;
  }> => {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      const background = await Location.getBackgroundPermissionsAsync();
      return {
        foreground: foreground.status === "granted",
        background: background.status === "granted",
      };
    } catch (error) {
      console.log("[Location] Check permission error:", error);
      return { foreground: false, background: false };
    }
  },

  getCurrentLocation: async (): Promise<LocationPoint | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      lastKnownLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude ?? undefined,
        accuracy: location.coords.accuracy ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: new Date(location.timestamp),
      };
      return lastKnownLocation;
    } catch (error) {
      console.log("[Location] Get current location error:", error);
      return null;
    }
  },

  getLastKnownLocation: (): LocationPoint | null => lastKnownLocation,

  startTracking: async (
    onLocation: (location: LocationPoint) => void,
    options?: {
      accuracy?: "low" | "balanced" | "high" | "highest";
      intervalMs?: number;
      distanceFilter?: number;
    },
  ): Promise<boolean> => {
    try {
      const accuracyMap = {
        low: Location.Accuracy.Low,
        balanced: Location.Accuracy.Balanced,
        high: Location.Accuracy.High,
        highest: Location.Accuracy.Highest,
      };

      watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: accuracyMap[options?.accuracy ?? "high"],
          timeInterval: options?.intervalMs ?? 10000,
          distanceInterval: options?.distanceFilter ?? 10,
        },
        (location) => {
          const point: LocationPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude ?? undefined,
            accuracy: location.coords.accuracy ?? undefined,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
            timestamp: new Date(location.timestamp),
          };
          lastKnownLocation = point;
          onLocation(point);
        },
      );
      console.log("[Location] Tracking started");
      return true;
    } catch (error) {
      console.log("[Location] Start tracking error:", error);
      return false;
    }
  },

  stopTracking: () => {
    if (watchSubscription) {
      watchSubscription.remove();
      watchSubscription = null;
      console.log("[Location] Tracking stopped");
    }
  },

  isTracking: () => !!watchSubscription,

  calculateDistance: (
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

  calculateBearing: (
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number },
  ): number => {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  },

  getGeocode: async (
    latitude: number,
    longitude: number,
  ): Promise<{ city: string; state: string; country: string } | null> => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (results.length > 0) {
        const result = results[0];
        return {
          city: result.city ?? "Unknown",
          state: result.region ?? "Unknown",
          country: result.country ?? "Unknown",
        };
      }
      return null;
    } catch (error) {
      console.log("[Location] Geocode error:", error);
      return null;
    }
  },

  searchAddress: async (
    address: string,
  ): Promise<{ latitude: number; longitude: number; name: string }[]> => {
    try {
      const results = await Location.geocodeAsync(address);
      return results.map((result, index) => ({
        latitude: result.latitude,
        longitude: result.longitude,
        name: address,
      }));
    } catch (error) {
      console.log("[Location] Address search error:", error);
      return [];
    }
  },
};
