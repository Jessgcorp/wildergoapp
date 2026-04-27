import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";

export default function CompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Sequence animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scaleAnim, fadeAnim, slideAnim]);

  const handleGetStarted = () => {
    router.replace("/(onboarding)/paywall");
  };

  return (
    <NatureBackground variant="forest" overlay overlayOpacity={0.4}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom },
        ]}
      >
        {/* Success Animation */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="checkmark"
                size={52}
                color={colors.text.inverse}
              />
            </View>
            <View style={styles.iconGlow} />
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Welcome to the Convoy!</Text>
            <Text style={styles.subtitle}>
              You&apos;re now part of an exclusive community of verified nomads.
              The road is better together.
            </Text>
          </Animated.View>

          {/* Feature Highlights */}
          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <GlassCard variant="medium" padding="lg">
              <View style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: colors.moss[500] + "25" },
                  ]}
                >
                  <Ionicons name="people" size={24} color={colors.moss[500]} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Community Mode</Text>
                  <Text style={styles.featureText}>
                    Join convoys and explore
                  </Text>
                </View>
              </View>

              <View style={styles.featureDivider} />

              <View style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: colors.driftwood[500] + "25" },
                  ]}
                >
                  <Ionicons
                    name="construct"
                    size={24}
                    color={colors.driftwood[500]}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Builder Network</Text>
                  <Text style={styles.featureText}>
                    Connect with van builders
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Button
            title="Start Exploring"
            onPress={handleGetStarted}
            variant="ember"
            size="lg"
            fullWidth
            icon={
              <Ionicons name="compass" size={20} color={colors.text.inverse} />
            }
            iconPosition="right"
          />

          <Text style={styles.footerText}>Your adventure begins now</Text>
        </View>
      </View>
    </NatureBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: spacing["2xl"],
    position: "relative",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.moss[500],
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glass,
  },
  iconGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: colors.moss[500],
    opacity: 0.3,
    zIndex: -1,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.text.inverse,
    textAlign: "center",
    marginBottom: spacing.md,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[200],
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  featuresContainer: {
    width: "100%",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureDivider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginVertical: spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
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
    marginBottom: 2,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  ctaSection: {
    paddingBottom: spacing.xl,
  },
  footerText: {
    textAlign: "center",
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
    marginTop: spacing.lg,
    fontStyle: "italic",
  },
});
