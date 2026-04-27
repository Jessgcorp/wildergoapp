/**
 * Help Alert Modal
 * High-priority frosted glass alert for nearby help requests
 * Pulsing red/orange glow for emergency levels
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import { NearbyAlert, EMERGENCY_CATEGORIES } from "./types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HelpAlertModalProps {
  visible: boolean;
  alert: NearbyAlert | null;
  onRespond: () => void;
  onDismiss: () => void;
  aiIcebreakers?: string[];
}

export const HelpAlertModal: React.FC<HelpAlertModalProps> = ({
  visible,
  alert,
  onRespond,
  onDismiss,
  aiIcebreakers = [],
}) => {
  const insets = useSafeAreaInsets();

  // Animations
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && alert) {
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();

      // Glow pulse animation
      const isEmergency = alert.request.priority === "critical";
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: isEmergency ? 500 : 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: isEmergency ? 500 : 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Icon pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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

      // Shake animation for critical
      if (isEmergency) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: 5,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: -5,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 5,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
          ]),
        ).start();
      }
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, alert, glowAnim, pulseAnim, slideAnim, shakeAnim]);

  if (!alert) return null;

  const categoryInfo = EMERGENCY_CATEGORIES[alert.request.category];
  const isEmergency = alert.request.priority === "critical";
  const isUrgent = alert.request.priority === "urgent";

  const getGlowColor = () => {
    if (isEmergency) return colors.emergency.red;
    if (isUrgent) return colors.sunsetOrange[500];
    return colors.burntSienna[500];
  };

  const getPriorityLabel = () => {
    switch (alert.request.priority) {
      case "critical":
        return "EMERGENCY";
      case "urgent":
        return "URGENT";
      default:
        return "ASSISTANCE NEEDED";
    }
  };

  const renderGlassCard = (children: React.ReactNode, style?: object) => {
    if (Platform.OS === "ios") {
      return (
        <BlurView
          tint="dark"
          intensity={blur.ultraIntense}
          style={[styles.cardBlur, style]}
        >
          {children}
        </BlurView>
      );
    }
    return <View style={[styles.cardAndroid, style]}>{children}</View>;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Animated glow background */}
        <Animated.View
          style={[
            styles.glowOverlay,
            {
              backgroundColor: getGlowColor(),
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.25],
              }),
            },
          ]}
        />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateX: slideAnim }, { translateX: shakeAnim }],
              paddingTop: insets.top + spacing.xl,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
        >
          {/* Priority Badge */}
          <View
            style={[styles.priorityBadge, { backgroundColor: getGlowColor() }]}
          >
            <View style={styles.priorityDot} />
            <Text style={styles.priorityText}>{getPriorityLabel()}</Text>
          </View>

          {/* Main Alert Card */}
          {renderGlassCard(
            <View style={styles.alertContent}>
              {/* Header with icon */}
              <View style={styles.alertHeader}>
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [{ scale: pulseAnim }],
                      backgroundColor: getGlowColor() + "30",
                    },
                  ]}
                >
                  <Ionicons
                    name={categoryInfo.icon as keyof typeof Ionicons.glyphMap}
                    size={36}
                    color={getGlowColor()}
                  />
                </Animated.View>
                <View style={styles.headerInfo}>
                  <Text style={styles.categoryLabel}>
                    {categoryInfo.label} Help
                  </Text>
                  <View style={styles.distanceRow}>
                    <Ionicons name="location" size={16} color="#FFFFFF" />
                    <Text style={styles.distanceText}>
                      {alert.distance.toFixed(1)} miles {alert.direction}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Requester Info */}
              <View style={styles.requesterInfo}>
                <View style={styles.requesterAvatar}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.requesterDetails}>
                  <Text style={styles.requesterName}>
                    {alert.request.userName}
                  </Text>
                  {alert.request.rigName && (
                    <Text style={styles.rigName}>{alert.request.rigName}</Text>
                  )}
                </View>
                {alert.estimatedTime && (
                  <View style={styles.etaContainer}>
                    <Text style={styles.etaLabel}>ETA</Text>
                    <Text style={styles.etaValue}>{alert.estimatedTime}</Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Situation</Text>
                <Text style={styles.descriptionText} numberOfLines={4}>
                  {alert.request.description}
                </Text>
              </View>

              {/* AI Icebreakers */}
              {aiIcebreakers.length > 0 && (
                <View style={styles.icebreakersContainer}>
                  <View style={styles.icebreakersHeader}>
                    <Ionicons
                      name="sparkles"
                      size={16}
                      color={colors.deepTeal[400]}
                    />
                    <Text style={styles.icebreakersLabel}>Quick Responses</Text>
                  </View>
                  <View style={styles.icebreakersList}>
                    {aiIcebreakers.slice(0, 2).map((msg, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.icebreakerChip}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.icebreakerText}>{msg}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={onDismiss}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dismissText}>Not Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.respondButton}
                  onPress={onRespond}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[getGlowColor(), colors.burntSienna[600]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.respondGradient}
                  >
                    <Ionicons name="hand-right" size={22} color="#FFF" />
                    <Text style={styles.respondText}>I Can Help</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>,
            styles.alertCard,
          )}

          {/* Nomadic Pulse (if available) */}
          {alert.request.nomadicPulse && (
            <View style={styles.pulseContainer}>
              <View style={styles.pulseIndicator} />
              <Text style={styles.pulseText}>
                Currently at {alert.request.nomadicPulse.currentLocation} →
                Heading to {alert.request.nomadicPulse.heading}
              </Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    maxWidth: 400,
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    ...shadows.glowEmergency,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
  },
  priorityText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.sm,
    color: "#FFF",
    letterSpacing: typography.letterSpacing.widest,
  },
  alertCard: {
    width: "100%",
    borderRadius: borderRadius.liquidXl,
    overflow: "hidden",
    ...shadows.glassFloat,
  },
  cardBlur: {
    borderRadius: borderRadius.liquidXl,
  },
  cardAndroid: {
    backgroundColor: "rgba(30, 24, 20, 0.95)",
    borderRadius: borderRadius.liquidXl,
  },
  alertContent: {
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.glass.borderLight,
    borderRadius: borderRadius.liquidXl,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  headerInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xl,
    color: "#FFF",
    letterSpacing: typography.letterSpacing.rugged,
    marginBottom: spacing.xs,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  distanceText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.base,
    color: "#FFFFFF",
  },
  requesterInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  requesterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.glass.whiteLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  requesterDetails: {
    flex: 1,
  },
  requesterName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: "#FFF",
  },
  rigName: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: spacing.xxs,
  },
  etaContainer: {
    alignItems: "center",
    backgroundColor: colors.glass.whiteLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  etaLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: "rgba(255, 255, 255, 0.8)",
  },
  etaValue: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: "#FFF",
  },
  descriptionContainer: {
    marginBottom: spacing.lg,
  },
  descriptionLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: "#FFFFFF",
    lineHeight: typography.fontSize.base * 1.5,
  },
  icebreakersContainer: {
    backgroundColor: colors.deepTeal[600] + "20",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  icebreakersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icebreakersLabel: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.9)",
  },
  icebreakersList: {
    gap: spacing.sm,
  },
  icebreakerChip: {
    backgroundColor: colors.glass.whiteSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  icebreakerText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: "#FFFFFF",
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dismissButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.bark[600],
  },
  dismissText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.base,
    color: "#FFFFFF",
  },
  respondButton: {
    flex: 2,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.glow,
  },
  respondGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  respondText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.md,
    color: "#FFF",
    letterSpacing: typography.letterSpacing.rugged,
  },
  pulseContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.forestGreen[500],
  },
  pulseText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.9)",
    flex: 1,
  },
});

export default HelpAlertModal;
