/**
 * WilderGo SOS Tab Icon
 * Animated tab icon that pulses when nearby help requests are active
 * Sunset Orange/Burnt Sienna visual language for high-urgency
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, borderRadius, shadows } from "@/constants/theme";

interface SOSTabIconProps {
  focused: boolean;
  color: string;
  hasNearbyAlert?: boolean;
  alertPriority?: "critical" | "urgent" | "assistance";
}

export const SOSTabIcon: React.FC<SOSTabIconProps> = ({
  focused,
  color,
  hasNearbyAlert = false,
  alertPriority = "assistance",
}) => {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasNearbyAlert) {
      // Determine pulse speed based on priority
      const duration =
        alertPriority === "critical"
          ? 500
          : alertPriority === "urgent"
            ? 800
            : 1200;

      // Icon pulse animation
      const iconPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.15,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      );

      // Ring pulse animation
      const ringPulse = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseOpacity, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(pulseScale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseOpacity, {
              toValue: 0,
              duration: duration,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

      // Glow animation
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.6,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.2,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      );

      iconPulse.start();
      ringPulse.start();
      glow.start();

      return () => {
        iconPulse.stop();
        ringPulse.stop();
        glow.stop();
      };
    } else {
      // Reset animations
      pulseScale.setValue(1);
      pulseOpacity.setValue(0);
      glowOpacity.setValue(0);
    }
  }, [hasNearbyAlert, alertPriority, pulseScale, pulseOpacity, glowOpacity]);

  const getPriorityColor = () => {
    switch (alertPriority) {
      case "critical":
        return colors.emergency.red;
      case "urgent":
        return colors.sunsetOrange[500];
      default:
        return colors.burntSienna[500];
    }
  };

  const iconName = focused ? "warning" : "warning-outline";
  const iconColor = focused ? colors.sunsetOrange[500] : color;

  return (
    <View style={styles.container}>
      {/* Animated Glow Ring */}
      {hasNearbyAlert && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              opacity: glowOpacity,
              backgroundColor: getPriorityColor(),
            },
          ]}
        />
      )}

      {/* Pulse Ring */}
      {hasNearbyAlert && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              opacity: pulseOpacity,
              borderColor: getPriorityColor(),
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
      )}

      {/* Icon Container */}
      <View
        style={[styles.iconContainer, focused && styles.iconContainerActive]}
      >
        <Animated.View
          style={{ transform: [{ scale: hasNearbyAlert ? pulseScale : 1 }] }}
        >
          <Ionicons
            name={iconName}
            size={24}
            color={hasNearbyAlert ? getPriorityColor() : iconColor}
          />
        </Animated.View>

        {/* Active Indicator */}
        {focused && (
          <View
            style={[
              styles.activeIndicator,
              {
                backgroundColor: hasNearbyAlert
                  ? getPriorityColor()
                  : colors.sunsetOrange[500],
              },
            ]}
          />
        )}

        {/* Alert Badge */}
        {hasNearbyAlert && (
          <View
            style={[styles.alertBadge, { backgroundColor: getPriorityColor() }]}
          >
            <Ionicons name="alert" size={8} color="#FFF" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  glowRing: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.3,
  },
  pulseRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    position: "relative",
  },
  iconContainerActive: {
    backgroundColor: colors.glass.whiteSubtle,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    ...shadows.glassSubtle,
  },
  alertBadge: {
    position: "absolute",
    top: 0,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(30, 24, 20, 0.95)",
  },
});

export default SOSTabIcon;
