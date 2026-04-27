import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Linking,
  Modal,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Purchases from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import Constants from "expo-constants";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";
import { Button } from "@/components/ui/Button";
import { LinearGradient } from "expo-linear-gradient";

interface PaywallScreenProps {
  onComplete: () => void;
  showSkip?: boolean;
}

interface FeatureComparison {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  free: string | boolean;
  premium: string | boolean;
}

const features: FeatureComparison[] = [
  {
    name: "Route Planning",
    icon: "map",
    free: "Basic",
    premium: "Advanced AI",
  },
  {
    name: "Events per Month",
    icon: "calendar",
    free: "3",
    premium: "Unlimited",
  },
  {
    name: "Emergency Response",
    icon: "alert-circle",
    free: "Standard",
    premium: "Priority",
  },
  {
    name: "Builder Consultations",
    icon: "videocam",
    free: false,
    premium: true,
  },
  { name: "Travel Analytics", icon: "analytics", free: false, premium: true },
  {
    name: "Convoy Size",
    icon: "people",
    free: "5 members",
    premium: "Unlimited",
  },
  {
    name: "Weather Alerts",
    icon: "cloud",
    free: "Basic",
    premium: "Real-time",
  },
  { name: "Offline Maps", icon: "download", free: false, premium: true },
];

function PremiumSuccessModal({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View style={[successStyles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[successStyles.card, { transform: [{ scale: scaleAnim }] }]}
        >
          <LinearGradient
            colors={[colors.moss[500], colors.forestGreen[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={successStyles.iconCircle}
          >
            <Ionicons name="star" size={40} color={colors.text.inverse} />
          </LinearGradient>
          <Text style={successStyles.title}>Welcome to WilderGo Premium!</Text>
          <Text style={successStyles.subtitle}>
            You now have full access to all premium features. Enjoy the open
            road!
          </Text>
          <View style={successStyles.features}>
            {[
              "Unlimited Convoys",
              "Builder Network",
              "Ghost Mode",
              "Priority SOS",
            ].map((feat) => (
              <View key={feat} style={successStyles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.moss[500]}
                />
                <Text style={successStyles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={successStyles.button}
            onPress={onDismiss}
            testID="button-premium-continue"
          >
            <LinearGradient
              colors={[colors.ember[400], colors.ember[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={successStyles.buttonGradient}
            >
              <Text style={successStyles.buttonText}>Let&apos;s Go!</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.text.inverse}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const successStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius["2xl"],
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  features: {
    alignSelf: "stretch",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.primary,
  },
  button: {
    alignSelf: "stretch",
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.inverse,
  },
});

export default function PaywallScreen({
  onComplete,
  showSkip = true,
}: PaywallScreenProps) {
  const insets = useSafeAreaInsets();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    const isExpoGo =
      Constants.appOwnership === "expo" ||
      Constants.executionEnvironment === "storeClient";
    if (isExpoGo || Platform.OS === "web") {
      console.log(
        "RevenueCat skipped in Expo Go/Web - paywall in preview mode",
      );
      setLoading(false);
      return;
    }

    try {
      await Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "",
      });

      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        setPackages(offerings.current.availablePackages);
      }
      setLoading(false);
    } catch (error) {
      console.log(
        "Purchases init skipped:",
        (error as any)?.message?.substring(0, 60),
      );
      setLoading(false);
    }
  };

  const handlePremiumSuccess = () => {
    setShowSuccessModal(true);
  };

  const handleSuccessDismiss = () => {
    setShowSuccessModal(false);
    onComplete();
  };

  const startFreeTrial = async () => {
    try {
      setPurchasing(true);
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "pro",
      });

      if (result === "PURCHASED" || result === "RESTORED") {
        handlePremiumSuccess();
      }
    } catch (error: any) {
      console.log("RevenueCat UI paywall error, falling back:", error?.message);
      if (packages.length > 0) {
        try {
          const purchaseResult = await Purchases.purchasePackage(packages[0]);
          if (purchaseResult.customerInfo.entitlements.active["pro"]) {
            handlePremiumSuccess();
            return;
          }
        } catch (purchaseError: any) {
          if (!purchaseError.userCancelled) {
            console.error("Purchase error:", purchaseError);
          }
        }
      } else {
        handlePremiumSuccess();
      }
    } finally {
      setPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setRestoring(true);
      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active["pro"]) {
        handlePremiumSuccess();
      } else {
        if (Platform.OS === "web") {
          alert(
            "No active subscriptions found. If you believe this is an error, please contact support.",
          );
        }
      }
    } catch (error: any) {
      console.error("Restore purchases error:", error);
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <NatureBackground variant="forest" overlay overlayOpacity={0.5}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.ember[500]} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </NatureBackground>
    );
  }

  return (
    <NatureBackground variant="forest" overlay overlayOpacity={0.5}>
      <PremiumSuccessModal
        visible={showSuccessModal}
        onDismiss={handleSuccessDismiss}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Adventure</Text>
          <Text style={styles.subtitle}>
            Start with Free or unlock the full WilderGo experience
          </Text>
        </View>

        <View style={styles.comparisonContainer}>
          <View style={styles.planLabels}>
            <View style={styles.featureLabelPlaceholder} />
            <View style={styles.planLabel}>
              <Text style={styles.planLabelText}>Free</Text>
            </View>
            <View style={[styles.planLabel, styles.premiumLabel]}>
              <Ionicons
                name="star"
                size={12}
                color={colors.text.inverse}
                style={styles.starIcon}
              />
              <Text style={[styles.planLabelText, styles.premiumLabelText]}>
                Premium
              </Text>
            </View>
          </View>

          <GlassCard variant="medium" padding="md" style={styles.featuresCard}>
            {features.map((feature, index) => (
              <View
                key={feature.name}
                style={[
                  styles.featureRow,
                  index < features.length - 1 && styles.featureRowBorder,
                ]}
              >
                <View style={styles.featureNameContainer}>
                  <Ionicons
                    name={feature.icon}
                    size={18}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.featureName}>{feature.name}</Text>
                </View>
                <View style={styles.featureValues}>
                  <View style={styles.featureValue}>
                    {typeof feature.free === "boolean" ? (
                      feature.free ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.moss[500]}
                        />
                      ) : (
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={colors.text.tertiary}
                        />
                      )
                    ) : (
                      <Text style={styles.featureValueText}>
                        {feature.free}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.featureValue, styles.premiumValue]}>
                    {typeof feature.premium === "boolean" ? (
                      feature.premium ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.moss[500]}
                        />
                      ) : (
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={colors.text.tertiary}
                        />
                      )
                    ) : (
                      <Text
                        style={[
                          styles.featureValueText,
                          styles.premiumValueText,
                        ]}
                      >
                        {feature.premium}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </GlassCard>
        </View>

        <GlassCard variant="medium" padding="lg" style={styles.pricingCard}>
          <View style={styles.pricingHeader}>
            <Ionicons name="star" size={24} color={colors.ember[500]} />
            <Text style={styles.pricingTitle}>WilderGo Premium</Text>
          </View>
          <Text style={styles.price}>
            $4.99<Text style={styles.pricePeriod}>/month</Text>
          </Text>
          <View style={styles.trialBadge}>
            <Ionicons name="gift" size={16} color={colors.moss[600]} />
            <Text style={styles.trialText}>7-day free trial included</Text>
          </View>
          <Text style={styles.cancelNote}>Cancel anytime, no commitment</Text>
        </GlassCard>

        <View style={styles.ctaSection}>
          <Button
            title={purchasing ? "Processing..." : "Start 7-Day Free Trial"}
            onPress={startFreeTrial}
            variant="ember"
            size="lg"
            fullWidth
            disabled={purchasing}
            icon={
              <Ionicons name="rocket" size={20} color={colors.text.inverse} />
            }
            iconPosition="right"
          />

          {showSkip ? (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onComplete}
              disabled={purchasing}
              testID="button-continue-free"
            >
              <Text style={styles.skipButtonText}>
                Continue with Free Version
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.text.inverse}
              />
            </TouchableOpacity>
          ) : null}

          <Text style={styles.terms}>
            After your 7-day free trial, Premium auto-renews at $4.99/month.
            {"\n"}
            Subscription automatically renews unless auto-renew is turned off at
            least 24-hours before the end of the current period.{"\n"}
            Your account will be charged for renewal within 24-hours prior to
            the end of the current period.{"\n"}
            Cancel anytime in Settings {">"} Subscriptions.
          </Text>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={restorePurchases}
            disabled={restoring || purchasing}
            testID="button-restore-purchases"
          >
            {restoring ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>

          <View style={styles.legalLinks}>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://wildergoapp.com/privacy")}
              testID="link-privacy-policy"
            >
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>|</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://wildergoapp.com/terms")}
              testID="link-terms-of-service"
            >
              <Text style={styles.legalLinkText}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </NatureBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.text.inverse,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.text.inverse,
    textAlign: "center",
    marginBottom: spacing.sm,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.text.inverse,
    textAlign: "center",
    opacity: 0.9,
  },
  comparisonContainer: {
    marginBottom: spacing.lg,
  },
  planLabels: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  featureLabelPlaceholder: {
    flex: 1,
  },
  planLabel: {
    width: 70,
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginLeft: spacing.xs,
  },
  premiumLabel: {
    backgroundColor: colors.ember[500],
    flexDirection: "row",
    justifyContent: "center",
  },
  starIcon: {
    marginRight: 4,
  },
  planLabelText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  premiumLabelText: {
    color: colors.text.inverse,
  },
  featuresCard: {
    paddingVertical: spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.borderLight,
  },
  featureNameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  featureName: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.primary,
  },
  featureValues: {
    flexDirection: "row",
  },
  featureValue: {
    width: 70,
    alignItems: "center",
    marginLeft: spacing.xs,
  },
  premiumValue: {},
  featureValueText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
  premiumValueText: {
    color: colors.ember[600],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  pricingCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.ember[500],
  },
  pricingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  pricingTitle: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  price: {
    fontSize: typography.fontSize["3xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.ember[500],
  },
  pricePeriod: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  trialBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.moss[100],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    marginTop: spacing.sm,
  },
  trialText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.moss[700],
  },
  cancelNote: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  ctaSection: {
    marginTop: spacing.md,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  skipButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
    marginRight: spacing.xs,
  },
  terms: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.inverse,
    textAlign: "center",
    marginTop: spacing.lg,
    opacity: 0.7,
    lineHeight: 18,
  },
  restoreButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  restoreButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.inverse,
    textDecorationLine: "underline",
    opacity: 0.8,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  legalLinkText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.inverse,
    textDecorationLine: "underline",
    opacity: 0.8,
  },
  legalSeparator: {
    marginHorizontal: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    opacity: 0.6,
  },
});
