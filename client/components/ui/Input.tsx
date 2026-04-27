import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import {
  colors,
  borderRadius,
  spacing,
  typography,
  blur,
  shadows,
} from "@/constants/theme";

type InputVariant = "default" | "glass" | "dark";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  variant?: InputVariant;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  variant = "default",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case "glass":
        return {
          backgroundColor: colors.glass.whiteMedium,
          borderColor: isFocused
            ? colors.glass.border
            : colors.glass.borderLight,
          focusedBorderColor: colors.moss[400],
          textColor: colors.bark[900],
          placeholderColor: colors.bark[400],
          labelColor: colors.text.inverse,
        };
      case "dark":
        return {
          backgroundColor: colors.glass.darkMedium,
          borderColor: colors.glass.borderLight,
          focusedBorderColor: colors.moss[400],
          textColor: colors.text.inverse,
          placeholderColor: colors.bark[200],
          labelColor: colors.text.inverse,
        };
      default:
        return {
          backgroundColor: colors.background.card,
          borderColor: colors.border.light,
          focusedBorderColor: colors.moss[500],
          textColor: colors.text.primary,
          placeholderColor: colors.text.muted,
          labelColor: colors.text.secondary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const inputContent = (
    <>
      {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
      <TextInput
        style={[
          styles.input,
          { color: variantStyles.textColor },
          leftIcon ? { paddingLeft: spacing.xs } : undefined,
          rightIcon ? { paddingRight: spacing.xs } : undefined,
          inputStyle,
        ]}
        placeholderTextColor={variantStyles.placeholderColor}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
    </>
  );

  // Glass variant with blur effect
  if (variant === "glass" && Platform.OS !== "web") {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: variantStyles.labelColor }]}>
            {label}
          </Text>
        )}
        <View
          style={[
            styles.glassWrapper,
            isFocused && styles.glassWrapperFocused,
            error && styles.inputError,
          ]}
        >
          <BlurView
            tint="light"
            intensity={blur.light}
            style={[
              styles.blurContent,
              {
                borderColor: isFocused
                  ? variantStyles.focusedBorderColor
                  : variantStyles.borderColor,
              },
            ]}
          >
            {inputContent}
          </BlurView>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        {helper && !error && (
          <Text
            style={[styles.helper, variant === "glass" && styles.helperGlass]}
          >
            {helper}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: variantStyles.labelColor }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: isFocused
              ? variantStyles.focusedBorderColor
              : variantStyles.borderColor,
          },
          error && styles.inputError,
        ]}
      >
        {inputContent}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {helper && !error && (
        <Text
          style={[styles.helper, variant === "glass" && styles.helperGlass]}
        >
          {helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    ...shadows.glassSubtle,
  },
  glassWrapper: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.glass,
  },
  glassWrapperFocused: {
    ...shadows.glow,
  },
  blurContent: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    fontWeight: "500",
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: colors.ember[500],
    marginTop: spacing.sm,
    fontWeight: "500",
  },
  helper: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  helperGlass: {
    color: colors.bark[200],
  },
});

export default Input;
