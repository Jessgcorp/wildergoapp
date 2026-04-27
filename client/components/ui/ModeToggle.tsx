/**
 * WilderGo Mode Toggle
 * Prominent frosted glass Mode Switcher with liquid color shift animations
 * Implements strict mode separation (Friends 🏔️, Builder 🔧)
 * Features animated mode icons and liquid ripple transitions
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  borderRadius,
  spacing,
  shadows,
  typography,
  animations,
  blur,
} from "@/constants/theme";
import { AnimatedModeIcon, LiquidRipple } from "./AnimatedModeIcon";

export type AppMode = "friends" | "builder";

interface ModeOption {
  key: AppMode;
  label: string;
  emoji: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  lightColor: string;
  darkColor: string;
  glow: string;
  description: string;
}

const modes: ModeOption[] = [
  {
    key: "friends",
    label: "Friends",
    emoji: "🏔️",
    icon: "people",
    color: colors.forestGreen[600],
    lightColor: colors.forestGreen[500],
    darkColor: colors.forestGreen[700],
    glow: "rgba(45, 90, 61, 0.4)",
    description: "Find your road family",
  },
  {
    key: "builder",
    label: "Builder",
    emoji: "🔧",
    icon: "construct",
    color: colors.deepTeal[600],
    lightColor: colors.deepTeal[500],
    darkColor: colors.deepTeal[700],
    glow: "rgba(27, 75, 82, 0.4)",
    description: "Pro rig network",
  },
];

interface ModeToggleProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  showPremiumBadge?: boolean;
  compact?: boolean;
  showAnimatedIcons?: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  activeMode,
  onModeChange,
  showPremiumBadge = false,
  compact = false,
  showAnimatedIcons = true,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const liquidAnim = useRef(new Animated.Value(0)).current;
  const prevModeRef = useRef<AppMode | null>(null);
  const isInitialMount = useRef(true);

  const [showRipple, setShowRipple] = useState(false);
  const [rippleColor, setRippleColor] = useState(colors.forestGreen[600]);

  const windowWidth = Dimensions.get("window").width;
  const outerPadding = spacing.xl * 2;
  const innerPadding = (spacing.xs + 2) * 2;
  const buttonWidth = (windowWidth - outerPadding - innerPadding) / 2;

  const currentModeConfig = modes.find((m) => m.key === activeMode) || modes[1];

  const handleRippleComplete = useCallback(() => {
    setShowRipple(false);
  }, []);

  const handleModeChange = useCallback(
    (newMode: AppMode) => {
      if (newMode === activeMode) return;

      const newModeConfig = modes.find((m) => m.key === newMode);
      if (newModeConfig) {
        setRippleColor(newModeConfig.color);
        setShowRipple(true);
      }

      onModeChange(newMode);
    },
    [activeMode, onModeChange],
  );

  useEffect(() => {
    const index = modes.findIndex((m) => m.key === activeMode);
    const targetPosition = index * buttonWidth;

    if (isInitialMount.current) {
      slideAnim.setValue(targetPosition);
      isInitialMount.current = false;
      prevModeRef.current = activeMode;
      return;
    }

    if (prevModeRef.current === activeMode) {
      slideAnim.setValue(targetPosition);
      return;
    }

    prevModeRef.current = activeMode;

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 15,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(slideAnim, {
        toValue: targetPosition,
        useNativeDriver: true,
        tension: 170,
        friction: 20,
      }),
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.timing(liquidAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(liquidAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [activeMode, buttonWidth, slideAnim, scaleAnim, glowAnim, liquidAnim]);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          Platform.OS !== "ios" && styles.containerFallback,
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            tint="light"
            intensity={blur.heavy}
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.liquidGlow,
            {
              backgroundColor: currentModeConfig.glow,
              opacity: liquidAnim,
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.sliderContainer,
            {
              width: Math.max(0, buttonWidth - (compact ? 4 : 6)),
              transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              currentModeConfig.lightColor,
              currentModeConfig.color,
              currentModeConfig.darkColor,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.slider}
          />
          <Animated.View
            style={[
              styles.sliderGlow,
              {
                backgroundColor: currentModeConfig.glow,
                shadowColor: currentModeConfig.color,
                opacity: glowAnim,
              },
            ]}
          />
        </Animated.View>

        {modes.map((modeItem) => {
          const isActive = activeMode === modeItem.key;
          const isPremiumLocked = false;

          return (
            <TouchableOpacity
              key={modeItem.key}
              style={[styles.button, { width: buttonWidth }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => handleModeChange(modeItem.key)}
              activeOpacity={0.7}
              testID={`mode-${modeItem.key}`}
            >
              <View style={styles.buttonContent}>
                {showAnimatedIcons ? (
                  <AnimatedModeIcon
                    mode={modeItem.key}
                    size={16}
                    isActive={isActive}
                    color={isActive ? colors.text.inverse : modeItem.color}
                  />
                ) : (
                  <Text style={styles.emoji}>{modeItem.emoji}</Text>
                )}
                <Text
                  style={[
                    styles.buttonText,
                    isActive && styles.activeButtonText,
                  ]}
                >
                  {modeItem.label}
                </Text>
                {isPremiumLocked ? (
                  <View style={styles.premiumBadge}>
                    <Ionicons
                      name="star"
                      size={8}
                      color={colors.sunsetOrange[400]}
                    />
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <LiquidRipple
        color={rippleColor}
        visible={showRipple}
        onComplete={handleRippleComplete}
      />
    </View>
  );
};

// Enhanced Mode Switcher for header placement
export const ModeHeader: React.FC<ModeToggleProps & { title?: string }> = ({
  activeMode,
  onModeChange,
  title,
  showPremiumBadge,
  showAnimatedIcons,
}) => {
  const currentModeConfig = modes.find((m) => m.key === activeMode) || modes[1];

  return (
    <View style={headerStyles.container}>
      {title && <Text style={headerStyles.title}>{title}</Text>}
      <ModeToggle
        activeMode={activeMode}
        onModeChange={onModeChange}
        showPremiumBadge={showPremiumBadge}
        showAnimatedIcons={showAnimatedIcons}
      />
      <View style={headerStyles.modeInfo}>
        <Text
          style={[
            headerStyles.modeDescription,
            { color: currentModeConfig.color },
          ]}
        >
          {currentModeConfig.description}
        </Text>
      </View>
    </View>
  );
};

// Compact Mode Indicator (for tab bar or status)
interface ModeIndicatorProps {
  mode: AppMode;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export const ModeIndicator: React.FC<ModeIndicatorProps> = ({
  mode,
  size = "medium",
  showLabel = false,
}) => {
  const modeConfig = modes.find((m) => m.key === mode) || modes[1];
  const iconSize = size === "small" ? 14 : size === "medium" ? 18 : 24;

  return (
    <View style={indicatorStyles.container}>
      <View
        style={[
          indicatorStyles.badge,
          { backgroundColor: modeConfig.color + "20" },
        ]}
      >
        <AnimatedModeIcon
          mode={mode}
          size={iconSize}
          isActive={true}
          color={modeConfig.color}
        />
        {showLabel && (
          <Text style={[indicatorStyles.label, { color: modeConfig.color }]}>
            {modeConfig.label}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignSelf: "center",
    borderRadius: borderRadius.liquid,
    overflow: "hidden",
    ...shadows.glass,
  },
  container: {
    flexDirection: "row",
    borderRadius: borderRadius.liquid,
    padding: spacing.xs + 2,
    borderWidth: 1.5,
    borderColor: colors.glass.border,
    overflow: "hidden",
    position: "relative",
  },
  containerFallback: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  liquidGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.liquid,
  },
  sliderContainer: {
    position: "absolute",
    top: spacing.xs + 3,
    left: spacing.xs + 3,
    height: "80%",
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  slider: {
    flex: 1,
    borderRadius: borderRadius.xl,
  },
  sliderGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: borderRadius.xl + 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: -1,
  },
  button: {
    paddingVertical: spacing.md + 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    position: "relative",
  },
  emoji: {
    fontSize: 15,
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[600],
    letterSpacing: 0.3,
  },
  activeButtonText: {
    color: colors.text.inverse,
    fontFamily: typography.fontFamily.bodyBold,
  },
  premiumBadge: {
    position: "absolute",
    top: -6,
    right: -10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sunsetOrange[200],
  },
});

const headerStyles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.inverse,
    textAlign: "center",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  modeInfo: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  modeDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

const indicatorStyles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
});

export default ModeToggle;
