/**
 * WilderGo Mode Context
 * Global state management for Friends and Builder modes
 * Community-first platform where connections happen organically
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/constants/theme";

const MODE_STORAGE_KEY = "wildergo_app_mode";

export type AppMode = "friends" | "builder";

export interface ModeTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  glow: string;
  gradient: [string, string, string];
  icon: string;
  emoji: string;
  label: string;
  description: string;
}

// WilderGo Brand Mode Colors
// Friends: #4A90E2 | Builder: #F2A154 | Emergency: #FF6B35
export const modeThemes: Record<AppMode, ModeTheme> = {
  friends: {
    primary: "#4A90E2", // WilderGo Friend Blue
    primaryLight: "#6BA8F2",
    primaryDark: "#3878C8",
    accent: "#E5F0FA",
    glow: "rgba(74, 144, 226, 0.4)",
    gradient: ["#6BA8F2", "#4A90E2", "#3878C8"],
    icon: "people",
    emoji: "🏔️",
    label: "Friends",
    description: "Join convoys and share adventures",
  },
  builder: {
    primary: "#F2A154", // WilderGo Builder Amber
    primaryLight: "#F5B878",
    primaryDark: "#E08A3C",
    accent: "#FEF4E8",
    glow: "rgba(242, 161, 84, 0.4)",
    gradient: ["#F5B878", "#F2A154", "#E08A3C"],
    icon: "construct",
    emoji: "🔧",
    label: "Builder",
    description: "Connect with vetted rig builders",
  },
};

interface UserSettings {
  ghostMode: boolean;
  isPremium: boolean;
  rigType: string;
  rigName: string;
}

interface ModeContextValue {
  // Current mode state
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  theme: ModeTheme;

  // Animated values for liquid transitions
  colorAnim: Animated.Value;
  isTransitioning: boolean;

  // User settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Ghost mode
  isGhostMode: boolean;
  toggleGhostMode: () => void;

  // Premium status
  isPremium: boolean;
  setPremium: (status: boolean) => void;

  // Mode-specific helpers
  getModeAccentColor: () => string;
  getModeIcon: () => string;
  isModeAllowed: (feature: string) => boolean;
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

interface ModeProviderProps {
  children: React.ReactNode;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>("friends");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    ghostMode: false,
    isPremium: false,
    rigType: "Van Lifer",
    rigName: "My Rig",
  });

  const colorAnim = useRef(new Animated.Value(0)).current;
  const modeLoadedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(MODE_STORAGE_KEY)
      .then((savedMode) => {
        if (savedMode && (savedMode === "friends" || savedMode === "builder")) {
          setModeState(savedMode as AppMode);
        }
        modeLoadedRef.current = true;
      })
      .catch(() => {
        modeLoadedRef.current = true;
      });
  }, []);

  useEffect(() => {
    if (modeLoadedRef.current) {
      AsyncStorage.setItem(MODE_STORAGE_KEY, mode).catch(() => {});
    }
  }, [mode]);

  const setMode = useCallback(
    (newMode: AppMode) => {
      if (newMode === mode) return;

      setIsTransitioning(true);
      setModeState(newMode);

      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        colorAnim.setValue(0);
        setIsTransitioning(false);
      });
    },
    [mode, colorAnim],
  );

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const toggleGhostMode = useCallback(() => {
    if (!settings.isPremium) {
      console.log("Ghost Mode requires premium");
      return;
    }
    setSettings((prev) => ({ ...prev, ghostMode: !prev.ghostMode }));
  }, [settings.isPremium]);

  const setPremium = useCallback((status: boolean) => {
    setSettings((prev) => ({ ...prev, isPremium: status }));
  }, []);

  const getModeAccentColor = useCallback(() => {
    return modeThemes[mode].primary;
  }, [mode]);

  const getModeIcon = useCallback(() => {
    return modeThemes[mode].icon;
  }, [mode]);

  const isModeAllowed = useCallback(
    (feature: string) => {
      // Ghost mode requires premium
      if (feature === "ghost-mode" && !settings.isPremium) {
        return false;
      }

      // Advanced route planning requires premium
      if (feature === "advanced-route" && !settings.isPremium) {
        return false;
      }

      return true;
    },
    [settings.isPremium],
  );

  const value: ModeContextValue = {
    mode,
    setMode,
    theme: modeThemes[mode],
    colorAnim,
    isTransitioning,
    settings,
    updateSettings,
    isGhostMode: settings.ghostMode,
    toggleGhostMode,
    isPremium: settings.isPremium,
    setPremium,
    getModeAccentColor,
    getModeIcon,
    isModeAllowed,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};

export const useMode = (): ModeContextValue => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};

export const useModeTheme = () => {
  const { theme, mode } = useMode();
  return { theme, mode };
};

export const useGhostMode = () => {
  const { isGhostMode, toggleGhostMode, isPremium } = useMode();
  return { isGhostMode, toggleGhostMode, isPremium };
};

export default ModeContext;
