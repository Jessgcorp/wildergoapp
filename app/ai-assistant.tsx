import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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

// Stub error codes (AI disabled in this environment)
const NewellErrorCode = {
  NETWORK_ERROR: "NETWORK_ERROR",
};

// Stub hook for image analysis (AI disabled)
function useImageAnalysis(_options?: {
  onError?: (err: { code: string }) => void;
}) {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  const analyzeImage = useCallback(
    async (_opts: { imageUrl: string; prompt: string }) => {
      setIsLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setData(
        "Image analysis is currently disabled. Your van build looks great! Consider checking wire gauges and ensuring proper grounding for your electrical system. Always use marine-grade components for longevity.",
      );
      setIsLoading(false);
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { analyzeImage, data, isLoading, error, reset };
}

// Stub hook for text generation (AI disabled)
function useTextGeneration(_options?: {
  onError?: (err: { code: string }) => void;
}) {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  const generateText = useCallback(async (_prompt: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setData(`1. "Hey! Love your ${_prompt.includes("Sprinter") ? "Sprinter" : "van"} setup - been thinking about a similar build. What was the trickiest part?"

2. "Fellow nomad here! Noticed you're into hiking - have any favorite trails near where you're parked?"

3. "Your rig looks road-ready! Heading anywhere interesting this season? Always looking for new spots to explore."`);
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { generateText, data, isLoading, error, reset };
}

const { width, height } = Dimensions.get("window");

type AssistantMode = "build" | "icebreaker";

interface UserProfile {
  name: string;
  interests: string[];
  vehicle: string;
  style: string;
  avatar: string;
}

// Sample profiles for icebreaker generation
const sampleProfiles: UserProfile[] = [
  {
    name: "Alex",
    interests: ["Hiking", "Coffee", "Photography"],
    vehicle: "'98 Sprinter",
    style: "Full-Time",
    avatar: "🧔",
  },
  {
    name: "Jordan",
    interests: ["Yoga", "Climbing", "Cooking"],
    vehicle: "Promaster",
    style: "Seasonal",
    avatar: "👩",
  },
  {
    name: "Sam",
    interests: ["Music", "Surfing", "Stars"],
    vehicle: "Skoolie",
    style: "Remote",
    avatar: "🧑",
  },
];

export default function AIAssistantScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeMode, setActiveMode] = useState<AssistantMode>("build");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(
    null,
  );

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const backgroundScale = useRef(new Animated.Value(1.1)).current;

  // HUD Scanning animations
  const scanRotation = useRef(new Animated.Value(0)).current;
  const scanPulse = useRef(new Animated.Value(0.3)).current;
  const scanRing1 = useRef(new Animated.Value(0)).current;
  const scanRing2 = useRef(new Animated.Value(0)).current;
  const scanRing3 = useRef(new Animated.Value(0)).current;
  const scanOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backgroundScale, {
        toValue: 1.05,
        duration: 20000,
        useNativeDriver: true,
      }),
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
  }, [fadeAnim, slideAnim, backgroundScale]);

  // Image Analysis hook for Build Assistant
  const {
    analyzeImage,
    data: analysisResult,
    isLoading: isAnalyzing,
    error: analysisError,
    reset: resetAnalysis,
  } = useImageAnalysis({
    onError: (err) => {
      if (err.code === NewellErrorCode.NETWORK_ERROR) {
        Alert.alert(
          "Network Error",
          "Please check your connection and try again.",
        );
      }
    },
  });

  // Text Generation hook for Icebreaker
  const {
    generateText,
    data: icebreakerResult,
    isLoading: isGenerating,
    error: icebreakerError,
    reset: resetIcebreaker,
  } = useTextGeneration({
    onError: (err) => {
      if (err.code === NewellErrorCode.NETWORK_ERROR) {
        Alert.alert(
          "Network Error",
          "Please check your connection and try again.",
        );
      }
    },
  });

  // Start HUD scanning animation when analyzing or generating
  useEffect(() => {
    if (isAnalyzing || isGenerating) {
      // Show scan overlay
      Animated.timing(scanOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Rotation animation
      Animated.loop(
        Animated.timing(scanRotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanPulse, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scanPulse, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Expanding rings animation
      const ringAnimation = (ring: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(ring, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(ring, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        );
      };

      ringAnimation(scanRing1, 0).start();
      ringAnimation(scanRing2, 600).start();
      ringAnimation(scanRing3, 1200).start();
    } else {
      // Hide scan overlay
      Animated.timing(scanOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [
    isAnalyzing,
    isGenerating,
    scanRotation,
    scanPulse,
    scanRing1,
    scanRing2,
    scanRing3,
    scanOpacity,
  ]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera roll permissions to analyze images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      resetAnalysis();
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera permissions to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      resetAnalysis();
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    const prompt =
      customPrompt ||
      "Analyze this van build or vehicle issue. Identify any problems with wiring, installation, or setup. Provide specific recommendations for fixes or improvements. Be detailed and practical for a DIY van builder.";

    await analyzeImage({
      imageUrl: selectedImage,
      prompt,
    });
  };

  const handleGenerateIcebreaker = async () => {
    if (!selectedProfile) return;

    const prompt = `Generate 3 unique, friendly conversation starters for someone meeting a fellow van lifer with these details:

Name: ${selectedProfile.name}
Vehicle: ${selectedProfile.vehicle}
Travel Style: ${selectedProfile.style}
Interests: ${selectedProfile.interests.join(", ")}

Make the icebreakers:
1. Warm and genuine, not cheesy
2. Related to their interests or nomad lifestyle
3. Open-ended to encourage conversation
4. Appropriate for the van life community

Format each icebreaker on a new line with a number.`;

    await generateText(prompt);
  };

  const handleModeChange = (mode: AssistantMode) => {
    setActiveMode(mode);
    resetAnalysis();
    resetIcebreaker();
  };

  const spin = scanRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderScanRing = (ring: Animated.Value, size: number) => (
    <Animated.View
      style={[
        styles.scanRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: ring.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.8, 0.4, 0],
          }),
          transform: [
            {
              scale: ring.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1.5],
              }),
            },
          ],
        },
      ]}
    />
  );

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
          source={{
            uri:
              activeMode === "build"
                ? natureImages.mountainLake
                : natureImages.campfire,
          }}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={800}
        />
      </Animated.View>

      {/* Gradient Overlay */}
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0.4)",
          "rgba(0, 0, 0, 0.5)",
          "rgba(30, 24, 20, 0.85)",
          "rgba(30, 24, 20, 0.98)",
        ]}
        locations={[0, 0.2, 0.5, 1]}
        style={styles.gradient}
      />

      {/* HUD Scanning Overlay */}
      <Animated.View
        style={[styles.scanOverlay, { opacity: scanOpacity }]}
        pointerEvents="none"
      >
        <View style={styles.scanContainer}>
          {renderScanRing(scanRing1, 200)}
          {renderScanRing(scanRing2, 200)}
          {renderScanRing(scanRing3, 200)}

          <Animated.View
            style={[styles.scanCenter, { transform: [{ rotate: spin }] }]}
          >
            <View style={styles.scanCrosshair}>
              <View style={[styles.scanLine, styles.scanLineHorizontal]} />
              <View style={[styles.scanLine, styles.scanLineVertical]} />
            </View>
            <Animated.View style={[styles.scanDot, { opacity: scanPulse }]} />
          </Animated.View>

          <Text style={styles.scanText}>
            {isAnalyzing ? "ANALYZING SYSTEMS..." : "GENERATING..."}
          </Text>

          <View style={styles.scanStatus}>
            <View style={styles.scanStatusDot} />
            <Text style={styles.scanStatusText}>NEWELL AI ACTIVE</Text>
          </View>
        </View>
      </Animated.View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={18} color={colors.ember[400]} />
          </View>
          <Text style={styles.headerTitle}>Newell AI</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Mode Toggle */}
      <Animated.View
        style={[
          styles.toggleWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <GlassCard variant="frost" padding="sm" style={styles.toggleCard}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeMode === "build" && styles.toggleButtonActive,
            ]}
            onPress={() => handleModeChange("build")}
          >
            <Ionicons
              name="construct"
              size={18}
              color={
                activeMode === "build" ? colors.text.inverse : colors.bark[500]
              }
            />
            <Text
              style={[
                styles.toggleText,
                activeMode === "build" && styles.toggleTextActive,
              ]}
            >
              Build Assistant
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeMode === "icebreaker" && styles.toggleButtonActive,
            ]}
            onPress={() => handleModeChange("icebreaker")}
          >
            <Ionicons
              name="chatbubbles"
              size={18}
              color={
                activeMode === "icebreaker"
                  ? colors.text.inverse
                  : colors.bark[500]
              }
            />
            <Text
              style={[
                styles.toggleText,
                activeMode === "icebreaker" && styles.toggleTextActive,
              ]}
            >
              Icebreaker
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeMode === "build" ? (
          /* Build Assistant Mode */
          <Animated.View
            style={[
              styles.modeContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <GlassCard variant="frost" padding="md" style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name="hardware-chip"
                    size={20}
                    color={colors.moss[400]}
                  />
                </View>
                <Text style={styles.infoText}>
                  Snap a photo of your wiring, plumbing, or any build issue. Our
                  AI will analyze it and provide expert recommendations.
                </Text>
              </View>
            </GlassCard>

            {/* Image Selection */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Upload or Take Photo</Text>

              {selectedImage ? (
                <GlassCard
                  variant="medium"
                  padding="none"
                  style={styles.selectedImageCard}
                >
                  <View style={styles.selectedImageContainer}>
                    <View style={styles.imagePlaceholder}>
                      <Ionicons
                        name="image"
                        size={48}
                        color={colors.moss[400]}
                      />
                      <Text style={styles.imagePlaceholderText}>
                        Image Selected
                      </Text>
                      <View style={styles.imageCheckBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.moss[500]}
                        />
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => {
                        setSelectedImage(null);
                        resetAnalysis();
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={32}
                        color={colors.ember[500]}
                      />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              ) : (
                <View style={styles.imageButtons}>
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={takePhoto}
                  >
                    <View style={styles.imageButtonIcon}>
                      <Ionicons
                        name="camera"
                        size={28}
                        color={colors.ember[400]}
                      />
                    </View>
                    <Text style={styles.imageButtonText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={pickImage}
                  >
                    <View style={styles.imageButtonIcon}>
                      <Ionicons
                        name="images"
                        size={28}
                        color={colors.moss[400]}
                      />
                    </View>
                    <Text style={styles.imageButtonText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Custom Prompt */}
            <View style={styles.promptSection}>
              <Text style={styles.sectionTitle}>
                Ask Specific Questions (Optional)
              </Text>
              <GlassCard
                variant="light"
                padding="none"
                style={styles.promptCard}
              >
                <TextInput
                  style={styles.promptInput}
                  placeholder="e.g., Is my solar wiring correct? What gauge wire should I use?"
                  placeholderTextColor={colors.bark[400]}
                  value={customPrompt}
                  onChangeText={setCustomPrompt}
                  multiline
                  numberOfLines={3}
                />
              </GlassCard>
            </View>

            {/* Analyze Button */}
            <Button
              title={isAnalyzing ? "Analyzing..." : "Analyze with AI Vision"}
              onPress={handleAnalyzeImage}
              variant="ember"
              size="lg"
              fullWidth
              disabled={!selectedImage || isAnalyzing}
              loading={isAnalyzing}
              icon={
                !isAnalyzing ? (
                  <Ionicons name="scan" size={18} color={colors.text.inverse} />
                ) : undefined
              }
            />

            {/* Analysis Result */}
            {analysisResult && (
              <GlassCard variant="frost" padding="lg" style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultIconContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.moss[500]}
                    />
                  </View>
                  <Text style={styles.resultTitle}>Analysis Complete</Text>
                </View>
                <Text style={styles.resultText}>{analysisResult}</Text>
              </GlassCard>
            )}

            {analysisError && (
              <GlassCard variant="frost" padding="lg" style={styles.errorCard}>
                <View style={styles.resultHeader}>
                  <View
                    style={[
                      styles.resultIconContainer,
                      { backgroundColor: colors.ember[500] + "20" },
                    ]}
                  >
                    <Ionicons
                      name="alert-circle"
                      size={24}
                      color={colors.ember[500]}
                    />
                  </View>
                  <Text
                    style={[styles.resultTitle, { color: colors.ember[500] }]}
                  >
                    Error
                  </Text>
                </View>
                <Text style={styles.resultText}>{analysisError.message}</Text>
              </GlassCard>
            )}
          </Animated.View>
        ) : (
          /* Icebreaker Mode */
          <Animated.View
            style={[
              styles.modeContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <GlassCard variant="frost" padding="md" style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="heart" size={20} color={colors.ember[400]} />
                </View>
                <Text style={styles.infoText}>
                  Select a profile to generate personalized conversation
                  starters based on shared interests and nomad lifestyle.
                </Text>
              </View>
            </GlassCard>

            {/* Profile Selection */}
            <View style={styles.profileSection}>
              <Text style={styles.sectionTitle}>Select a Profile</Text>
              <View style={styles.profileGrid}>
                {sampleProfiles.map((profile, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedProfile(profile);
                      resetIcebreaker();
                    }}
                  >
                    <GlassCard
                      variant={
                        selectedProfile?.name === profile.name
                          ? "medium"
                          : "light"
                      }
                      padding="md"
                      style={StyleSheet.flatten([
                        styles.profileCard,
                        selectedProfile?.name === profile.name &&
                          styles.profileCardSelected,
                      ])}
                    >
                      <View style={styles.profileAvatar}>
                        <Text style={styles.profileAvatarText}>
                          {profile.avatar}
                        </Text>
                      </View>
                      <Text style={styles.profileName}>{profile.name}</Text>
                      <Text style={styles.profileVehicle}>
                        {profile.vehicle}
                      </Text>
                      <View style={styles.profileStyleBadge}>
                        <Text style={styles.profileStyleText}>
                          {profile.style}
                        </Text>
                      </View>
                      <View style={styles.profileInterests}>
                        {profile.interests.slice(0, 2).map((interest, i) => (
                          <View key={i} style={styles.interestTag}>
                            <Text style={styles.interestTagText}>
                              {interest}
                            </Text>
                          </View>
                        ))}
                      </View>
                      {selectedProfile?.name === profile.name && (
                        <View style={styles.selectedCheck}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.moss[500]}
                          />
                        </View>
                      )}
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Generate Button */}
            <Button
              title={isGenerating ? "Generating..." : "Generate Icebreakers"}
              onPress={handleGenerateIcebreaker}
              variant="ember"
              size="lg"
              fullWidth
              disabled={!selectedProfile || isGenerating}
              loading={isGenerating}
              icon={
                !isGenerating ? (
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color={colors.text.inverse}
                  />
                ) : undefined
              }
            />

            {/* Icebreaker Result */}
            {icebreakerResult && (
              <GlassCard variant="frost" padding="lg" style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultIconContainer}>
                    <Ionicons
                      name="chatbubbles"
                      size={24}
                      color={colors.ember[400]}
                    />
                  </View>
                  <Text style={styles.resultTitle}>Conversation Starters</Text>
                </View>
                <Text style={styles.resultText}>{icebreakerResult}</Text>

                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() =>
                    Alert.alert("Copied!", "Icebreakers copied to clipboard")
                  }
                >
                  <Ionicons
                    name="copy-outline"
                    size={18}
                    color={colors.ember[400]}
                  />
                  <Text style={styles.copyButtonText}>Copy All</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {icebreakerError && (
              <GlassCard variant="frost" padding="lg" style={styles.errorCard}>
                <View style={styles.resultHeader}>
                  <View
                    style={[
                      styles.resultIconContainer,
                      { backgroundColor: colors.ember[500] + "20" },
                    ]}
                  >
                    <Ionicons
                      name="alert-circle"
                      size={24}
                      color={colors.ember[500]}
                    />
                  </View>
                  <Text
                    style={[styles.resultTitle, { color: colors.ember[500] }]}
                  >
                    Error
                  </Text>
                </View>
                <Text style={styles.resultText}>{icebreakerError.message}</Text>
              </GlassCard>
            )}
          </Animated.View>
        )}
      </ScrollView>
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
  // HUD Scanning Overlay
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 100,
  },
  scanContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.ember[400],
  },
  scanCenter: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  scanCrosshair: {
    width: 60,
    height: 60,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  scanLine: {
    position: "absolute",
    backgroundColor: colors.ember[400],
  },
  scanLineHorizontal: {
    width: 60,
    height: 2,
  },
  scanLineVertical: {
    width: 2,
    height: 60,
  },
  scanDot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ember[500],
    shadowColor: colors.ember[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  scanText: {
    marginTop: spacing["3xl"],
    fontSize: typography.fontSize.sm,
    fontWeight: "700",
    color: colors.ember[400],
    letterSpacing: 4,
  },
  scanStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  scanStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.moss[500],
    shadowColor: colors.moss[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  scanStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "600",
    color: colors.moss[400],
    letterSpacing: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glass,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.ember[500] + "30",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "700",
    color: colors.text.inverse,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  headerSpacer: {
    width: 44,
  },
  toggleWrapper: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  toggleCard: {
    borderRadius: borderRadius.xl,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.ember[500],
    ...shadows.glassFloat,
  },
  toggleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.bark[500],
  },
  toggleTextActive: {
    color: colors.text.inverse,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  modeContent: {
    gap: spacing.lg,
  },
  infoCard: {
    borderRadius: borderRadius.xl,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glass.whiteSubtle,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    lineHeight: 20,
  },
  imageSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.text.inverse,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  imageButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  imageButton: {
    flex: 1,
    height: 120,
    backgroundColor: colors.glass.whiteMedium,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.glass.border,
    justifyContent: "center",
    alignItems: "center",
  },
  imageButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.whiteSubtle,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  imageButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.bark[300],
  },
  selectedImageCard: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  selectedImageContainer: {
    position: "relative",
  },
  imagePlaceholder: {
    height: 180,
    backgroundColor: colors.moss[500] + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.moss[400],
    fontWeight: "500",
  },
  imageCheckBadge: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
  },
  removeImageButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.glass.whiteMedium,
    borderRadius: borderRadius.full,
  },
  promptSection: {
    gap: spacing.md,
  },
  promptCard: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  promptInput: {
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
    minHeight: 80,
    textAlignVertical: "top",
  },
  resultCard: {
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
  },
  errorCard: {
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.ember[500] + "40",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.moss[500] + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  resultTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.bark[800],
  },
  resultText: {
    fontSize: typography.fontSize.base,
    color: colors.bark[600],
    lineHeight: 24,
  },
  profileSection: {
    gap: spacing.md,
  },
  profileGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  profileCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: borderRadius.xl,
    position: "relative",
    minWidth: 100,
  },
  profileCardSelected: {
    borderWidth: 2,
    borderColor: colors.moss[500],
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteSubtle,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  profileAvatarText: {
    fontSize: 24,
  },
  profileName: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.bark[800],
  },
  profileVehicle: {
    fontSize: typography.fontSize.xs,
    color: colors.bark[500],
    marginTop: 2,
  },
  profileStyleBadge: {
    backgroundColor: colors.ember[500] + "20",
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  profileStyleText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.ember[500],
  },
  profileInterests: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  interestTag: {
    backgroundColor: colors.glass.whiteSubtle,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  interestTagText: {
    fontSize: 10,
    color: colors.bark[600],
    fontWeight: "500",
  },
  selectedCheck: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.ember[500] + "15",
    borderRadius: borderRadius.md,
  },
  copyButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: colors.ember[500],
  },
});
