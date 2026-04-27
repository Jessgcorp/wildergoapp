/**
 * Smart Route Service
 * Provides route calculation with REAL weather and road risk data
 */

import { getCurrentWeather } from "@/services/weather/weatherService";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface WeatherPoint {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
}

export interface SafetyData {
  level: "safe" | "caution" | "warning";
  score: number;
  warnings: string[];
  recommendations: string[];
}

export interface SmartRouteData {
  success: boolean;
  coordinates: Coordinate[];
  distance: string;
  duration: string;
  weather: {
    start: WeatherPoint;
    middle: WeatherPoint;
    end: WeatherPoint;
  };
  safety: SafetyData;
}

function generateRouteCoordinates(
  origin: Coordinate,
  destination: Coordinate,
  numPoints: number = 20,
): Coordinate[] {
  const coordinates: Coordinate[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    const curve = Math.sin(ratio * Math.PI) * 0.02;

    coordinates.push({
      latitude:
        origin.latitude +
        (destination.latitude - origin.latitude) * ratio +
        curve,
      longitude:
        origin.longitude + (destination.longitude - origin.longitude) * ratio,
    });
  }

  return coordinates;
}

function calculateDistance(
  origin: Coordinate,
  destination: Coordinate,
): number {
  const R = 3959;
  const dLat = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const dLon = ((destination.longitude - origin.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.latitude * Math.PI) / 180) *
      Math.cos((destination.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchRealWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherPoint> {
  try {
    const weather = await getCurrentWeather(latitude, longitude);
    if (weather.success) {
      return {
        temperature: weather.temperature || 0,
        condition: weather.condition || "Clear",
        description: weather.description || "clear sky",
        humidity: weather.humidity || 50,
        windSpeed: weather.windSpeed || 0,
      };
    }
  } catch (error) {
    console.warn("Failed to fetch real weather, using fallback:", error);
  }
  return {
    temperature: 55,
    condition: "Clear",
    description: "Weather data unavailable",
    humidity: 50,
    windSpeed: 5,
  };
}

function generateSafetyData(weather: {
  start: WeatherPoint;
  middle: WeatherPoint;
  end: WeatherPoint;
}): SafetyData {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const allConditions = [
    weather.start.condition,
    weather.middle.condition,
    weather.end.condition,
  ];

  if (allConditions.includes("Snow")) {
    warnings.push("Snow expected along route - reduced visibility");
    recommendations.push("Carry tire chains and emergency supplies");
    score -= 25;
  }

  if (allConditions.includes("Rain")) {
    warnings.push("Rain forecasted - slippery roads possible");
    recommendations.push("Reduce speed and increase following distance");
    score -= 15;
  }

  if (allConditions.includes("Mist") || allConditions.includes("Fog")) {
    warnings.push("Foggy conditions expected - limited visibility");
    recommendations.push("Use low-beam headlights");
    score -= 10;
  }

  if (allConditions.includes("Thunderstorm")) {
    warnings.push("Thunderstorms along route - severe weather risk");
    recommendations.push("Consider delaying departure or finding shelter");
    score -= 30;
  }

  const temps = [
    weather.start.temperature,
    weather.middle.temperature,
    weather.end.temperature,
  ];
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  if (minTemp < 32) {
    warnings.push("Freezing temperatures - watch for black ice");
    recommendations.push("Check tire pressure and antifreeze levels");
    score -= 20;
  }

  if (maxTemp > 90) {
    warnings.push("High temperatures - risk of overheating");
    recommendations.push("Check coolant and carry extra water");
    score -= 10;
  }

  const maxWind = Math.max(
    weather.start.windSpeed,
    weather.middle.windSpeed,
    weather.end.windSpeed,
  );
  if (maxWind > 20) {
    warnings.push(
      `High winds up to ${maxWind} mph - use caution with trailers`,
    );
    recommendations.push("Secure loose items and reduce speed");
    score -= 15;
  }

  if (recommendations.length === 0) {
    recommendations.push("Safe driving conditions expected");
    recommendations.push("Take regular breaks every 2 hours");
  }

  let level: "safe" | "caution" | "warning";
  if (score >= 80) {
    level = "safe";
  } else if (score >= 50) {
    level = "caution";
  } else {
    level = "warning";
  }

  return {
    level,
    score: Math.max(0, score),
    warnings,
    recommendations,
  };
}

function decodePolyline(encoded: string): Coordinate[] {
  const coordinates: Coordinate[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

async function fetchDirectionsRoute(
  origin: Coordinate,
  destination: Coordinate,
): Promise<{
  coordinates: Coordinate[];
  distance: string;
  duration: string;
} | null> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not available, using fallback route");
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn("Directions API request failed:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.warn("Directions API returned no routes");
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];
    const encodedPolyline = route.overview_polyline?.points;

    if (!encodedPolyline) {
      console.warn("Directions API returned no polyline");
      return null;
    }

    const coordinates = decodePolyline(encodedPolyline);
    const distance = leg.distance?.text || "";
    const duration = leg.duration?.text || "";

    return { coordinates, distance, duration };
  } catch (error) {
    console.warn("Directions API error, using fallback route:", error);
    return null;
  }
}

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !query.trim()) return [];

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=geocode|establishment&components=country:us&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) return [];

    const data = await response.json();

    if (data.status !== "OK" || !data.predictions) return [];

    return data.predictions.map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text || p.description,
      secondaryText: p.structured_formatting?.secondary_text || "",
    }));
  } catch (error) {
    console.warn("Place search error:", error);
    return [];
  }
}

export async function getPlaceCoordinates(
  placeId: string,
  placeName?: string,
): Promise<{ coordinate: Coordinate; name: string } | null> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address&key=${apiKey}`;
    console.log("[SmartRoute] Fetching place details for:", placeId);
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      console.log("[SmartRoute] Place details status:", data.status);

      if (data.status === "OK" && data.result?.geometry?.location) {
        return {
          coordinate: {
            latitude: data.result.geometry.location.lat,
            longitude: data.result.geometry.location.lng,
          },
          name:
            data.result.name || data.result.formatted_address || "Destination",
        };
      }
    }
  } catch (error) {
    console.warn(
      "[SmartRoute] Place details failed, trying geocode fallback:",
      error,
    );
  }

  if (placeName) {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=${apiKey}`;
      console.log("[SmartRoute] Trying geocode fallback for:", placeName);
      const response = await fetch(geocodeUrl);

      if (response.ok) {
        const data = await response.json();
        console.log("[SmartRoute] Geocode status:", data.status);

        if (data.status === "OK" && data.results?.length > 0) {
          const result = data.results[0];
          return {
            coordinate: {
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng,
            },
            name: result.formatted_address?.split(",")[0] || placeName,
          };
        }
      }
    } catch (error) {
      console.warn("[SmartRoute] Geocode fallback also failed:", error);
    }
  }

  return null;
}

export async function getSmartRoute(
  origin: Coordinate,
  destination: Coordinate,
): Promise<SmartRouteData> {
  const directionsResult = await fetchDirectionsRoute(origin, destination);

  let coordinates: Coordinate[];
  let distance: string;
  let duration: string;

  if (directionsResult) {
    coordinates = directionsResult.coordinates;
    distance = directionsResult.distance;
    duration = directionsResult.duration;
  } else {
    coordinates = generateRouteCoordinates(origin, destination);
    const distanceMiles = calculateDistance(origin, destination);
    const durationHours = distanceMiles / 55;

    distance =
      distanceMiles < 1
        ? `${Math.round(distanceMiles * 5280)} ft`
        : `${distanceMiles.toFixed(1)} mi`;

    const hours = Math.floor(durationHours);
    const minutes = Math.round((durationHours - hours) * 60);
    duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
  }

  const midCoord = coordinates[Math.floor(coordinates.length / 2)];

  const [startWeather, middleWeather, endWeather] = await Promise.all([
    fetchRealWeather(origin.latitude, origin.longitude),
    fetchRealWeather(midCoord.latitude, midCoord.longitude),
    fetchRealWeather(destination.latitude, destination.longitude),
  ]);

  const weather = {
    start: startWeather,
    middle: middleWeather,
    end: endWeather,
  };

  const safety = generateSafetyData(weather);

  return {
    success: true,
    coordinates,
    distance,
    duration,
    weather,
    safety,
  };
}

export function getWeatherIconName(condition: string): string {
  const iconMap: Record<string, string> = {
    Clear: "sunny",
    Clouds: "cloud",
    Rain: "rainy",
    Snow: "snow",
    Thunderstorm: "thunderstorm",
    Drizzle: "rainy",
    Mist: "water",
    Fog: "water",
  };
  return iconMap[condition] || "partly-sunny";
}

export function getRoadRiskColor(level: string): string {
  switch (level) {
    case "safe":
      return "#2D5A3D";
    case "caution":
      return "#F2A154";
    case "warning":
      return "#D94848";
    default:
      return "#2D5A3D";
  }
}
