import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import {
  colors,
  borderRadius,
  spacing,
  shadows,
  blur,
} from "@/constants/theme";

// Standardized Button Variants
// Primary: Burnt Sienna | Secondary: White with Orange/Sienna border
type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "terracotta"
  | "glass"
  | "ember"
  | "mode";
type ButtonSize = "sm" | "md" | "lg";

// Brand button colors
const BUTTON_COLORS = {
  burntSienna: "#C65D3B",
  sunsetOrange: "#E87A47",
  white: "#FFFFFF",
  cream: "#F5EFE6",
  disabled: "#E8E4DE",
  disabledText: "#9A8E84",
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = false,
  testID,
}) => {
  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    useGlass?: boolean;
    glowEffect?: boolean;
  } => {
    switch (variant) {
      case "primary":
        // Standardized: Burnt Sienna background
        return {
          container: {
            backgroundColor: BUTTON_COLORS.burntSienna,
            borderWidth: 0,
          },
          text: {
            color: BUTTON_COLORS.white,
          },
          glowEffect: true,
        };
      case "secondary":
        // Standardized: White background with Burnt Sienna border
        return {
          container: {
            backgroundColor: BUTTON_COLORS.white,
            borderWidth: 2,
            borderColor: BUTTON_COLORS.burntSienna,
          },
          text: {
            color: BUTTON_COLORS.burntSienna,
          },
        };
      case "terracotta":
      case "ember":
        // Orange accent variant
        return {
          container: {
            backgroundColor: BUTTON_COLORS.sunsetOrange,
            borderWidth: 0,
          },
          text: {
            color: BUTTON_COLORS.white,
          },
          glowEffect: true,
        };
      case "mode":
        // Mode-specific (inherits from context)
        return {
          container: {
            backgroundColor: BUTTON_COLORS.burntSienna,
            borderWidth: 0,
          },
          text: {
            color: BUTTON_COLORS.white,
          },
          glowEffect: true,
        };
      case "glass":
        return {
          container: {
            backgroundColor: colors.glass.whiteMedium,
            borderWidth: 1,
            borderColor: colors.glass.border,
          },
          text: {
            color: colors.bark[800],
          },
          useGlass: true,
        };
      case "outline":
        // White background with Orange border
        return {
          container: {
            backgroundColor: BUTTON_COLORS.white,
            borderWidth: 2,
            borderColor: BUTTON_COLORS.sunsetOrange,
          },
          text: {
            color: BUTTON_COLORS.sunsetOrange,
          },
        };
      case "ghost":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 0,
          },
          text: {
            color: BUTTON_COLORS.burntSienna,
          },
        };
      default:
        return {
          container: {
            backgroundColor: BUTTON_COLORS.burntSienna,
            borderWidth: 0,
          },
          text: {
            color: BUTTON_COLORS.white,
          },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "sm":
        return {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.base,
            borderRadius: borderRadius.lg,
          },
          text: {
            fontSize: 14,
          },
        };
      case "lg":
        return {
          container: {
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
            borderRadius: borderRadius.liquid,
          },
          text: {
            fontSize: 17,
            letterSpacing: 0.3,
          },
        };
      default:
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.xl,
          },
          text: {
            fontSize: 16,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonContent = (
    <>
      {icon && iconPosition === "left" && icon}
      <Text
        style={[
          styles.text,
          variantStyles.text,
          sizeStyles.text,
          icon && iconPosition === "left"
            ? { marginLeft: spacing.sm }
            : undefined,
          icon && iconPosition === "right"
            ? { marginRight: spacing.sm }
            : undefined,
          textStyle,
        ]}
      >
        {title}
      </Text>
      {icon && iconPosition === "right" && icon}
    </>
  );

  // Glass variant with blur effect
  if (variantStyles.useGlass && Platform.OS !== "web") {
    return (
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.glassWrapper,
          sizeStyles.container,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
      >
        <BlurView
          tint="light"
          intensity={blur.light}
          style={[
            styles.blurContent,
            { borderRadius: sizeStyles.container.borderRadius },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={variantStyles.text.color} size="small" />
          ) : (
            buttonContent
          )}
        </BlurView>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        variantStyles.glowEffect && shadows.glow,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} size="small" />
      ) : (
        buttonContent
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.glass,
  },
  glassWrapper: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.glass,
  },
  blurContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: BUTTON_COLORS.disabled,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Button;
