/**
 * WilderGo Database Schema Types
 * Complete TypeScript definitions for Supabase database
 * Ready for integration when Supabase is connected
 */

// ============================================================================
// ENUMS
// ============================================================================

export type AppMode = "friends" | "builder";

export type VerificationStatus = "pending" | "verified" | "failed" | "expired";

export type HelpCategory = "mechanical" | "medical" | "security" | "supplies";

export type HelpPriority = "critical" | "urgent" | "assistance";

export type HelpRequestStatus =
  | "broadcasting"
  | "responding"
  | "resolved"
  | "cancelled"
  | "expired";

export type MessageStatus = "sent" | "delivered" | "read";

export type ConvoyRole = "leader" | "member";

export type SubscriptionTier = "free" | "convoy";

export type BuilderSpecialty =
  | "electrical"
  | "plumbing"
  | "solar"
  | "mechanical"
  | "interior"
  | "exterior"
  | "full_build";

// ============================================================================
// USER & PROFILE
// ============================================================================

export interface Profile {
  id: string; // UUID, references auth.users
  created_at: string;
  updated_at: string;

  // Basic info
  display_name: string;
  bio: string | null;
  avatar_url: string | null;

  // Rig info
  rig_type: string | null; // e.g., "2020 Sprinter 144"
  rig_name: string | null; // e.g., "The Wanderer"
  rig_photos: string[]; // Array of photo URLs

  // Verification
  photo_verified: boolean;
  photo_verified_at: string | null;
  verification_confidence: number | null; // 0-100

  // Location (last known)
  last_latitude: number | null;
  last_longitude: number | null;
  last_location_update: string | null;
  location_sharing_enabled: boolean;
  ghost_mode_enabled: boolean;

  // Nomadic Pulse
  current_heading: string | null; // e.g., "Arches NP"
  current_location_name: string | null; // e.g., "Moab, UT"
  traveling_with: number; // Number of companions
  on_the_road_since: string | null; // Date started nomading

  // Social
  instagram_handle: string | null;
  website_url: string | null;

  // Subscription
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;

  // Settings
  notifications_enabled: boolean;
  friends_mode_enabled: boolean;
  builder_mode_enabled: boolean;
}

export interface ProfilePreferences {
  id: string; // UUID
  profile_id: string; // References profiles.id
  created_at: string;
  updated_at: string;

  // Route matching
  route_overlap_threshold: number; // Minimum % overlap to show match

  // Notification preferences
  notify_new_matches: boolean;
  notify_messages: boolean;
  notify_help_requests: boolean;
  notify_convoy_updates: boolean;
  notify_campfire_events: boolean;
}

// ============================================================================
// ROUTES & TRAVEL
// ============================================================================

export interface Route {
  id: string; // UUID
  profile_id: string; // References profiles.id
  created_at: string;
  updated_at: string;

  name: string;
  description: string | null;

  // Route geometry (PostGIS)
  route_geometry: unknown; // PostGIS geography type

  // Waypoints
  start_location: string;
  end_location: string;
  waypoints: RouteWaypoint[];

  // Timing
  start_date: string | null;
  end_date: string | null;
  is_flexible: boolean;

  // Status
  is_active: boolean;
  is_public: boolean;
}

export interface RouteWaypoint {
  name: string;
  latitude: number;
  longitude: number;
  arrival_date: string | null;
  departure_date: string | null;
  notes: string | null;
}

export interface RouteOverlap {
  id: string; // UUID
  route_a_id: string; // References routes.id
  route_b_id: string; // References routes.id
  profile_a_id: string; // References profiles.id
  profile_b_id: string; // References profiles.id

  overlap_percentage: number; // 0-100
  overlap_distance_miles: number;
  overlap_start_date: string | null;
  overlap_end_date: string | null;

  // Overlap geometry
  overlap_geometry: unknown; // PostGIS geography type

  calculated_at: string;
}

// ============================================================================
// MATCHING & CONNECTIONS
// ============================================================================

export interface Match {
  id: string; // UUID
  created_at: string;
  updated_at: string;

  profile_a_id: string; // References profiles.id
  profile_b_id: string; // References profiles.id

  // Match context
  mode: AppMode;
  route_overlap_id: string | null; // References route_overlaps.id

  // Swipe states
  profile_a_liked: boolean | null;
  profile_b_liked: boolean | null;

  // Match status
  is_match: boolean; // Both liked
  matched_at: string | null;

  // Conversation
  last_message_at: string | null;
  unread_count_a: number;
  unread_count_b: number;
}

export interface Swipe {
  id: string; // UUID
  created_at: string;

  swiper_id: string; // References profiles.id
  swiped_id: string; // References profiles.id

  direction: "like" | "pass";
  mode: AppMode;
}

// ============================================================================
// MESSAGING
// ============================================================================

export interface Conversation {
  id: string; // UUID
  created_at: string;
  updated_at: string;

  match_id: string; // References matches.id

  // Participants
  participant_a_id: string; // References profiles.id
  participant_b_id: string; // References profiles.id

  // Last message preview
  last_message_text: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;

  // Status
  is_archived_a: boolean;
  is_archived_b: boolean;
  is_blocked: boolean;
  blocked_by: string | null;
}

export interface Message {
  id: string; // UUID
  created_at: string;

  conversation_id: string; // References conversations.id
  sender_id: string; // References profiles.id

  // Content
  text: string | null;
  image_url: string | null;
  location_share: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;

  // AI-generated icebreaker flag
  is_ai_suggested: boolean;

  // Status
  status: MessageStatus;
  delivered_at: string | null;
  read_at: string | null;
}

// ============================================================================
// HELP / SOS SYSTEM
// ============================================================================

export interface HelpRequest {
  id: string; // UUID
  created_at: string;
  updated_at: string;

  requester_id: string; // References profiles.id

  // Request details
  category: HelpCategory;
  priority: HelpPriority;
  description: string;

  // Location
  latitude: number;
  longitude: number;
  address: string | null;

  // Nomadic Pulse context
  heading: string | null;
  rig_type: string | null;

  // Status
  status: HelpRequestStatus;
  resolved_at: string | null;
  resolved_by: string | null; // References profiles.id

  // Broadcasting
  broadcast_radius_miles: number;
  responders_notified: number;

  // AI Triage
  ai_triage_advice: string | null;
}

export interface HelpResponse {
  id: string; // UUID
  created_at: string;
  updated_at: string;

  request_id: string; // References help_requests.id
  responder_id: string; // References profiles.id

  // Response details
  message: string;
  eta_minutes: number | null;
  distance_miles: number;

  // Status
  status: "offered" | "en_route" | "arrived" | "completed" | "cancelled";

  // Location at response time
  responder_latitude: number;
  responder_longitude: number;
}

// ============================================================================
// CONVOYS
// ============================================================================

export interface Convoy {
  id: string; // UUID
  created_at: string;
  updated_at: string;

  name: string;
  description: string | null;

  leader_id: string; // References profiles.id

  // Route
  route_id: string | null; // References routes.id
  destination: string | null;

  // Settings
  max_members: number;
  is_public: boolean;
  requires_verification: boolean;

  // Stats
  member_count: number;
}

export interface ConvoyMember {
  id: string; // UUID
  created_at: string;

  convoy_id: string; // References convoys.id
  profile_id: string; // References profiles.id

  role: ConvoyRole;
  joined_at: string;

  // Position in convoy
  position_order: number;

  // Status
  is_active: boolean;
  last_location_latitude: number | null;
  last_location_longitude: number | null;
  last_location_update: string | null;
}

// ============================================================================
// CAMPFIRE EVENTS
// ============================================================================

export interface CampfireEvent {
  id: string; // UUID
  created_at: string;
  updated_at: string;

  host_id: string; // References profiles.id

  // Event details
  title: string;
  description: string | null;
  event_type: "meetup" | "potluck" | "workshop" | "hangout" | "other";

  // Location
  latitude: number;
  longitude: number;
  address: string | null;
  location_name: string | null; // e.g., "BLM Land near Quartzsite"

  // Timing
  starts_at: string;
  ends_at: string | null;

  // Capacity
  max_attendees: number | null;
  current_attendees: number;

  // Status
  is_cancelled: boolean;
  is_public: boolean;
}

export interface CampfireRSVP {
  id: string; // UUID
  created_at: string;

  event_id: string; // References campfire_events.id
  profile_id: string; // References profiles.id

  status: "going" | "maybe" | "not_going";
}

// ============================================================================
// BUILDER NETWORK
// ============================================================================

export interface Builder {
  id: string; // UUID
  profile_id: string; // References profiles.id
  created_at: string;
  updated_at: string;

  // Business info
  business_name: string | null;
  tagline: string | null;

  // Specialties
  specialties: BuilderSpecialty[];

  // Verification
  is_verified: boolean;
  verified_at: string | null;
  years_experience: number | null;

  // Portfolio
  portfolio_photos: string[];
  builds_completed: number;

  // Availability
  is_available: boolean;
  service_radius_miles: number | null;

  // Location
  base_latitude: number | null;
  base_longitude: number | null;
  base_location_name: string | null;
  is_mobile: boolean; // Travels to clients

  // Ratings
  average_rating: number | null;
  review_count: number;
}

export interface BuilderReview {
  id: string; // UUID
  created_at: string;

  builder_id: string; // References builders.id
  reviewer_id: string; // References profiles.id

  rating: number; // 1-5
  review_text: string | null;

  // Project context
  project_type: BuilderSpecialty;
  project_photos: string[];
}

export interface BuilderInquiry {
  id: string; // UUID
  created_at: string;
  updated_at: string;

  builder_id: string; // References builders.id
  requester_id: string; // References profiles.id

  // Inquiry details
  project_type: BuilderSpecialty;
  description: string;
  budget_range: string | null;
  timeline: string | null;

  // Status
  status: "pending" | "responded" | "accepted" | "declined" | "completed";

  // Location
  project_latitude: number | null;
  project_longitude: number | null;
  project_location_name: string | null;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string; // UUID
  created_at: string;

  profile_id: string; // References profiles.id

  type:
    | "new_match"
    | "new_message"
    | "help_request"
    | "help_response"
    | "convoy_invite"
    | "campfire_event"
    | "route_overlap"
    | "builder_request"
    | "verification_complete"
    | "subscription_update";

  title: string;
  body: string;

  // Related data
  data: Record<string, unknown>;

  // Status
  is_read: boolean;
  read_at: string | null;

  // Push
  push_sent: boolean;
  push_sent_at: string | null;
}

// ============================================================================
// PASSPORT / ACHIEVEMENTS
// ============================================================================

export interface PassportStamp {
  id: string; // UUID
  created_at: string;

  profile_id: string; // References profiles.id

  // Location
  latitude: number;
  longitude: number;
  location_name: string;
  state: string | null;
  country: string;

  // Visit info
  visited_at: string;
  photo_url: string | null;
  notes: string | null;
}

export interface Achievement {
  id: string; // UUID
  created_at: string;

  profile_id: string; // References profiles.id

  achievement_type:
    | "first_match"
    | "first_help"
    | "first_convoy"
    | "states_visited_10"
    | "states_visited_25"
    | "states_visited_50"
    | "helped_10_nomads"
    | "verified_builder"
    | "convoy_leader";

  earned_at: string;
}

// ============================================================================
// DATABASE TYPE HELPER
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      profile_preferences: {
        Row: ProfilePreferences;
        Insert: Omit<ProfilePreferences, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<ProfilePreferences, "id" | "profile_id" | "created_at">
        >;
      };
      routes: {
        Row: Route;
        Insert: Omit<Route, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Route, "id" | "profile_id" | "created_at">>;
      };
      route_overlaps: {
        Row: RouteOverlap;
        Insert: Omit<RouteOverlap, "id" | "calculated_at">;
        Update: Partial<Omit<RouteOverlap, "id">>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Match, "id" | "created_at">>;
      };
      swipes: {
        Row: Swipe;
        Insert: Omit<Swipe, "id" | "created_at">;
        Update: never;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Conversation, "id" | "created_at">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: Partial<
          Omit<Message, "id" | "created_at" | "conversation_id" | "sender_id">
        >;
      };
      help_requests: {
        Row: HelpRequest;
        Insert: Omit<HelpRequest, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<HelpRequest, "id" | "created_at" | "requester_id">
        >;
      };
      help_responses: {
        Row: HelpResponse;
        Insert: Omit<HelpResponse, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<
            HelpResponse,
            "id" | "created_at" | "request_id" | "responder_id"
          >
        >;
      };
      convoys: {
        Row: Convoy;
        Insert: Omit<
          Convoy,
          "id" | "created_at" | "updated_at" | "member_count"
        >;
        Update: Partial<Omit<Convoy, "id" | "created_at" | "leader_id">>;
      };
      convoy_members: {
        Row: ConvoyMember;
        Insert: Omit<ConvoyMember, "id" | "created_at">;
        Update: Partial<
          Omit<ConvoyMember, "id" | "created_at" | "convoy_id" | "profile_id">
        >;
      };
      campfire_events: {
        Row: CampfireEvent;
        Insert: Omit<
          CampfireEvent,
          "id" | "created_at" | "updated_at" | "current_attendees"
        >;
        Update: Partial<Omit<CampfireEvent, "id" | "created_at" | "host_id">>;
      };
      campfire_rsvps: {
        Row: CampfireRSVP;
        Insert: Omit<CampfireRSVP, "id" | "created_at">;
        Update: Partial<
          Omit<CampfireRSVP, "id" | "created_at" | "event_id" | "profile_id">
        >;
      };
      builders: {
        Row: Builder;
        Insert: Omit<
          Builder,
          "id" | "created_at" | "updated_at" | "average_rating" | "review_count"
        >;
        Update: Partial<Omit<Builder, "id" | "created_at" | "profile_id">>;
      };
      builder_reviews: {
        Row: BuilderReview;
        Insert: Omit<BuilderReview, "id" | "created_at">;
        Update: never;
      };
      builder_inquiries: {
        Row: BuilderInquiry;
        Insert: Omit<BuilderInquiry, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<
            BuilderInquiry,
            "id" | "created_at" | "builder_id" | "requester_id"
          >
        >;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "created_at" | "profile_id">>;
      };
      passport_stamps: {
        Row: PassportStamp;
        Insert: Omit<PassportStamp, "id" | "created_at">;
        Update: Partial<
          Omit<PassportStamp, "id" | "created_at" | "profile_id">
        >;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, "id" | "created_at">;
        Update: never;
      };
    };
  };
}

export default Database;
