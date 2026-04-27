import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

interface AnimatedPressableProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  duration?: number;
  children: React.ReactNode;
}

export function AnimatedPressable({
  onPressIn,
  onPressOut,
  onPress,
  style,
  scaleValue = 0.92,
  duration = 100,
  children,
  ...props
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration,
      useNativeDriver: true,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 15,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default AnimatedPressable;
