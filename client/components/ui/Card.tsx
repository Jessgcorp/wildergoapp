import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, borderRadius, spacing, shadows } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "default",
  padding = "md",
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: colors.background.card,
          ...shadows.md,
        };
      case "outlined":
        return {
          backgroundColor: colors.background.card,
          borderWidth: 1,
          borderColor: colors.border.light,
        };
      default:
        return {
          backgroundColor: colors.background.card,
          ...shadows.sm,
        };
    }
  };

  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case "none":
        return { padding: 0 };
      case "sm":
        return { padding: spacing.sm };
      case "lg":
        return { padding: spacing.xl };
      default:
        return { padding: spacing.base };
    }
  };

  return (
    <View style={[styles.card, getVariantStyles(), getPaddingStyles(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
});

export default Card;
