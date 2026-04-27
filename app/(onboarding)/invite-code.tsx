import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TextInput,
} from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  VALID_INVITE_CODES,
} from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";

export default function InviteCodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const waitlistAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleVerifyCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      triggerShake();
      return;
    }

    setLoading(true);
    setError("");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validate against VALID_INVITE_CODES
    const isValid = VALID_INVITE_CODES.includes(
      inviteCode.toUpperCase().trim(),
    );

    if (isValid) {
      // Success - proceed to next step
      router.push("/(onboarding)/phone-auth");
    } else {
      // Invalid code - show waitlist
      setError("Invalid invite code");
      triggerShake();
      setTimeout(() => {
        showWaitlistPanel();
      }, 500);
    }

    setLoading(false);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showWaitlistPanel = () => {
    setShowWaitlist(true);
    Animated.spring(waitlistAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const hideWaitlistPanel = () => {
    Animated.timing(waitlistAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowWaitlist(false);
      setError("");
    });
  };

  const handleWaitlistSubmit = async () => {
    if (!email.trim()) return;

    // Simulate submission
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setWaitlistSubmitted(true);
  };

  return (
    <NatureBackground variant="forest" overlay overlayOpacity={0.45}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
          </View>

          <Text style={styles.stepLabel}>Step 1 of 4</Text>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.logoText}>WilderGo</Text>
            <Text style={styles.title}>Secure Onboarding</Text>
            <Text style={styles.subtitle}>
              Enter your invite code to join our community of verified nomads
            </Text>
          </View>

          {/* Invite Code Input Card */}
          <GlassCard variant="medium" padding="lg" style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="ticket" size={24} color={colors.ember[500]} />
              </View>
              <Text style={styles.inputLabel}>Enter Invite Code</Text>
            </View>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <View
                style={[
                  styles.codeInputContainer,
                  error && styles.codeInputError,
                ]}
              >
                <TextInput
                  style={styles.codeInput}
                  placeholder="WILDER2024"
                  placeholderTextColor={colors.bark[300]}
                  value={inviteCode}
                  onChangeText={(text) => {
                    setInviteCode(text.toUpperCase());
                    setError("");
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={20}
                />
              </View>
            </Animated.View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={colors.ember[500]}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.hintContainer}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.bark[400]}
              />
              <Text style={styles.hintText}>
                Invite codes are provided by existing community members
              </Text>
            </View>
          </GlassCard>

          {/* Request Code Option */}
          <TouchableOpacity
            style={styles.requestCodeButton}
            onPress={showWaitlistPanel}
          >
            <Text style={styles.requestCodeText}>Don&apos;t have a code? </Text>
            <Text style={styles.requestCodeLink}>Request Access</Text>
          </TouchableOpacity>

          {/* CTA Button */}
          <View style={styles.ctaSection}>
            <Button
              title="Join the Convoy"
              onPress={handleVerifyCode}
              variant="ember"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!inviteCode.trim() || loading}
              icon={
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.text.inverse}
                />
              }
              iconPosition="right"
            />
          </View>

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            <GlassCard variant="light" padding="sm" style={styles.trustBadge}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={colors.moss[500]}
              />
              <Text style={styles.trustText}>Vetted Community</Text>
            </GlassCard>
            <GlassCard variant="light" padding="sm" style={styles.trustBadge}>
              <Ionicons name="lock-closed" size={16} color={colors.moss[500]} />
              <Text style={styles.trustText}>Privacy First</Text>
            </GlassCard>
          </View>
        </ScrollView>

        {/* Waitlist Panel Overlay */}
        {showWaitlist && (
          <Animated.View
            style={[
              styles.waitlistOverlay,
              {
                opacity: waitlistAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.waitlistBackdrop}
              activeOpacity={1}
              onPress={hideWaitlistPanel}
            />
            <Animated.View
              style={[
                styles.waitlistPanel,
                {
                  transform: [
                    {
                      translateY: waitlistAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <GlassCard variant="frost" padding="xl">
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={hideWaitlistPanel}
                >
                  <Ionicons name="close" size={24} color={colors.bark[500]} />
                </TouchableOpacity>

                {!waitlistSubmitted ? (
                  <>
                    {/* Waitlist Icon */}
                    <View style={styles.waitlistIconContainer}>
                      <View style={styles.waitlistIcon}>
                        <Ionicons
                          name="hourglass-outline"
                          size={36}
                          color={colors.ember[500]}
                        />
                      </View>
                    </View>

                    <Text style={styles.waitlistTitle}>Join the Waitlist</Text>
                    <Text style={styles.waitlistSubtitle}>
                      WilderGo is invite-only to ensure a safe, verified
                      community. Leave your email and we&apos;ll notify you when
                      a spot opens up.
                    </Text>

                    {/* Email Input */}
                    <View style={styles.waitlistInputContainer}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={colors.bark[400]}
                      />
                      <TextInput
                        style={styles.waitlistInput}
                        placeholder="your@email.com"
                        placeholderTextColor={colors.bark[300]}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    <Button
                      title="Join Waitlist"
                      onPress={handleWaitlistSubmit}
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={loading}
                      disabled={!email.trim() || loading}
                    />

                    {/* Position in Line */}
                    <View style={styles.positionContainer}>
                      <Text style={styles.positionText}>
                        <Text style={styles.positionNumber}>1,247</Text> nomads
                        ahead of you
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Success State */}
                    <View style={styles.waitlistIconContainer}>
                      <View
                        style={[
                          styles.waitlistIcon,
                          { backgroundColor: colors.moss[500] + "20" },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={40}
                          color={colors.moss[500]}
                        />
                      </View>
                    </View>

                    <Text style={styles.waitlistTitle}>
                      You&apos;re on the List!
                    </Text>
                    <Text style={styles.waitlistSubtitle}>
                      We&apos;ll send you an invite code as soon as a spot opens
                      up. Keep your eyes on your inbox!
                    </Text>

                    <View style={styles.successInfo}>
                      <View style={styles.successRow}>
                        <Ionicons
                          name="mail"
                          size={18}
                          color={colors.moss[500]}
                        />
                        <Text style={styles.successText}>{email}</Text>
                      </View>
                      <View style={styles.successRow}>
                        <Ionicons
                          name="trending-up"
                          size={18}
                          color={colors.ember[500]}
                        />
                        <Text style={styles.successText}>Position #1,248</Text>
                      </View>
                    </View>

                    <Button
                      title="Got It"
                      onPress={hideWaitlistPanel}
                      variant="ghost"
                      size="md"
                      fullWidth
                    />
                  </>
                )}
              </GlassCard>
            </Animated.View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </NatureBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glass,
  },
  progressContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.full,
  },
  progressActive: {
    backgroundColor: colors.ember[500],
  },
  stepLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[200],
    marginTop: spacing.md,
  },
  titleSection: {
    alignItems: "center",
    marginTop: spacing["2xl"],
    marginBottom: spacing["2xl"],
  },
  logoText: {
    fontSize: 36,
    fontWeight: "300",
    color: colors.text.inverse,
    fontStyle: "italic",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: "700",
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.bark[200],
    textAlign: "center",
    lineHeight: 22,
  },
  inputCard: {
    marginBottom: spacing.lg,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  inputIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.ember[500] + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
    color: colors.bark[800],
  },
  codeInputContainer: {
    backgroundColor: colors.glass.whiteSubtle,
    borderWidth: 2,
    borderColor: colors.glass.border,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  codeInputError: {
    borderColor: colors.ember[500],
  },
  codeInput: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.bark[900],
    textAlign: "center",
    letterSpacing: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.ember[500],
    fontWeight: "500",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  hintText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
  },
  requestCodeButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  requestCodeText: {
    fontSize: typography.fontSize.base,
    color: colors.bark[200],
  },
  requestCodeLink: {
    fontSize: typography.fontSize.base,
    fontWeight: "600",
    color: colors.ember[400],
  },
  ctaSection: {
    marginBottom: spacing.xl,
  },
  trustSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  trustText: {
    fontSize: typography.fontSize.sm,
    color: colors.moss[600],
    fontWeight: "500",
  },
  // Waitlist Panel Styles
  waitlistOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  waitlistBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  waitlistPanel: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteLight,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  waitlistIconContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  waitlistIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.ember[500] + "20",
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glassSubtle,
  },
  waitlistTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: "700",
    color: colors.bark[900],
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  waitlistSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.bark[500],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  waitlistInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.whiteSubtle,
    borderWidth: 1.5,
    borderColor: colors.glass.border,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  waitlistInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.bark[900],
  },
  positionContainer: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  positionText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
  },
  positionNumber: {
    fontWeight: "700",
    color: colors.ember[500],
  },
  successInfo: {
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  successText: {
    fontSize: typography.fontSize.base,
    color: colors.bark[700],
    fontWeight: "500",
  },
});
