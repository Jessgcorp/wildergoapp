/**
 * WilderGo Convoy Service
 * Manages convoy (group) messaging, member statuses, and live location sharing
 */

import { profileImages, eventImages } from "@/constants/theme";

// Member status types for convoy coordination
export type ConvoyMemberStatus =
  | "en_route"
  | "stationary"
  | "looking_for_camp"
  | "offline";

// Nomadic Pulse environment types
export type NomadicPulseType =
  | "off_grid"
  | "stealth_camping"
  | "rv_park"
  | "urban_discovery"
  | "boondocking"
  | "national_park";

export interface NomadicPulse {
  type: NomadicPulseType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const nomadicPulseOptions: Record<NomadicPulseType, NomadicPulse> = {
  off_grid: {
    type: "off_grid",
    label: "Off-Grid",
    icon: "radio-outline",
    color: "#5A7D60",
    description: "Living off the grid",
  },
  stealth_camping: {
    type: "stealth_camping",
    label: "Stealth",
    icon: "eye-off-outline",
    color: "#685C50",
    description: "Stealth camping",
  },
  rv_park: {
    type: "rv_park",
    label: "RV Park",
    icon: "home-outline",
    color: "#D68A5C",
    description: "At an RV park",
  },
  urban_discovery: {
    type: "urban_discovery",
    label: "Urban",
    icon: "business-outline",
    color: "#7A6E64",
    description: "Urban discovery",
  },
  boondocking: {
    type: "boondocking",
    label: "Boondocking",
    icon: "trail-sign-outline",
    color: "#4A6B50",
    description: "Free camping",
  },
  national_park: {
    type: "national_park",
    label: "National Park",
    icon: "leaf-outline",
    color: "#2E462F",
    description: "At a national park",
  },
};

export interface ConvoyMember {
  id: string;
  name: string;
  avatar?: string;
  status: ConvoyMemberStatus;
  nomadicPulse?: NomadicPulseType;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  destination?: string;
  eta?: string;
  vehicle?: string;
  isOnline: boolean;
  lastSeen?: string;
  routeOverlap?: number;
  interests?: string[];
}

export interface LivePin {
  id: string;
  senderId: string;
  senderName: string;
  latitude: number;
  longitude: number;
  locationName: string;
  pinType:
    | "camp_spot"
    | "meetup"
    | "hazard"
    | "scenic"
    | "resource"
    | "general";
  note?: string;
  timestamp: string;
  expiresAt?: string;
}

export interface ConvoyMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "live_pin" | "status_update" | "system" | "icebreaker";
  timestamp: string;
  livePin?: LivePin;
  statusUpdate?: {
    previousStatus: ConvoyMemberStatus;
    newStatus: ConvoyMemberStatus;
  };
  isAiGenerated?: boolean;
  reactions?: { emoji: string; userId: string }[];
}

export interface Convoy {
  id: string;
  name: string;
  description?: string;
  members: ConvoyMember[];
  messages: ConvoyMessage[];
  destination?: string;
  departureDate?: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
  routeOverlapAverage?: number;
}

// Mock convoy data
const mockMembers: ConvoyMember[] = [
  {
    id: "m1",
    name: "Alex",
    avatar: profileImages.alex,
    status: "en_route",
    nomadicPulse: "boondocking",
    location: { latitude: 38.5733, longitude: -109.5498, name: "Near Moab" },
    destination: "Glacier NP",
    eta: "3 days",
    vehicle: "'98 Sprinter",
    isOnline: true,
    routeOverlap: 85,
    interests: ["Hiking", "Coffee", "Photography"],
  },
  {
    id: "m2",
    name: "Jordan",
    avatar: profileImages.jordan,
    status: "stationary",
    nomadicPulse: "national_park",
    location: { latitude: 38.6833, longitude: -109.4498, name: "Arches NP" },
    destination: "Big Sur",
    vehicle: "Promaster",
    isOnline: true,
    routeOverlap: 72,
    interests: ["Yoga", "Climbing", "Cooking"],
  },
  {
    id: "m3",
    name: "Sam",
    avatar: profileImages.sam,
    status: "looking_for_camp",
    nomadicPulse: "stealth_camping",
    location: { latitude: 38.4533, longitude: -109.6198, name: "Canyonlands" },
    destination: "Pacific NW",
    eta: "5 hours",
    vehicle: "Skoolie",
    isOnline: true,
    routeOverlap: 45,
    interests: ["Music", "Surfing", "Stargazing"],
  },
  {
    id: "m4",
    name: "Sarah",
    avatar: profileImages.sarah,
    status: "offline",
    nomadicPulse: "off_grid",
    vehicle: "Converted School Bus",
    isOnline: false,
    lastSeen: "2h ago",
    interests: ["Solar", "DIY", "Hiking"],
  },
];

const mockLivePin: LivePin = {
  id: "pin1",
  senderId: "m1",
  senderName: "Alex",
  latitude: 38.59,
  longitude: -109.52,
  locationName: "Amazing campspot with cell signal!",
  pinType: "camp_spot",
  note: "Free camping, great views, Verizon works here",
  timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
};

const mockMessages: ConvoyMessage[] = [
  {
    id: "msg1",
    senderId: "system",
    senderName: "System",
    content: "Sam joined the convoy",
    type: "system",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "msg2",
    senderId: "m1",
    senderName: "Alex",
    senderAvatar: profileImages.alex,
    content:
      "Hey everyone! Found an amazing spot near the overlook. Let's meet up!",
    type: "text",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: "msg3",
    senderId: "m1",
    senderName: "Alex",
    senderAvatar: profileImages.alex,
    content: "",
    type: "live_pin",
    timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    livePin: mockLivePin,
  },
  {
    id: "msg4",
    senderId: "m2",
    senderName: "Jordan",
    senderAvatar: profileImages.jordan,
    content:
      "On my way! Should be there in about an hour. Can't wait to check it out!",
    type: "text",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "msg5",
    senderId: "m3",
    senderName: "Sam",
    senderAvatar: profileImages.sam,
    content: "",
    type: "status_update",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    statusUpdate: {
      previousStatus: "stationary",
      newStatus: "looking_for_camp",
    },
  },
  {
    id: "msg6",
    senderId: "m3",
    senderName: "Sam",
    senderAvatar: profileImages.sam,
    content: "Looking for a spot near you guys. Any recommendations?",
    type: "text",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
];

const mockConvoys: Convoy[] = [
  {
    id: "conv1",
    name: "Pacific Coast Convoy",
    description: "Heading up the coast to the Pacific Northwest",
    members: mockMembers,
    messages: mockMessages,
    destination: "Olympic National Park",
    departureDate: "2024-08-20",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isActive: true,
    routeOverlapAverage: 67,
  },
  {
    id: "conv2",
    name: "Desert Nomads",
    description: "Exploring the Southwest deserts together",
    members: mockMembers.slice(0, 2),
    messages: mockMessages.slice(0, 3),
    destination: "Joshua Tree",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    routeOverlapAverage: 78,
  },
];

// Service functions
export function getConvoys(): Convoy[] {
  return mockConvoys;
}

export function getConvoyById(id: string): Convoy | undefined {
  return mockConvoys.find((c) => c.id === id);
}

export function getConvoyMembers(convoyId: string): ConvoyMember[] {
  const convoy = getConvoyById(convoyId);
  return convoy?.members || [];
}

export function getMemberStatusLabel(status: ConvoyMemberStatus): string {
  switch (status) {
    case "en_route":
      return "En Route";
    case "stationary":
      return "Stationary";
    case "looking_for_camp":
      return "Looking for Camp";
    case "offline":
      return "Offline";
    default:
      return "Unknown";
  }
}

export function getMemberStatusColor(status: ConvoyMemberStatus): string {
  switch (status) {
    case "en_route":
      return "#5A7D60"; // Moss green
    case "stationary":
      return "#D68A5C"; // Ember orange
    case "looking_for_camp":
      return "#7A9B80"; // Light moss
    case "offline":
      return "#7A6E64"; // Bark
    default:
      return "#9A8E84";
  }
}

export function getMemberStatusIcon(status: ConvoyMemberStatus): string {
  switch (status) {
    case "en_route":
      return "navigate";
    case "stationary":
      return "location";
    case "looking_for_camp":
      return "search";
    case "offline":
      return "moon";
    default:
      return "help-circle";
  }
}

export function getPinTypeConfig(pinType: LivePin["pinType"]) {
  const configs = {
    camp_spot: { icon: "bonfire", color: "#D68A5C", label: "Camp Spot" },
    meetup: { icon: "people", color: "#5A7D60", label: "Meetup" },
    hazard: { icon: "warning", color: "#C4784A", label: "Hazard" },
    scenic: { icon: "camera", color: "#4A6B50", label: "Scenic" },
    resource: { icon: "water", color: "#6A7B6A", label: "Resource" },
    general: { icon: "pin", color: "#685C50", label: "Location" },
  };
  return configs[pinType] || configs.general;
}

// AI Icebreaker prompts based on shared interests/routes
export function generateIcebreakerContext(
  newMember: ConvoyMember,
  existingMembers: ConvoyMember[],
): string {
  const sharedInterests: string[] = [];
  const newMemberInterests = newMember.interests || [];

  existingMembers.forEach((member) => {
    member.interests?.forEach((interest) => {
      if (
        newMemberInterests.includes(interest) &&
        !sharedInterests.includes(interest)
      ) {
        sharedInterests.push(interest);
      }
    });
  });

  const context = {
    newMemberName: newMember.name,
    newMemberVehicle: newMember.vehicle,
    sharedInterests,
    destination: existingMembers[0]?.destination,
    convoySize: existingMembers.length,
  };

  return `Generate a friendly, casual icebreaker introduction for ${context.newMemberName} who just joined a nomad convoy. They drive a ${context.newMemberVehicle || "van"}. ${sharedInterests.length > 0 ? `They share these interests with the group: ${sharedInterests.join(", ")}.` : ""} The convoy is heading to ${context.destination || "various destinations"}. Keep it brief (2-3 sentences), warm, and nomad-focused.`;
}

export const convoyService = {
  getConvoys,
  getConvoyById,
  getConvoyMembers,
  getMemberStatusLabel,
  getMemberStatusColor,
  getMemberStatusIcon,
  getPinTypeConfig,
  generateIcebreakerContext,
  nomadicPulseOptions,
};

export default convoyService;
