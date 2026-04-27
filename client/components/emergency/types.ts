/**
 * Emergency Help System Types
 * SOS Ecosystem for WilderGo
 */

export type EmergencyCategory =
  | "mechanical"
  | "medical"
  | "security"
  | "supplies";

export type EmergencyPriority = "critical" | "urgent" | "assistance";

export type HelpRequestStatus =
  | "pending"
  | "broadcasting"
  | "responded"
  | "resolved"
  | "cancelled";

export interface EmergencyCategoryInfo {
  id: EmergencyCategory;
  label: string;
  icon: string;
  description: string;
  color: string;
  examples: string[];
}

export const EMERGENCY_CATEGORIES: Record<
  EmergencyCategory,
  EmergencyCategoryInfo
> = {
  mechanical: {
    id: "mechanical",
    label: "Mechanical",
    icon: "build",
    description: "Vehicle breakdowns, tire issues, engine trouble",
    color: "#E87A47", // Sunset Orange
    examples: [
      "Flat tire",
      "Engine won't start",
      "Transmission issues",
      "Alternator failure",
    ],
  },
  medical: {
    id: "medical",
    label: "Medical",
    icon: "medkit",
    description: "Health emergencies, injuries, illness",
    color: "#DC2626", // Red
    examples: ["Allergic reaction", "Injury", "Illness", "Need medication"],
  },
  security: {
    id: "security",
    label: "Security",
    icon: "shield-checkmark",
    description: "Safety concerns, suspicious activity",
    color: "#C65D3B", // Burnt Sienna
    examples: ["Suspicious person", "Feel unsafe", "Theft", "Need escort"],
  },
  supplies: {
    id: "supplies",
    label: "Supplies",
    icon: "cube",
    description: "Running low on essentials, need resources",
    color: "#2D5A3D", // Forest Green
    examples: [
      "Low on water",
      "Need fuel",
      "Food supplies",
      "Equipment needed",
    ],
  },
};

export interface HelpRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rigName?: string;
  category: EmergencyCategory;
  priority: EmergencyPriority;
  description: string;
  status: HelpRequestStatus;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  nomadicPulse?: {
    heading: string;
    currentLocation: string;
    travelingWith?: number;
  };
  createdAt: string;
  updatedAt: string;
  respondersCount: number;
  respondersNotified: number;
  aiTriageAdvice?: string;
  aiIcebreakers?: string[];
}

export interface HelpResponse {
  id: string;
  requestId: string;
  responderId: string;
  responderName: string;
  responderAvatar?: string;
  message?: string;
  eta?: string;
  distance: number; // in miles
  status: "offered" | "accepted" | "en_route" | "arrived" | "completed";
  createdAt: string;
}

export interface NearbyAlert {
  request: HelpRequest;
  distance: number;
  direction: string;
  estimatedTime?: string;
}
