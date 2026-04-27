/**
 * WilderGo Subscription Service
 * RevenueCat premium subscription logic with feature gating
 * "The Convoy" tier unlocks: Builder Network, Ghost Mode, Advanced Routes, Unlimited Convoys
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Entitlement identifiers
export const ENTITLEMENTS = {
  CONVOY: "convoy",
  PREMIUM: "premium",
  PRO: "pro",
} as const;

// Feature IDs that require premium access
export const PREMIUM_FEATURES = {
  BUILDER_NETWORK: "builder_network",
  GHOST_MODE: "ghost_mode",
  ADVANCED_ROUTES: "advanced_routes",
  UNLIMITED_MESSAGES: "unlimited_messages",
  ROUTE_OVERLAP_ALERTS: "route_overlap_alerts",
  PRIORITY_SUPPORT: "priority_support",
} as const;

export type PremiumFeature =
  (typeof PREMIUM_FEATURES)[keyof typeof PREMIUM_FEATURES];

// Subscription tiers
export type SubscriptionTier = "free" | "convoy";

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  features: PremiumFeature[];
}

// Storage keys
const STORAGE_KEYS = {
  SUBSCRIPTION_CACHE: "@wildergo_subscription_cache",
  FREE_TRIAL_USED: "@wildergo_free_trial_used",
  MESSAGE_COUNT: "@wildergo_message_count",
};

// Free tier limits
export const FREE_TIER_LIMITS = {
  DAILY_MESSAGES: 5,
  SWIPES_PER_DAY: 10,
  ROUTE_CHECKS_PER_DAY: 3,
} as const;

/**
 * Get all features available for a tier
 */
export function getFeaturesForTier(tier: SubscriptionTier): PremiumFeature[] {
  switch (tier) {
    case "convoy":
      return [
        PREMIUM_FEATURES.BUILDER_NETWORK,
        PREMIUM_FEATURES.GHOST_MODE,
        PREMIUM_FEATURES.ADVANCED_ROUTES,
        PREMIUM_FEATURES.UNLIMITED_MESSAGES,
        PREMIUM_FEATURES.ROUTE_OVERLAP_ALERTS,
        PREMIUM_FEATURES.PRIORITY_SUPPORT,
      ];
    case "free":
    default:
      return [];
  }
}

/**
 * Check if a feature requires premium
 */
export function featureRequiresPremium(feature: PremiumFeature): boolean {
  return Object.values(PREMIUM_FEATURES).includes(feature);
}

/**
 * Get current subscription status from RevenueCat
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const Purchases = await import("react-native-purchases")
      .then((m) => m.default)
      .catch(() => null);

    if (!Purchases) {
      // Return cached status or free tier in development
      return getCachedSubscriptionStatus();
    }

    const customerInfo = await Purchases.getCustomerInfo();

    // Check for active entitlements
    const convoyEntitlement =
      customerInfo.entitlements.active[ENTITLEMENTS.CONVOY];
    const premiumEntitlement =
      customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];

    const hasConvoy =
      !!convoyEntitlement || !!premiumEntitlement || !!proEntitlement;
    const activeEntitlement =
      convoyEntitlement || premiumEntitlement || proEntitlement;

    const status: SubscriptionStatus = {
      tier: hasConvoy ? "convoy" : "free",
      isActive: hasConvoy,
      expirationDate: activeEntitlement?.expirationDate ?? null,
      willRenew: activeEntitlement?.willRenew ?? false,
      features: hasConvoy ? getFeaturesForTier("convoy") : [],
    };

    // Cache the status
    await cacheSubscriptionStatus(status);

    return status;
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return getCachedSubscriptionStatus();
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  feature: PremiumFeature,
): Promise<boolean> {
  const status = await getSubscriptionStatus();
  return status.features.includes(feature);
}

/**
 * Check if user can access Builder Network
 */
export async function canAccessBuilderNetwork(): Promise<boolean> {
  return hasFeatureAccess(PREMIUM_FEATURES.BUILDER_NETWORK);
}

/**
 * Check if user can use Ghost Mode
 */
export async function canUseGhostMode(): Promise<boolean> {
  return hasFeatureAccess(PREMIUM_FEATURES.GHOST_MODE);
}

/**
 * Check if user has unlimited messages
 */
export async function hasUnlimitedMessages(): Promise<boolean> {
  return hasFeatureAccess(PREMIUM_FEATURES.UNLIMITED_MESSAGES);
}

/**
 * Check and track daily message limit for free users
 */
export async function checkMessageLimit(): Promise<{
  canSend: boolean;
  remaining: number;
  resetTime: string | null;
}> {
  const hasUnlimited = await hasUnlimitedMessages();

  if (hasUnlimited) {
    return { canSend: true, remaining: -1, resetTime: null };
  }

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGE_COUNT);
    const data = stored
      ? JSON.parse(stored)
      : { count: 0, date: new Date().toDateString() };

    // Reset if it's a new day
    const today = new Date().toDateString();
    if (data.date !== today) {
      data.count = 0;
      data.date = today;
    }

    const remaining = FREE_TIER_LIMITS.DAILY_MESSAGES - data.count;
    const canSend = remaining > 0;

    // Calculate reset time (midnight)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      canSend,
      remaining: Math.max(0, remaining),
      resetTime: tomorrow.toISOString(),
    };
  } catch {
    return {
      canSend: true,
      remaining: FREE_TIER_LIMITS.DAILY_MESSAGES,
      resetTime: null,
    };
  }
}

/**
 * Increment message count for free users
 */
export async function incrementMessageCount(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGE_COUNT);
    const data = stored
      ? JSON.parse(stored)
      : { count: 0, date: new Date().toDateString() };

    const today = new Date().toDateString();
    if (data.date !== today) {
      data.count = 1;
      data.date = today;
    } else {
      data.count += 1;
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.MESSAGE_COUNT,
      JSON.stringify(data),
    );
  } catch (error) {
    console.error("Error tracking message count:", error);
  }
}

/**
 * Cache subscription status for offline access
 */
async function cacheSubscriptionStatus(
  status: SubscriptionStatus,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.SUBSCRIPTION_CACHE,
      JSON.stringify({
        ...status,
        cachedAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("Error caching subscription status:", error);
  }
}

/**
 * Get cached subscription status
 */
async function getCachedSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_CACHE);
    if (cached) {
      const data = JSON.parse(cached);
      // Check if cache is still valid (within 24 hours)
      const cachedAt = new Date(data.cachedAt);
      const now = new Date();
      const hoursSinceCached =
        (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCached < 24) {
        return {
          tier: data.tier,
          isActive: data.isActive,
          expirationDate: data.expirationDate,
          willRenew: data.willRenew,
          features: data.features,
        };
      }
    }
  } catch {
    // Fall through to default
  }

  // Default to free tier
  return {
    tier: "free",
    isActive: false,
    expirationDate: null,
    willRenew: false,
    features: [],
  };
}

/**
 * Check if user has used their free trial
 */
export async function hasUsedFreeTrial(): Promise<boolean> {
  try {
    const used = await AsyncStorage.getItem(STORAGE_KEYS.FREE_TRIAL_USED);
    return used === "true";
  } catch {
    return false;
  }
}

/**
 * Mark free trial as used
 */
export async function markFreeTrialUsed(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FREE_TRIAL_USED, "true");
  } catch (error) {
    console.error("Error marking free trial as used:", error);
  }
}

/**
 * Get subscription tier display info
 */
export function getTierDisplayInfo(tier: SubscriptionTier): {
  name: string;
  description: string;
  icon: string;
  color: string;
} {
  switch (tier) {
    case "convoy":
      return {
        name: "The Convoy",
        description: "Full nomadic experience",
        icon: "star",
        color: "#C65D3B", // Burnt Sienna
      };
    case "free":
    default:
      return {
        name: "Explorer",
        description: "Basic features",
        icon: "compass",
        color: "#6B7280", // Gray
      };
  }
}

/**
 * Feature gate helper - shows paywall if feature requires premium
 */
export interface FeatureGateResult {
  hasAccess: boolean;
  reason?: "premium_required" | "limit_reached";
  limit?: number;
  used?: number;
}

export async function checkFeatureGate(
  feature: PremiumFeature,
): Promise<FeatureGateResult> {
  const hasAccess = await hasFeatureAccess(feature);

  if (hasAccess) {
    return { hasAccess: true };
  }

  // Check if it's a limited feature
  if (feature === PREMIUM_FEATURES.UNLIMITED_MESSAGES) {
    const messageStatus = await checkMessageLimit();
    return {
      hasAccess: messageStatus.canSend,
      reason: messageStatus.canSend ? undefined : "limit_reached",
      limit: FREE_TIER_LIMITS.DAILY_MESSAGES,
      used: FREE_TIER_LIMITS.DAILY_MESSAGES - messageStatus.remaining,
    };
  }

  return {
    hasAccess: false,
    reason: "premium_required",
  };
}

export default {
  ENTITLEMENTS,
  PREMIUM_FEATURES,
  FREE_TIER_LIMITS,
  getSubscriptionStatus,
  hasFeatureAccess,
  canAccessBuilderNetwork,
  canUseGhostMode,
  hasUnlimitedMessages,
  checkMessageLimit,
  incrementMessageCount,
  hasUsedFreeTrial,
  markFreeTrialUsed,
  getTierDisplayInfo,
  checkFeatureGate,
  getFeaturesForTier,
};
