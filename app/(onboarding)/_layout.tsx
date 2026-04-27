import { Stack } from "expo-router";
import { colors } from "@/constants/theme";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="invite-code" />
      <Stack.Screen name="phone-auth" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="email-verification" />
      <Stack.Screen name="selfie-verify" />
      <Stack.Screen name="profile-customize" />
      <Stack.Screen name="activities" />
      <Stack.Screen name="vehicle-select" />
      <Stack.Screen name="nomad-style" />
      <Stack.Screen name="complete" />
      <Stack.Screen name="paywall" />
    </Stack>
  );
}
