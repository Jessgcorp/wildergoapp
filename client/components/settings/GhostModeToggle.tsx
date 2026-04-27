/**
 * WilderGo Ghost Mode Toggle
 * Premium privacy feature that hides exact map location
 * Part of "The Convoy" subscription
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import { useMode } from "@/contexts/ModeContext";

interface GhostModeToggleProps {
  onUpgrade?: () => void;
  compact?: boolean;
}

export const GhostModeToggle: React.FC<GhostModeToggleProps> = ({
  onUpgrade,
  compact = false,
}) => {
  const { isGhostMode, toggleGhostMode, isPremium } = useMode();
  const [showInfo, setShowInfo] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const infoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isGhostMode) {
      // Continuous pulse animation when ghost mode is active
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Glow animation
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isGhostMode, pulseAnim, glowAnim]);

  useEffect(() => {
    Animated.spring(infoAnim, {
      toValue: showInfo ? 1 : 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [showInfo, infoAnim]);

  const handleToggle = () => {
    if (!isPremium) {
      onUpgrade?.();
      return;
    }
    toggleGhostMode();
  };

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          compactStyles.container,
          isGhostMode && compactStyles.containerActive,
        ]}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            compactStyles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons
            name={isGhostMode ? "eye-off" : "eye"}
            size={18}
            color={isGhostMode ? colors.sage[400] : colors.bark[400]}
          />
        </Animated.View>
        <Text
          style={[
            compactStyles.label,
            isGhostMode && compactStyles.labelActive,
          ]}
        >
          Ghost
        </Text>
        {!isPremium && (
          <Ionicons name="star" size={12} color={colors.ember[400]} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ContainerWrapper
        {...(Platform.OS === "ios"
          ? {
              tint: "light" as const,
              intensity: blur.medium,
              style: styles.container,
            }
          : { style: [styles.container, styles.containerFallback] })}
      >
        {/* Active glow overlay */}
        <Animated.View
          style={[
            styles.glowOverlay,
            {
              opacity: glowAnim,
            },
          ]}
        />

        <View style={styles.content}>
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              isGhostMode && styles.iconContainerActive,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Ionicons
              name={isGhostMode ? "eye-off" : "eye"}
              size={24}
              color={isGhostMode ? colors.sage[400] : colors.bark[500]}
            />
          </Animated.View>

          {/* Text */}
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Ghost Mode</Text>
              {!isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={10} color={colors.ember[400]} />
                  <Text style={styles.premiumText}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={styles.description}>
              {isGhostMode
                ? "Your exact location is hidden"
                : "Hide your precise map location"}
            </Text>
          </View>

          {/* Toggle/Upgrade */}
          {isPremium ? (
            <Switch
              value={isGhostMode}
              onValueChange={handleToggle}
              trackColor={{
                false: colors.bark[200],
                true: colors.sage[400],
              }}
              thumbColor={isGhostMode ? colors.text.inverse : colors.bark[100]}
              ios_backgroundColor={colors.bark[200]}
            />
          ) : (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={onUpgrade}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[
                  colors.ember[400],
                  colors.ember[500],
                  colors.ember[600],
                ]}
                style={styles.upgradeGradient}
              >
                <Text style={styles.upgradeText}>Unlock</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Info button */}
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfo(!showInfo)}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.bark[400]}
            />
          </TouchableOpacity>
        </View>

        {/* Info Panel */}
        <Animated.View
          style={[
            styles.infoPanel,
            {
              opacity: infoAnim,
              maxHeight: infoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
            },
          ]}
        >
          <View style={styles.infoDivider} />
          <Text style={styles.infoTitle}>How Ghost Mode Works</Text>
          <View style={styles.infoItem}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.moss[500]}
            />
            <Text style={styles.infoText}>
              Your general area is still shown to nearby nomads
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.moss[500]}
            />
            <Text style={styles.infoText}>
              Exact coordinates are hidden from your profile
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.moss[500]}
            />
            <Text style={styles.infoText}>
              Route overlap calculations still work normally
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.moss[500]}
            />
            <Text style={styles.infoText}>
              Toggle anytime from your profile or settings
            </Text>
          </View>
        </Animated.View>
      </ContainerWrapper>
    </View>
  );
};

// Status indicator for map/header
export const GhostModeStatus: React.FC<{ onPress?: () => void }> = ({
  onPress,
}) => {
  const { isGhostMode, isPremium } = useMode();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isGhostMode) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isGhostMode, pulseAnim]);

  if (!isPremium || !isGhostMode) return null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          statusStyles.container,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[colors.sage[400], colors.sage[500], colors.sage[600]]}
          style={statusStyles.gradient}
        >
          <Ionicons name="eye-off" size={14} color={colors.text.inverse} />
          <Text style={statusStyles.text}>GHOST</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.glass,
  },
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  containerFallback: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(90, 102, 88, 0.1)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.whiteSubtle,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerActive: {
    backgroundColor: colors.sage[100],
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.ember[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  premiumText: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 9,
    color: colors.ember[600],
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    marginTop: 2,
  },
  upgradeButton: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  upgradeGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  upgradeText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
  },
  infoButton: {
    padding: spacing.xs,
  },
  infoPanel: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    overflow: "hidden",
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    lineHeight: 18,
  },
});

const compactStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  containerActive: {
    backgroundColor: colors.sage[100],
    borderColor: colors.sage[300],
  },
  iconContainer: {
    // No additional styles needed
  },
  label: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.xs,
    color: colors.bark[500],
  },
  labelActive: {
    color: colors.sage[600],
  },
});

const statusStyles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    overflow: "hidden",
    ...shadows.glassSubtle,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 10,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  },
});

export default GhostModeToggle;
