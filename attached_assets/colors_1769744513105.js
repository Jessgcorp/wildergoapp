/**
 * WilderGo Brand Colors - Complete Palette
 * For React Native / Replit
 *
 * SETUP:
 * 1. Copy this file to your Replit project: /theme/colors.js
 * 2. Import with: import colors from './theme/colors'
 * 3. Use in styles: backgroundColor: colors.background
 */

// ============================================
// MAIN COLOR OBJECT
// Import this with: import colors from './theme/colors'
// ============================================

const colors = {
  // ========== PRIMARY PALETTE (60% usage) ==========
  primary: "#C65D3B", // Burnt Sienna - main brand color
  primaryLight: "#E87A47", // Sunset Orange - hover states
  primaryDark: "#A04D2C", // Darker sienna - pressed states

  // ========== BACKGROUNDS ==========
  background: "#F5EFE6", // Warm Cream - MAIN APP BACKGROUND ⚠️ Never use #FFFFFF
  surface: "#FFFFFF", // Pure White - for cards only
  surfaceLight: "#E8C5A5", // Desert Sand - badges, tags

  // ========== SECONDARY PALETTE (30% usage) ==========
  secondary: "#2D5A3D", // Forest Green - success, nature
  secondaryLight: "#3A7A4F", // Lighter green
  secondaryDark: "#1B4B52", // Deep Teal - water themes

  // ========== TEXT COLORS ==========
  text: "#2A2A2A", // Charcoal - primary text ⚠️ Never use #000000
  textSecondary: "#4A5568", // Slate - secondary text, metadata
  textDisabled: "#9CA3AF", // Cloud Gray - disabled states
  textLight: "#FFFFFF", // White text on dark backgrounds

  // ========== MODE COLORS (Tertiary - Mode-Specific ONLY) ==========
  dating: "#D94848", // Dating Mode 💕
  friend: "#4A90E2", // Friend Mode 🏔️
  builder: "#F2A154", // Builder Mode 🔧
  emergency: "#FF6B35", // Emergency Help 🆘
  emergencyLight: "#FF8C5A", // Emergency light variant
  emergencyDark: "#E85A24", // Emergency dark variant

  // ========== SEMANTIC COLORS (States) ==========
  success: "#2D5A3D", // Forest Green
  error: "#D94848", // Dating Red
  warning: "#F2A154", // Builder Amber
  info: "#4A90E2", // Friend Blue

  // ========== UI ELEMENTS ==========
  border: "#E8C5A5", // Desert Sand - main borders
  borderLight: "#E5E7EB", // Light Gray - subtle borders
  divider: "#E5E7EB", // Light Gray - section dividers
  overlay: "rgba(42, 42, 42, 0.5)", // Modal overlays
  shadow: "rgba(0, 0, 0, 0.12)", // Drop shadows

  // ========== NAMED COLORS (Direct Reference) ==========
  burntSienna: "#C65D3B",
  sunsetOrange: "#E87A47",
  warmCream: "#F5EFE6",
  desertSand: "#E8C5A5",
  forestGreen: "#2D5A3D",
  deepTeal: "#1B4B52",
  morningMist: "#B8C5D6",
  charcoal: "#2A2A2A",
  slate: "#4A5568",
  cloudGray: "#9CA3AF",
  lightGray: "#E5E7EB",
  white: "#FFFFFF",

  // ========== GRADIENTS (Array format for LinearGradient) ==========
  gradients: {
    sunset: ["#E87A47", "#C65D3B"], // Primary brand gradient
    forest: ["#2D5A3D", "#1B4B52"], // Nature/adventure
    sand: ["#F5EFE6", "#E8C5A5"], // Subtle background
    emergency: ["#FF6B35", "#FF8C5A"], // Emergency alerts
  },
};

// ============================================
// RGB VALUES
// For creating colors with opacity
// ============================================

export const RGB = {
  burntSienna: "198, 93, 59",
  sunsetOrange: "232, 122, 71",
  warmCream: "245, 239, 230",
  desertSand: "232, 197, 165",
  forestGreen: "45, 90, 61",
  deepTeal: "27, 75, 82",
  morningMist: "184, 197, 214",
  charcoal: "42, 42, 42",
  slate: "74, 85, 104",
  cloudGray: "156, 163, 175",
  lightGray: "229, 231, 235",
  dating: "217, 72, 72",
  friend: "74, 144, 226",
  builder: "242, 161, 84",
  emergency: "255, 107, 53",
  white: "255, 255, 255",
  black: "0, 0, 0",
};

// ============================================
// HELPER: withOpacity
// Add opacity to any color
// ============================================

export const withOpacity = (colorKey, opacity) => {
  const rgbValue = RGB[colorKey];
  if (!rgbValue) {
    console.warn(`❌ Color "${colorKey}" not found in RGB. Using black.`);
    return `rgba(0, 0, 0, ${opacity})`;
  }
  return `rgba(${rgbValue}, ${opacity})`;
};

// Usage: backgroundColor: withOpacity('burntSienna', 0.1)

// ============================================
// HELPER: getModeColor
// Get color for a specific mode
// ============================================

export const getModeColor = (mode) => {
  const modeMap = {
    dating: colors.dating,
    friend: colors.friend,
    friends: colors.friend, // Handle plural
    builder: colors.builder,
    builders: colors.builder, // Handle plural
    emergency: colors.emergency,
    help: colors.emergency, // Alias
  };
  return modeMap[mode?.toLowerCase()] || colors.primary;
};

// Usage: const tabColor = getModeColor('dating')

// ============================================
// GRADIENT CONFIGS
// For react-native-linear-gradient component
// ============================================

export const GRADIENT_CONFIGS = {
  sunset: {
    colors: ["#E87A47", "#C65D3B"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  forest: {
    colors: ["#2D5A3D", "#1B4B52"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  sand: {
    colors: ["#F5EFE6", "#E8C5A5"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  emergency: {
    colors: ["#FF6B35", "#FF8C5A"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// Usage:
// <LinearGradient
//   colors={GRADIENT_CONFIGS.sunset.colors}
//   start={GRADIENT_CONFIGS.sunset.start}
//   end={GRADIENT_CONFIGS.sunset.end}
// >

// ============================================
// ORGANIZED EXPORTS (for named imports)
// ============================================

export const PRIMARY = {
  burntSienna: "#C65D3B",
  sunsetOrange: "#E87A47",
  warmCream: "#F5EFE6",
};

export const SECONDARY = {
  forestGreen: "#2D5A3D",
  deepTeal: "#1B4B52",
  morningMist: "#B8C5D6",
  desertSand: "#E8C5A5",
};

export const MODES = {
  dating: "#D94848",
  friend: "#4A90E2",
  builder: "#F2A154",
  emergency: "#FF6B35",
};

export const NEUTRALS = {
  charcoal: "#2A2A2A",
  slate: "#4A5568",
  cloudGray: "#9CA3AF",
  lightGray: "#E5E7EB",
  pureWhite: "#FFFFFF",
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default colors;
export { colors };

// ============================================
// PRINT COLORS (CMYK & Pantone)
// For marketing materials, business cards, merch
// ============================================

export const PRINT = {
  cmyk: {
    burntSienna: "C0 M53 Y70 K22",
    sunsetOrange: "C0 M47 Y69 K9",
    warmCream: "C0 M2 Y6 K4",
    desertSand: "C0 M15 Y29 K9",
    forestGreen: "C50 M0 Y32 K65",
    deepTeal: "C67 M9 Y0 K68",
    dating: "C0 M67 Y67 K15",
    friend: "C67 M36 Y0 K11",
    builder: "C0 M33 Y65 K5",
    emergency: "C0 M58 Y79 K0",
  },
  pantone: {
    burntSienna: "7516 C",
    sunsetOrange: "1645 C",
    warmCream: "9220 C",
    desertSand: "7507 C",
    forestGreen: "3308 C",
    deepTeal: "309 C",
    morningMist: "544 C",
    dating: "1788 C",
    friend: "279 C",
    builder: "714 C",
    emergency: "1645 C",
  },
};

/* ============================================
   USAGE EXAMPLES
   ============================================

// Example 1: Import and use in StyleSheet
import colors from './theme/colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,    // Warm cream #F5EFE6
  },
  primaryButton: {
    backgroundColor: colors.primary,       // Burnt sienna #C65D3B
    color: colors.white,
  },
  heading: {
    color: colors.text,                    // Charcoal #2A2A2A
  },
  datingTab: {
    backgroundColor: colors.dating,        // Red #D94848
  },
});

// Example 2: Named imports for organization
import { PRIMARY, MODES, NEUTRALS, withOpacity } from './theme/colors';

const styles = StyleSheet.create({
  screen: {
    backgroundColor: PRIMARY.warmCream,
  },
  text: {
    color: NEUTRALS.charcoal,
  },
  overlay: {
    backgroundColor: withOpacity('burntSienna', 0.1),
  },
});

// Example 3: Dynamic mode colors
import { getModeColor } from './theme/colors';

const ModeTab = ({ mode }) => {
  const tabColor = getModeColor(mode);  // Returns correct color for mode
  
  return (
    <View style={{ backgroundColor: tabColor }}>
      <Text>{mode}</Text>
    </View>
  );
};

// Example 4: Using gradients
import LinearGradient from 'react-native-linear-gradient';
import { GRADIENT_CONFIGS } from './theme/colors';

const HeroSection = () => (
  <LinearGradient
    colors={GRADIENT_CONFIGS.sunset.colors}
    start={GRADIENT_CONFIGS.sunset.start}
    end={GRADIENT_CONFIGS.sunset.end}
    style={styles.hero}
  >
    <Text style={styles.heroText}>Find Your Road Family</Text>
  </LinearGradient>
);

// Example 5: Opacity variations
import { withOpacity } from './theme/colors';

const Card = () => (
  <View style={{
    backgroundColor: withOpacity('warmCream', 0.9),
    borderWidth: 1,
    borderColor: withOpacity('burntSienna', 0.3),
  }}>
    <Text>Card content</Text>
  </View>
);

============================================ */

/* ============================================
   COLOR USAGE RULES
   ============================================

✅ DO:
- Use colors.background (#F5EFE6) for ALL app backgrounds
- Use colors.text (#2A2A2A) for ALL body text
- Use mode colors ONLY for their designated modes
- Use withOpacity() for transparent color variations
- Use GRADIENT_CONFIGS for consistent gradients
- Import from this file - never hardcode colors

❌ DON'T:
- NEVER use pure white (#FFFFFF) for backgrounds
- NEVER use pure black (#000000) for text
- NEVER mix mode colors (Dating red on Builder screens)
- NEVER use colors not in this palette
- NEVER hardcode hex values directly in components

PALETTE BREAKDOWN:
- Primary (60%): Burnt Sienna, Sunset Orange, Warm Cream
- Secondary (30%): Forest Green, Deep Teal, Morning Mist, Desert Sand
- Tertiary (Mode-specific): Dating, Friend, Builder, Emergency
- Neutrals (10%): Charcoal, Slate, Cloud Gray, Light Gray

CRITICAL RULES:
⚠️ Background is ALWAYS #F5EFE6 (Warm Cream), not white
⚠️ Text is ALWAYS #2A2A2A (Charcoal), not black
⚠️ Mode colors stay in their modes - don't mix!

============================================ */
