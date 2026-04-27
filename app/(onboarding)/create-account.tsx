import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
} from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);

  const handleCreateAccount = async () => {
    console.log(
      `[CREATE ACCOUNT] Button pressed! isSignIn=${isSignIn}, email="${email}"`,
    );
    setError("");

    if (!email.trim()) {
      console.log(`[CREATE ACCOUNT] Validation failed: empty email`);
      setError("Please enter your email address");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      console.log(`[CREATE ACCOUNT] Validation failed: invalid email format`);
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      console.log(`[CREATE ACCOUNT] Validation failed: password too short`);
      setError("Password must be at least 6 characters");
      return;
    }

    if (!isSignIn && password !== confirmPassword) {
      console.log(`[CREATE ACCOUNT] Validation failed: passwords don't match`);
      setError("Passwords do not match");
      return;
    }

    console.log(
      `[CREATE ACCOUNT] Validation passed, calling ${isSignIn ? "signIn" : "signUp"}...`,
    );
    setLoading(true);

    try {
      if (isSignIn) {
        console.log(`[CREATE ACCOUNT] Calling signIn...`);
        const result = await signIn(email, password);
        console.log(`[CREATE ACCOUNT] signIn result:`, JSON.stringify(result));
        if (result.success) {
          console.log(
            `[CREATE ACCOUNT] signIn succeeded, auto-navigating to home`,
          );
        } else {
          console.log(`[CREATE ACCOUNT] signIn failed: ${result.message}`);
          setError(result.message || "Sign in failed");
        }
      } else {
        console.log(`[CREATE ACCOUNT] Calling signUp...`);
        const result = await signUp(email, password);
        console.log(`[CREATE ACCOUNT] signUp result:`, JSON.stringify(result));
        if (result.success) {
          console.log(
            `[CREATE ACCOUNT] signUp succeeded, auto-logging in and navigating to home`,
          );
        } else {
          console.log(`[CREATE ACCOUNT] signUp failed: ${result.message}`);
          setError(result.message || "Account creation failed");
        }
      }
    } catch (err: any) {
      console.error(`[CREATE ACCOUNT] Unexpected error:`, err.message);
      setError("An unexpected error occurred. Please try again.");
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="button-back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <Logo size="large" variant="light" />
            <Text style={styles.title}>
              {isSignIn ? "Welcome Back" : "Create Account"}
            </Text>
            <Text style={styles.subtitle}>
              {isSignIn
                ? "Sign in to continue your journey"
                : "Join the WilderGo nomadic community"}
            </Text>
          </View>

          <GlassCard variant="frost" padding="lg" style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.bark[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="yourname@email.com"
                  placeholderTextColor={colors.bark[400]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="input-email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.bark[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.bark[400]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  testID="input-password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.bark[400]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {!isSignIn ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.bark[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor={colors.bark[400]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    testID="input-confirm-password"
                  />
                </View>
              </View>
            ) : null}

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

            <Button
              title={
                loading
                  ? isSignIn
                    ? "Signing In..."
                    : "Creating Account..."
                  : isSignIn
                    ? "Sign In"
                    : "Create Account"
              }
              onPress={handleCreateAccount}
              variant="ember"
              size="lg"
              fullWidth
              disabled={loading}
              testID="button-create-account"
            />
          </GlassCard>

          {!isSignIn ? (
            <View style={styles.safetyNotice}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={colors.moss[400]}
              />
              <Text style={styles.safetyNoticeText}>
                By signing up, you agree to verify your identity with a selfie
                to keep our community safe.
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsSignIn(!isSignIn);
              setError("");
            }}
            testID="button-switch-mode"
          >
            <Text style={styles.switchText}>
              {isSignIn
                ? "Don't have an account? "
                : "Already have an account? "}
              <Text style={styles.switchTextBold}>
                {isSignIn ? "Create one" : "Sign in"}
              </Text>
            </Text>
          </TouchableOpacity>
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
    marginBottom: spacing.lg,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.text.inverse,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
    marginTop: spacing.sm,
    textAlign: "center",
  },
  formCard: {
    borderRadius: borderRadius["2xl"],
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[700],
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bark[100],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.bark[200],
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[900],
    height: "100%",
  },
  eyeButton: {
    padding: spacing.xs,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ember[500] + "15",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.ember[600],
    flex: 1,
  },
  safetyNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  safetyNoticeText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
    lineHeight: 18,
  },
  switchButton: {
    alignItems: "center",
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  switchText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
  },
  switchTextBold: {
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.ember[400],
  },
});
