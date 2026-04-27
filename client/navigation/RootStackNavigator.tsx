import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import ModalScreen from "@/screens/ModalScreen";
import AIAssistantScreen from "../../app/ai-assistant";
import WelcomeScreen from "../../app/(onboarding)/welcome";
import CreateAccountScreen from "../../app/(onboarding)/create-account";
import EmailVerificationScreen from "../../app/(onboarding)/email-verification";
import SelfieVerifyScreen from "../../app/(onboarding)/selfie-verify";
import VehicleSelectScreen from "../../app/(onboarding)/vehicle-select";
import NomadStyleScreen from "../../app/(onboarding)/nomad-style";
import CompleteScreen from "../../app/(onboarding)/complete";
import PaywallScreen from "../../app/(onboarding)/paywall";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/theme";

export type RootStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  EmailVerification: undefined;
  SelfieVerify: undefined;
  VehicleSelect: undefined;
  NomadStyle: undefined;
  Complete: undefined;
  Paywall: undefined;
  Main: undefined;
  Modal: undefined;
  AIAssistant: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color={colors.ember[500]} />
      </View>
    );
  }

  const isFullyOnboarded = !!user && !!user.onboardingComplete;

  const getInitialOnboardingRoute = (): keyof RootStackParamList => {
    if (!user) return "Welcome";
    if (!user.emailVerified) return "EmailVerification";
    if (!user.selfieSubmitted && !user.selfieVerified) return "SelfieVerify";
    if (!user.vehicle) return "VehicleSelect";
    if (!user.nomadStyle) return "NomadStyle";
    return "Complete";
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isFullyOnboarded ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Modal"
            component={ModalScreen}
            options={{
              presentation: "modal",
              headerTitle: "Modal",
            }}
          />
          <Stack.Screen
            name="AIAssistant"
            component={AIAssistantScreen}
            options={{
              presentation: "modal",
              headerTitle: "AI Assistant",
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccountScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SelfieVerify"
            component={SelfieVerifyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VehicleSelect"
            component={VehicleSelectScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NomadStyle"
            component={NomadStyleScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Complete"
            component={CompleteScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
});
