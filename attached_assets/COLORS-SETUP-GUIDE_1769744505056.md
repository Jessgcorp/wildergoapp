# WilderGo Colors - Replit Setup Guide

## 📥 Quick Import to Replit

### Step 1: Upload the File
1. Download `colors.js` from your outputs
2. In Replit, create folder: `/theme/` (or `/src/theme/`)
3. Upload `colors.js` to that folder

### Step 2: Import in Your Components
```javascript
import colors from './theme/colors';
// or if in subdirectories:
import colors from '../theme/colors';
```

### Step 3: Use in Your Styles
```javascript
import { StyleSheet } from 'react-native';
import colors from './theme/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,  // Warm cream
  },
  button: {
    backgroundColor: colors.primary,     // Burnt sienna
    color: colors.white,
  },
  text: {
    color: colors.text,                  // Charcoal
  },
});
```

---

## 🎨 Complete Color Reference

### PRIMARY PALETTE (60% usage)
```javascript
colors.primary           // #C65D3B - Burnt Sienna (main brand)
colors.primaryLight      // #E87A47 - Sunset Orange
colors.primaryDark       // #A04D2C - Darker variant
```

### BACKGROUNDS
```javascript
colors.background        // #F5EFE6 - Warm Cream ⚠️ MAIN BACKGROUND
colors.surface           // #FFFFFF - White (cards only)
colors.surfaceLight      // #E8C5A5 - Desert Sand (badges)
```

### SECONDARY PALETTE (30% usage)
```javascript
colors.secondary         // #2D5A3D - Forest Green
colors.secondaryLight    // #3A7A4F - Lighter green
colors.secondaryDark     // #1B4B52 - Deep Teal
```

### TEXT COLORS
```javascript
colors.text              // #2A2A2A - Charcoal ⚠️ MAIN TEXT
colors.textSecondary     // #4A5568 - Slate (metadata)
colors.textDisabled      // #9CA3AF - Cloud Gray
colors.textLight         // #FFFFFF - White text
```

### MODE COLORS (Tertiary - Mode-Specific ONLY!)
```javascript
colors.dating            // #D94848 - Dating Mode 💕
colors.friend            // #4A90E2 - Friend Mode 🏔️
colors.builder           // #F2A154 - Builder Mode 🔧
colors.emergency         // #FF6B35 - Emergency Help 🆘
colors.emergencyLight    // #FF8C5A
colors.emergencyDark     // #E85A24
```

### SEMANTIC COLORS
```javascript
colors.success           // #2D5A3D - Forest Green
colors.error             // #D94848 - Dating Red
colors.warning           // #F2A154 - Builder Amber
colors.info              // #4A90E2 - Friend Blue
```

### UI ELEMENTS
```javascript
colors.border            // #E8C5A5 - Desert Sand
colors.borderLight       // #E5E7EB - Light Gray
colors.divider           // #E5E7EB - Light Gray
colors.overlay           // rgba(42, 42, 42, 0.5)
colors.shadow            // rgba(0, 0, 0, 0.12)
```

### NAMED COLORS (Direct Reference)
```javascript
colors.burntSienna       // #C65D3B
colors.sunsetOrange      // #E87A47
colors.warmCream         // #F5EFE6
colors.desertSand        // #E8C5A5
colors.forestGreen       // #2D5A3D
colors.deepTeal          // #1B4B52
colors.morningMist       // #B8C5D6
colors.charcoal          // #2A2A2A
colors.slate             // #4A5568
colors.cloudGray         // #9CA3AF
colors.lightGray         // #E5E7EB
colors.white             // #FFFFFF
```

---

## 🛠️ Helper Functions

### withOpacity() - Add transparency to colors
```javascript
import { withOpacity } from './theme/colors';

// Examples:
backgroundColor: withOpacity('burntSienna', 0.1)    // 10% opacity
borderColor: withOpacity('emergency', 0.5)          // 50% opacity
backgroundColor: withOpacity('warmCream', 0.9)      // 90% opacity
```

### getModeColor() - Get color by mode name
```javascript
import { getModeColor } from './theme/colors';

const tabColor = getModeColor('dating');      // Returns '#D94848'
const tabColor = getModeColor('friend');      // Returns '#4A90E2'
const tabColor = getModeColor('emergency');   // Returns '#FF6B35'

// Works with plural too:
const color = getModeColor('friends');        // Returns '#4A90E2'
```

---

## 🎨 Gradients

### Array Format (for LinearGradient)
```javascript
import LinearGradient from 'react-native-linear-gradient';
import colors from './theme/colors';

<LinearGradient
  colors={colors.gradients.sunset}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
  <Text>Hero Section</Text>
</LinearGradient>
```

### Using GRADIENT_CONFIGS (more control)
```javascript
import { GRADIENT_CONFIGS } from './theme/colors';

<LinearGradient
  colors={GRADIENT_CONFIGS.sunset.colors}
  start={GRADIENT_CONFIGS.sunset.start}
  end={GRADIENT_CONFIGS.sunset.end}
>
  <Text>Emergency Alert</Text>
</LinearGradient>
```

**Available Gradients:**
- `colors.gradients.sunset` - Primary brand gradient
- `colors.gradients.forest` - Nature/adventure theme
- `colors.gradients.sand` - Subtle backgrounds
- `colors.gradients.emergency` - Emergency alerts

---

## 📋 Named Imports (Alternative Usage)

```javascript
// Instead of importing the whole colors object:
import { PRIMARY, MODES, NEUTRALS, withOpacity } from './theme/colors';

const styles = StyleSheet.create({
  screen: {
    backgroundColor: PRIMARY.warmCream,
  },
  text: {
    color: NEUTRALS.charcoal,
  },
  datingTab: {
    backgroundColor: MODES.dating,
  },
  overlay: {
    backgroundColor: withOpacity('burntSienna', 0.1),
  },
});
```

**Available Named Exports:**
- `PRIMARY` - { burntSienna, sunsetOrange, warmCream }
- `SECONDARY` - { forestGreen, deepTeal, morningMist, desertSand }
- `MODES` - { dating, friend, builder, emergency }
- `NEUTRALS` - { charcoal, slate, cloudGray, lightGray, pureWhite }

---

## 🖨️ Print Colors (For Marketing)

### CMYK Values (for professional printing)
```javascript
import { PRINT } from './theme/colors';

console.log(PRINT.cmyk.burntSienna);  // "C0 M53 Y70 K22"
console.log(PRINT.cmyk.emergency);    // "C0 M58 Y79 K0"
```

### Pantone Codes (for exact color matching)
```javascript
console.log(PRINT.pantone.burntSienna);  // "7516 C"
console.log(PRINT.pantone.friend);       // "279 C"
```

---

## ⚠️ CRITICAL RULES

### ✅ DO:
- Use `colors.background` (#F5EFE6) for ALL app backgrounds
- Use `colors.text` (#2A2A2A) for ALL body text
- Use mode colors ONLY for their specific modes
- Use `withOpacity()` for transparent variations
- Import from this file - never hardcode colors

### ❌ DON'T:
- **NEVER use pure white (#FFFFFF) for backgrounds** - use `colors.background`
- **NEVER use pure black (#000000) for text** - use `colors.text`
- **NEVER mix mode colors** - Dating red on Builder screens is wrong
- **NEVER use colors outside this palette**
- **NEVER hardcode hex values** - always import from colors.js

---

## 🎯 Common Patterns

### Screen Background
```javascript
container: {
  backgroundColor: colors.background,  // Always warm cream
}
```

### Card/Surface
```javascript
card: {
  backgroundColor: colors.surface,  // White
  borderRadius: 12,
  padding: 16,
}
```

### Primary Button
```javascript
primaryButton: {
  backgroundColor: colors.primary,
  borderRadius: 12,
  padding: 16,
}
```

### Secondary Button
```javascript
secondaryButton: {
  backgroundColor: colors.white,
  borderWidth: 2,
  borderColor: colors.primary,
  borderRadius: 12,
  padding: 16,
}
```

### Mode Tab (Dynamic)
```javascript
import { getModeColor } from './theme/colors';

const ModeTab = ({ mode }) => (
  <View style={{
    backgroundColor: getModeColor(mode),
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  }}>
    <Text style={{ color: colors.white }}>{mode}</Text>
  </View>
);
```

### Text Hierarchy
```javascript
heading: {
  color: colors.text,           // Charcoal
  fontSize: 32,
  fontWeight: '700',
}

body: {
  color: colors.text,           // Charcoal
  fontSize: 16,
}

metadata: {
  color: colors.textSecondary,  // Slate
  fontSize: 12,
  fontFamily: 'SpaceMono',
  textTransform: 'uppercase',
}
```

---

## 🚀 Quick Migration Checklist

If you're replacing existing colors:

```
[ ] Replace all #FFFFFF backgrounds with colors.background
[ ] Replace all #000000 text with colors.text
[ ] Replace hardcoded hex values with color constants
[ ] Add mode-specific colors to navigation tabs
[ ] Update button backgrounds to colors.primary
[ ] Change borders to colors.border or colors.borderLight
[ ] Update gradients to use colors.gradients
```

---

## 💡 Tips

1. **Keep it consistent** - Always use the same color constant for the same purpose
2. **Test in light** - Warm cream background looks different than white
3. **Use opacity wisely** - withOpacity() is great for overlays and subtle effects
4. **Mode colors are sacred** - Never use Dating red on Friend screens
5. **Gradients sparingly** - Use for hero sections and important CTAs only

---

## 📞 Need Help?

If colors aren't appearing correctly:
1. Check import path is correct: `'./theme/colors'`
2. Verify file is in `/theme/colors.js`
3. Make sure you're using `colors.background` not `colors.white`
4. Clear cache: `npm start -- --reset-cache`

---

**You're all set!** 🎉

This color system gives you every color WilderGo needs, properly organized and easy to use.
