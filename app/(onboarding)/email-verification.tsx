import React, { useState, useEffect, useRef } from "react";
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

export default function EmailVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, resendVerification, checkEmailVerified, logout } = useAuth();
  const [resendTimer, setResendTimer] = useState(0);
  const [checking, setChecking] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const verified = await checkEmailVerified();
      if (verified) {
        router.push("/(onboarding)/selfie-verify");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkEmailVerified]);

  const handleResend = async () => {
    setResendLoading(true);
    setMessage("");
    const result = await resendVerification();
    if (result.success) {
      setMessage("Verification email sent!");
      setResendTimer(60);
    } else {
      setMessage(result.message || "Failed to resend");
    }
    setResendLoading(false);
  };

  const handleChangeEmail = async () => {
    await logout();
  };

  const handleContinue = async () => {
    setChecking(true);
    const verified = await checkEmailVerified();
    if (verified) {
      router.push("/(onboarding)/selfie-verify");
    } else {
      setMessage("Email not verified yet. Please check your inbox.");
    }
    setChecking(false);
  };

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
        <View style={styles.headerSection}>
          <Logo size="medium" variant="light" />
        </View>

        <View style={styles.centerSection}>
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="mail-open-outline"
                size={56}
                color={colors.ember[400]}
              />
            </View>
          </Animated.View>

          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>We sent a verification link to:</Text>
          <Text style={styles.emailText}>{user?.email || "your email"}</Text>
          <Text style={styles.description}>
            Please check your email and click the link to continue.
          </Text>

          {message ? (
            <View style={styles.messageContainer}>
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.moss[600]}
              />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomSection}>
          <Button
            title={checking ? "Checking..." : "I've Verified My Email"}
            onPress={handleContinue}
            variant="ember"
            size="lg"
            fullWidth
            disabled={checking}
            testID="button-continue-verification"
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleResend}
              disabled={resendTimer > 0 || resendLoading}
              testID="button-resend-email"
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={resendTimer > 0 ? colors.bark[400] : colors.text.inverse}
              />
              <Text
                style={[
                  styles.actionText,
                  resendTimer > 0 ? styles.actionTextDisabled : null,
                ]}
              >
                {resendLoading
                  ? "Sending..."
                  : resendTimer > 0
                    ? `Resend (${resendTimer}s)`
                    : "Resend Email"}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangeEmail}
              testID="button-change-email"
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.text.inverse}
              />
              <Text style={styles.actionText}>Change Email</Text>
            </TouchableOpacity>
          </View>
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
  headerSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
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
    width: 120,
    height: 120,
    borderRadius: 60,
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
  },
  emailText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.ember[400],
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
    textAlign: "center",
    lineHeight: 22,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.moss[500] + "20",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  messageText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.moss[600],
    flex: 1,
  },
  bottomSection: {
    gap: spacing.lg,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  actionTextDisabled: {
    color: colors.bark[400],
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.glass.border,
  },
});
