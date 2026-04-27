/**
 * WilderGo Subscription Hook
 * React hook for subscription state and feature gating
 */

import { useState, useEffect, useCallback } from "react";
import {
  getSubscriptionStatus,
  hasFeatureAccess,
  checkFeatureGate,
  checkMessageLimit,
  incrementMessageCount,
  SubscriptionStatus,
  PremiumFeature,
  FeatureGateResult,
  PREMIUM_FEATURES,
} from "@/services/subscription/subscriptionService";

interface UseSubscriptionReturn {
  // State
  status: SubscriptionStatus | null;
  isLoading: boolean;
  error: Error | null;

  // Derived state
  isPremium: boolean;
  tier: "free" | "convoy";

  // Feature checks
  hasFeature: (feature: PremiumFeature) => boolean;
  canAccessBuilder: boolean;
  canUseGhost: boolean;
  hasUnlimitedMessages: boolean;

  // Actions
  checkFeature: (feature: PremiumFeature) => Promise<FeatureGateResult>;
  checkMessages: () => Promise<{ canSend: boolean; remaining: number }>;
  trackMessage: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load subscription status
  const loadStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentStatus = await getSubscriptionStatus();
      setStatus(currentStatus);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load subscription"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Derived values
  const isPremium = status?.tier === "convoy" && status?.isActive;
  const tier = status?.tier ?? "free";

  // Check if user has a specific feature
  const hasFeature = useCallback(
    (feature: PremiumFeature): boolean => {
      return status?.features.includes(feature) ?? false;
    },
    [status],
  );

  // Pre-computed feature access
  const canAccessBuilder = hasFeature(PREMIUM_FEATURES.BUILDER_NETWORK);
  const canUseGhost = hasFeature(PREMIUM_FEATURES.GHOST_MODE);
  const hasUnlimitedMessages = hasFeature(PREMIUM_FEATURES.UNLIMITED_MESSAGES);

  // Check feature gate (with limits)
  const checkFeature = useCallback(async (feature: PremiumFeature) => {
    return checkFeatureGate(feature);
  }, []);

  // Check message limits
  const checkMessages = useCallback(async () => {
    const result = await checkMessageLimit();
    return {
      canSend: result.canSend,
      remaining: result.remaining,
    };
  }, []);

  // Track a sent message
  const trackMessage = useCallback(async () => {
    await incrementMessageCount();
  }, []);

  // Refresh subscription status
  const refresh = useCallback(async () => {
    await loadStatus();
  }, [loadStatus]);

  return {
    status,
    isLoading,
    error,
    isPremium,
    tier,
    hasFeature,
    canAccessBuilder,
    canUseGhost,
    hasUnlimitedMessages,
    checkFeature,
    checkMessages,
    trackMessage,
    refresh,
  };
}

export default useSubscription;
