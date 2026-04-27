import React from "react";
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { colors, borderRadius, shadows, blur } from "@/constants/theme";

type GlassVariant = "light" | "medium" | "dark" | "frost" | "hud";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: GlassVariant;
  intensity?: number;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  borderGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = "light",
  intensity,
  padding = "md",
  borderGlow = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "dark":
        return {
          tint: "dark" as const,
          intensity: intensity ?? blur.medium,
          backgroundColor: colors.glass.dark,
          borderColor: colors.glass.borderDark,
        };
      case "medium":
        return {
          tint: "light" as const,
          intensity: intensity ?? blur.medium,
          backgroundColor: colors.glass.whiteMedium,
          borderColor: colors.glass.border,
        };
      case "frost":
        return {
          tint: "light" as const,
          intensity: intensity ?? blur.heavy,
          backgroundColor: colors.glass.white,
          borderColor: colors.glass.border,
        };
      case "hud":
        return {
          tint: "dark" as const,
          intensity: intensity ?? blur.intense,
          backgroundColor: colors.glass.darkMedium,
          borderColor: colors.glass.borderLight,
        };
      default: // light
        return {
          tint: "light" as const,
          intensity: intensity ?? blur.light,
          backgroundColor: colors.glass.whiteLight,
          borderColor: colors.glass.border,
        };
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case "none":
        return { padding: 0 };
      case "sm":
        return { padding: 12 };
      case "lg":
        return { padding: 24 };
      case "xl":
        return { padding: 32 };
      default:
        return { padding: 16 };
    }
  };

  const variantStyles = getVariantStyles();
  const paddingStyle = getPaddingStyle();

  // For web, use CSS backdrop-filter fallback
  if (Platform.OS === "web") {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
          },
          borderGlow && styles.borderGlow,
          paddingStyle,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, borderGlow && styles.borderGlow, style]}>
      <BlurView
        tint={variantStyles.tint}
        intensity={variantStyles.intensity}
        style={[
          styles.blurContainer,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
          },
          paddingStyle,
        ]}
      >
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
    ...shadows.glass,
  },
  container: {
    borderRadius: borderRadius.liquid,
    borderWidth: 1,
    overflow: "hidden",
    ...shadows.glass,
  },
  blurContainer: {
    borderRadius: borderRadius.liquid,
    borderWidth: 1,
    overflow: "hidden",
  },
  borderGlow: {
    ...shadows.glow,
  },
});

export default GlassCard;
