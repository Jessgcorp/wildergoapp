/**
 * WilderGo Nomadic Pulse Badge
 * Shows user's current environment status with organic icons
 * Follows the liquid glass aesthetic with 30px+ corner radii
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
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
  NomadicPulseType,
  nomadicPulseOptions,
  NomadicPulse,
} from "@/services/convoy/convoyService";

interface NomadicPulseBadgeProps {
  pulse: NomadicPulseType;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  onPress?: () => void;
  animated?: boolean;
}

export const NomadicPulseBadge: React.FC<NomadicPulseBadgeProps> = ({
  pulse,
  size = "medium",
  showLabel = true,
  onPress,
  animated = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const pulseConfig = nomadicPulseOptions[pulse];

  useEffect(() => {
    if (animated) {
      // Subtle pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [animated, pulseAnim, glowAnim]);

  const sizeConfig = {
    small: { icon: 14, padding: spacing.xs, fontSize: typography.fontSize.xs },
    medium: { icon: 18, padding: spacing.sm, fontSize: typography.fontSize.sm },
    large: {
      icon: 24,
      padding: spacing.md,
      fontSize: typography.fontSize.base,
    },
  };

  const config = sizeConfig[size];

  const content = (
    <View style={styles.badgeContent}>
      {/* Glow effect */}
      {animated && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              backgroundColor: pulseConfig.color + "40",
              opacity: glowAnim,
            },
          ]}
        />
      )}

      {/* Icon container */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: pulseConfig.color + "25",
            padding: config.padding,
            transform: animated ? [{ scale: pulseAnim }] : [],
          },
        ]}
      >
        <Ionicons
          name={pulseConfig.icon as keyof typeof Ionicons.glyphMap}
          size={config.icon}
          color={pulseConfig.color}
        />
      </Animated.View>

      {showLabel && (
        <Text
          style={[
            styles.label,
            { fontSize: config.fontSize, color: pulseConfig.color },
          ]}
        >
          {pulseConfig.label}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

// Full selector component for choosing pulse status
interface NomadicPulseSelectorProps {
  currentPulse?: NomadicPulseType;
  onSelect: (pulse: NomadicPulseType) => void;
}

export const NomadicPulseSelector: React.FC<NomadicPulseSelectorProps> = ({
  currentPulse,
  onSelect,
}) => {
  const pulseTypes = Object.keys(nomadicPulseOptions) as NomadicPulseType[];

  return (
    <View style={selectorStyles.container}>
      <Text style={selectorStyles.title}>{"What's Your Vibe?"}</Text>
      <Text style={selectorStyles.subtitle}>
        Let others know your current environment
      </Text>

      <View style={selectorStyles.grid}>
        {pulseTypes.map((type) => {
          const config = nomadicPulseOptions[type];
          const isSelected = currentPulse === type;

          return (
            <TouchableOpacity
              key={type}
              style={[
                selectorStyles.option,
                isSelected && selectorStyles.optionSelected,
                isSelected && { borderColor: config.color },
              ]}
              onPress={() => onSelect(type)}
              activeOpacity={0.7}
            >
              {Platform.OS === "ios" ? (
                <BlurView
                  intensity={isSelected ? 60 : 40}
                  tint="light"
                  style={selectorStyles.optionBlur}
                >
                  <View
                    style={[
                      selectorStyles.iconWrapper,
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
                      selectorStyles.optionLabel,
                      isSelected && { color: config.color, fontWeight: "700" },
                    ]}
                  >
                    {config.label}
                  </Text>
                  {isSelected && (
                    <View
                      style={[
                        selectorStyles.checkmark,
                        { backgroundColor: config.color },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={colors.text.inverse}
                      />
                    </View>
                  )}
                </BlurView>
              ) : (
                <View
                  style={[
                    selectorStyles.optionBlur,
                    selectorStyles.optionFallback,
                  ]}
                >
                  <View
                    style={[
                      selectorStyles.iconWrapper,
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
                      selectorStyles.optionLabel,
                      isSelected && { color: config.color, fontWeight: "700" },
                    ]}
                  >
                    {config.label}
                  </Text>
                  {isSelected && (
                    <View
                      style={[
                        selectorStyles.checkmark,
                        { backgroundColor: config.color },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={colors.text.inverse}
                      />
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    position: "relative",
  },
  glowRing: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: borderRadius.full,
  },
  iconContainer: {
    borderRadius: borderRadius.lg,
    ...shadows.glassSubtle,
  },
  label: {
    fontFamily: typography.fontFamily.bodySemiBold,
    marginLeft: spacing.xs,
  },
});

const selectorStyles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[800],
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  option: {
    width: "47%",
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    ...shadows.glassSubtle,
  },
  optionSelected: {
    ...shadows.glass,
  },
  optionBlur: {
    padding: spacing.lg,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
  },
  optionFallback: {
    backgroundColor: colors.glass.whiteMedium,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  optionLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[700],
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NomadicPulseBadge;
