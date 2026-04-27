/**
 * WilderGo Liquid Mode Transition
 * Smooth, organic liquid ripple effect when switching between modes
 * Features:
 * - Full-screen ripple animation
 * - Color morphing based on mode
 * - Multiple ripple waves
 * - Coordinated with mode toggle
 */

import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Animated, Dimensions, Easing } from "react-native";
import { colors, animations } from "@/constants/theme";
import { AppMode } from "@/services/map/mapService";
import { getModeTransitionConfig } from "@/services/map/advancedMapService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_RIPPLE_SIZE =
  Math.sqrt(SCREEN_WIDTH * SCREEN_WIDTH + SCREEN_HEIGHT * SCREEN_HEIGHT) * 2;

interface LiquidModeTransitionProps {
  fromMode: AppMode;
  toMode: AppMode;
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
  originX?: number;
  originY?: number;
}

// Mode color configuration
const modeColors: Record<AppMode, string> = {
  friends: colors.forestGreen[600],
  builder: colors.deepTeal[600],
};

const modeGlowColors: Record<AppMode, string> = {
  friends: "rgba(45, 90, 61, 0.5)",
  builder: "rgba(27, 75, 82, 0.5)",
};

// Single ripple wave
interface RippleWaveProps {
  color: string;
  delay: number;
  duration: number;
  originX: number;
  originY: number;
  isActive: boolean;
  onComplete?: () => void;
}

const RippleWave: React.FC<RippleWaveProps> = ({
  color,
  delay,
  duration,
  originX,
  originY,
  isActive,
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isActive) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0.8);

      // Start animation sequence with delay
      const animationTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: duration * 0.8,
            delay: duration * 0.2,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete?.();
        });
      }, delay);

      return () => clearTimeout(animationTimer);
    }
  }, [isActive, delay, duration, scaleAnim, opacityAnim, onComplete]);

  if (!isActive) return null;

  return (
    <Animated.View
      style={[
        styles.rippleWave,
        {
          backgroundColor: color,
          left: originX - MAX_RIPPLE_SIZE / 2,
          top: originY - MAX_RIPPLE_SIZE / 2,
          width: MAX_RIPPLE_SIZE,
          height: MAX_RIPPLE_SIZE,
          borderRadius: MAX_RIPPLE_SIZE / 2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    />
  );
};

// Main transition component
export const LiquidModeTransition: React.FC<LiquidModeTransitionProps> = ({
  fromMode,
  toMode,
  isTransitioning,
  onTransitionComplete,
  originX = SCREEN_WIDTH / 2,
  originY = SCREEN_HEIGHT / 3,
}) => {
  const [activeWaves, setActiveWaves] = useState<number[]>([]);
  const completedWaves = useRef(0);
  const transitionConfig = getModeTransitionConfig(fromMode, toMode);

  useEffect(() => {
    if (isTransitioning && fromMode !== toMode) {
      // Reset wave tracking
      completedWaves.current = 0;

      // Start multiple ripple waves
      const waveIndices = Array.from(
        { length: transitionConfig.rippleCount },
        (_, i) => i,
      );
      setActiveWaves(waveIndices);
    }
  }, [isTransitioning, fromMode, toMode, transitionConfig.rippleCount]);

  const handleWaveComplete = () => {
    completedWaves.current += 1;
    if (completedWaves.current >= transitionConfig.rippleCount) {
      setActiveWaves([]);
      onTransitionComplete?.();
    }
  };

  if (!isTransitioning || fromMode === toMode) return null;

  const targetColor = modeColors[toMode];
  const { duration, rippleCount } = transitionConfig;
  const waveDelay = 100; // Stagger delay between waves

  return (
    <View style={styles.container} pointerEvents="none">
      {activeWaves.map((waveIndex) => (
        <RippleWave
          key={`wave-${waveIndex}`}
          color={targetColor}
          delay={waveIndex * waveDelay}
          duration={duration}
          originX={originX}
          originY={originY}
          isActive={true}
          onComplete={
            waveIndex === rippleCount - 1 ? handleWaveComplete : undefined
          }
        />
      ))}
    </View>
  );
};

// Compact ripple for inline use (e.g., in mode toggle)
interface MiniRippleProps {
  color: string;
  visible: boolean;
  size?: number;
  onComplete?: () => void;
}

export const MiniRipple: React.FC<MiniRippleProps> = ({
  color,
  visible,
  size = 200,
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0.6);

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: animations.liquidRipple.duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: animations.liquidRipple.duration * 0.8,
          delay: animations.liquidRipple.duration * 0.2,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(onComplete);
    }
  }, [visible, scaleAnim, opacityAnim, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.miniRipple,
        {
          backgroundColor: color + "50",
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    />
  );
};

// Mode color glow effect for backgrounds
interface ModeGlowProps {
  mode: AppMode;
  intensity?: number;
}

export const ModeGlow: React.FC<ModeGlowProps> = ({
  mode,
  intensity = 0.3,
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [currentColor, setCurrentColor] = useState(modeGlowColors[mode]);

  useEffect(() => {
    // Fade out current glow
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Update color
      setCurrentColor(modeGlowColors[mode]);
      // Fade in new glow
      Animated.timing(opacityAnim, {
        toValue: intensity,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [mode, intensity, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.modeGlow,
        {
          backgroundColor: currentColor,
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    />
  );
};

// Hook for managing mode transitions
export function useModeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fromMode, setFromMode] = useState<AppMode>("friends");
  const [toMode, setToMode] = useState<AppMode>("friends");
  const [originCoords, setOriginCoords] = useState({
    x: SCREEN_WIDTH / 2,
    y: SCREEN_HEIGHT / 3,
  });

  const startTransition = (
    from: AppMode,
    to: AppMode,
    origin?: { x: number; y: number },
  ) => {
    if (from === to) return;

    setFromMode(from);
    setToMode(to);
    if (origin) {
      setOriginCoords(origin);
    }
    setIsTransitioning(true);
  };

  const completeTransition = () => {
    setIsTransitioning(false);
    setFromMode(toMode);
  };

  return {
    isTransitioning,
    fromMode,
    toMode,
    originCoords,
    startTransition,
    completeTransition,
  };
}

// Animated mode icon with liquid transition
interface AnimatedModeIndicatorProps {
  mode: AppMode;
  size?: number;
}

export const AnimatedModeIndicator: React.FC<AnimatedModeIndicatorProps> = ({
  mode,
  size = 40,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [showRipple, setShowRipple] = useState(false);
  const [prevMode, setPrevMode] = useState(mode);

  useEffect(() => {
    if (prevMode !== mode) {
      // Trigger ripple
      setShowRipple(true);

      // Bounce animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotate animation
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setPrevMode(mode);
    }
  }, [mode, prevMode, scaleAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const color = modeColors[mode];

  return (
    <View
      style={[styles.modeIndicatorContainer, { width: size, height: size }]}
    >
      <MiniRipple
        color={color}
        visible={showRipple}
        size={size * 3}
        onComplete={() => setShowRipple(false)}
      />
      <Animated.View
        style={[
          styles.modeIndicator,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale: scaleAnim }, { rotate: rotation }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: "hidden",
  },
  rippleWave: {
    position: "absolute",
  },
  miniRipple: {
    position: "absolute",
  },
  modeGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  modeIndicatorContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  modeIndicator: {
    position: "absolute",
  },
});

export default LiquidModeTransition;
