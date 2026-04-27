import React, { useCallback, useEffect } from "react";
import { StyleSheet, View, Text, useColorScheme } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  DelaGothicOne_400Regular,
} from "@expo-google-fonts/dela-gothic-one";
import {
  Figtree_400Regular,
  Figtree_700Bold,
} from "@expo-google-fonts/figtree";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ModeProvider } from "@/contexts/ModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { colors, spacing, typography, borderRadius } from "./constants/theme";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    DelaGothicOne_400Regular,
    Figtree_400Regular,
    Figtree_700Bold,
  });

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const defaultText = Text as any;
  if (!defaultText.defaultProps) {
    defaultText.defaultProps = {};
  }
  defaultText.defaultProps.style = {
    color: isDarkMode ? colors.text.inverse : colors.text.primary,
    fontFamily: typography.fontFamily.body,
    textAlign: "left",
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ModeProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView style={styles.root}>
                <KeyboardProvider>
                  <View style={styles.container} onLayout={onLayoutRootView}>
                    <NavigationContainer>
                      <MainTabNavigator />
                    </NavigationContainer>
                  </View>
                  <StatusBar style="dark" />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ModeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
