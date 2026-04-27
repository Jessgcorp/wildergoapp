/**
 * WilderGo Ghost Mode Marker
 * Shows a blurred sage green circle when Ghost Mode is active
 * Indicates general area without revealing exact rig location
 */

import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  blur,
} from "@/constants/theme";

interface GhostModeMarkerProps {
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  userName?: string;
  animated?: boolean;
  position?: { top: `${number}%`; left: `${number}%` };
}

export const GhostModeMarker: React.FC<GhostModeMarkerProps> = ({
  size = "medium",
  showLabel = false,
  userName,
  animated = true,
  position,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const outerPulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = {
    small: { outer: 48, inner: 32, blur: 24, icon: 14 },
    medium: { outer: 72, inner: 48, blur: 36, icon: 18 },
    large: { outer: 100, inner: 64, blur: 50, icon: 24 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (animated) {
      // Inner pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.9,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Outer ring pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(outerPulseAnim, {
            toValue: 1.15,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(outerPulseAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Slow rotation for organic feel
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 30000,
          useNativeDriver: true,
        }),
      ).start();
    }

    return () => {
      pulseAnim.stopAnimation();
      outerPulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [animated, pulseAnim, outerPulseAnim, rotateAnim]);

  return (
    <View
      style={[
        styles.container,
        position && {
          position: "absolute",
          top: position.top,
          left: position.left,
        },
      ]}
    >
      {/* Outer blurred ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: config.outer,
            height: config.outer,
            borderRadius: config.outer / 2,
            transform: [
              { scale: outerPulseAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={config.blur}
            tint="default"
            style={[
              styles.outerBlur,
              {
                width: config.outer,
                height: config.outer,
                borderRadius: config.outer / 2,
              },
            ]}
          >
            <View
              style={[styles.outerGradient, { borderRadius: config.outer / 2 }]}
            />
          </BlurView>
        ) : (
          <View
            style={[
              styles.outerBlurFallback,
              {
                width: config.outer,
                height: config.outer,
                borderRadius: config.outer / 2,
              },
            ]}
          />
        )}
      </Animated.View>

      {/* Inner core with sage green gradient */}
      <Animated.View
        style={[
          styles.innerCore,
          {
            width: config.inner,
            height: config.inner,
            borderRadius: config.inner / 2,
            opacity: pulseAnim,
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={blur.medium}
            tint="light"
            style={[
              styles.innerBlur,
              {
                width: config.inner,
                height: config.inner,
                borderRadius: config.inner / 2,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="eye-off"
                size={config.icon}
                color={colors.sage[400]}
              />
            </View>
          </BlurView>
        ) : (
          <View
            style={[
              styles.innerBlurFallback,
              {
                width: config.inner,
                height: config.inner,
                borderRadius: config.inner / 2,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="eye-off"
                size={config.icon}
                color={colors.sage[400]}
              />
            </View>
          </View>
        )}
      </Animated.View>

      {/* Scattered particles for organic effect */}
      {animated && (
        <>
          <Animated.View
            style={[
              styles.particle,
              {
                width: 4,
                height: 4,
                top: "20%",
                left: "70%",
                opacity: pulseAnim.interpolate({
                  inputRange: [0.6, 0.9],
                  outputRange: [0.3, 0.7],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.particle,
              {
                width: 3,
                height: 3,
                top: "65%",
                left: "15%",
                opacity: pulseAnim.interpolate({
                  inputRange: [0.6, 0.9],
                  outputRange: [0.5, 0.2],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.particle,
              {
                width: 5,
                height: 5,
                top: "80%",
                left: "60%",
                opacity: pulseAnim.interpolate({
                  inputRange: [0.6, 0.9],
                  outputRange: [0.2, 0.6],
                }),
              },
            ]}
          />
        </>
      )}

      {/* Label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {userName ? `${userName} (Ghost)` : "Ghost Mode"}
          </Text>
        </View>
      )}
    </View>
  );
};

// Status indicator variant for compact display
interface GhostModeIndicatorProps {
  isActive: boolean;
  onPress?: () => void;
}

export const GhostModeIndicator: React.FC<GhostModeIndicatorProps> = ({
  isActive,
  onPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  if (!isActive) return null;

  return (
    <Animated.View
      style={[indicatorStyles.container, { transform: [{ scale: pulseAnim }] }]}
    >
      <View style={indicatorStyles.inner}>
        <Ionicons name="eye-off" size={12} color={colors.text.inverse} />
        <Text style={indicatorStyles.text}>GHOST</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  outerBlur: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  outerBlurFallback: {
    backgroundColor: colors.sage[400] + "25",
    justifyContent: "center",
    alignItems: "center",
  },
  outerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.sage[400] + "30",
  },
  innerCore: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  innerBlur: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: colors.sage[500] + "40",
    borderWidth: 2,
    borderColor: colors.sage[400] + "50",
  },
  innerBlurFallback: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.sage[400] + "50",
    borderWidth: 2,
    borderColor: colors.sage[400] + "60",
  },
  iconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.sage[400],
  },
  labelContainer: {
    marginTop: spacing.sm,
    backgroundColor: colors.sage[600] + "80",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.inverse,
  },
});

const indicatorStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.sage[500],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  text: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
});

export default GhostModeMarker;
