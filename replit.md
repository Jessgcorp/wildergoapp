# WilderGo - Replit Project Guide

## Overview
WilderGo is a React Native/Expo mobile application for outdoor adventurers and nomadic communities. It facilitates trail discovery, weather monitoring, convoy coordination, and emergency assistance. The app features a "liquid glass" aesthetic with glassmorphism UI and nature-inspired earth tones, targeting a premium outdoor brand feel. Its core mission is to connect users with nature and each other, supporting a variety of outdoor activities and nomadic lifestyles.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: Expo SDK 54 with React Native 0.81.
- **Navigation**: Custom floating glass pill tab bar (`_layout.tsx`) with 5 tabs: Discover, Map, Convoy, Passport, SOS. Pill shape (92% width, height 75, borderRadius 40, bottom 30) with BlurView intensity 80 tint 'light' on native, CSS backdropFilter blur(20px) on web. Border 0.5px rgba(255,255,255,0.5) with cream fallback bg rgba(245,239,230,0.65). SOS tab (#D90429 crimson) uses long-press gesture (1.5s) with progress ring and haptic heartbeat. Active tab has pill-shaped glass highlight. Tab labels shown below icons. FloatingGlassPill is a standalone component using usePathname/useRouter (not dependent on React Navigation tab state). React Navigation tab bar is hidden with tabBar={() => null} and display:'none'.
- **State Management**: React Context for application mode (Friends/Builder) and TanStack React Query for server-side state.
- **Styling**: StyleSheet-based design system using `client/constants/theme.ts`. Custom glassmorphism components are built with `expo-blur`, `expo-linear-gradient`, and Reanimated for animations.
- **UI/UX**: Community-first platform with two modes (Friends, Builder). Dating Mode has been fully and completely removed — no dating references exist anywhere in the codebase. Connections happen organically through the community.
- **Fonts**: Google Fonts (`Russo One`, `Outfit`, `Inter`) loaded via `@expo-google-fonts`.
- **Mobile-Specific Features**: Gesture handling (`react-native-gesture-handler`), safe area management (`react-native-safe-area-context`), keyboard control (`react-native-keyboard-controller`), location services (`expo-location`), image handling (`expo-image`, `expo-image-picker`), and haptic feedback (`expo-haptics`).
- **Haptic Feedback**: `expo-haptics` integrated for physical feedback — Medium impact on discovery toggle, selectionAsync on badge taps, notificationAsync Success on help request submit, Light impact on modal dismiss.

### Backend
- **Server**: Express.js server.
- **API Pattern**: RESTful endpoints prefixed with `/api`.
- **Data Storage**: Drizzle ORM with PostgreSQL. Schema in `shared/schema.ts`. PostgreSQL database is provisioned and ready.
- **Authentication**: OTP-based phone/email authentication via `/api/auth/*` endpoints. Uses Firebase Admin SDK for custom token generation.

### Database Tables (PostgreSQL)
- **users**: Core user accounts (phone, email, Firebase UID, premium status)
- **profiles**: Dating/friends profiles (bio, age, rig details, location, mode settings, privacy)
- **profile_photos**: User photos with sort order
- **matches**: Swipe actions and mutual matches (like/pass/super_like)
- **connections**: Friend connections with status (pending/accepted/declined/blocked)
- **convoys**: Group travel coordination with routes and timing
- **convoy_members**: Convoy membership and roles
- **messages**: Direct and convoy messages
- **sos_alerts**: Emergency alerts with location and response tracking
- **travel_spots**: User travel history and saved locations

### Database Tables (PostgreSQL)
- **users**: Core user accounts (phone, email, Firebase UID, premium status)
- **profiles**: Dating/friends profiles (bio, age, rig details, location, mode settings, privacy)
- **profile_photos**: User photos with sort order
- **matches**: Swipe actions and mutual matches (like/pass/super_like)
- **connections**: Friend connections with status (pending/accepted/declined/blocked)
- **convoys**: Group travel coordination with routes and timing
- **convoy_members**: Convoy membership and roles
- **messages**: Direct and convoy messages
- **sos_alerts**: Emergency alerts with location and response tracking
- **travel_spots**: User travel history and saved locations
- **user_badges**: Earned badges per user (firebase_uid, badge_id) with unique constraint; used for Genesis badge tracking

### Key Design Patterns
- **Path Aliases**: `@/` for `client/` and `@shared/` for `shared/`.
- **Component Organization**: UI components in `client/components/ui/`, feature-specific components in dedicated folders.
- **Two-Mode Architecture (Friends / Builder)**: `AppMode` is now `'friends' | 'builder'`. Dating Mode has been fully removed. The `ModeToggle` component shows two options. The Discovery screen defaults to Friends mode (scrollable nomad list + activity events). Onboarding skips the `discovery-mode` screen — `nomad-style` navigates directly to `selfie-verify`.
- **Genesis Badge (Apex Pioneer)**: Badge #10 is auto-awarded to the first 100 users on signup via atomic transaction in `server/services/auth.ts`. The `GET /api/badges/:firebaseUid` endpoint returns earned badges and `genesisAvailable` flag. `AchievementGallery` hides badge #10 from the grid when `genesisAvailable` is false and the user hasn't earned it. Users who already have it keep it permanently.

## External Dependencies

### Third-Party Services
- **Google Maps**: Fully integrated via `react-native-maps` for mapping, directions, geocoding, and place search. Requires `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.
- **Firebase Admin SDK**: Integrated for backend services including Firestore, Authentication, Cloud Messaging, and Storage. Requires `FIREBASE_SERVICE_ACCOUNT` secret.

### Database
- **ORM**: Drizzle ORM configured for PostgreSQL, with schema in `shared/schema.ts`.

### Key NPM Packages
- `@tanstack/react-query`
- `expo-blur`, `expo-linear-gradient`, `react-native-reanimated`
- `drizzle-orm`, `drizzle-zod`
- `@expo-google-fonts/*`