/**
 * WilderGo Animated Mode Icons
 * Organic micro-animations for mode icons:
 * - Friends: Gentle sway (mountains/trees)
 * - Builder: Tightening rotation (wrench)
 * - Nomadic Pulse: Ripple effect for real-time activity
 */

import React, { useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, animations, borderRadius, shadows } from "@/constants/theme";

type ModeType = "friends" | "builder";

interface AnimatedModeIconProps {
  mode: ModeType;
  size?: number;
  isActive?: boolean;
  showPulse?: boolean;
  color?: string;
}

export const AnimatedModeIcon: React.FC<AnimatedModeIconProps> = ({
  mode,
  size = 24,
  isActive = false,
  showPulse = false,
  color,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Get icon and color based on mode
  // Icons: Leaf/Tree (friends), Wrench (builder)
  const getIconConfig = () => {
    switch (mode) {
      case "friends":
        return {
          name: "leaf" as const, // Tree/leaf icon for nature-focused swaying animation
          color: color || colors.forestGreen[600],
          glowColor: colors.forestGreen[600] + "40",
        };
      case "builder":
        return {
          name: "build" as const, // Wrench icon for tightening animation
          color: color || colors.deepTeal[600],
          glowColor: colors.deepTeal[600] + "40",
        };
      default:
        return {
          name: "help" as const,
          color: color || colors.bark[500],
          glowColor: colors.bark[500] + "40",
        };
    }
  };

  const iconConfig = getIconConfig();

  // Sway animation for Friends mode
  useEffect(() => {
    if (mode === "friends" && isActive) {
      const sway = Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: animations.sway.duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: animations.sway.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: animations.sway.duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      sway.start();
      return () => sway.stop();
    }
  }, [mode, isActive, rotateAnim]);

  // Tightening rotation for Builder mode
  useEffect(() => {
    if (mode === "builder" && isActive) {
      const tighten = Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: animations.tighten.duration / 4,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: animations.tighten.duration / 4,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0.5,
            duration: animations.tighten.duration / 4,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: animations.tighten.duration / 4,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(800),
        ]),
      );
      tighten.start();
      return () => tighten.stop();
    }
  }, [mode, isActive, rotateAnim]);

  // Nomadic Pulse ripple effect
  useEffect(() => {
    if (showPulse) {
      const pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseScale, {
              toValue: 1.5,
              duration: animations.nomadicPulse.duration,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseScale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0,
              duration: animations.nomadicPulse.duration,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [showPulse, pulseScale, pulseOpacity]);

  // Interpolate rotation values
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-3deg", "0deg", "3deg"],
  });

  const builderRotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-15deg", "0deg", "15deg"],
  });

  const getRotation = () => {
    if (mode === "builder") return builderRotateInterpolate;
    return rotateInterpolate;
  };

  return (
    <View style={styles.container}>
      {/* Nomadic Pulse Ripple */}
      {showPulse && (
        <Animated.View
          style={[
            styles.pulseRipple,
            {
              backgroundColor: iconConfig.glowColor,
              width: size * 2,
              height: size * 2,
              borderRadius: size,
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
      )}

      {/* Glow effect when active */}
      {isActive && (
        <View
          style={[
            styles.glow,
            {
              backgroundColor: iconConfig.glowColor,
              width: size * 1.5,
              height: size * 1.5,
              borderRadius: size * 0.75,
            },
          ]}
        />
      )}

      {/* Animated Icon */}
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            transform: [{ scale: scaleAnim }, { rotate: getRotation() }],
          },
        ]}
      >
        <Ionicons name={iconConfig.name} size={size} color={iconConfig.color} />
      </Animated.View>
    </View>
  );
};

// Nomadic Pulse Indicator - Message activity ripple
interface NomadicPulseIndicatorProps {
  size?: number;
  color?: string;
  active?: boolean;
}

export const NomadicPulseIndicator: React.FC<NomadicPulseIndicatorProps> = ({
  size = 12,
  color = colors.sunsetOrange[500],
  active = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (active) {
      const pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 2,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [active, pulseAnim, opacityAnim]);

  if (!active) return null;

  return (
    <View
      style={[pulseStyles.container, { width: size * 3, height: size * 3 }]}
    >
      <Animated.View
        style={[
          pulseStyles.ripple,
          {
            backgroundColor: color + "40",
            width: size * 3,
            height: size * 3,
            borderRadius: size * 1.5,
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View
        style={[
          pulseStyles.dot,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  );
};

// Liquid Ripple Effect for Mode Transitions
interface LiquidRippleProps {
  color: string;
  size?: number;
  visible: boolean;
  onComplete?: () => void;
}

export const LiquidRipple: React.FC<LiquidRippleProps> = ({
  color,
  size = 300,
  visible,
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0.8);

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 2,
          duration: animations.liquidRipple.duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: animations.liquidRipple.duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onCompleteRef.current?.();
      });
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        rippleStyles.ripple,
        {
          backgroundColor: color + "60",
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    />
  );
};

// Message Icon with Activity Indicator
interface MessageActivityIconProps {
  hasActivity?: boolean;
  size?: number;
  color?: string;
}

export const MessageActivityIcon: React.FC<MessageActivityIconProps> = ({
  hasActivity = false,
  size = 24,
  color = colors.bark[500],
}) => {
  return (
    <View style={styles.messageIconContainer}>
      <Ionicons name="chatbubbles" size={size} color={color} />
      {hasActivity && (
        <View style={styles.activityIndicator}>
          <NomadicPulseIndicator size={6} color={colors.sunsetOrange[500]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    zIndex: 2,
  },
  glow: {
    position: "absolute",
    zIndex: 1,
    ...shadows.glow,
  },
  pulseRipple: {
    position: "absolute",
    zIndex: 0,
  },
  messageIconContainer: {
    position: "relative",
  },
  activityIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
  },
});

const pulseStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  ripple: {
    position: "absolute",
  },
  dot: {
    ...shadows.sm,
  },
});

const rippleStyles = StyleSheet.create({
  ripple: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AnimatedModeIcon;
