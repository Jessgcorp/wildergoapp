import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - core authentication
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  phone: text("phone").unique(),
  email: text("email").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  firebaseUid: text("firebase_uid").unique(),
  passwordHash: text("password_hash"),
  passwordSalt: text("password_salt"),
  isPremium: boolean("is_premium").default(false),
  premiumExpiresAt: timestamp("premium_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profiles table - community profiles
export const profiles = pgTable("profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id)
    .notNull(),

  // Profile details
  bio: text("bio"),
  age: integer("age"),
  rigName: text("rig_name"),
  rigType: text("rig_type"),
  rigYear: integer("rig_year"),

  // Location
  currentLatitude: real("current_latitude"),
  currentLongitude: real("current_longitude"),
  currentLocationName: text("current_location_name"),
  lastLocationUpdate: timestamp("last_location_update"),

  // Mode settings
  datingModeEnabled: boolean("dating_mode_enabled").default(false),
  friendsModeEnabled: boolean("friends_mode_enabled").default(true),
  builderModeEnabled: boolean("builder_mode_enabled").default(true),

  // Connection preferences
  lookingFor: text("looking_for"), // 'friendship', 'both'
  ageMin: integer("age_min"),
  ageMax: integer("age_max"),
  maxDistance: integer("max_distance"), // in miles

  // Privacy
  isGhostMode: boolean("is_ghost_mode").default(false),
  showOnlineStatus: boolean("show_online_status").default(true),
  profileVisibility: text("profile_visibility").default("everyone"), // 'everyone', 'friends', 'nobody'

  // Rig specs (JSON for flexibility)
  rigSpecs: jsonb("rig_specs"),

  // Stats
  daysOnRoad: integer("days_on_road").default(0),
  statesVisited: integer("states_visited").default(0),
  milesTracked: integer("miles_tracked").default(0),

  // Verification
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profile photos
export const profilePhotos = pgTable("profile_photos", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id")
    .references(() => profiles.id)
    .notNull(),
  photoUrl: text("photo_url").notNull(),
  sortOrder: integer("sort_order").default(0),
  isMain: boolean("is_main").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches table - swipe actions and mutual matches
export const matches = pgTable("matches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  swiperId: varchar("swiper_id")
    .references(() => profiles.id)
    .notNull(),
  swipedId: varchar("swiped_id")
    .references(() => profiles.id)
    .notNull(),
  action: text("action").notNull(), // 'like', 'pass', 'super_like'
  isMatch: boolean("is_match").default(false),
  matchedAt: timestamp("matched_at"),
  mode: text("mode").default("friends"), // 'friends', 'builder'
  createdAt: timestamp("created_at").defaultNow(),
});

// Connections table - friend connections
export const connections = pgTable("connections", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id")
    .references(() => profiles.id)
    .notNull(),
  receiverId: varchar("receiver_id")
    .references(() => profiles.id)
    .notNull(),
  status: text("status").default("pending"), // 'pending', 'accepted', 'declined', 'blocked'
  connectionType: text("connection_type").default("friend"), // 'friend', 'convoy_member'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Convoys table - group coordination
export const convoys = pgTable("convoys", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  leaderId: varchar("leader_id")
    .references(() => profiles.id)
    .notNull(),

  // Route info
  startLocation: text("start_location"),
  endLocation: text("end_location"),
  startLatitude: real("start_latitude"),
  startLongitude: real("start_longitude"),
  endLatitude: real("end_latitude"),
  endLongitude: real("end_longitude"),

  // Timing
  departureDate: timestamp("departure_date"),
  estimatedArrival: timestamp("estimated_arrival"),

  // Settings
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(true),
  maxMembers: integer("max_members").default(10),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Convoy members
export const convoyMembers = pgTable("convoy_members", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  convoyId: varchar("convoy_id")
    .references(() => convoys.id)
    .notNull(),
  profileId: varchar("profile_id")
    .references(() => profiles.id)
    .notNull(),
  role: text("role").default("member"), // 'leader', 'co_leader', 'member'
  status: text("status").default("active"), // 'active', 'left', 'removed'
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id")
    .references(() => profiles.id)
    .notNull(),
  receiverId: varchar("receiver_id").references(() => profiles.id),
  convoyId: varchar("convoy_id").references(() => convoys.id),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // 'text', 'image', 'location', 'sos'
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SOS alerts
export const sosAlerts = pgTable("sos_alerts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id")
    .references(() => profiles.id)
    .notNull(),
  alertType: text("alert_type").notNull(), // 'medical', 'mechanical', 'safety', 'general'
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  locationName: text("location_name"),
  description: text("description"),
  status: text("status").default("active"), // 'active', 'responding', 'resolved', 'cancelled'
  respondersCount: integer("responders_count").default(0),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Travel history / spots
export const travelSpots = pgTable("travel_spots", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id")
    .references(() => profiles.id)
    .notNull(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  visitedAt: timestamp("visited_at").defaultNow(),
  notes: text("notes"),
  rating: integer("rating"), // 1-5
  photos: jsonb("photos"), // array of photo URLs
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConvoySchema = createInsertSchema(convoys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertSosAlertSchema = createInsertSchema(sosAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertTravelSpotSchema = createInsertSchema(travelSpots).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

export type InsertConvoy = z.infer<typeof insertConvoySchema>;
export type Convoy = typeof convoys.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertSosAlert = z.infer<typeof insertSosAlertSchema>;
export type SosAlert = typeof sosAlerts.$inferSelect;

export type InsertTravelSpot = z.infer<typeof insertTravelSpotSchema>;
export type TravelSpot = typeof travelSpots.$inferSelect;

export const userBadges = pgTable("user_badges", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull(),
  badgeId: text("badge_id").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges);
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
