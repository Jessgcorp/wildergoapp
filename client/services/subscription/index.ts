/**
 * WilderGo Subscription Services
 * Export all subscription-related functionality
 */

export {
  // Constants
  ENTITLEMENTS,
  PREMIUM_FEATURES,
  FREE_TIER_LIMITS,
  // Functions
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
  featureRequiresPremium,
  // Types
  type PremiumFeature,
  type SubscriptionTier,
  type SubscriptionStatus,
  type FeatureGateResult,
} from "./subscriptionService";
