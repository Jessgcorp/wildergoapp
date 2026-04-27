/**
 * WilderGo Build Diagnostic HUD
 * AI-powered rig diagnostic tool
 * Features:
 * - Symptom-based diagnosis
 * - Image analysis of damage
 * - Step-by-step repair guides
 * - Severity indicators
 * - Tools needed list
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import {
  colors,
  borderRadius,
  spacing,
  typography,
  shadows,
  blur,
} from "@/constants/theme";
import {
  DiagnosticResult,
  ImageDiagnosticResult,
  IssueCategory,
  IssueSeverity,
  diagnoseBuildIssue,
  analyzeRigImage,
  getQuickTips,
} from "@/services/ai/buildDiagnosticService";
import { RigSpecifications } from "@/services/passport/nomadPassportService";

interface BuildDiagnosticHUDProps {
  visible: boolean;
  onClose: () => void;
  rigSpecs?: Partial<RigSpecifications>;
}

// Category configuration
const categoryConfig: Record<
  IssueCategory,
  { icon: string; label: string; color: string }
> = {
  electrical: {
    icon: "flash",
    label: "Electrical",
    color: colors.sunsetOrange[500],
  },
  plumbing: { icon: "water", label: "Plumbing", color: colors.deepTeal[500] },
  mechanical: { icon: "cog", label: "Mechanical", color: colors.bark[500] },
  solar: { icon: "sunny", label: "Solar", color: colors.sunsetOrange[400] },
  climate: {
    icon: "thermometer",
    label: "Climate",
    color: colors.forestGreen[500],
  },
  structural: {
    icon: "home",
    label: "Structural",
    color: colors.burntSienna[500],
  },
  connectivity: {
    icon: "wifi",
    label: "Connectivity",
    color: colors.deepTeal[400],
  },
  other: { icon: "help", label: "Other", color: colors.bark[400] },
};

// Severity configuration
const severityConfig: Record<
  IssueSeverity,
  { color: string; bgColor: string; label: string }
> = {
  minor: {
    color: colors.forestGreen[600],
    bgColor: colors.forestGreen[100],
    label: "Minor",
  },
  moderate: {
    color: colors.sunsetOrange[600],
    bgColor: colors.sunsetOrange[100],
    label: "Moderate",
  },
  urgent: {
    color: colors.burntSienna[600],
    bgColor: colors.burntSienna[100],
    label: "Urgent",
  },
  critical: {
    color: colors.emergency.red,
    bgColor: colors.emergency.redLight,
    label: "Critical",
  },
};

export const BuildDiagnosticHUD: React.FC<BuildDiagnosticHUDProps> = ({
  visible,
  onClose,
  rigSpecs,
}) => {
  const [step, setStep] = useState<"category" | "symptoms" | "result">(
    "category",
  );
  const [selectedCategory, setSelectedCategory] =
    useState<IssueCategory | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<ImageDiagnosticResult | null>(
    null,
  );
  const [quickTips, setQuickTips] = useState<string[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setStep("category");
      setSelectedCategory(null);
      setSymptoms("");
      setResult(null);
      setImageUri(null);
      setImageResult(null);
      setQuickTips([]);
    }
  }, [visible]);

  // Load quick tips when category is selected
  useEffect(() => {
    if (selectedCategory) {
      loadQuickTips(selectedCategory);
    }
  }, [selectedCategory]);

  const loadQuickTips = async (category: IssueCategory) => {
    const tips = await getQuickTips(category);
    setQuickTips(tips);
  };

  // Handle diagnosis
  const handleDiagnose = async () => {
    if (!symptoms.trim()) {
      Alert.alert(
        "Missing Information",
        "Please describe the symptoms you are experiencing.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const diagnosisResult = await diagnoseBuildIssue({
        symptoms: symptoms.trim(),
        category: selectedCategory || undefined,
        rigSpecs,
      });
      setResult(diagnosisResult);
      setStep("result");

      // Animate result
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      Alert.alert(
        "Diagnosis Failed",
        "Unable to complete diagnosis. Please try again.",
      );
      console.error("Diagnosis error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image analysis
  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photos to analyze images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      analyzeImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow camera access to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri: string) => {
    setImageUri(uri);
    setIsLoading(true);
    try {
      const analysisResult = await analyzeRigImage(uri, symptoms || undefined);
      setImageResult(analysisResult);
    } catch (error) {
      Alert.alert(
        "Analysis Failed",
        "Unable to analyze image. Please try again.",
      );
      console.error("Image analysis error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Category selection step
  const renderCategoryStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What system is affected?</Text>
      <Text style={styles.stepSubtitle}>
        Select a category to help narrow down the issue
      </Text>

      <View style={styles.categoryGrid}>
        {(
          Object.entries(categoryConfig) as [
            IssueCategory,
            (typeof categoryConfig)[IssueCategory],
          ][]
        ).map(([category, config]) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryCard,
              selectedCategory === category && {
                borderColor: config.color,
                backgroundColor: config.color + "15",
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: config.color + "20" },
              ]}
            >
              <Ionicons
                name={config.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={config.color}
              />
            </View>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category && { color: config.color },
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick tips preview */}
      {selectedCategory && quickTips.length > 0 && (
        <View style={styles.quickTipsPreview}>
          <View style={styles.quickTipsHeader}>
            <Ionicons
              name="bulb-outline"
              size={16}
              color={colors.sunsetOrange[500]}
            />
            <Text style={styles.quickTipsTitle}>Quick Check First</Text>
          </View>
          {quickTips.slice(0, 2).map((tip, index) => (
            <Text key={index} style={styles.quickTipText}>
              • {tip}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.nextButton,
          !selectedCategory && styles.nextButtonDisabled,
        ]}
        onPress={() => setStep("symptoms")}
        disabled={!selectedCategory}
      >
        <LinearGradient
          colors={
            selectedCategory
              ? [colors.deepTeal[500], colors.deepTeal[600]]
              : [colors.bark[300], colors.bark[400]]
          }
          style={styles.nextButtonGradient}
        >
          <Text style={styles.nextButtonText}>Next: Describe Symptoms</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={colors.text.inverse}
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Symptoms input step
  const renderSymptomsStep = () => (
    <View style={styles.stepContent}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep("category")}
      >
        <Ionicons name="arrow-back" size={20} color={colors.bark[500]} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Describe the problem</Text>
      <Text style={styles.stepSubtitle}>
        Be as specific as possible about what you are experiencing
      </Text>

      {/* Symptoms input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.symptomsInput}
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder="Example: My water pump isn't working. It makes a humming sound but no water comes out. The fuse looks fine..."
          placeholderTextColor={colors.bark[400]}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      {/* Image upload option */}
      <View style={styles.imageSection}>
        <Text style={styles.imageSectionTitle}>Add a Photo (Optional)</Text>
        <View style={styles.imageButtons}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handleTakePhoto}
          >
            <Ionicons name="camera" size={24} color={colors.deepTeal[500]} />
            <Text style={styles.imageButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handlePickImage}
          >
            <Ionicons name="images" size={24} color={colors.deepTeal[500]} />
            <Text style={styles.imageButtonText}>Choose Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Image preview */}
        {imageUri && (
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => {
                setImageUri(null);
                setImageResult(null);
              }}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={colors.emergency.red}
              />
            </TouchableOpacity>
            {imageResult && (
              <View style={styles.imageResultOverlay}>
                <Text style={styles.imageResultText}>
                  {imageResult.assessment}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Diagnose button */}
      <TouchableOpacity
        style={[
          styles.diagnoseButton,
          isLoading && styles.diagnoseButtonDisabled,
        ]}
        onPress={handleDiagnose}
        disabled={isLoading || !symptoms.trim()}
      >
        <LinearGradient
          colors={[colors.deepTeal[500], colors.deepTeal[600]]}
          style={styles.diagnoseButtonGradient}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color={colors.text.inverse} />
              <Text style={styles.diagnoseButtonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color={colors.text.inverse} />
              <Text style={styles.diagnoseButtonText}>Run AI Diagnosis</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Result display step
  const renderResultStep = () => {
    if (!result) return null;

    const severity = severityConfig[result.severity];
    const categoryInfo = selectedCategory
      ? categoryConfig[selectedCategory]
      : null;

    return (
      <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep("symptoms")}
        >
          <Ionicons name="arrow-back" size={20} color={colors.bark[500]} />
          <Text style={styles.backButtonText}>Modify Symptoms</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Severity badge */}
          <View style={styles.resultHeader}>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: severity.bgColor },
              ]}
            >
              <Text style={[styles.severityText, { color: severity.color }]}>
                {severity.label}
              </Text>
            </View>
            {!result.canContinueDriving && (
              <View style={styles.warningBadge}>
                <Ionicons
                  name="warning"
                  size={14}
                  color={colors.emergency.red}
                />
                <Text style={styles.warningBadgeText}>Stop & Fix</Text>
              </View>
            )}
          </View>

          {/* Diagnosis */}
          <View style={styles.resultSection}>
            <Text style={styles.resultSectionTitle}>Diagnosis</Text>
            <Text style={styles.diagnosisText}>{result.diagnosis}</Text>
          </View>

          {/* Possible causes */}
          <View style={styles.resultSection}>
            <Text style={styles.resultSectionTitle}>Possible Causes</Text>
            {result.possibleCauses.map((cause, index) => (
              <View key={index} style={styles.causeItem}>
                <Text style={styles.causeNumber}>{index + 1}</Text>
                <Text style={styles.causeText}>{cause}</Text>
              </View>
            ))}
          </View>

          {/* Safety warnings */}
          {result.safetyWarnings.length > 0 && (
            <View style={[styles.resultSection, styles.warningSection]}>
              <View style={styles.warningSectionHeader}>
                <Ionicons
                  name="warning"
                  size={18}
                  color={colors.emergency.red}
                />
                <Text
                  style={[
                    styles.resultSectionTitle,
                    { color: colors.emergency.red },
                  ]}
                >
                  Safety Warnings
                </Text>
              </View>
              {result.safetyWarnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>
                  • {warning}
                </Text>
              ))}
            </View>
          )}

          {/* Troubleshooting steps */}
          <View style={styles.resultSection}>
            <Text style={styles.resultSectionTitle}>Troubleshooting Steps</Text>
            {result.immediateSteps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Tools needed */}
          {result.toolsNeeded.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>Tools Needed</Text>
              <View style={styles.toolsGrid}>
                {result.toolsNeeded.map((tool, index) => (
                  <View key={index} style={styles.toolBadge}>
                    <Ionicons
                      name="construct-outline"
                      size={12}
                      color={colors.deepTeal[600]}
                    />
                    <Text style={styles.toolText}>{tool}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Difficulty and cost */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="hammer" size={20} color={colors.bark[500]} />
              <Text style={styles.metaLabel}>Difficulty</Text>
              <Text style={styles.metaValue}>{result.estimatedDifficulty}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="cash-outline"
                size={20}
                color={colors.bark[500]}
              />
              <Text style={styles.metaLabel}>Est. Cost</Text>
              <Text style={styles.metaValue}>{result.estimatedCost}</Text>
            </View>
          </View>

          {/* New diagnosis button */}
          <TouchableOpacity
            style={styles.newDiagnosisButton}
            onPress={() => {
              setStep("category");
              setSelectedCategory(null);
              setSymptoms("");
              setResult(null);
            }}
          >
            <Text style={styles.newDiagnosisText}>Start New Diagnosis</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <LinearGradient
                    colors={[colors.deepTeal[500], colors.deepTeal[600]]}
                    style={styles.headerIconGradient}
                  >
                    <Ionicons
                      name="construct"
                      size={20}
                      color={colors.text.inverse}
                    />
                  </LinearGradient>
                </View>
                <View>
                  <Text style={styles.headerTitle}>Build Diagnostic</Text>
                  <Text style={styles.headerSubtitle}>
                    AI-Powered by Newell
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.bark[500]} />
              </TouchableOpacity>
            </View>

            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepDot,
                  step === "category" && styles.stepDotActive,
                ]}
              />
              <View style={styles.stepLine} />
              <View
                style={[
                  styles.stepDot,
                  step === "symptoms" && styles.stepDotActive,
                ]}
              />
              <View style={styles.stepLine} />
              <View
                style={[
                  styles.stepDot,
                  step === "result" && styles.stepDotActive,
                ]}
              />
            </View>

            {/* Content */}
            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
            >
              {step === "category" && renderCategoryStep()}
              {step === "symptoms" && renderSymptomsStep()}
              {step === "result" && renderResultStep()}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: "95%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[200],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerIcon: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  headerIconGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  // Step indicator
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bark[200],
  },
  stepDotActive: {
    backgroundColor: colors.deepTeal[500],
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.bark[200],
  },
  body: {
    padding: spacing.lg,
  },
  stepContent: {
    paddingBottom: spacing.xl,
  },
  // Step content
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[500],
  },
  // Category grid
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    width: "48%",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.bark[200],
    backgroundColor: colors.bark[50],
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  // Quick tips
  quickTipsPreview: {
    backgroundColor: colors.sunsetOrange[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  quickTipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  quickTipsTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.sunsetOrange[600],
  },
  quickTipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  // Buttons
  nextButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  // Symptoms input
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.bark[200],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.bark[50],
    marginBottom: spacing.lg,
  },
  symptomsInput: {
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.text.primary,
    minHeight: 120,
  },
  // Image section
  imageSection: {
    marginBottom: spacing.lg,
  },
  imageSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  imageButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  imageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.deepTeal[300],
    borderStyle: "dashed",
  },
  imageButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.deepTeal[500],
  },
  imagePreview: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 150,
  },
  removeImageButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  imageResultOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: spacing.sm,
  },
  imageResultText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.inverse,
  },
  // Diagnose button
  diagnoseButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  diagnoseButtonDisabled: {
    opacity: 0.6,
  },
  diagnoseButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  diagnoseButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  // Result
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  severityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  severityText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    textTransform: "uppercase",
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    backgroundColor: colors.emergency.redLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  warningBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.emergency.red,
  },
  resultSection: {
    marginBottom: spacing.lg,
  },
  resultSectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  diagnosisText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  // Causes
  causeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  causeNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.deepTeal[100],
    textAlign: "center",
    lineHeight: 20,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.deepTeal[600],
    marginRight: spacing.sm,
  },
  causeText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  // Warnings
  warningSection: {
    backgroundColor: colors.emergency.redLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  warningSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.emergency.red,
    lineHeight: 20,
  },
  // Steps
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.deepTeal[500],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  stepNumberText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  // Tools
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  toolBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    backgroundColor: colors.deepTeal[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  toolText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.deepTeal[600],
  },
  // Meta
  metaGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flex: 1,
    backgroundColor: colors.bark[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  metaLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  metaValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginTop: spacing.xxs,
    textAlign: "center",
  },
  // New diagnosis
  newDiagnosisButton: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  newDiagnosisText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.deepTeal[500],
  },
});

export default BuildDiagnosticHUD;
