/**
 * Help Request Form
 * Liquid Glass form to describe emergency situation
 * Auto-captures GPS and Nomadic Pulse status
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import {
  EmergencyCategory,
  EmergencyPriority,
  EMERGENCY_CATEGORIES,
  HelpRequest,
} from "./types";
import { useEmergencyTriage } from "@/hooks/useEmergencyTriage";

interface HelpRequestFormProps {
  category: EmergencyCategory;
  onSubmit: (request: Partial<HelpRequest>) => void;
  onCancel: () => void;
  onAITriageResponse?: (advice: string) => void;
  isSubmitting?: boolean;
}

export const HelpRequestForm: React.FC<HelpRequestFormProps> = ({
  category,
  onSubmit,
  onCancel,
  onAITriageResponse,
  isSubmitting = false,
}) => {
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<EmergencyPriority>("assistance");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const categoryInfo = EMERGENCY_CATEGORIES[category];

  // AI Triage hook
  const {
    analyzeTriage,
    getQuickAdvice,
    isAnalyzing: aiAnalyzingFromHook,
  } = useEmergencyTriage();

  // Mock Nomadic Pulse data (in real app, this would come from user context)
  const nomadicPulse = {
    heading: "Glacier NP",
    currentLocation: "Moab, UT",
    travelingWith: 0,
  };

  useEffect(() => {
    // Fetch current location
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setIsLoadingLocation(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // Get address from coordinates
        const [addressResult] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        const address = addressResult
          ? `${addressResult.city || addressResult.region}, ${addressResult.region}`
          : undefined;

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address,
        });
      } catch {
        // Fallback location for demo
        setLocation({
          latitude: 38.5733,
          longitude: -109.5498,
          address: "Moab, UT",
        });
      } finally {
        setIsLoadingLocation(false);
      }
    })();

    // Priority pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  // AI Triage - analyze description when it changes
  useEffect(() => {
    if (description.length > 20) {
      const debounceTimer = setTimeout(() => {
        analyzeWithAI();
      }, 1500);
      return () => clearTimeout(debounceTimer);
    }
  }, [description]);

  const analyzeWithAI = async () => {
    if (!description.trim()) return;

    setAiAnalyzing(true);

    try {
      // Use Newell AI for emergency triage analysis
      const result = await analyzeTriage({
        category,
        description,
        priority,
        location: location
          ? {
              address: location.address,
              latitude: location.latitude,
              longitude: location.longitude,
            }
          : undefined,
      });

      if (result) {
        setAiAdvice(result.safetyAdvice);
        onAITriageResponse?.(result.safetyAdvice);
      } else {
        // Fallback to quick advice if AI fails
        const quickAdvice = getQuickAdvice(category, priority);
        setAiAdvice(quickAdvice);
        onAITriageResponse?.(quickAdvice);
      }
    } catch {
      // Fallback to local triage advice
      const advice = getTriageAdvice(category, description, priority);
      setAiAdvice(advice);
      onAITriageResponse?.(advice);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const getTriageAdvice = (
    cat: EmergencyCategory,
    desc: string,
    prio: EmergencyPriority,
  ): string => {
    const descLower = desc.toLowerCase();

    if (cat === "mechanical") {
      if (descLower.includes("tire") || descLower.includes("flat")) {
        return "Stay visible and safe. Turn on hazard lights. If you have a spare, check if it is inflated. Nearby nomads with tire repair kits will be notified.";
      }
      if (descLower.includes("engine") || descLower.includes("overheat")) {
        return "Turn off the engine immediately if overheating. Do not open the radiator cap while hot. Move to a safe location if possible. Help is on the way.";
      }
      return "Document the issue with photos if safe. Stay with your vehicle. Nearby builders and mechanics will be notified of your situation.";
    }

    if (cat === "medical") {
      if (prio === "critical") {
        return "Call 911 immediately for life-threatening emergencies. While waiting, nearby nomads with medical training are being notified.";
      }
      return "Stay calm and rest. If you have a first aid kit, prepare relevant supplies. Nearby nomads are being notified and may have medical supplies.";
    }

    if (cat === "security") {
      return "Trust your instincts. Lock your vehicle and stay inside if possible. Nearby nomads are being notified and may be able to check on you.";
    }

    if (cat === "supplies") {
      return "Help is on the way. Conserve your current resources. Nearby nomads with supplies to share are being notified.";
    }

    return "Your request is being broadcast to nearby nomads. Stay safe and someone will respond shortly.";
  };

  const handleSubmit = () => {
    if (!description.trim() || !location) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit({
      category,
      priority,
      description: description.trim(),
      location,
      nomadicPulse,
      aiTriageAdvice: aiAdvice || undefined,
    });
  };

  const getPriorityColor = (p: EmergencyPriority) => {
    switch (p) {
      case "critical":
        return colors.emergency.red;
      case "urgent":
        return colors.sunsetOrange[500];
      case "assistance":
        return colors.burntSienna[500];
    }
  };

  const renderGlassContainer = (children: React.ReactNode, style?: object) => {
    if (Platform.OS === "ios") {
      return (
        <BlurView
          tint="light"
          intensity={blur.heavy}
          style={[styles.glassBlur, style]}
        >
          {children}
        </BlurView>
      );
    }
    return <View style={[styles.glassAndroid, style]}>{children}</View>;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, "#F5F0EB", "#EDE6DF"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + 120,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Category */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onCancel}
              testID="button-back"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={colors.bark[800]} />
            </TouchableOpacity>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryInfo.color + "30" },
              ]}
            >
              <Ionicons
                name={categoryInfo.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={categoryInfo.color}
              />
              <Text
                style={[
                  styles.categoryBadgeText,
                  { color: categoryInfo.color },
                ]}
              >
                {categoryInfo.label}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>REQUEST HELP</Text>

          {/* Location Card */}
          {renderGlassContainer(
            <View style={styles.locationContent}>
              <View style={styles.locationHeader}>
                <Ionicons
                  name="location"
                  size={20}
                  color={colors.sunsetOrange[500]}
                />
                <Text style={styles.locationLabel}>Your Location</Text>
                {isLoadingLocation && (
                  <ActivityIndicator
                    size="small"
                    color={colors.sunsetOrange[500]}
                  />
                )}
              </View>
              <Text style={styles.locationText}>
                {location?.address || "Detecting location..."}
              </Text>
              {location && (
                <Text style={styles.coordinatesText}>
                  {location.latitude.toFixed(4)},{" "}
                  {location.longitude.toFixed(4)}
                </Text>
              )}
            </View>,
            styles.locationCard,
          )}

          {/* Nomadic Pulse Card */}
          {renderGlassContainer(
            <View style={styles.pulseContent}>
              <View style={styles.pulseHeader}>
                <View style={styles.pulseDot} />
                <Text style={styles.pulseLabel}>Nomadic Pulse</Text>
              </View>
              <View style={styles.pulseInfo}>
                <View style={styles.pulseItem}>
                  <Text style={styles.pulseItemLabel}>Currently</Text>
                  <Text style={styles.pulseItemValue}>
                    {nomadicPulse.currentLocation}
                  </Text>
                </View>
                <View style={styles.pulseDivider} />
                <View style={styles.pulseItem}>
                  <Text style={styles.pulseItemLabel}>Heading to</Text>
                  <Text style={styles.pulseItemValue}>
                    {nomadicPulse.heading}
                  </Text>
                </View>
              </View>
            </View>,
            styles.pulseCard,
          )}

          {/* Priority Selection */}
          <Text style={styles.sectionTitle}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {(["assistance", "urgent", "critical"] as EmergencyPriority[]).map(
              (p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && [
                      styles.priorityOptionSelected,
                      { borderColor: getPriorityColor(p) },
                    ],
                  ]}
                  onPress={() => setPriority(p)}
                >
                  {priority === p && p === "critical" ? (
                    <Animated.View
                      style={{ transform: [{ scale: pulseAnim }] }}
                    >
                      <Ionicons
                        name={
                          p === "critical"
                            ? "alert-circle"
                            : p === "urgent"
                              ? "warning"
                              : "help-circle"
                        }
                        size={24}
                        color={getPriorityColor(p)}
                      />
                    </Animated.View>
                  ) : (
                    <Ionicons
                      name={
                        p === "critical"
                          ? "alert-circle"
                          : p === "urgent"
                            ? "warning"
                            : "help-circle"
                      }
                      size={24}
                      color={
                        priority === p ? getPriorityColor(p) : colors.bark[400]
                      }
                    />
                  )}
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p && { color: getPriorityColor(p) },
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          {/* Description Input */}
          <Text style={styles.sectionTitle}>Describe Your Situation</Text>
          {renderGlassContainer(
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Be as specific as possible about what you need help with..."
              placeholderTextColor={colors.bark[400]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />,
            styles.inputCard,
          )}

          {/* AI Triage Advice */}
          {(aiAnalyzing || aiAdvice) && (
            <View style={styles.aiAdviceContainer}>
              <LinearGradient
                colors={[
                  colors.deepTeal[600] + "30",
                  colors.deepTeal[600] + "10",
                ]}
                style={styles.aiAdviceGradient}
              >
                <View style={styles.aiAdviceHeader}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={styles.aiAdviceLabel}>AI Safety Advice</Text>
                  {aiAnalyzing && (
                    <ActivityIndicator
                      size="small"
                      color={colors.deepTeal[400]}
                    />
                  )}
                </View>
                {aiAdvice && (
                  <Text style={styles.aiAdviceText}>{aiAdvice}</Text>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!description.trim() || !location || isSubmitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!description.trim() || !location || isSubmitting}
          >
            <LinearGradient
              colors={[colors.sunsetOrange[500], colors.burntSienna[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="radio" size={24} color="#FFF" />
                  <Text style={styles.submitText}>BROADCAST HELP REQUEST</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bark[900],
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bark[100],
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
  },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["2xl"],
    color: colors.sunsetOrange[500],
    letterSpacing: typography.letterSpacing.rugged,
    marginBottom: spacing.xl,
  },
  glassBlur: {
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
  },
  glassAndroid: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
  },
  locationCard: {
    marginBottom: spacing.md,
  },
  locationContent: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: borderRadius.liquid,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  locationLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  locationText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.lg,
    color: colors.bark[800],
  },
  coordinatesText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  pulseCard: {
    marginBottom: spacing.xl,
  },
  pulseContent: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: borderRadius.liquid,
  },
  pulseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.forestGreen[600],
  },
  pulseLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  pulseInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  pulseItem: {
    flex: 1,
  },
  pulseItemLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  pulseItemValue: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[700],
  },
  pulseDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.bark[200],
    marginHorizontal: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.md,
    color: colors.bark[900],
    letterSpacing: typography.letterSpacing.rugged,
    marginBottom: spacing.md,
  },
  priorityContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  priorityOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  priorityOptionSelected: {
    backgroundColor: "#FFFFFF",
  },
  priorityText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.bark[800],
    textAlign: "center",
  },
  inputCard: {
    marginBottom: spacing.lg,
  },
  descriptionInput: {
    padding: spacing.lg,
    minHeight: 140,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: borderRadius.liquid,
  },
  aiAdviceContainer: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
  },
  aiAdviceGradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.liquid,
    borderWidth: 1,
    borderColor: colors.deepTeal[600] + "40",
  },
  aiAdviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  aiAdviceLabel: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    flex: 1,
  },
  aiAdviceText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.5,
  },
  submitButton: {
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
    ...shadows.glowEmergency,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  submitText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.lg,
    color: "#FFF",
    letterSpacing: typography.letterSpacing.rugged,
  },
});

export default HelpRequestForm;
