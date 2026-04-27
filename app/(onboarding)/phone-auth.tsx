import React, { useState } from "react";
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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";
import { useAuth } from "@/contexts/AuthContext";

export default function PhoneAuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sendOTP } = useAuth();
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setError("");
    setLoading(true);

    if (authMethod === "phone") {
      if (phone.length < 10) {
        setError("Please enter a valid phone number");
        setLoading(false);
        return;
      }
    } else {
      if (!email.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
    }

    const value = authMethod === "phone" ? phone : email;
    const result = await sendOTP(authMethod, value);

    if (result.success) {
      router.push("/(onboarding)/verify-otp");
    } else {
      setError(result.message || "Failed to send verification code");
    }

    setLoading(false);
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
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
          </View>

          <Text style={styles.stepLabel}>Step 2 of 4</Text>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="phone-portrait"
                size={32}
                color={colors.text.inverse}
              />
            </View>
            <Text style={styles.title}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>
              We&apos;ll send you a 6-digit code to verify your identity
            </Text>
          </View>

          {/* Auth Method Toggle Card */}
          <GlassCard variant="medium" padding="sm" style={styles.toggleCard}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  authMethod === "phone" && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  setAuthMethod("phone");
                  setError("");
                }}
              >
                <Ionicons
                  name="call"
                  size={18}
                  color={
                    authMethod === "phone"
                      ? colors.text.inverse
                      : colors.bark[500]
                  }
                />
                <Text
                  style={[
                    styles.toggleText,
                    authMethod === "phone" && styles.toggleTextActive,
                  ]}
                >
                  Phone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  authMethod === "email" && styles.toggleButtonActive,
                ]}
                onPress={() => {
                  setAuthMethod("email");
                  setError("");
                }}
              >
                <Ionicons
                  name="mail"
                  size={18}
                  color={
                    authMethod === "email"
                      ? colors.text.inverse
                      : colors.bark[500]
                  }
                />
                <Text
                  style={[
                    styles.toggleText,
                    authMethod === "email" && styles.toggleTextActive,
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Input Form Card */}
          <GlassCard variant="medium" padding="lg" style={styles.formCard}>
            <View style={styles.formHeader}>
              <Ionicons
                name={authMethod === "phone" ? "call" : "mail"}
                size={20}
                color={colors.ember[500]}
              />
              <Text style={styles.formLabel}>
                Enter your{" "}
                {authMethod === "phone" ? "phone number" : "email address"}
              </Text>
            </View>

            {authMethod === "phone" ? (
              <Input
                placeholder="(555) 123-4567"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, ""));
                  setError("");
                }}
                error={error}
                keyboardType="phone-pad"
                leftIcon={
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+1</Text>
                  </View>
                }
              />
            ) : (
              <Input
                placeholder="email@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text.toLowerCase());
                  setError("");
                }}
                error={error}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.bark[400]}
                  />
                }
              />
            )}

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={colors.moss[500]}
              />
              <Text style={styles.privacyText}>
                Your {authMethod} will only be used for verification and will
                never be shared
              </Text>
            </View>
          </GlassCard>

          {/* CTA Button */}
          <View style={styles.ctaSection}>
            <Button
              title="Send Verification Code"
              onPress={handleContinue}
              variant="ember"
              size="lg"
              fullWidth
              loading={loading}
              disabled={authMethod === "phone" ? !phone : !email}
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
  },
  toggleCard: {
    marginBottom: spacing.lg,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.moss[500],
    ...shadows.glassSubtle,
  },
  toggleText: {
    fontSize: typography.fontSize.base,
    fontWeight: "600",
    color: colors.bark[500],
  },
  toggleTextActive: {
    color: colors.text.inverse,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.bark[700],
  },
  countryCode: {
    borderRightWidth: 1,
    borderRightColor: colors.glass.border,
    paddingRight: spacing.md,
    marginRight: spacing.sm,
  },
  countryCodeText: {
    fontSize: typography.fontSize.base,
    fontWeight: "600",
    color: colors.bark[600],
  },
  privacyNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.moss[500] + "15",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.moss[700],
    lineHeight: 18,
  },
  ctaSection: {
    marginBottom: spacing.xl,
  },
});
