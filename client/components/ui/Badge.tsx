import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, borderRadius, spacing } from "@/constants/theme";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "outline";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = "default",
  style,
  textStyle,
  size = "md",
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "primary":
        return {
          container: { backgroundColor: colors.forestGreen[100] },
          text: { color: colors.forestGreen[700] },
        };
      case "success":
        return {
          container: { backgroundColor: colors.forestGreen[100] },
          text: { color: colors.forestGreen[700] },
        };
      case "warning":
        return {
          container: { backgroundColor: colors.earthBrown[100] },
          text: { color: colors.earthBrown[700] },
        };
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.border.medium,
          },
          text: { color: colors.text.secondary },
        };
      default:
        return {
          container: { backgroundColor: colors.background.secondary },
          text: { color: colors.text.secondary },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        size === "sm" && styles.containerSm,
        variantStyles.container,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === "sm" && styles.textSm,
          variantStyles.text,
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
  },
  containerSm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
  },
  textSm: {
    fontSize: 11,
  },
});

export default Badge;
