/**
 * WilderGo Nomad Passport Service
 * Comprehensive rig management and travel tracking:
 * - Rig Specs (solar, water, connectivity)
 * - Travel History with pinned spots
 * - Maintenance Tracker
 * - Private Nomad Journal
 */

import { colors, maintenanceCategories, rigSpecs } from "@/constants/theme";

// Rig Specifications Types
export interface RigSpecifications {
  id: string;
  userId: string;
  rigName: string;
  rigType: string;
  year?: number;
  make?: string;
  model?: string;
  // Power System
  solarWattage: number;
  batteryCapacity: number;
  batteryType: "lithium" | "agm" | "lead-acid" | "other";
  hasShorepower: boolean;
  hasGenerator: boolean;
  generatorType?: string;
  // Water System
  freshWaterCapacity: number;
  greyWaterCapacity: number;
  blackWaterCapacity: number;
  hasWaterFilter: boolean;
  hasWaterHeater: boolean;
  // Connectivity
  connectivityType: string;
  starlinkActive: boolean;
  cellularCarrier?: string;
  hasBooster: boolean;
  // Climate
  hasAC: boolean;
  acType?: string;
  hasHeater: boolean;
  heaterType?: string;
  // Additional
  sleeps: number;
  hasKitchen: boolean;
  hasBathroom: boolean;
  notes?: string;
  lastUpdated: string;
}

// Pinned Spot / Travel History Types
export type SpotType =
  | "blm_land"
  | "campsite"
  | "national_park"
  | "boondocking"
  | "rv_park"
  | "urban"
  | "scenic"
  | "friend_spot";

export interface PinnedSpot {
  id: string;
  userId: string;
  type: SpotType;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  visitedAt: string;
  departedAt?: string;
  daysStayed: number;
  rating?: number;
  notes?: string;
  photos?: string[];
  tags?: string[];
  isFavorite: boolean;
  isPublic: boolean;
  amenities?: string[];
  cellSignal?: number;
  costs?: {
    camping?: number;
    fuel?: number;
    food?: number;
    other?: number;
  };
}

// Maintenance Types
export interface MaintenanceRecord {
  id: string;
  rigId: string;
  categoryId: string;
  categoryLabel: string;
  date: string;
  mileage?: number;
  cost?: number;
  notes?: string;
  photos?: string[];
  nextDue?: string;
  nextDueMileage?: number;
  provider?: string;
  isCompleted: boolean;
}

// Journal Entry Types
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  photos?: string[];
  mood?: "great" | "good" | "neutral" | "challenging" | "difficult";
  weather?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
}

// Spot Type Configuration
export const spotTypeConfig: Record<
  SpotType,
  {
    icon: string;
    label: string;
    color: string;
  }
> = {
  blm_land: {
    icon: "leaf",
    label: "BLM Land",
    color: colors.forestGreen[500],
  },
  campsite: {
    icon: "bonfire",
    label: "Campsite",
    color: colors.sunsetOrange[500],
  },
  national_park: {
    icon: "trail-sign",
    label: "National Park",
    color: colors.forestGreen[600],
  },
  boondocking: {
    icon: "compass",
    label: "Boondocking",
    color: colors.deepTeal[500],
  },
  rv_park: {
    icon: "home",
    label: "RV Park",
    color: colors.desertSand[700],
  },
  urban: {
    icon: "business",
    label: "Urban",
    color: colors.bark[500],
  },
  scenic: {
    icon: "camera",
    label: "Scenic",
    color: colors.burntSienna[500],
  },
  friend_spot: {
    icon: "people",
    label: "Friend's Spot",
    color: colors.forestGreen[400],
  },
};

// Mood Configuration
export const moodConfig: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  great: { icon: "happy", label: "Great", color: colors.forestGreen[500] },
  good: {
    icon: "happy-outline",
    label: "Good",
    color: colors.forestGreen[400],
  },
  neutral: { icon: "ellipse", label: "Neutral", color: colors.desertSand[600] },
  challenging: {
    icon: "sad-outline",
    label: "Challenging",
    color: colors.sunsetOrange[500],
  },
  difficult: {
    icon: "sad",
    label: "Difficult",
    color: colors.burntSienna[600],
  },
};

// Mock Data
const mockRigSpecs: RigSpecifications = {
  id: "rig-1",
  userId: "user-1",
  rigName: "The Wanderer",
  rigType: "Sprinter Van",
  year: 2019,
  make: "Mercedes-Benz",
  model: "Sprinter 2500",
  solarWattage: 400,
  batteryCapacity: 400,
  batteryType: "lithium",
  hasShorepower: true,
  hasGenerator: false,
  freshWaterCapacity: 30,
  greyWaterCapacity: 20,
  blackWaterCapacity: 0,
  hasWaterFilter: true,
  hasWaterHeater: true,
  connectivityType: "Starlink",
  starlinkActive: true,
  cellularCarrier: "Verizon",
  hasBooster: true,
  hasAC: true,
  acType: "Roof-mounted",
  hasHeater: true,
  heaterType: "Diesel",
  sleeps: 2,
  hasKitchen: true,
  hasBathroom: true,
  lastUpdated: "2024-01-15T10:00:00Z",
};

const mockPinnedSpots: PinnedSpot[] = [
  {
    id: "spot-1",
    userId: "user-1",
    type: "blm_land",
    name: "Valley of the Gods",
    latitude: 37.3123,
    longitude: -109.8675,
    visitedAt: "2024-01-10T00:00:00Z",
    departedAt: "2024-01-12T00:00:00Z",
    daysStayed: 3,
    rating: 5,
    notes:
      "Incredible free camping with stunning rock formations. Quiet and remote.",
    isFavorite: true,
    isPublic: true,
    cellSignal: 2,
    tags: ["free camping", "scenic", "remote"],
  },
  {
    id: "spot-2",
    userId: "user-1",
    type: "national_park",
    name: "Arches National Park",
    latitude: 38.7331,
    longitude: -109.5925,
    visitedAt: "2024-01-08T00:00:00Z",
    departedAt: "2024-01-09T00:00:00Z",
    daysStayed: 2,
    rating: 5,
    notes: "Devils Garden campground. Book early!",
    isFavorite: true,
    isPublic: true,
    amenities: ["flush toilets", "water"],
    costs: { camping: 50 },
  },
  {
    id: "spot-3",
    userId: "user-1",
    type: "boondocking",
    name: "Lone Mesa",
    latitude: 38.2456,
    longitude: -109.2134,
    visitedAt: "2024-01-05T00:00:00Z",
    departedAt: "2024-01-07T00:00:00Z",
    daysStayed: 3,
    rating: 4,
    notes: "Great dispersed camping spot. Bring extra water.",
    isFavorite: false,
    isPublic: true,
    cellSignal: 1,
    tags: ["dispersed", "quiet"],
  },
  {
    id: "spot-4",
    userId: "user-1",
    type: "rv_park",
    name: "Moab Valley RV Resort",
    latitude: 38.5733,
    longitude: -109.5498,
    visitedAt: "2024-01-02T00:00:00Z",
    departedAt: "2024-01-04T00:00:00Z",
    daysStayed: 3,
    rating: 4,
    amenities: ["full hookups", "laundry", "wifi", "pool"],
    isFavorite: false,
    isPublic: true,
    costs: { camping: 65 },
  },
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "maint-1",
    rigId: "rig-1",
    categoryId: "oil",
    categoryLabel: "Oil Change",
    date: "2024-01-05T00:00:00Z",
    mileage: 45000,
    cost: 75,
    notes: "Full synthetic, Mobil 1",
    isCompleted: true,
    nextDueMileage: 50000,
  },
  {
    id: "maint-2",
    rigId: "rig-1",
    categoryId: "tires",
    categoryLabel: "Tire Rotation",
    date: "2024-01-05T00:00:00Z",
    mileage: 45000,
    isCompleted: true,
    nextDueMileage: 52500,
  },
  {
    id: "maint-3",
    rigId: "rig-1",
    categoryId: "solar",
    categoryLabel: "Solar Panel Clean",
    date: "2023-12-20T00:00:00Z",
    notes: "Deep cleaned all panels, checked connections",
    isCompleted: true,
    nextDue: "2024-03-20T00:00:00Z",
  },
  {
    id: "maint-4",
    rigId: "rig-1",
    categoryId: "battery",
    categoryLabel: "Battery Check",
    date: "2024-01-10T00:00:00Z",
    notes: "All cells balanced, SOH at 98%",
    isCompleted: true,
    nextDue: "2024-02-10T00:00:00Z",
  },
];

const mockJournalEntries: JournalEntry[] = [
  {
    id: "journal-1",
    userId: "user-1",
    title: "Sunset at Valley of the Gods",
    content:
      "The most incredible sunset I have ever witnessed. The red rocks lit up like fire as the sun dropped below the horizon. Complete silence except for the wind. This is why I chose this life.",
    latitude: 37.3123,
    longitude: -109.8675,
    locationName: "Valley of the Gods, UT",
    mood: "great",
    weather: "Clear skies, 65°F",
    tags: ["sunset", "peaceful", "gratitude"],
    createdAt: "2024-01-11T19:30:00Z",
    updatedAt: "2024-01-11T19:30:00Z",
    isPrivate: true,
  },
  {
    id: "journal-2",
    userId: "user-1",
    title: "First Starlink Day",
    content:
      "Finally got Starlink set up and working! Video calls with family from the middle of nowhere. The future is now.",
    latitude: 38.5733,
    longitude: -109.5498,
    locationName: "Moab, UT",
    mood: "great",
    tags: ["tech", "milestone"],
    createdAt: "2024-01-03T14:00:00Z",
    updatedAt: "2024-01-03T14:00:00Z",
    isPrivate: true,
  },
  {
    id: "journal-3",
    userId: "user-1",
    title: "Challenging Day",
    content:
      "Generator issues and running low on water. Had to find a fill station in a pinch. Learning to always have backup plans.",
    mood: "challenging",
    tags: ["lessons", "problem-solving"],
    createdAt: "2024-01-06T20:00:00Z",
    updatedAt: "2024-01-06T20:00:00Z",
    isPrivate: true,
  },
];

// Service Functions

// Rig Specs
export function getRigSpecs(userId: string): RigSpecifications | null {
  return mockRigSpecs.userId === userId ? mockRigSpecs : null;
}

export function updateRigSpecs(
  specs: Partial<RigSpecifications>,
): RigSpecifications {
  Object.assign(mockRigSpecs, specs, { lastUpdated: new Date().toISOString() });
  return mockRigSpecs;
}

// Pinned Spots / Travel History
export function getPinnedSpots(userId: string): PinnedSpot[] {
  return mockPinnedSpots.filter((s) => s.userId === userId);
}

export function getFavoriteSpots(userId: string): PinnedSpot[] {
  return mockPinnedSpots.filter((s) => s.userId === userId && s.isFavorite);
}

export function addPinnedSpot(spot: Omit<PinnedSpot, "id">): PinnedSpot {
  const newSpot: PinnedSpot = {
    ...spot,
    id: `spot-${Date.now()}`,
  };
  mockPinnedSpots.unshift(newSpot);
  return newSpot;
}

export function updatePinnedSpot(
  spotId: string,
  updates: Partial<PinnedSpot>,
): PinnedSpot | null {
  const index = mockPinnedSpots.findIndex((s) => s.id === spotId);
  if (index >= 0) {
    mockPinnedSpots[index] = { ...mockPinnedSpots[index], ...updates };
    return mockPinnedSpots[index];
  }
  return null;
}

export function deletePinnedSpot(spotId: string): void {
  const index = mockPinnedSpots.findIndex((s) => s.id === spotId);
  if (index >= 0) {
    mockPinnedSpots.splice(index, 1);
  }
}

// Maintenance Records
export function getMaintenanceRecords(rigId: string): MaintenanceRecord[] {
  return mockMaintenanceRecords.filter((m) => m.rigId === rigId);
}

export function getUpcomingMaintenance(
  rigId: string,
  currentMileage: number,
): MaintenanceRecord[] {
  return mockMaintenanceRecords
    .filter((m) => m.rigId === rigId && m.isCompleted)
    .filter((m) => {
      if (m.nextDueMileage && currentMileage >= m.nextDueMileage - 500)
        return true;
      if (
        m.nextDue &&
        new Date(m.nextDue) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      )
        return true;
      return false;
    });
}

export function addMaintenanceRecord(
  record: Omit<MaintenanceRecord, "id">,
): MaintenanceRecord {
  const newRecord: MaintenanceRecord = {
    ...record,
    id: `maint-${Date.now()}`,
  };
  mockMaintenanceRecords.unshift(newRecord);
  return newRecord;
}

export function updateMaintenanceRecord(
  recordId: string,
  updates: Partial<MaintenanceRecord>,
): MaintenanceRecord | null {
  const index = mockMaintenanceRecords.findIndex((m) => m.id === recordId);
  if (index >= 0) {
    mockMaintenanceRecords[index] = {
      ...mockMaintenanceRecords[index],
      ...updates,
    };
    return mockMaintenanceRecords[index];
  }
  return null;
}

// Journal Entries
export function getJournalEntries(userId: string): JournalEntry[] {
  return mockJournalEntries.filter((j) => j.userId === userId);
}

export function addJournalEntry(
  entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">,
): JournalEntry {
  const now = new Date().toISOString();
  const newEntry: JournalEntry = {
    ...entry,
    id: `journal-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  mockJournalEntries.unshift(newEntry);
  return newEntry;
}

export function updateJournalEntry(
  entryId: string,
  updates: Partial<JournalEntry>,
): JournalEntry | null {
  const index = mockJournalEntries.findIndex((j) => j.id === entryId);
  if (index >= 0) {
    mockJournalEntries[index] = {
      ...mockJournalEntries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockJournalEntries[index];
  }
  return null;
}

export function deleteJournalEntry(entryId: string): void {
  const index = mockJournalEntries.findIndex((j) => j.id === entryId);
  if (index >= 0) {
    mockJournalEntries.splice(index, 1);
  }
}

// Stats helpers
export function getTravelStats(userId: string): {
  totalSpots: number;
  totalDays: number;
  favoriteSpots: number;
  mostVisitedType: SpotType | null;
  averageRating: number;
} {
  const spots = getPinnedSpots(userId);
  const totalDays = spots.reduce((sum, s) => sum + s.daysStayed, 0);
  const favoriteSpots = spots.filter((s) => s.isFavorite).length;

  const typeCounts = spots.reduce(
    (acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    },
    {} as Record<SpotType, number>,
  );

  const mostVisitedType = Object.entries(typeCounts).sort(
    ([, a], [, b]) => b - a,
  )[0]?.[0] as SpotType | undefined;

  const ratedSpots = spots.filter((s) => s.rating);
  const averageRating =
    ratedSpots.length > 0
      ? ratedSpots.reduce((sum, s) => sum + (s.rating || 0), 0) /
        ratedSpots.length
      : 0;

  return {
    totalSpots: spots.length,
    totalDays,
    favoriteSpots,
    mostVisitedType: mostVisitedType || null,
    averageRating: Math.round(averageRating * 10) / 10,
  };
}

export function getMaintenanceStats(rigId: string): {
  totalRecords: number;
  upcomingCount: number;
  totalSpent: number;
  lastServiceDate: string | null;
} {
  const records = getMaintenanceRecords(rigId);
  const totalSpent = records.reduce((sum, r) => sum + (r.cost || 0), 0);
  const upcomingCount = getUpcomingMaintenance(rigId, 45000).length; // Mock mileage

  const sortedByDate = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return {
    totalRecords: records.length,
    upcomingCount,
    totalSpent,
    lastServiceDate: sortedByDate[0]?.date || null,
  };
}

export const nomadPassportService = {
  // Rig Specs
  getRigSpecs,
  updateRigSpecs,
  // Pinned Spots
  getPinnedSpots,
  getFavoriteSpots,
  addPinnedSpot,
  updatePinnedSpot,
  deletePinnedSpot,
  // Maintenance
  getMaintenanceRecords,
  getUpcomingMaintenance,
  addMaintenanceRecord,
  updateMaintenanceRecord,
  // Journal
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  // Stats
  getTravelStats,
  getMaintenanceStats,
  // Config
  spotTypeConfig,
  moodConfig,
};

export default nomadPassportService;
