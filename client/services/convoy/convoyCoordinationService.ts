/**
 * WilderGo Convoy Coordination Service
 * Premium coordination tools for nomadic groups:
 * - Shared route planning with stops (fuel, water, campsites)
 * - Live coordinate sharing
 * - Rig Break Flare emergency system
 */

import { colors } from "@/constants/theme";

// Route Stop Types
export type RouteStopType =
  | "fuel"
  | "water"
  | "campsite"
  | "blm_land"
  | "rest_area"
  | "grocery"
  | "dump_station"
  | "propane"
  | "repair_shop"
  | "scenic_viewpoint"
  | "custom";

export interface RouteStop {
  id: string;
  type: RouteStopType;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  addedBy: string;
  addedAt: string;
  notes?: string;
  estimatedArrival?: string;
  isConfirmed: boolean;
  votes: number;
  voterIds: string[];
  amenities?: string[];
  priceLevel?: number; // 1-4 for cost indication
  rating?: number;
}

export interface ConvoyRoute {
  id: string;
  convoyId: string;
  name: string;
  startLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  endLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  stops: RouteStop[];
  totalDistance: number; // miles
  estimatedDuration: number; // hours
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: "planning" | "active" | "completed";
}

// Rig Break Flare Types
export type RigBreakSeverity = "minor" | "moderate" | "severe" | "emergency";

export interface RigBreakFlare {
  id: string;
  convoyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rigName: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  severity: RigBreakSeverity;
  issueType: string;
  description: string;
  createdAt: string;
  isActive: boolean;
  respondersCount: number;
  responderIds: string[];
  estimatedHelp?: string;
  photos?: string[];
  resolved: boolean;
  resolvedAt?: string;
}

// Live Coordinate Update
export interface LiveCoordinate {
  id: string;
  convoyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  status: "moving" | "stopped" | "parked";
  battery?: number;
  signal?: number;
}

// Route Stop Configuration
export const routeStopConfig: Record<
  RouteStopType,
  {
    icon: string;
    label: string;
    color: string;
    description: string;
  }
> = {
  fuel: {
    icon: "car",
    label: "Fuel",
    color: colors.sunsetOrange[500],
    description: "Gas station or fuel stop",
  },
  water: {
    icon: "water",
    label: "Water",
    color: colors.deepTeal[500],
    description: "Fresh water fill station",
  },
  campsite: {
    icon: "bonfire",
    label: "Campsite",
    color: colors.forestGreen[600],
    description: "Campground or overnight spot",
  },
  blm_land: {
    icon: "leaf",
    label: "BLM Land",
    color: colors.forestGreen[500],
    description: "Free dispersed camping",
  },
  rest_area: {
    icon: "bed",
    label: "Rest Area",
    color: colors.bark[500],
    description: "Highway rest stop",
  },
  grocery: {
    icon: "cart",
    label: "Grocery",
    color: colors.burntSienna[500],
    description: "Grocery store or market",
  },
  dump_station: {
    icon: "trash",
    label: "Dump Station",
    color: colors.bark[600],
    description: "RV dump station",
  },
  propane: {
    icon: "flame",
    label: "Propane",
    color: colors.sunsetOrange[600],
    description: "Propane refill location",
  },
  repair_shop: {
    icon: "construct",
    label: "Repair Shop",
    color: colors.deepTeal[600],
    description: "Mechanic or repair service",
  },
  scenic_viewpoint: {
    icon: "camera",
    label: "Viewpoint",
    color: colors.forestGreen[400],
    description: "Scenic overlook or photo spot",
  },
  custom: {
    icon: "location",
    label: "Custom Stop",
    color: colors.desertSand[700],
    description: "Custom waypoint",
  },
};

// Rig Break Configuration
export const rigBreakConfig: Record<
  RigBreakSeverity,
  {
    label: string;
    color: string;
    icon: string;
    description: string;
  }
> = {
  minor: {
    label: "Minor Issue",
    color: colors.desertSand[600],
    icon: "alert-circle",
    description: "Non-urgent, can continue safely",
  },
  moderate: {
    label: "Moderate Issue",
    color: colors.sunsetOrange[500],
    icon: "warning",
    description: "Should address soon",
  },
  severe: {
    label: "Severe Issue",
    color: colors.burntSienna[600],
    icon: "alert",
    description: "Cannot continue, need assistance",
  },
  emergency: {
    label: "Emergency",
    color: colors.emergency.red,
    icon: "flash",
    description: "Immediate help needed",
  },
};

// Mock Data for Convoy Routes
const mockConvoyRoutes: ConvoyRoute[] = [
  {
    id: "route-1",
    convoyId: "convoy-1",
    name: "Moab to Glacier National Park",
    startLocation: {
      name: "Moab, UT",
      latitude: 38.5733,
      longitude: -109.5498,
    },
    endLocation: {
      name: "Glacier NP, MT",
      latitude: 48.7596,
      longitude: -113.787,
    },
    stops: [
      {
        id: "stop-1",
        type: "fuel",
        name: "Green River Gas",
        latitude: 38.995,
        longitude: -110.1591,
        addedBy: "Alex",
        addedAt: "2024-01-15T10:00:00Z",
        isConfirmed: true,
        votes: 4,
        voterIds: ["user-1", "user-2", "user-3", "user-4"],
        priceLevel: 2,
      },
      {
        id: "stop-2",
        type: "campsite",
        name: "Grand Teton Campground",
        latitude: 43.7904,
        longitude: -110.6818,
        addedBy: "Jordan",
        addedAt: "2024-01-15T11:00:00Z",
        notes: "Beautiful views, book in advance!",
        isConfirmed: true,
        votes: 5,
        voterIds: ["user-1", "user-2", "user-3", "user-4", "user-5"],
        rating: 4.8,
      },
      {
        id: "stop-3",
        type: "water",
        name: "Jackson Water Fill",
        latitude: 43.4799,
        longitude: -110.7624,
        addedBy: "Sam",
        addedAt: "2024-01-15T12:00:00Z",
        isConfirmed: false,
        votes: 2,
        voterIds: ["user-1", "user-2"],
        amenities: ["potable water", "dump station"],
      },
      {
        id: "stop-4",
        type: "scenic_viewpoint",
        name: "Snake River Overlook",
        latitude: 43.7557,
        longitude: -110.675,
        addedBy: "Alex",
        addedAt: "2024-01-15T13:00:00Z",
        notes: "Iconic Ansel Adams photo spot!",
        isConfirmed: true,
        votes: 6,
        voterIds: ["user-1", "user-2", "user-3", "user-4", "user-5", "user-6"],
      },
    ],
    totalDistance: 750,
    estimatedDuration: 12,
    createdBy: "Alex",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T14:00:00Z",
    status: "active",
  },
];

// Mock Rig Break Flares
const mockRigBreakFlares: RigBreakFlare[] = [
  {
    id: "flare-1",
    convoyId: "convoy-1",
    userId: "user-3",
    userName: "Sam",
    userAvatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
    rigName: "Freedom Machine",
    location: {
      latitude: 38.895,
      longitude: -110.0591,
      address: "Highway 191, Green River, UT",
    },
    severity: "moderate",
    issueType: "Flat Tire",
    description:
      "Rear driver side tire blowout. Have a spare but could use an extra hand.",
    createdAt: "2024-01-15T14:30:00Z",
    isActive: true,
    respondersCount: 2,
    responderIds: ["user-1", "user-2"],
    estimatedHelp: "15 minutes",
    resolved: false,
  },
];

// Mock Live Coordinates
const mockLiveCoordinates: LiveCoordinate[] = [
  {
    id: "coord-1",
    convoyId: "convoy-1",
    userId: "user-1",
    userName: "Alex",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    latitude: 38.6733,
    longitude: -109.6498,
    heading: 45,
    speed: 55,
    timestamp: "2024-01-15T15:00:00Z",
    status: "moving",
    battery: 85,
    signal: 4,
  },
  {
    id: "coord-2",
    convoyId: "convoy-1",
    userId: "user-2",
    userName: "Jordan",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    latitude: 38.62,
    longitude: -109.58,
    heading: 45,
    speed: 52,
    timestamp: "2024-01-15T15:00:00Z",
    status: "moving",
    battery: 72,
    signal: 3,
  },
  {
    id: "coord-3",
    convoyId: "convoy-1",
    userId: "user-3",
    userName: "Sam",
    latitude: 38.895,
    longitude: -110.0591,
    timestamp: "2024-01-15T14:30:00Z",
    status: "stopped",
    battery: 45,
    signal: 2,
  },
];

// Service Functions

export function getConvoyRoute(convoyId: string): ConvoyRoute | null {
  return mockConvoyRoutes.find((r) => r.convoyId === convoyId) || null;
}

export function getConvoyRoutes(): ConvoyRoute[] {
  return mockConvoyRoutes;
}

export function addRouteStop(
  routeId: string,
  stop: Omit<RouteStop, "id" | "votes" | "voterIds" | "isConfirmed">,
): RouteStop {
  const newStop: RouteStop = {
    ...stop,
    id: `stop-${Date.now()}`,
    votes: 1,
    voterIds: [stop.addedBy],
    isConfirmed: false,
  };

  const route = mockConvoyRoutes.find((r) => r.id === routeId);
  if (route) {
    route.stops.push(newStop);
    route.updatedAt = new Date().toISOString();
  }

  return newStop;
}

export function voteForStop(
  routeId: string,
  stopId: string,
  userId: string,
): void {
  const route = mockConvoyRoutes.find((r) => r.id === routeId);
  if (route) {
    const stop = route.stops.find((s) => s.id === stopId);
    if (stop && !stop.voterIds.includes(userId)) {
      stop.votes += 1;
      stop.voterIds.push(userId);
      // Auto-confirm if 3+ votes
      if (stop.votes >= 3) {
        stop.isConfirmed = true;
      }
    }
  }
}

export function removeRouteStop(routeId: string, stopId: string): void {
  const route = mockConvoyRoutes.find((r) => r.id === routeId);
  if (route) {
    route.stops = route.stops.filter((s) => s.id !== stopId);
    route.updatedAt = new Date().toISOString();
  }
}

// Rig Break Flare Functions

export function createRigBreakFlare(
  flare: Omit<
    RigBreakFlare,
    "id" | "respondersCount" | "responderIds" | "resolved" | "isActive"
  >,
): RigBreakFlare {
  const newFlare: RigBreakFlare = {
    ...flare,
    id: `flare-${Date.now()}`,
    respondersCount: 0,
    responderIds: [],
    resolved: false,
    isActive: true,
  };

  mockRigBreakFlares.push(newFlare);
  return newFlare;
}

export function getActiveFlares(convoyId: string): RigBreakFlare[] {
  return mockRigBreakFlares.filter(
    (f) => f.convoyId === convoyId && f.isActive && !f.resolved,
  );
}

export function getAllFlares(convoyId: string): RigBreakFlare[] {
  return mockRigBreakFlares.filter((f) => f.convoyId === convoyId);
}

export function respondToFlare(flareId: string, userId: string): void {
  const flare = mockRigBreakFlares.find((f) => f.id === flareId);
  if (flare && !flare.responderIds.includes(userId)) {
    flare.responderIds.push(userId);
    flare.respondersCount += 1;
  }
}

export function resolveFlare(flareId: string): void {
  const flare = mockRigBreakFlares.find((f) => f.id === flareId);
  if (flare) {
    flare.resolved = true;
    flare.resolvedAt = new Date().toISOString();
    flare.isActive = false;
  }
}

// Live Coordinate Functions

export function getLiveCoordinates(convoyId: string): LiveCoordinate[] {
  return mockLiveCoordinates.filter((c) => c.convoyId === convoyId);
}

export function updateLiveCoordinate(coordinate: LiveCoordinate): void {
  const index = mockLiveCoordinates.findIndex(
    (c) => c.convoyId === coordinate.convoyId && c.userId === coordinate.userId,
  );
  if (index >= 0) {
    mockLiveCoordinates[index] = coordinate;
  } else {
    mockLiveCoordinates.push(coordinate);
  }
}

export function shareCoordinateToChat(
  convoyId: string,
  userId: string,
  latitude: number,
  longitude: number,
  message?: string,
): {
  type: "coordinate_share";
  latitude: number;
  longitude: number;
  message?: string;
  timestamp: string;
} {
  return {
    type: "coordinate_share",
    latitude,
    longitude,
    message,
    timestamp: new Date().toISOString(),
  };
}

// Helper functions

export function getStopIcon(type: RouteStopType): string {
  return routeStopConfig[type].icon;
}

export function getStopColor(type: RouteStopType): string {
  return routeStopConfig[type].color;
}

export function getStopLabel(type: RouteStopType): string {
  return routeStopConfig[type].label;
}

export function getSeverityColor(severity: RigBreakSeverity): string {
  return rigBreakConfig[severity].color;
}

export function getSeverityLabel(severity: RigBreakSeverity): string {
  return rigBreakConfig[severity].label;
}

export function formatEstimatedArrival(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function calculateDistanceBetweenCoords(
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
  return Math.round(R * c);
}

export const convoyCoordinationService = {
  getConvoyRoute,
  getConvoyRoutes,
  addRouteStop,
  voteForStop,
  removeRouteStop,
  createRigBreakFlare,
  getActiveFlares,
  getAllFlares,
  respondToFlare,
  resolveFlare,
  getLiveCoordinates,
  updateLiveCoordinate,
  shareCoordinateToChat,
  getStopIcon,
  getStopColor,
  getStopLabel,
  getSeverityColor,
  getSeverityLabel,
  formatEstimatedArrival,
  calculateDistanceBetweenCoords,
  routeStopConfig,
  rigBreakConfig,
};

export default convoyCoordinationService;
