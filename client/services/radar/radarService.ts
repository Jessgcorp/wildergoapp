/**
 * WilderGo Advanced Radar Service
 * "Look Ahead" feature for future nomad/event predictions
 * Route Overlap notifications and match predictions
 */

import { profileImages, eventImages } from "@/constants/theme";

export interface FutureNomad {
  id: string;
  name: string;
  avatar?: string;
  vehicle?: string;
  routeOverlap: number;
  predictedLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  predictedDate: string;
  interests?: string[];
  isMatch?: boolean;
  confidence: number; // 0-100 prediction confidence
}

export interface FutureEvent {
  id: string;
  title: string;
  type: "social" | "activity" | "convoy";
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  date: string;
  expectedAttendees: number;
  host: string;
  imageUrl?: string;
}

export interface LookAheadResult {
  targetDate: string;
  targetLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  nomads: FutureNomad[];
  events: FutureEvent[];
  nomadicDensity: "low" | "medium" | "high";
  recommendation?: string;
}

export interface RouteOverlapNotification {
  id: string;
  type: "route_overlap" | "upcoming_event" | "convoy_forming" | "high_match";
  title: string;
  description: string;
  matchPercentage?: number;
  relatedUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  predictedDate?: string;
  predictedLocation?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  isRead: boolean;
}

// Mock data for Look Ahead predictions
const mockFutureNomads: FutureNomad[] = [
  {
    id: "fn1",
    name: "Alex",
    avatar: profileImages.alex,
    vehicle: "'98 Sprinter",
    routeOverlap: 89,
    predictedLocation: {
      latitude: 48.7596,
      longitude: -113.787,
      name: "Glacier National Park",
    },
    predictedDate: "2024-08-18",
    interests: ["Hiking", "Coffee", "Photography"],
    isMatch: true,
    confidence: 92,
  },
  {
    id: "fn2",
    name: "Jordan",
    avatar: profileImages.jordan,
    vehicle: "Promaster",
    routeOverlap: 76,
    predictedLocation: {
      latitude: 48.7596,
      longitude: -113.787,
      name: "Glacier National Park",
    },
    predictedDate: "2024-08-19",
    interests: ["Yoga", "Climbing", "Cooking"],
    isMatch: true,
    confidence: 85,
  },
  {
    id: "fn3",
    name: "Sam",
    avatar: profileImages.sam,
    vehicle: "Skoolie",
    routeOverlap: 58,
    predictedLocation: {
      latitude: 48.7596,
      longitude: -113.787,
      name: "Glacier National Park",
    },
    predictedDate: "2024-08-20",
    interests: ["Music", "Surfing", "Stargazing"],
    confidence: 72,
  },
  {
    id: "fn4",
    name: "Sarah",
    avatar: profileImages.sarah,
    vehicle: "Transit",
    routeOverlap: 45,
    predictedLocation: {
      latitude: 48.7596,
      longitude: -113.787,
      name: "Glacier National Park",
    },
    predictedDate: "2024-08-21",
    interests: ["Solar", "DIY", "Hiking"],
    confidence: 65,
  },
];

const mockFutureEvents: FutureEvent[] = [
  {
    id: "fe1",
    title: "Glacier Sunrise Hike",
    type: "activity",
    location: {
      latitude: 48.7596,
      longitude: -113.787,
      name: "Glacier National Park",
    },
    date: "2024-08-18",
    expectedAttendees: 8,
    host: "Mountain Nomads",
    imageUrl: eventImages.hiking,
  },
  {
    id: "fe2",
    title: "Lakeside Bonfire",
    type: "social",
    location: {
      latitude: 48.7596,
      longitude: -113.787,
      name: "Lake McDonald",
    },
    date: "2024-08-19",
    expectedAttendees: 15,
    host: "Alex",
    imageUrl: eventImages.bonfire,
  },
];

const mockNotifications: RouteOverlapNotification[] = [
  {
    id: "notif1",
    type: "high_match",
    title: "High Route Match!",
    description:
      "Alex has 89% route overlap with you this week. They're heading to Glacier NP too!",
    matchPercentage: 89,
    relatedUser: {
      id: "fn1",
      name: "Alex",
      avatar: profileImages.alex,
    },
    predictedDate: "2024-08-18",
    predictedLocation: "Glacier National Park",
    priority: "high",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: "notif2",
    type: "convoy_forming",
    title: "New Convoy Forming",
    description:
      "3 nomads are forming a convoy to Olympic NP next week. Join them?",
    predictedDate: "2024-08-25",
    predictedLocation: "Olympic National Park",
    priority: "medium",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: "notif3",
    type: "route_overlap",
    title: "Path Crossing Ahead",
    description: "Jordan's route will cross yours near Yellowstone in 4 days.",
    matchPercentage: 76,
    relatedUser: {
      id: "fn2",
      name: "Jordan",
      avatar: profileImages.jordan,
    },
    predictedDate: "2024-08-22",
    predictedLocation: "Yellowstone NP",
    priority: "medium",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: "notif4",
    type: "upcoming_event",
    title: "Event Near Your Route",
    description:
      "Lakeside Bonfire happening at your next destination. 15 nomads expected!",
    predictedDate: "2024-08-19",
    predictedLocation: "Lake McDonald",
    priority: "low",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

// Service functions
export function getLookAheadPrediction(
  targetDate: string,
  targetLocation: { latitude: number; longitude: number; name: string },
): LookAheadResult {
  // In production, this would call an AI/ML backend for predictions
  const nomads = mockFutureNomads.map((n) => ({
    ...n,
    predictedDate: targetDate,
    predictedLocation: targetLocation,
  }));

  const events = mockFutureEvents.map((e) => ({
    ...e,
    date: targetDate,
    location: targetLocation,
  }));

  const nomadicDensity: "low" | "medium" | "high" =
    nomads.length >= 5 ? "high" : nomads.length >= 2 ? "medium" : "low";

  const recommendation = getRecommendation(nomads, events, nomadicDensity);

  return {
    targetDate,
    targetLocation,
    nomads,
    events,
    nomadicDensity,
    recommendation,
  };
}

function getRecommendation(
  nomads: FutureNomad[],
  events: FutureEvent[],
  density: "low" | "medium" | "high",
): string {
  if (density === "high") {
    const highMatches = nomads.filter((n) => n.routeOverlap >= 70);
    if (highMatches.length >= 2) {
      return `Great timing! ${highMatches.length} high-overlap nomads and ${events.length} events predicted. Consider forming a convoy!`;
    }
    return `Popular destination! ${nomads.length} nomads expected. Book campsites early.`;
  }
  if (density === "medium") {
    return `Good window for meetups. ${nomads.length} nomads expected at this location.`;
  }
  return `Quieter period ahead. Ideal for solitude seekers.`;
}

export function getRouteOverlapNotifications(
  userId: string,
  minOverlap: number = 50,
): RouteOverlapNotification[] {
  // Filter notifications relevant to the user
  return mockNotifications.filter((n) => {
    if (n.type === "high_match" || n.type === "route_overlap") {
      return (n.matchPercentage || 0) >= minOverlap;
    }
    return true;
  });
}

export function getUpcomingRouteMatches(
  userId: string,
  daysAhead: number = 7,
): FutureNomad[] {
  // Get nomads with high route overlap in the coming week
  return mockFutureNomads.filter((n) => n.routeOverlap >= 60);
}

export function getPredictedNomadicDensity(
  latitude: number,
  longitude: number,
  date: string,
): { density: number; trend: "increasing" | "stable" | "decreasing" } {
  // Mock prediction - would be ML-based in production
  const baseDensity = Math.floor(Math.random() * 15) + 5;
  const trends: ("increasing" | "stable" | "decreasing")[] = [
    "increasing",
    "stable",
    "decreasing",
  ];
  const trend = trends[Math.floor(Math.random() * trends.length)];

  return { density: baseDensity, trend };
}

export function getNotificationPriorityColor(
  priority: "low" | "medium" | "high",
): string {
  switch (priority) {
    case "high":
      return "#D68A5C"; // Ember
    case "medium":
      return "#5A7D60"; // Moss
    case "low":
      return "#7A6E64"; // Bark
    default:
      return "#9A8E84";
  }
}

export function getNotificationIcon(
  type: RouteOverlapNotification["type"],
): string {
  switch (type) {
    case "high_match":
      return "heart";
    case "route_overlap":
      return "git-merge";
    case "convoy_forming":
      return "people";
    case "upcoming_event":
      return "flame";
    default:
      return "notifications";
  }
}

export const radarService = {
  getLookAheadPrediction,
  getRouteOverlapNotifications,
  getUpcomingRouteMatches,
  getPredictedNomadicDensity,
  getNotificationPriorityColor,
  getNotificationIcon,
};

export default radarService;
