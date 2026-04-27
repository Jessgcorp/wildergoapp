import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/contexts/AuthContext";

const IS_BETA = process.env.EXPO_PUBLIC_BETA_MODE === "true";

export default function SelfieVerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { submitSelfie, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSkip = IS_BETA || !!user?.invitedBy;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const handleTakeSelfie = async () => {
    setLoading(true);
    const result = await submitSelfie("selfie_captured");
    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        router.push("/(onboarding)/profile-customize");
      }, 1500);
    }
    setLoading(false);
  };

  const handleSkip = () => {
    router.push("/(onboarding)/profile-customize");
  };

  const verifyReasons = [
    {
      icon: "shield-checkmark" as const,
      text: "Prevents bots and fake accounts",
    },
    { icon: "people" as const, text: "Keeps the community safe" },
    { icon: "heart" as const, text: "Builds trust between members" },
  ];

  return (
    <NatureBackground variant="forest" overlay overlayOpacity={0.45}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="button-back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Logo size="medium" variant="light" />
        </View>

        <Animated.View
          style={[
            styles.centerSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.iconCircle}>
              {submitted ? (
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color={colors.moss[400]}
                />
              ) : (
                <Ionicons
                  name="camera-outline"
                  size={56}
                  color={colors.ember[400]}
                />
              )}
            </View>
          </Animated.View>

          <Text style={styles.title}>
            {submitted ? "Selfie Submitted!" : "Verify You're Real"}
          </Text>
          <Text style={styles.subtitle}>
            {submitted
              ? "Your selfie is being reviewed. You'll get your verified badge soon."
              : "WilderGo is a safe community.\nTake a quick selfie to verify you're a real person."}
          </Text>

          {!submitted ? (
            <GlassCard variant="frost" padding="lg" style={styles.reasonsCard}>
              <Text style={styles.reasonsTitle}>Why we verify:</Text>
              {verifyReasons.map((reason, index) => (
                <View key={index} style={styles.reasonRow}>
                  <Ionicons
                    name={reason.icon}
                    size={20}
                    color={colors.moss[500]}
                  />
                  <Text style={styles.reasonText}>{reason.text}</Text>
                </View>
              ))}
            </GlassCard>
          ) : null}
        </Animated.View>

        <View style={styles.bottomSection}>
          {!submitted ? (
            <>
              <Button
                title={loading ? "Capturing..." : "Take Selfie"}
                onPress={handleTakeSelfie}
                variant="ember"
                size="lg"
                fullWidth
                disabled={loading}
                icon={
                  <Ionicons
                    name="camera"
                    size={20}
                    color={colors.text.inverse}
                  />
                }
                testID="button-take-selfie"
              />

              {canSkip ? (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  testID="button-skip-selfie"
                >
                  <Text style={styles.skipText}>
                    {user?.invitedBy
                      ? "Skip (Invited by a Member)"
                      : "Skip for Now (Beta)"}
                  </Text>
                  <Text style={styles.skipSubtext}>
                    {user?.invitedBy
                      ? "Your friend vouched for you"
                      : "Beta testers can skip during testing"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.requiredNotice}>
                  <Ionicons
                    name="shield-checkmark"
                    size={14}
                    color={colors.moss[400]}
                  />
                  <Text style={styles.requiredNoticeText}>
                    Selfie verification is required to keep our community safe
                  </Text>
                </View>
              )}
            </>
          ) : null}
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: spacing["2xl"],
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.ember[400] + "40",
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.text.inverse,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  reasonsCard: {
    borderRadius: borderRadius["2xl"],
    width: "100%",
  },
  reasonsTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    marginBottom: spacing.md,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  reasonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[700],
    flex: 1,
  },
  bottomSection: {
    gap: spacing.md,
  },
  skipButton: {
    alignItems: "center",
    padding: spacing.md,
  },
  skipText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[300],
  },
  skipSubtext: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
    marginTop: spacing.xs,
  },
  requiredNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  requiredNoticeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.moss[400],
  },
});
