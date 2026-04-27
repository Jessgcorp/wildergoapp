/**
 * WilderGo Feature Gate Component
 * Wraps premium features and shows paywall when needed
 * Brand-styled with warm cream and burnt sienna
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "@/constants/theme";
import {
  checkFeatureGate,
  PremiumFeature,
  PREMIUM_FEATURES,
  FeatureGateResult,
  getTierDisplayInfo,
} from "@/services/subscription/subscriptionService";

interface FeatureGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgradePress?: () => void;
  showBlockedUI?: boolean;
}

// Feature display info
const FEATURE_INFO: Record<
  PremiumFeature,
  { title: string; description: string; icon: string }
> = {
  [PREMIUM_FEATURES.BUILDER_NETWORK]: {
    title: "Builder Network",
    description: "Connect with verified rig builders and consultants",
    icon: "construct",
  },
  [PREMIUM_FEATURES.GHOST_MODE]: {
    title: "Ghost Mode",
    description: "Hide your exact location while staying connected",
    icon: "eye-off",
  },
  [PREMIUM_FEATURES.ADVANCED_ROUTES]: {
    title: "Advanced Routes",
    description: "AI-powered route planning with nomad density insights",
    icon: "map",
  },
  [PREMIUM_FEATURES.UNLIMITED_MESSAGES]: {
    title: "Unlimited Messages",
    description: "Message without daily limits",
    icon: "chatbubbles",
  },
  [PREMIUM_FEATURES.ROUTE_OVERLAP_ALERTS]: {
    title: "Route Overlap Alerts",
    description: "Get notified when routes match with other nomads",
    icon: "notifications",
  },
  [PREMIUM_FEATURES.PRIORITY_SUPPORT]: {
    title: "Priority Support",
    description: "Get faster response times from our support team",
    icon: "headset",
  },
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  onUpgradePress,
  showBlockedUI = true,
}) => {
  const [gateResult, setGateResult] = useState<FeatureGateResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await checkFeatureGate(feature);
      setGateResult(result);
    } catch (error) {
      console.error("Error checking feature gate:", error);
      setGateResult({ hasAccess: false, reason: "premium_required" });
    } finally {
      setIsLoading(false);
    }
  }, [feature]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.ember[500]} />
      </View>
    );
  }

  // User has access - render children
  if (gateResult?.hasAccess) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Don't show blocked UI (silent gate)
  if (!showBlockedUI) {
    return null;
  }

  // Show premium upgrade UI
  const featureInfo = FEATURE_INFO[feature];
  const tierInfo = getTierDisplayInfo("convoy");

  return (
    <View style={styles.container}>
      {/* Locked Feature Card */}
      <LinearGradient colors={["#F5EFE6", "#EDE5D8"]} style={styles.lockedCard}>
        {/* Lock Icon */}
        <View style={styles.lockIconContainer}>
          <LinearGradient
            colors={[colors.ember[400], colors.ember[500], colors.ember[600]]}
            style={styles.lockIcon}
          >
            <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
          </LinearGradient>
        </View>

        {/* Feature Info */}
        <View style={styles.featureInfo}>
          <View style={styles.featureIconRow}>
            <Ionicons
              name={featureInfo.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={colors.ember[500]}
            />
            <Text style={styles.featureTitle}>{featureInfo.title}</Text>
          </View>
          <Text style={styles.featureDescription}>
            {featureInfo.description}
          </Text>
        </View>

        {/* Limit Info (if applicable) */}
        {gateResult?.reason === "limit_reached" && gateResult.limit && (
          <View style={styles.limitInfo}>
            <Ionicons name="alert-circle" size={16} color={colors.ember[500]} />
            <Text style={styles.limitText}>
              Daily limit reached ({gateResult.used}/{gateResult.limit})
            </Text>
          </View>
        )}

        {/* Upgrade Button */}
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={onUpgradePress}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.ember[400], colors.ember[500], colors.ember[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeButtonGradient}
          >
            <Ionicons name="star" size={18} color="#FFFFFF" />
            <Text style={styles.upgradeButtonText}>
              Upgrade to {tierInfo.name}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Benefits Preview */}
        <View style={styles.benefitsPreview}>
          <View style={styles.benefitItem}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.moss[500]}
            />
            <Text style={styles.benefitText}>Builder Network Access</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.moss[500]}
            />
            <Text style={styles.benefitText}>Unlimited Messages</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.moss[500]}
            />
            <Text style={styles.benefitText}>Ghost Mode</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

/**
 * Hook-based feature gate for conditional rendering
 */
export function useFeatureGate(feature: PremiumFeature) {
  const [result, setResult] = useState<FeatureGateResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      setIsLoading(true);
      try {
        const gateResult = await checkFeatureGate(feature);
        setResult(gateResult);
      } catch {
        setResult({ hasAccess: false, reason: "premium_required" });
      } finally {
        setIsLoading(false);
      }
    };
    check();
  }, [feature]);

  return {
    hasAccess: result?.hasAccess ?? false,
    reason: result?.reason,
    limit: result?.limit,
    used: result?.used,
    isLoading,
  };
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    padding: spacing.md,
  },
  lockedCard: {
    borderRadius: borderRadius["2xl"],
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: "#C65D3B",
    ...shadows.md,
  },
  lockIconContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  lockIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glow,
  },
  featureInfo: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  featureIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  featureTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    color: colors.bark[900],
  },
  featureDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    textAlign: "center",
    lineHeight: 20,
  },
  limitInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(232, 122, 71, 0.1)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  limitText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.ember[600],
  },
  upgradeButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    ...shadows.glow,
  },
  upgradeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  upgradeButtonText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.md,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  benefitsPreview: {
    gap: spacing.xs,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
  },
  benefitText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
  },
});

export default FeatureGate;
