import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  natureImages,
} from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Logo } from "@/components/ui/Logo";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const backgroundScale = useRef(new Animated.Value(1.1)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.parallel([
      // Background zoom
      Animated.timing(backgroundScale, {
        toValue: 1.05,
        duration: 20000,
        useNativeDriver: true,
      }),
      // Logo scale
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      // Content fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      // Content slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, logoScale, backgroundScale]);

  return (
    <View style={styles.container}>
      {/* Full-Screen Background Image */}
      <Animated.View
        style={[
          styles.backgroundContainer,
          { transform: [{ scale: backgroundScale }] },
        ]}
      >
        <Image
          source={{ uri: natureImages.vanStars }}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={800}
        />
      </Animated.View>

      {/* Dark Gradient Overlay */}
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0.2)",
          "rgba(0, 0, 0, 0.4)",
          "rgba(30, 24, 20, 0.8)",
          "rgba(30, 24, 20, 0.95)",
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradient}
      />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
        {/* Logo Section */}
        <Animated.View
          style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}
        >
          <View style={styles.logoIcon}>
            <Image
              source={require("../../assets/images/brand-logo.png")}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>
          <Logo size="hero" variant="light" showTagline />
          <View style={styles.taglineContainer}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>Invite-Only Nomadic Community</Text>
            <View style={styles.taglineLine} />
          </View>
        </Animated.View>

        {/* Features Glass Card */}
        <Animated.View
          style={[
            styles.featuresWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <GlassCard variant="frost" padding="lg" style={styles.featuresCard}>
            <View style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.moss[500] + "30" },
                ]}
              >
                <Ionicons name="people" size={22} color={colors.moss[500]} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Friends Mode</Text>
                <Text style={styles.featureText}>
                  Find events and connect with nomads along the way
                </Text>
              </View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.driftwood[500] + "30" },
                ]}
              >
                <Ionicons
                  name="build"
                  size={22}
                  color={colors.driftwood[500]}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Builds Mode</Text>
                <Text style={styles.featureText}>
                  Connect with van builders and share your rig journey
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Bottom Section */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              paddingBottom: insets.bottom + spacing.xl,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Premium Badge */}
          <GlassCard variant="frost" padding="sm" style={styles.premiumBadge}>
            <View style={styles.premiumContent}>
              <View style={styles.premiumIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={colors.text.inverse}
                />
              </View>
              <Text style={styles.premiumText}>
                Verified Community Members Only
              </Text>
            </View>
          </GlassCard>

          {/* CTA Button */}
          <Button
            title="Join the Convoy"
            onPress={() => router.push("/(onboarding)/create-account")}
            variant="ember"
            size="lg"
            fullWidth
            icon={
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.text.inverse}
              />
            }
            iconPosition="right"
          />

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1814",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
    marginTop: spacing.xl,
  },
  logoIcon: {
    width: 88,
    height: 88,
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.glassFloat,
  },
  logoImage: {
    width: 88,
    height: 88,
  },
  logoText: {
    fontSize: 52,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.logo,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
    textTransform: "uppercase",
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    gap: spacing.md,
    width: "100%",
  },
  taglineLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.ember[400],
    opacity: 0.6,
  },
  tagline: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[200],
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  featuresWrapper: {
    marginBottom: spacing.xl,
  },
  featuresCard: {
    borderRadius: borderRadius["2xl"],
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    lineHeight: 18,
  },
  featureDivider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginVertical: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingTop: spacing.lg,
  },
  premiumBadge: {
    marginBottom: spacing.xl,
    alignSelf: "center",
    borderRadius: borderRadius.full,
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  premiumIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.moss[500],
    justifyContent: "center",
    alignItems: "center",
  },
  premiumText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.moss[600],
  },
  disclaimer: {
    textAlign: "center",
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
    marginTop: spacing.lg,
  },
});
