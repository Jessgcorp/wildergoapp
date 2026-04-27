/**
 * WilderGo Map Service
 * Handles map data, marker management, and social layer logic
 */

import {
  markerTypes,
  socialLayer,
  profileImages,
  eventImages,
  natureImages,
} from "@/constants/theme";

export type MarkerType = "traveler" | "campfire" | "match" | "builder" | "pin";
export type AppMode = "friends" | "builder";

export interface MapMarkerData {
  id: string;
  type: MarkerType;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  title?: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  // Traveler/Match specific
  age?: number;
  vehicle?: string;
  routeOverlap?: number;
  destination?: string;
  destinationDate?: string;
  interests?: string[];
  online?: boolean;
  // Event specific
  eventType?: "social" | "activity" | "convoy";
  eventName?: string;
  eventTime?: string;
  time?: string;
  participants?: number;
  attendees?: number;
  maxAttendees?: number;
  host?: string;
  activity?: string;
  location?: string;
  description?: string;
  // Builder specific
  specialty?: string;
  rating?: number;
  reviews?: number;
  verified?: boolean;
  availability?: string;
  expertise?: string[];
}

// Mock data for travelers/matches
const mockTravelers: MapMarkerData[] = [
  {
    id: "t1",
    type: "traveler",
    latitude: 38.5733,
    longitude: -109.5498,
    title: "Alex",
    name: "Alex",
    age: 28,
    vehicle: "'98 Sprinter",
    routeOverlap: 85,
    destination: "Glacier NP",
    destinationDate: "Aug 15",
    interests: ["Hiking", "Coffee", "Photography"],
    imageUrl: profileImages.alex,
    online: true,
    subtitle: "Moab, UT",
  },
  {
    id: "t2",
    type: "match",
    latitude: 38.6833,
    longitude: -109.4498,
    title: "Jordan",
    name: "Jordan",
    age: 32,
    vehicle: "Promaster",
    routeOverlap: 72,
    destination: "Big Sur",
    destinationDate: "Sept 1",
    interests: ["Yoga", "Climbing", "Cooking"],
    imageUrl: profileImages.jordan,
    online: true,
    subtitle: "Near Arches NP",
  },
  {
    id: "t3",
    type: "traveler",
    latitude: 38.4533,
    longitude: -109.6198,
    title: "Sam",
    name: "Sam",
    age: 26,
    vehicle: "Skoolie",
    routeOverlap: 45,
    destination: "Pacific NW",
    destinationDate: "Aug 20",
    interests: ["Music", "Surfing", "Stargazing"],
    imageUrl: profileImages.sam,
    online: false,
    subtitle: "Canyonlands",
  },
];

// Mock data for events
const mockEvents: MapMarkerData[] = [
  {
    id: "e1",
    type: "campfire",
    latitude: 38.5933,
    longitude: -109.5098,
    name: "Sunset Bonfire",
    title: "Sunset Bonfire",
    eventName: "Sunset Bonfire Hangout",
    eventTime: "Tonight at 7pm",
    participants: 12,
    host: "Alex",
    activity: "Social",
    imageUrl: eventImages.bonfire,
    subtitle: "Desert Overlook",
  },
  {
    id: "e2",
    type: "campfire",
    latitude: 38.6133,
    longitude: -109.4898,
    name: "Morning Hike",
    title: "Morning Hike",
    eventName: "Delicate Arch Sunrise",
    eventTime: "Tomorrow 5:30am",
    participants: 6,
    host: "Jordan",
    activity: "Hiking",
    imageUrl: eventImages.hiking,
    subtitle: "Arches NP",
  },
  {
    id: "e3",
    type: "campfire",
    latitude: 38.5333,
    longitude: -109.5798,
    name: "Climbing Session",
    title: "Climbing Session",
    eventName: "Fisher Towers Climb",
    eventTime: "Sat 6am",
    participants: 4,
    host: "Sam",
    activity: "Climbing",
    imageUrl: eventImages.climbing,
    subtitle: "Fisher Towers",
  },
];

// Mock data for builders
const mockBuilders: MapMarkerData[] = [
  {
    id: "b1",
    type: "builder",
    latitude: 38.5433,
    longitude: -109.5298,
    title: "Sarah's Solar",
    name: "Sarah",
    specialty: "Electrical Systems",
    rating: 4.9,
    reviews: 47,
    verified: true,
    imageUrl: profileImages.sarah,
    availability: "Available this week",
    expertise: ["Solar Installation", "Battery Systems", "Inverters"],
    subtitle: "Moab Area",
  },
  {
    id: "b2",
    type: "builder",
    latitude: 38.6033,
    longitude: -109.4698,
    title: "VanTech Mike",
    name: "Mike",
    specialty: "Complete Builds",
    rating: 4.8,
    reviews: 32,
    verified: true,
    imageUrl: profileImages.mike,
    availability: "Booked - Available Oct 15",
    expertise: ["Custom Cabinetry", "Insulation", "Plumbing"],
    subtitle: "Near Arches",
  },
];

/**
 * Get markers filtered by current app mode
 */
export function getMarkersForMode(mode: AppMode): MapMarkerData[] {
  const markers: MapMarkerData[] = [];

  switch (mode) {
    case "friends":
      // Show all travelers and events
      markers.push(...mockTravelers);
      markers.push(...mockEvents);
      break;

    case "builder":
      // Show builders only
      markers.push(...mockBuilders);
      break;
  }

  return markers;
}

/**
 * Get marker configuration by type
 */
export function getMarkerConfig(type: MarkerType) {
  return markerTypes[type] || markerTypes.traveler;
}

/**
 * Calculate route overlap glow intensity
 */
export function getRouteOverlapGlow(overlap: number): {
  intensity: number;
  color: string;
} {
  if (overlap >= socialLayer.routeOverlap.high) {
    return { intensity: 0.8, color: "rgba(214, 138, 92, 0.8)" }; // Strong ember
  } else if (overlap >= socialLayer.routeOverlap.medium) {
    return { intensity: 0.5, color: "rgba(214, 138, 92, 0.5)" }; // Medium ember
  } else if (overlap >= socialLayer.routeOverlap.low) {
    return { intensity: 0.3, color: "rgba(214, 138, 92, 0.3)" }; // Light ember
  }
  return { intensity: 0, color: "transparent" };
}

/**
 * Calculate nomadic density for an area
 */
export function calculateNomadicDensity(
  markers: MapMarkerData[],
  centerLat: number,
  centerLng: number,
  radiusMiles: number,
): number {
  const travelers = markers.filter(
    (m) => m.type === "traveler" || m.type === "match",
  );

  // Simple distance calculation (approximate for demo)
  const nearby = travelers.filter((t) => {
    const lat = t.latitude ?? t.lat ?? 0;
    const lng = t.longitude ?? t.lng ?? 0;
    const dLat = lat - centerLat;
    const dLng = lng - centerLng;
    const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 69; // rough miles
    return distance <= radiusMiles;
  });

  return nearby.length;
}

/**
 * Weather condition for a route waypoint
 */
export interface RouteWeatherCondition {
  condition: "clear" | "cloudy" | "rain" | "storm" | "snow" | "fog" | "windy";
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  visibility: number;
  icon: string;
  alert?: {
    type: "warning" | "danger";
    message: string;
    action: string;
  };
}

/**
 * Waypoint with weather data for Smart Route
 */
export interface SmartRouteWaypoint {
  latitude: number;
  longitude: number;
  name: string;
  arrivalTime?: string;
  weather?: RouteWeatherCondition;
  weatherImpact?: "excellent" | "good" | "fair" | "poor" | "dangerous";
  aiRecommendation?: string;
}

/**
 * Get smart route suggestions based on social overlap and weather
 */
export interface SmartRouteSuggestion {
  id: string;
  name: string;
  description: string;
  overlapPercentage: number;
  nomadicDensity: number;
  waypoints: SmartRouteWaypoint[];
  estimatedTravelTime: string;
  highlights: string[];
  weatherSummary?: {
    overallRating: "excellent" | "good" | "fair" | "poor" | "dangerous";
    bestDepartureWindow: string;
    alerts: number;
    recommendation: string;
  };
  aiOptimized?: boolean;
}

export function getSmartRouteSuggestions(): SmartRouteSuggestion[] {
  return [
    {
      id: "route1",
      name: "High Desert Social Loop",
      description:
        "Maximum nomad density route through Moab to Monument Valley",
      overlapPercentage: 78,
      nomadicDensity: 12,
      waypoints: [
        {
          latitude: 38.5733,
          longitude: -109.5498,
          name: "Moab",
          arrivalTime: "Now",
          weather: {
            condition: "clear",
            temperature: 85,
            feelsLike: 88,
            humidity: 15,
            windSpeed: 8,
            precipitation: 0,
            uvIndex: 9,
            visibility: 10,
            icon: "sunny",
          },
          weatherImpact: "excellent",
          aiRecommendation: "Perfect conditions for departure",
        },
        {
          latitude: 38.7833,
          longitude: -109.7498,
          name: "Arches NP",
          arrivalTime: "Tomorrow 2pm",
          weather: {
            condition: "cloudy",
            temperature: 82,
            feelsLike: 84,
            humidity: 25,
            windSpeed: 12,
            precipitation: 10,
            uvIndex: 6,
            visibility: 8,
            icon: "partly-sunny",
          },
          weatherImpact: "good",
          aiRecommendation: "Great for photography - soft light",
        },
        {
          latitude: 37.0042,
          longitude: -110.0987,
          name: "Monument Valley",
          arrivalTime: "Day 3 morning",
          weather: {
            condition: "clear",
            temperature: 92,
            feelsLike: 95,
            humidity: 12,
            windSpeed: 15,
            precipitation: 0,
            uvIndex: 10,
            visibility: 10,
            icon: "sunny",
            alert: {
              type: "warning",
              message: "High UV index - stay hydrated",
              action: "Bring extra water",
            },
          },
          weatherImpact: "good",
          aiRecommendation: "Hot but clear - best views at sunrise/sunset",
        },
      ],
      estimatedTravelTime: "3 days",
      highlights: [
        "3 bonfire events",
        "8 travelers en route",
        "2 vetted builders",
      ],
      weatherSummary: {
        overallRating: "excellent",
        bestDepartureWindow: "Today before 10am",
        alerts: 1,
        recommendation:
          "Ideal route conditions. AI suggests early morning departures to avoid afternoon heat.",
      },
      aiOptimized: true,
    },
    {
      id: "route2",
      name: "Canyon Country Connect",
      description: "Connect with nomads heading to Zion and Bryce",
      overlapPercentage: 65,
      nomadicDensity: 8,
      waypoints: [
        {
          latitude: 38.5733,
          longitude: -109.5498,
          name: "Moab",
          arrivalTime: "Now",
          weather: {
            condition: "clear",
            temperature: 85,
            feelsLike: 88,
            humidity: 15,
            windSpeed: 8,
            precipitation: 0,
            uvIndex: 9,
            visibility: 10,
            icon: "sunny",
          },
          weatherImpact: "excellent",
        },
        {
          latitude: 37.2982,
          longitude: -113.0263,
          name: "Zion NP",
          arrivalTime: "Day 2 afternoon",
          weather: {
            condition: "rain",
            temperature: 72,
            feelsLike: 70,
            humidity: 65,
            windSpeed: 18,
            precipitation: 45,
            uvIndex: 3,
            visibility: 5,
            icon: "rainy",
            alert: {
              type: "warning",
              message: "Flash flood risk in slot canyons",
              action: "Avoid The Narrows hike",
            },
          },
          weatherImpact: "fair",
          aiRecommendation: "Consider delay - rain clears by evening",
        },
        {
          latitude: 37.6283,
          longitude: -112.1677,
          name: "Bryce Canyon",
          arrivalTime: "Day 4 morning",
          weather: {
            condition: "clear",
            temperature: 68,
            feelsLike: 66,
            humidity: 30,
            windSpeed: 10,
            precipitation: 0,
            uvIndex: 7,
            visibility: 10,
            icon: "sunny",
          },
          weatherImpact: "excellent",
          aiRecommendation: "Perfect stargazing conditions",
        },
      ],
      estimatedTravelTime: "4 days",
      highlights: ["2 hiking groups", "5 travelers with overlap", "1 builder"],
      weatherSummary: {
        overallRating: "good",
        bestDepartureWindow: "Tomorrow morning",
        alerts: 1,
        recommendation:
          "Rain expected at Zion on Day 2. AI suggests departing tomorrow to arrive after weather clears.",
      },
      aiOptimized: true,
    },
    {
      id: "route3",
      name: "Pacific Northwest Trail",
      description: "Follow the nomad migration to cooler climates",
      overlapPercentage: 52,
      nomadicDensity: 15,
      waypoints: [
        {
          latitude: 38.5733,
          longitude: -109.5498,
          name: "Moab",
          arrivalTime: "Now",
          weather: {
            condition: "clear",
            temperature: 85,
            feelsLike: 88,
            humidity: 15,
            windSpeed: 8,
            precipitation: 0,
            uvIndex: 9,
            visibility: 10,
            icon: "sunny",
          },
          weatherImpact: "excellent",
        },
        {
          latitude: 43.8041,
          longitude: -110.7139,
          name: "Grand Teton",
          arrivalTime: "Day 3",
          weather: {
            condition: "cloudy",
            temperature: 62,
            feelsLike: 58,
            humidity: 55,
            windSpeed: 20,
            precipitation: 30,
            uvIndex: 4,
            visibility: 7,
            icon: "partly-sunny",
          },
          weatherImpact: "good",
          aiRecommendation: "Cooler temps - bring layers",
        },
        {
          latitude: 45.5152,
          longitude: -122.6784,
          name: "Portland",
          arrivalTime: "Day 7",
          weather: {
            condition: "cloudy",
            temperature: 58,
            feelsLike: 55,
            humidity: 70,
            windSpeed: 12,
            precipitation: 40,
            uvIndex: 2,
            visibility: 6,
            icon: "cloudy",
          },
          weatherImpact: "fair",
          aiRecommendation: "Typical PNW weather - pack rain gear",
        },
      ],
      estimatedTravelTime: "7 days",
      highlights: ["Multiple convoy opportunities", "15+ nomads", "5 builders"],
      weatherSummary: {
        overallRating: "good",
        bestDepartureWindow: "Within 2 days",
        alerts: 0,
        recommendation:
          "Long route with variable weather. AI recommends flexible schedule for best conditions.",
      },
      aiOptimized: true,
    },
  ];
}

// Google Maps API functions
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

/**
 * Get route between two points
 * Returns route with distance, duration, and polyline
 */
export const getRoute = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) => {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${origin.latitude},${origin.longitude}&` +
      `destination=${destination.latitude},${destination.longitude}&` +
      `key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        success: true,
        distance: leg.distance.text,
        distanceValue: leg.distance.value,
        duration: leg.duration.text,
        durationValue: leg.duration.value,
        polyline: route.overview_polyline.points,
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ""),
          distance: step.distance.text,
          duration: step.duration.text,
          location: step.start_location,
        })),
        startAddress: leg.start_address,
        endAddress: leg.end_address,
      };
    } else {
      return {
        success: false,
        error: `Directions API error: ${data.status}`,
      };
    }
  } catch (error: any) {
    console.error("Error getting route:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get multiple route options (fastest, shortest, etc.)
 */
export const getRouteOptions = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) => {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${origin.latitude},${origin.longitude}&` +
      `destination=${destination.latitude},${destination.longitude}&` +
      `alternatives=true&` +
      `key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      return {
        success: true,
        routes: data.routes.map((route: any, index: number) => ({
          id: index,
          summary: route.summary,
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
          polyline: route.overview_polyline.points,
        })),
      };
    } else {
      return { success: false, error: data.status };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Convert address to coordinates (geocoding)
 */
export const geocodeAddress = async (address: string) => {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(address)}&` +
      `key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      return {
        success: true,
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: data.results[0].formatted_address,
        placeId: data.results[0].place_id,
      };
    } else {
      return { success: false, error: data.status };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Convert coordinates to address (reverse geocoding)
 */
export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `latlng=${latitude},${longitude}&` +
      `key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      return {
        success: true,
        address: data.results[0].formatted_address,
        city:
          data.results[0].address_components.find((c: any) =>
            c.types.includes("locality"),
          )?.long_name || "",
        state:
          data.results[0].address_components.find((c: any) =>
            c.types.includes("administrative_area_level_1"),
          )?.short_name || "",
      };
    } else {
      return { success: false, error: data.status };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Search for places (for location autocomplete)
 */
export const searchPlaces = async (
  searchText: string,
  location: { latitude: number; longitude: number } | null = null,
) => {
  try {
    let url =
      `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
      `query=${encodeURIComponent(searchText)}&` +
      `key=${GOOGLE_MAPS_API_KEY}`;

    if (location) {
      url += `&location=${location.latitude},${location.longitude}&radius=50000`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      return {
        success: true,
        places: data.results.map((place: any) => ({
          name: place.name,
          address: place.formatted_address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          placeId: place.place_id,
        })),
      };
    } else {
      return { success: false, error: data.status };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return {
    miles: Math.round(distance * 10) / 10,
    kilometers: Math.round(distance * 1.60934 * 10) / 10,
  };
};

/**
 * Decode Google Maps polyline into coordinates array
 */
export const decodePolyline = (encoded: string) => {
  const poly: { latitude: number; longitude: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }
  return poly;
};

export const mapService = {
  getMarkersForMode,
  getMarkerConfig,
  getRouteOverlapGlow,
  calculateNomadicDensity,
  getSmartRouteSuggestions,
  // Google Maps functions
  getRoute,
  getRouteOptions,
  geocodeAddress,
  reverseGeocode,
  searchPlaces,
  calculateDistance,
  decodePolyline,
};

export default mapService;
