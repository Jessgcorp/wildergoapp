/**
 * WilderGo Convoy Paywall
 * Premium frosted glass subscription UI with RevenueCat integration
 * Highlights: Unlimited Convoys, Builder Network, Ghost Mode, Advanced Route Planning
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
  natureImages,
} from "@/constants/theme";
import { Image } from "expo-image";
import RevenueCatUI from "react-native-purchases-ui";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Premium features for The Convoy subscription
const premiumFeatures = [
  {
    id: "convoy",
    icon: "people",
    emoji: "🏕️",
    title: "Unlimited Convoys",
    description:
      "Create and join unlimited group travel convoys with your road family",
    gradient: [
      colors.ember[400],
      colors.ember[500],
      colors.ember[600],
    ] as const,
    glow: "rgba(214, 138, 92, 0.4)",
  },
  {
    id: "builder",
    icon: "construct",
    emoji: "🔧",
    title: "Builder Priority",
    description: "First access to top-rated rig builders and consultations",
    gradient: [
      colors.driftwood[400],
      colors.driftwood[500],
      colors.driftwood[600],
    ] as const,
    glow: "rgba(104, 92, 80, 0.4)",
  },
  {
    id: "ghost",
    icon: "eye-off",
    emoji: "👻",
    title: "Ghost Mode",
    description: "Hide your exact location while staying connected",
    gradient: [colors.sage[400], colors.sage[500], colors.sage[600]] as const,
    glow: "rgba(90, 102, 88, 0.4)",
  },
  {
    id: "route",
    icon: "map",
    emoji: "🗺️",
    title: "Advanced Routes",
    description: "AI-powered route planning with nomad density insights",
    gradient: [colors.moss[400], colors.moss[500], colors.moss[600]] as const,
    glow: "rgba(74, 107, 80, 0.4)",
  },
];

interface ConvoyPaywallProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe?: (success: boolean) => void;
}

export const ConvoyPaywall: React.FC<ConvoyPaywallProps> = ({
  visible,
  onClose,
  onSubscribe,
}) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    "monthly",
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Feature card animations
  const featureAnims = useRef(
    premiumFeatures.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation sequence
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered feature card animations
      featureAnims.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 1,
          delay: 150 + index * 100,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }).start();
      });

      // Continuous glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, scaleAnim, glowAnim, featureAnims]);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "pro",
      });

      if (result === "PURCHASED" || result === "RESTORED") {
        onSubscribe?.(true);
        onClose();
      }
    } catch (error: any) {
      console.log("RevenueCat UI paywall error, falling back:", error?.message);
      try {
        const Purchases = await import("react-native-purchases")
          .then((m) => m.default)
          .catch(() => null);
        if (Purchases) {
          const offerings = await Purchases.getOfferings();
          const packages = offerings.current?.availablePackages ?? [];
          if (packages.length > 0) {
            const packageId =
              selectedPlan === "annual" ? "$rc_annual" : "$rc_monthly";
            const selectedPackage =
              packages.find((p) => p.identifier === packageId) || packages[0];
            const { customerInfo } =
              await Purchases.purchasePackage(selectedPackage);
            if (
              customerInfo.entitlements.active["pro"] ||
              customerInfo.entitlements.active["convoy"] ||
              customerInfo.entitlements.active["premium"]
            ) {
              onSubscribe?.(true);
              onClose();
            }
          }
        }
      } catch (fallbackError: any) {
        if (!fallbackError.userCancelled) {
          console.error("Purchase error:", fallbackError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);

    try {
      const Purchases = await import("react-native-purchases")
        .then((m) => m.default)
        .catch(() => null);

      if (!Purchases) {
        setRestoring(false);
        return;
      }

      const customerInfo = await Purchases.restorePurchases();

      if (
        customerInfo.entitlements.active["pro"] ||
        customerInfo.entitlements.active["convoy"] ||
        customerInfo.entitlements.active["premium"]
      ) {
        onSubscribe?.(true);
        onClose();
      }
    } catch (error: any) {
      console.error("Restore error:", error);
    } finally {
      setRestoring(false);
    }
  };

  if (!visible) return null;

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Background Image */}
      <Image
        source={{ uri: natureImages.starryNight }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={styles.imageOverlay} />

      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.text.inverse} />
          </TouchableOpacity>

          {/* Premium Badge */}
          <View style={styles.premiumBadge}>
            <LinearGradient
              colors={[colors.ember[400], colors.ember[500], colors.ember[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumBadgeGradient}
            >
              <Ionicons name="star" size={16} color={colors.text.inverse} />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </LinearGradient>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.convoyTitle}>THE CONVOY</Text>
            <Text style={styles.convoySubtitle}>
              Unlock the full nomadic experience
            </Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.featuresContainer}>
            {premiumFeatures.map((feature, index) => (
              <Animated.View
                key={feature.id}
                style={[
                  styles.featureCardWrapper,
                  {
                    opacity: featureAnims[index],
                    transform: [
                      {
                        translateY: featureAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <ContainerWrapper
                  {...(Platform.OS === "ios"
                    ? {
                        tint: "dark" as const,
                        intensity: blur.medium,
                        style: styles.featureCard,
                      }
                    : {
                        style: [styles.featureCard, styles.featureCardFallback],
                      })}
                >
                  <View style={styles.featureContent}>
                    <LinearGradient
                      colors={
                        feature.gradient as unknown as [
                          string,
                          string,
                          ...string[],
                        ]
                      }
                      style={styles.featureIconContainer}
                    >
                      <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                    </LinearGradient>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>
                        {feature.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.moss[400]}
                    />
                  </View>
                </ContainerWrapper>
              </Animated.View>
            ))}
          </View>

          {/* Pricing Section */}
          <ContainerWrapper
            {...(Platform.OS === "ios"
              ? {
                  tint: "light" as const,
                  intensity: blur.heavy,
                  style: styles.pricingCard,
                }
              : { style: [styles.pricingCard, styles.pricingCardFallback] })}
          >
            {/* Plan Toggle */}
            <View style={styles.planToggle}>
              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === "monthly" && styles.planOptionSelected,
                ]}
                onPress={() => setSelectedPlan("monthly")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.planOptionText,
                    selectedPlan === "monthly" && styles.planOptionTextSelected,
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === "annual" && styles.planOptionSelected,
                ]}
                onPress={() => setSelectedPlan("annual")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.planOptionText,
                    selectedPlan === "annual" && styles.planOptionTextSelected,
                  ]}
                >
                  Annual
                </Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 33%</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Price Display */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>
                {selectedPlan === "monthly" ? "$9.99" : "$79.99"}
              </Text>
              <Text style={styles.pricePeriod}>
                /{selectedPlan === "monthly" ? "month" : "year"}
              </Text>
            </View>

            {selectedPlan === "annual" && (
              <Text style={styles.monthlyBreakdown}>
                Just $6.67/month billed annually
              </Text>
            )}

            {/* Subscribe Button */}
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
              activeOpacity={0.85}
              disabled={loading}
            >
              <LinearGradient
                colors={[
                  colors.ember[400],
                  colors.ember[500],
                  colors.ember[600],
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <>
                    <Text style={styles.subscribeButtonText}>
                      JOIN THE CONVOY
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={colors.text.inverse}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Restore Purchases */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={restoring}
            >
              {restoring ? (
                <ActivityIndicator size="small" color={colors.bark[400]} />
              ) : (
                <Text style={styles.restoreButtonText}>Restore Purchases</Text>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              Cancel anytime. Subscription auto-renews until cancelled.
            </Text>
          </ContainerWrapper>

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={colors.moss[400]}
              />
              <Text style={styles.trustText}>Secure Payment</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="refresh" size={18} color={colors.moss[400]} />
              <Text style={styles.trustText}>Cancel Anytime</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="people" size={18} color={colors.moss[400]} />
              <Text style={styles.trustText}>10K+ Nomads</Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteLight,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glass,
  },
  premiumBadge: {
    alignSelf: "center",
    marginTop: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  premiumBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  premiumBadgeText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.wider,
  },
  titleSection: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing["2xl"],
  },
  convoyTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["3xl"],
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.widest,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  convoySubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.bark[200],
    marginTop: spacing.sm,
    textAlign: "center",
  },
  featuresContainer: {
    gap: spacing.md,
    marginBottom: spacing["2xl"],
  },
  featureCardWrapper: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  featureCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  featureCardFallback: {
    backgroundColor: "rgba(30, 24, 20, 0.75)",
  },
  featureContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.text.inverse,
    marginBottom: 2,
  },
  featureDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[300],
    lineHeight: 18,
  },
  pricingCard: {
    borderRadius: borderRadius["2xl"],
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.glass.border,
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  pricingCardFallback: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  planToggle: {
    flexDirection: "row",
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    marginBottom: spacing.xl,
  },
  planOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  planOptionSelected: {
    backgroundColor: colors.glass.white,
    ...shadows.glassSubtle,
  },
  planOptionText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
  },
  planOptionTextSelected: {
    color: colors.bark[800],
  },
  saveBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: colors.moss[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  saveBadgeText: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 8,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  priceAmount: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["3xl"],
    color: colors.bark[900],
  },
  pricePeriod: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.md,
    color: colors.bark[400],
    marginLeft: spacing.xs,
  },
  monthlyBreakdown: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.moss[600],
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  subscribeButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadows.glow,
  },
  subscribeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  subscribeButtonText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.md,
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.wide,
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  restoreButtonText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    textDecorationLine: "underline",
  },
  termsText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[300],
    textAlign: "center",
    lineHeight: 16,
  },
  trustSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  trustText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[200],
  },
});

export default ConvoyPaywall;
