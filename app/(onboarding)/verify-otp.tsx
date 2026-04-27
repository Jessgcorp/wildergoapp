import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
} from "@/constants/theme";
import { OTPInput } from "@/components/ui/OTPInput";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { verifyOTP, pendingAuth, sendOTP } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOTPComplete = async (code: string) => {
    setError("");
    setLoading(true);

    const result = await verifyOTP(code);

    if (result.success) {
      router.replace("/(onboarding)/vehicle-select");
    } else {
      setError(result.message || "Invalid code. Please try again.");
    }

    setLoading(false);
  };

  const handleResend = async () => {
    if (!canResend || !pendingAuth) return;

    setCanResend(false);
    setResendTimer(30);
    setError("");

    const result = await sendOTP(pendingAuth.type, pendingAuth.value);
    if (!result.success) {
      setError(result.message || "Failed to resend code");
    }
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
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={styles.progressBar} />
          </View>

          <Text style={styles.stepLabel}>Step 3 of 4</Text>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="keypad" size={32} color={colors.text.inverse} />
            </View>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to your phone. Enter it below to continue.
            </Text>
          </View>

          {/* OTP Input Card */}
          <GlassCard variant="medium" padding="xl" style={styles.otpCard}>
            <OTPInput length={6} onComplete={handleOTPComplete} autoFocus />

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={colors.ember[500]}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Resend Code */}
            <View style={styles.resendSection}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendText}>
                  Resend code in{" "}
                  <Text style={styles.timerText}>{resendTimer}s</Text>
                </Text>
              )}
            </View>
          </GlassCard>

          {/* Help Section */}
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={colors.bark[300]}
            />
            <Text style={styles.helpText}>Didn&apos;t receive the code?</Text>
          </TouchableOpacity>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <GlassCard variant="frost" padding="xl">
                <View style={styles.loadingContent}>
                  <Ionicons
                    name="shield-checkmark"
                    size={32}
                    color={colors.moss[500]}
                  />
                  <Text style={styles.loadingText}>Verifying...</Text>
                </View>
              </GlassCard>
            </View>
          )}
        </ScrollView>
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
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.glass,
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
    paddingHorizontal: spacing.lg,
  },
  otpCard: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.ember[500],
    fontWeight: "500",
  },
  resendSection: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  resendText: {
    fontSize: typography.fontSize.base,
    color: colors.bark[500],
  },
  timerText: {
    fontWeight: "700",
    color: colors.ember[500],
  },
  resendLink: {
    fontSize: typography.fontSize.base,
    fontWeight: "600",
    color: colors.moss[500],
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[300],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingContent: {
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.bark[800],
  },
});
