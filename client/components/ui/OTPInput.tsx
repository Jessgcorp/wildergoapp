import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  TextInputKeyPressEventData,
  NativeSyntheticEvent,
} from "react-native";
import { colors, borderRadius, spacing, shadows } from "@/constants/theme";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  autoFocus = true,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    // Only allow numbers
    const sanitized = text.replace(/[^0-9]/g, "");

    if (sanitized.length > 1) {
      // Handle paste
      const chars = sanitized.slice(0, length).split("");
      const newOtp = [...otp];
      chars.forEach((char, i) => {
        if (index + i < length) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);

      const code = newOtp.join("");
      onChange?.(code);

      if (code.length === length) {
        onComplete(code);
        Keyboard.dismiss();
      } else {
        const nextIndex = Math.min(index + chars.length, length - 1);
        inputs.current[nextIndex]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = sanitized;
    setOtp(newOtp);

    const code = newOtp.join("");
    onChange?.(code);

    if (sanitized && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (code.length === length && !code.includes("")) {
      onComplete(code);
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          style={[styles.input, digit && styles.inputFilled]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={length}
          selectTextOnFocus
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  input: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border.light,
    backgroundColor: colors.background.card,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text.primary,
    ...shadows.sm,
  },
  inputFilled: {
    borderColor: colors.forestGreen[500],
    backgroundColor: colors.forestGreen[50],
  },
});

export default OTPInput;
