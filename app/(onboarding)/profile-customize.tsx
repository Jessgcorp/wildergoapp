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
import { Image } from "expo-image";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function ProfileCustomizeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      console.log("Image picker not available");
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.push("/(onboarding)/activities");
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
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
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="button-back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.bark[700]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handlePickPhoto}
          activeOpacity={0.8}
          testID="button-pick-photo"
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Logo size="small" variant="dark" />
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={16} color={colors.bark[600]} />
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Customize your profile</Text>
        <Text style={styles.subtitle}>
          Get ready to connect with the community
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Your name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add your name"
              placeholderTextColor={colors.bark[400]}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              testID="input-display-name"
            />
          </View>

          <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>
            Short bio (optional)
          </Text>
          <View style={[styles.inputContainer, styles.bioContainer]}>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about your adventures..."
              placeholderTextColor={colors.bark[400]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              maxLength={150}
              testID="input-bio"
            />
          </View>
          <Text style={styles.charCount}>{bio.length}/150</Text>
        </View>

        <View style={styles.bottomSection}>
          <Button
            title={loading ? "Saving..." : "Next"}
            onPress={handleContinue}
            variant="ember"
            size="lg"
            fullWidth
            disabled={loading}
            icon={
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.text.inverse}
              />
            }
            testID="button-continue-profile"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: colors.bark[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    alignSelf: "flex-start",
    marginBottom: spacing.xl,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bark[700],
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.bark[200],
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    marginBottom: spacing["2xl"],
  },
  formSection: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[900],
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.bark[50] || "#FAF8F5",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.bark[200],
    paddingHorizontal: spacing.lg,
    height: 52,
    justifyContent: "center",
  },
  bioContainer: {
    height: 100,
    paddingVertical: spacing.md,
  },
  input: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[900],
  },
  bioInput: {
    height: 70,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
    textAlign: "right",
    marginTop: spacing.xs,
  },
  bottomSection: {
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.lg,
  },
});
