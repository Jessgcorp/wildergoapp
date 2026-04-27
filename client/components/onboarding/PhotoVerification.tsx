/**
 * WilderGo Photo Verification Component
 * Selfie Match flow for onboarding verification
 * Uses Newell AI Vision to compare selfie with profile photo
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import {
  verifyPhotoMatch,
  checkFaceInImage,
  VerificationResult,
  VerificationStatus,
} from "@/services/ai/photoVerificationService";

// Brand colors
const BRAND = {
  cream: "#F5EFE6",
  sienna: "#C65D3B",
  orange: "#E87A47",
  desertSand: "#E8C5A5",
};

interface PhotoVerificationProps {
  profilePhotoUri: string;
  onVerificationComplete: (result: VerificationResult) => void;
  onSkip?: () => void;
}

type VerificationStep = "intro" | "camera" | "preview" | "analyzing" | "result";

export const PhotoVerification: React.FC<PhotoVerificationProps> = ({
  profilePhotoUri,
  onVerificationComplete,
  onSkip,
}) => {
  const [step, setStep] = useState<VerificationStep>("intro");
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for camera frame
  useEffect(() => {
    if (step === "camera") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [step, pulseAnim]);

  // Progress animation for analyzing
  useEffect(() => {
    if (step === "analyzing") {
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
      ).start();
    }
  }, [step, progressAnim]);

  const handleStartVerification = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please enable camera access to verify your photo.",
          [{ text: "OK" }],
        );
        return;
      }
    }
    setStep("camera");
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        setSelfieUri(photo.uri);
        setStep("preview");
      }
    } catch (error) {
      console.error("Failed to capture photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelfieUri(result.assets[0].uri);
      setStep("preview");
    }
  };

  const handleRetake = () => {
    setSelfieUri(null);
    setStep("camera");
  };

  const handleVerify = async () => {
    if (!selfieUri) return;

    setStep("analyzing");

    try {
      const verificationResult = await verifyPhotoMatch({
        profilePhotoUri,
        selfieUri,
      });

      setResult(verificationResult);
      setStep("result");
    } catch (error) {
      console.error("Verification failed:", error);
      setResult({
        status: "error",
        confidenceScore: 0,
        isMatch: false,
        feedback: "Verification failed. Please try again.",
      });
      setStep("result");
    }
  };

  const handleComplete = () => {
    if (result) {
      onVerificationComplete(result);
    }
  };

  const renderIntro = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={64} color={BRAND.sienna} />
      </View>

      <Text style={styles.title}>Photo Verification</Text>
      <Text style={styles.subtitle}>
        Help keep our community safe by verifying your identity
      </Text>

      {/* Profile Photo Preview */}
      <View style={styles.profilePreview}>
        <Text style={styles.previewLabel}>Your Profile Photo</Text>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: profilePhotoUri }}
            style={styles.profileImage}
          />
        </View>
      </View>

      <Text style={styles.instructionText}>
        Take a quick selfie to confirm you are the person in your profile photo.
        This helps build trust in the nomadic community.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleStartVerification}
      >
        <LinearGradient
          colors={[BRAND.sienna, BRAND.orange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Ionicons name="camera" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Take Selfie</Text>
        </LinearGradient>
      </TouchableOpacity>

      {onSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Face Guide Overlay */}
        <View style={styles.cameraOverlay}>
          <Animated.View
            style={[styles.faceGuide, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={styles.faceGuideInner} />
          </Animated.View>

          <Text style={styles.cameraInstruction}>
            Position your face within the circle
          </Text>
        </View>

        {/* Camera Controls */}
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handlePickFromGallery}
          >
            <Ionicons name="images" size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setFacing(facing === "front" ? "back" : "front")}
          >
            <Ionicons name="camera-reverse" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep("intro")}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Review Your Selfie</Text>

      <View style={styles.comparisonContainer}>
        <View style={styles.photoBox}>
          <Text style={styles.photoLabel}>Profile</Text>
          <Image
            source={{ uri: profilePhotoUri }}
            style={styles.comparisonImage}
          />
        </View>

        <Ionicons name="swap-horizontal" size={32} color={BRAND.sienna} />

        <View style={styles.photoBox}>
          <Text style={styles.photoLabel}>Selfie</Text>
          {selfieUri && (
            <Image source={{ uri: selfieUri }} style={styles.comparisonImage} />
          )}
        </View>
      </View>

      <Text style={styles.previewHint}>
        Make sure your face is clearly visible in both photos
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake}>
          <Ionicons name="refresh" size={20} color={BRAND.sienna} />
          <Text style={styles.secondaryButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleVerify}>
          <LinearGradient
            colors={[BRAND.sienna, BRAND.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            <Text style={styles.primaryButtonText}>Verify</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAnalyzing = () => (
    <View style={styles.stepContainer}>
      <View style={styles.analyzingContainer}>
        <ActivityIndicator size="large" color={BRAND.sienna} />

        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />

        <Text style={styles.analyzingTitle}>Analyzing...</Text>
        <Text style={styles.analyzingText}>
          Our AI is comparing your photos to verify your identity. This usually
          takes 5-10 seconds.
        </Text>
      </View>
    </View>
  );

  const renderResult = () => {
    const isPassed = result?.status === "passed";

    return (
      <View style={styles.stepContainer}>
        <View
          style={[
            styles.resultIcon,
            { backgroundColor: isPassed ? "#22C55E20" : "#DC262620" },
          ]}
        >
          <Ionicons
            name={isPassed ? "checkmark-circle" : "close-circle"}
            size={80}
            color={isPassed ? "#22C55E" : "#DC2626"}
          />
        </View>

        <Text style={styles.title}>
          {isPassed ? "Verified!" : "Verification Failed"}
        </Text>

        <Text style={styles.resultFeedback}>{result?.feedback}</Text>

        {result?.confidenceScore !== undefined &&
          result.confidenceScore > 0 && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Confidence Score</Text>
              <Text
                style={[
                  styles.scoreValue,
                  { color: isPassed ? "#22C55E" : "#DC2626" },
                ]}
              >
                {result.confidenceScore}%
              </Text>
            </View>
          )}

        {result?.details?.suggestions && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggestions:</Text>
            {result.details.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Ionicons name="bulb-outline" size={16} color={BRAND.orange} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.buttonRow}>
          {!isPassed && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetake}
            >
              <Ionicons name="refresh" size={20} color={BRAND.sienna} />
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, !isPassed && styles.buttonFlex]}
            onPress={handleComplete}
          >
            <LinearGradient
              colors={
                isPassed ? ["#22C55E", "#16A34A"] : [BRAND.sienna, BRAND.orange]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>
                {isPassed ? "Continue" : "Continue Anyway"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {step === "intro" && renderIntro()}
      {step === "camera" && renderCamera()}
      {step === "preview" && renderPreview()}
      {step === "analyzing" && renderAnalyzing()}
      {step === "result" && renderResult()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.cream,
  },
  stepContainer: {
    flex: 1,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: BRAND.desertSand,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["2xl"],
    color: colors.bark[800],
    textAlign: "center",
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.rugged,
  },
  subtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.md,
    color: colors.bark[500],
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  profilePreview: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  previewLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    marginBottom: spacing.sm,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: BRAND.sienna,
    overflow: "hidden",
    ...shadows.md,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  instructionText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.bark[600],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
    ...shadows.md,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 180,
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: "#FFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.liquid,
    borderWidth: 2,
    borderColor: BRAND.sienna,
    backgroundColor: "#FFF",
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: BRAND.sienna,
  },
  skipButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  skipText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.base,
    color: colors.bark[400],
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  faceGuide: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    borderColor: "#FFF",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  faceGuideInner: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cameraInstruction: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.md,
    color: "#FFF",
    marginTop: spacing.xl,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    paddingHorizontal: spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Preview styles
  comparisonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  photoBox: {
    alignItems: "center",
  },
  photoLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    marginBottom: spacing.sm,
  },
  comparisonImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: BRAND.sienna,
  },
  previewHint: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
    justifyContent: "center",
  },
  buttonFlex: {
    flex: 1,
  },
  // Analyzing styles
  analyzingContainer: {
    alignItems: "center",
    gap: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: BRAND.sienna,
    borderRadius: 2,
    marginTop: spacing.lg,
  },
  analyzingTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    color: colors.bark[800],
    letterSpacing: typography.letterSpacing.rugged,
  },
  analyzingText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.bark[500],
    textAlign: "center",
    maxWidth: 280,
  },
  // Result styles
  resultIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  resultFeedback: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.md,
    color: colors.bark[600],
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  scoreLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["3xl"],
  },
  suggestionsContainer: {
    backgroundColor: BRAND.desertSand,
    borderRadius: borderRadius.liquid,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: "100%",
  },
  suggestionsTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
    marginBottom: spacing.md,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestionText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    flex: 1,
  },
});

export default PhotoVerification;
