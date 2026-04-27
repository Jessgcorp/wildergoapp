/**
 * Firebase Integration Stub
 * User profiles, real-time convoy tracking, and data sync
 *
 * To activate:
 * 1. Create Firebase project at https://console.firebase.google.com/
 * 2. Enable Authentication and Firestore
 * 3. Add Firebase config to environment
 */

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  rigType?: string;
  rigName?: string;
  bio?: string;
  memberSince: string;
  verified: boolean;
  premium: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  preferences: {
    travelStyle: string[];
    interests: string[];
    lookingFor: "friends" | "builders" | "all";
  };
}

export interface ConvoyMember {
  id: string;
  name: string;
  avatar?: string;
  location: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    timestamp: Date;
  };
  status: "active" | "paused" | "offline";
  batteryLevel?: number;
}

export interface Convoy {
  id: string;
  name: string;
  leaderId: string;
  members: ConvoyMember[];
  destination?: {
    name: string;
    latitude: number;
    longitude: number;
    eta?: Date;
  };
  route?: { latitude: number; longitude: number }[];
  createdAt: Date;
  status: "active" | "paused" | "completed";
}

let currentUser: FirebaseUser | null = null;

export const FirebaseService = {
  initialize: (config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  }) => {
    console.log("[Firebase] Initialized with project:", config.projectId);
    return true;
  },

  isConfigured: () => true,

  auth: {
    getCurrentUser: (): FirebaseUser | null => currentUser,

    signIn: async (email: string, password: string): Promise<FirebaseUser> => {
      console.log("[Firebase] Signing in:", email);
      currentUser = {
        uid: "user-" + Date.now(),
        email,
        displayName: "Alex Nomad",
        photoURL: null,
        emailVerified: true,
        createdAt: new Date(),
      };
      return currentUser;
    },

    signUp: async (
      email: string,
      password: string,
      displayName: string,
    ): Promise<FirebaseUser> => {
      console.log("[Firebase] Signing up:", email);
      currentUser = {
        uid: "user-" + Date.now(),
        email,
        displayName,
        photoURL: null,
        emailVerified: false,
        createdAt: new Date(),
      };
      return currentUser;
    },

    signOut: async () => {
      console.log("[Firebase] Signing out");
      currentUser = null;
      return true;
    },

    onAuthStateChange: (callback: (user: FirebaseUser | null) => void) => {
      callback(currentUser);
      return () => {};
    },
  },

  profiles: {
    get: async (userId: string): Promise<UserProfile | null> => {
      console.log("[Firebase] Getting profile:", userId);
      return null;
    },

    update: async (
      userId: string,
      data: Partial<UserProfile>,
    ): Promise<boolean> => {
      console.log("[Firebase] Updating profile:", userId);
      return true;
    },

    search: async (filters: {
      location?: { latitude: number; longitude: number; radiusMiles: number };
      interests?: string[];
      travelStyle?: string[];
      lookingFor?: UserProfile["preferences"]["lookingFor"];
    }): Promise<UserProfile[]> => {
      console.log("[Firebase] Searching profiles with filters:", filters);
      return [];
    },
  },

  convoys: {
    create: async (name: string, leaderId: string): Promise<Convoy> => {
      console.log("[Firebase] Creating convoy:", name);
      return {
        id: "convoy-" + Date.now(),
        name,
        leaderId,
        members: [],
        createdAt: new Date(),
        status: "active",
      };
    },

    join: async (convoyId: string, userId: string): Promise<boolean> => {
      console.log("[Firebase] Joining convoy:", convoyId);
      return true;
    },

    leave: async (convoyId: string, userId: string): Promise<boolean> => {
      console.log("[Firebase] Leaving convoy:", convoyId);
      return true;
    },

    updateLocation: async (
      convoyId: string,
      userId: string,
      location: ConvoyMember["location"],
    ): Promise<boolean> => {
      console.log("[Firebase] Updating convoy location");
      return true;
    },

    onMembersChange: (
      convoyId: string,
      callback: (members: ConvoyMember[]) => void,
    ) => {
      console.log("[Firebase] Listening to convoy members:", convoyId);
      return () => {};
    },

    getActive: async (userId: string): Promise<Convoy | null> => {
      console.log("[Firebase] Getting active convoy for:", userId);
      return null;
    },
  },

  realtime: {
    subscribeToLocation: (
      userId: string,
      callback: (location: {
        latitude: number;
        longitude: number;
        timestamp: Date;
      }) => void,
    ) => {
      console.log("[Firebase] Subscribing to location updates for:", userId);
      return () => {};
    },

    broadcastLocation: async (
      userId: string,
      location: { latitude: number; longitude: number },
    ): Promise<boolean> => {
      console.log("[Firebase] Broadcasting location");
      return true;
    },
  },
};
