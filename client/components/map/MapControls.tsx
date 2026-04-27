/**
 * WilderGo Glass-Styled Map Controls
 * Frosted glass floating buttons for map interactions
 */

import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  borderRadius,
  shadows,
  spacing,
  typography,
} from "@/constants/theme";

interface MapControlsProps {
  onRecenter?: () => void;
  onSearchArea?: () => void;
  onSmartRoute?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  showSmartRoute?: boolean;
  isSearching?: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onRecenter,
  onSearchArea,
  onSmartRoute,
  onZoomIn,
  onZoomOut,
  showSmartRoute = true,
  isSearching = false,
}) => {
  const GlassButton: React.FC<{
    onPress?: () => void;
    icon: keyof typeof Ionicons.glyphMap;
    label?: string;
    size?: "small" | "medium" | "large";
    variant?: "default" | "primary" | "ai";
    loading?: boolean;
  }> = ({
    onPress,
    icon,
    label,
    size = "medium",
    variant = "default",
    loading = false,
  }) => {
    const buttonSize = size === "small" ? 40 : size === "large" ? 56 : 48;
    const iconSize = size === "small" ? 18 : size === "large" ? 24 : 20;

    const getBackgroundColor = () => {
      switch (variant) {
        case "primary":
          return colors.ember[500];
        case "ai":
          return colors.moss[600];
        default:
          return "transparent";
      }
    };

    const ButtonContent = (
      <View
        style={[
          styles.buttonContent,
          {
            width: label ? undefined : buttonSize,
            height: buttonSize,
            backgroundColor:
              variant !== "default" ? getBackgroundColor() : undefined,
            paddingHorizontal: label ? spacing.lg : 0,
          },
        ]}
      >
        <Ionicons
          name={loading ? "sync" : icon}
          size={iconSize}
          color={variant !== "default" ? colors.text.inverse : colors.bark[700]}
          style={loading ? styles.loadingIcon : undefined}
        />
        {label && (
          <Text
            style={[
              styles.buttonLabel,
              {
                color:
                  variant !== "default"
                    ? colors.text.inverse
                    : colors.bark[700],
              },
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    );

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        disabled={loading}
        style={[
          styles.button,
          {
            width: label ? undefined : buttonSize,
            height: buttonSize,
            borderRadius: label ? borderRadius.xl : buttonSize / 2,
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill}>
            <View style={styles.blurOverlay} />
          </BlurView>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
        )}
        {ButtonContent}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top Controls - Search Area */}
      <View style={styles.topControls}>
        <GlassButton
          onPress={onSearchArea}
          icon="search"
          label="Search this Area"
          size="medium"
          loading={isSearching}
        />
      </View>

      {/* Right Side Controls - Zoom */}
      <View style={styles.rightControls}>
        <View style={styles.zoomContainer}>
          <GlassButton onPress={onZoomIn} icon="add" size="small" />
          <View style={styles.zoomDivider} />
          <GlassButton onPress={onZoomOut} icon="remove" size="small" />
        </View>

        <GlassButton onPress={onRecenter} icon="locate" size="medium" />
      </View>

      {/* Bottom Controls - Smart Route */}
      {showSmartRoute && (
        <View style={styles.bottomControls}>
          <GlassButton
            onPress={onSmartRoute}
            icon="sparkles"
            label="Smart Route"
            size="large"
            variant="ai"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.lg,
  },
  topControls: {
    position: "absolute",
    top: spacing.lg,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  rightControls: {
    position: "absolute",
    right: spacing.lg,
    top: "30%",
    gap: spacing.md,
  },
  bottomControls: {
    position: "absolute",
    bottom: spacing["3xl"],
    left: 0,
    right: 0,
    alignItems: "center",
  },
  zoomContainer: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.glass,
  },
  zoomDivider: {
    height: 1,
    backgroundColor: colors.glass.borderLight,
  },
  button: {
    overflow: "hidden",
    ...shadows.glass,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  buttonLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glass.whiteMedium,
  },
  androidBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  loadingIcon: {
    // Animation handled by React Native Animated in production
  },
});

export default MapControls;
