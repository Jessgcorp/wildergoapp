/**
 * Active Request HUD
 * Pulsing broadcast animation showing request status
 * Displays count of nearby users alerted
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
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
import { HelpRequest, HelpResponse, EMERGENCY_CATEGORIES } from "./types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ActiveRequestHUDProps {
  request: HelpRequest;
  responses?: HelpResponse[];
  onCancel: () => void;
  onViewResponder?: (response: HelpResponse) => void;
}

export const ActiveRequestHUD: React.FC<ActiveRequestHUDProps> = ({
  request,
  responses = [],
  onCancel,
  onViewResponder,
}) => {
  const insets = useSafeAreaInsets();
  const categoryInfo = EMERGENCY_CATEGORIES[request.category];

  // Animation refs
  const pulseScale = useRef(new Animated.Value(1)).current;
  const ripple1Scale = useRef(new Animated.Value(0.5)).current;
  const ripple1Opacity = useRef(new Animated.Value(0.8)).current;
  const ripple2Scale = useRef(new Animated.Value(0.5)).current;
  const ripple2Opacity = useRef(new Animated.Value(0.8)).current;
  const ripple3Scale = useRef(new Animated.Value(0.5)).current;
  const ripple3Opacity = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Main pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Ripple animations (staggered)
    const createRippleAnimation = (
      scale: Animated.Value,
      opacity: Animated.Value,
      delay: number,
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 2.5,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
    };

    createRippleAnimation(ripple1Scale, ripple1Opacity, 0).start();
    createRippleAnimation(ripple2Scale, ripple2Opacity, 666).start();
    createRippleAnimation(ripple3Scale, ripple3Opacity, 1333).start();

    // Radar rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [
    pulseScale,
    ripple1Scale,
    ripple1Opacity,
    ripple2Scale,
    ripple2Opacity,
    ripple3Scale,
    ripple3Opacity,
    rotateAnim,
    glowAnim,
  ]);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getPriorityColor = () => {
    switch (request.priority) {
      case "critical":
        return colors.emergency.red;
      case "urgent":
        return colors.sunsetOrange[500];
      case "assistance":
        return colors.burntSienna[500];
    }
  };

  const renderResponderCard = (response: HelpResponse) => (
    <TouchableOpacity
      key={response.id}
      style={styles.responderCard}
      onPress={() => onViewResponder?.(response)}
      activeOpacity={0.8}
    >
      <View style={styles.responderAvatar}>
        <Ionicons name="person" size={20} color={colors.bark[600]} />
      </View>
      <View style={styles.responderInfo}>
        <Text style={styles.responderName}>{response.responderName}</Text>
        <Text style={styles.responderStatus}>
          {response.status === "en_route"
            ? `ETA: ${response.eta || "calculating..."}`
            : response.status}
        </Text>
      </View>
      <View style={styles.responderDistance}>
        <Text style={styles.distanceText}>
          {response.distance.toFixed(1)} mi
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1E1814", "#2C2420", "#3A2820"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Glow Background */}
      <Animated.View
        style={[
          styles.glowBackground,
          {
            opacity: glowAnim,
            backgroundColor: getPriorityColor(),
          },
        ]}
      />

      {/* Main Content */}
      <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
        {/* Broadcast Radar Animation */}
        <View style={styles.radarContainer}>
          {/* Ripple Effects */}
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: ripple1Scale }],
                opacity: ripple1Opacity,
                borderColor: getPriorityColor(),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: ripple2Scale }],
                opacity: ripple2Opacity,
                borderColor: getPriorityColor(),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: ripple3Scale }],
                opacity: ripple3Opacity,
                borderColor: getPriorityColor(),
              },
            ]}
          />

          {/* Rotating Radar Sweep */}
          <Animated.View
            style={[
              styles.radarSweep,
              { transform: [{ rotate: rotateInterpolation }] },
            ]}
          >
            <LinearGradient
              colors={[getPriorityColor() + "60", "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sweepGradient}
            />
          </Animated.View>

          {/* Center Pulse */}
          <Animated.View
            style={[
              styles.centerPulse,
              {
                transform: [{ scale: pulseScale }],
                backgroundColor: getPriorityColor(),
              },
            ]}
          >
            <Ionicons
              name={categoryInfo.icon as keyof typeof Ionicons.glyphMap}
              size={44}
              color="#FFF"
            />
          </Animated.View>
        </View>

        {/* Status Text */}
        <Text style={styles.broadcastingText}>BROADCASTING</Text>
        <Text style={styles.categoryText}>
          {categoryInfo.label.toUpperCase()} HELP
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: getPriorityColor() }]}>
              {request.respondersNotified}
            </Text>
            <Text style={styles.statLabel}>Nomads Notified</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              style={[styles.statNumber, { color: colors.forestGreen[500] }]}
            >
              {responses.length}
            </Text>
            <Text style={styles.statLabel}>Responding</Text>
          </View>
        </View>

        {/* AI Advice Card */}
        {request.aiTriageAdvice && (
          <View style={styles.adviceContainer}>
            {Platform.OS === "ios" ? (
              <BlurView
                tint="dark"
                intensity={blur.heavy}
                style={styles.adviceBlur}
              >
                <View style={styles.adviceContent}>
                  <View style={styles.adviceHeader}>
                    <Ionicons
                      name="sparkles"
                      size={18}
                      color={colors.deepTeal[400]}
                    />
                    <Text style={styles.adviceHeaderText}>While you wait</Text>
                  </View>
                  <Text style={styles.adviceText}>
                    {request.aiTriageAdvice}
                  </Text>
                </View>
              </BlurView>
            ) : (
              <View style={[styles.adviceContent, styles.adviceAndroid]}>
                <View style={styles.adviceHeader}>
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color={colors.deepTeal[400]}
                  />
                  <Text style={styles.adviceHeaderText}>While you wait</Text>
                </View>
                <Text style={styles.adviceText}>{request.aiTriageAdvice}</Text>
              </View>
            )}
          </View>
        )}

        {/* Responders List */}
        {responses.length > 0 && (
          <View style={styles.respondersSection}>
            <Text style={styles.respondersTitle}>RESPONDERS</Text>
            {responses.map(renderResponderCard)}
          </View>
        )}

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bark[900],
  },
  glowBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  radarContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  ripple: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: SCREEN_WIDTH * 0.35,
    borderWidth: 2,
  },
  radarSweep: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: SCREEN_WIDTH * 0.35,
    overflow: "hidden",
  },
  sweepGradient: {
    width: "50%",
    height: "50%",
    borderTopRightRadius: SCREEN_WIDTH * 0.35,
  },
  centerPulse: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glowEmergency,
  },
  broadcastingText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["2xl"],
    color: "#FFF",
    letterSpacing: typography.letterSpacing.rugged,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.liquid,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["3xl"],
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: "rgba(255, 255, 255, 0.9)",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.bark[600],
    marginHorizontal: spacing.lg,
  },
  adviceContainer: {
    width: "100%",
    marginBottom: spacing.xl,
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
  },
  adviceBlur: {
    borderRadius: borderRadius.liquid,
  },
  adviceContent: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.deepTeal[600] + "30",
    borderRadius: borderRadius.liquid,
  },
  adviceAndroid: {
    backgroundColor: "rgba(27, 75, 82, 0.3)",
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  adviceHeaderText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.deepTeal[400],
  },
  adviceText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: "#FFFFFF",
    lineHeight: typography.fontSize.base * 1.5,
  },
  respondersSection: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  respondersTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.md,
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: typography.letterSpacing.rugged,
    marginBottom: spacing.md,
  },
  responderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  responderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass.whiteLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  responderInfo: {
    flex: 1,
  },
  responderName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: "#FFF",
    marginBottom: spacing.xxs,
  },
  responderStatus: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.forestGreen[400],
  },
  responderDistance: {
    backgroundColor: colors.glass.whiteLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  distanceText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: "#FFF",
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.bark[500],
  },
  cancelText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.base,
    color: "rgba(255, 255, 255, 0.85)",
  },
});

export default ActiveRequestHUD;
