/**
 * WilderGo Discovery Screen
 * Strict mode separation with mode-specific profile cards
 * Friends: Activity-aligned companions
 * Builder: Professional directory (no swiping)
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  profileImages,
  eventImages,
  natureImages,
} from "@/constants/theme";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Logo } from "@/components/ui/Logo";
import { useMode, AppMode, modeThemes } from "@/contexts/ModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { FriendsProfileCard } from "@/components/profiles/FriendsProfileCard";
import {
  BuilderProfileCard,
  BuilderCompactCard,
} from "@/components/profiles/BuilderProfileCard";
import { GhostModeStatus } from "@/components/settings/GhostModeToggle";
import { ConvoyPaywall } from "@/components/paywall/ConvoyPaywall";
import { MiniPassport } from "@/components/passport/MiniPassport";
import { OutdoorEvents } from "@/components/events/OutdoorEvents";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - spacing.xl * 2;
const SWIPE_THRESHOLD = width * 0.15; // Reduced from 25% to 15% for easier swiping
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Quick flicks trigger swipe even with less distance

// Mode-specific data interfaces
interface ActivityWithLevel {
  name: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
}

interface FriendsProfile {
  id: string;
  name: string;
  age?: number;
  imageUrl: string;
  currentLocation: string;
  rigType: string;
  activities: ActivityWithLevel[];
  availableFor: string[];
  bio?: string;
  online?: boolean;
  verified?: boolean;
  travelStyle?: string;
  pets?: string;
}

interface BuilderProfile {
  id: string;
  name: string;
  businessName: string;
  imageUrl: string;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  expertise: string[];
  specialties: { name: string; icon: keyof typeof Ionicons.glyphMap }[];
  consultationRate: number;
  portfolioImages: string[];
  bio?: string;
  certifications?: string[];
}

// Friends Mode Profiles - Activity Alignment focus
const friendsProfiles: FriendsProfile[] = [
  {
    id: "1",
    name: "Riley",
    imageUrl: profileImages.alex,
    currentLocation: "Boulder, CO",
    rigType: "Subaru Outback w/ Rooftop Tent",
    activities: [
      { name: "Backpacking", skillLevel: "intermediate" },
      { name: "Climb", skillLevel: "beginner" },
      { name: "Camp", skillLevel: "advanced" },
    ],
    availableFor: ["Photo Convoys", "Camp Meetups", "Stargazing"],
    bio: "Part-time nomad, full-time photographer. Love capturing van life moments on the road!",
    online: true,
    verified: true,
    travelStyle: "Weekend warrior",
  },
  {
    id: "2",
    name: "Dakota",
    imageUrl: profileImages.jordan,
    currentLocation: "Silverton, CO",
    rigType: "Sprinter Van + Snowmobile Trailer",
    activities: [
      { name: "Ski", skillLevel: "advanced" },
      { name: "Snowboard", skillLevel: "advanced" },
      { name: "Snowmobile", skillLevel: "intermediate" },
    ],
    availableFor: ["Ski Convoys", "Winter Camping", "Sled Adventures"],
    bio: "Full-time van dweller chasing powder. My rig is built for -20°F!",
    online: true,
    verified: true,
    travelStyle: "Chasing snow",
  },
  {
    id: "3",
    name: "Kody",
    imageUrl: profileImages.sam,
    currentLocation: "Grand Mesa, CO",
    rigType: "Lance Truck Camper",
    activities: [
      { name: "Fishing", skillLevel: "advanced" },
      { name: "Off Road/SxS", skillLevel: "intermediate" },
      { name: "Camp", skillLevel: "advanced" },
    ],
    availableFor: ["Fishing Trips", "Boondocking", "Campfire Hangs"],
    bio: "Truck camper nomad seeking fishing buddies. Know all the best free campsites!",
    online: false,
    verified: true,
    travelStyle: "Early riser",
  },
  {
    id: "4",
    name: "Maria",
    imageUrl: profileImages.sarah,
    currentLocation: "Moab, UT",
    rigType: "Promaster Conversion",
    activities: [
      { name: "SUP", skillLevel: "intermediate" },
      { name: "Kayak", skillLevel: "beginner" },
      { name: "Explore", skillLevel: "advanced" },
    ],
    availableFor: ["Dark Sky Camping", "Van Meetups", "Sunrise Yoga"],
    bio: "Desert dweller in my DIY Promaster. Solo female van lifer - safety in numbers!",
    online: true,
    verified: true,
    travelStyle: "Night owl",
  },
  {
    id: "5",
    name: "Jake",
    imageUrl: profileImages.mike,
    currentLocation: "Durango, CO",
    rigType: "Transit Van + Bike Rack",
    activities: [
      { name: "MTB", skillLevel: "advanced" },
      { name: "Dirt Bike", skillLevel: "intermediate" },
      { name: "Camp", skillLevel: "intermediate" },
    ],
    availableFor: ["Group Rides", "Trail Camping", "Rig Tours"],
    bio: "Full-time van lifer chasing singletrack. Built my rig around my bikes!",
    online: true,
    verified: false,
    travelStyle: "Always moving",
  },
  {
    id: "6",
    name: "Lila",
    age: 29,
    imageUrl: profileImages.sarah,
    currentLocation: "Joshua Tree, CA",
    rigType: "Sprinter Solar Van",
    activities: [
      { name: "Yoga", skillLevel: "beginner" },
      { name: "Photography", skillLevel: "intermediate" },
      { name: "Camp", skillLevel: "intermediate" },
    ],
    availableFor: ["Sunrise Yoga", "Photo Convoys", "Trail Hikes"],
    bio: "Solar-powered van life with a slow morning routine and a love for wide-open desert skies.",
    online: true,
    verified: false,
    travelStyle: "Desert dreamer",
    pets: "Dog",
  },
  {
    id: "7",
    name: "Noah",
    age: 32,
    imageUrl: profileImages.mike,
    currentLocation: "Bend, OR",
    rigType: "Ford Transit + Dirt Bike",
    activities: [
      { name: "MTB", skillLevel: "advanced" },
      { name: "Climbing", skillLevel: "intermediate" },
      { name: "Camp", skillLevel: "advanced" },
    ],
    availableFor: ["Group Rides", "Rig Tours", "Trail Camping"],
    bio: "Mountain rider who lives for steep trails, long fire roads, and good company by the campfire.",
    online: false,
    verified: true,
    travelStyle: "Trail seeker",
  },
  {
    id: "8",
    name: "Avery",
    age: 27,
    imageUrl: profileImages.alex,
    currentLocation: "Santa Cruz, CA",
    rigType: "Surf Van with Roof Rack",
    activities: [
      { name: "Surfing", skillLevel: "intermediate" },
      { name: "Photography", skillLevel: "intermediate" },
      { name: "Camp", skillLevel: "beginner" },
    ],
    availableFor: ["Beach Meetups", "Sunset Sessions", "Campfire Hangs"],
    bio: "Surfer with a vibrant rig and a knack for finding the best coastal spots.",
    online: true,
    verified: false,
    travelStyle: "Coastal cruiser",
  },
  {
    id: "9",
    name: "Maya",
    age: 31,
    imageUrl: profileImages.sam,
    currentLocation: "Asheville, NC",
    rigType: "Vintage VW Bus",
    activities: [
      { name: "Coffee", skillLevel: "beginner" },
      { name: "Co-working", skillLevel: "intermediate" },
      { name: "Explore", skillLevel: "advanced" },
    ],
    availableFor: ["Co-working", "Camp Meetups", "Photo Convoys"],
    bio: "Remote creative balancing on-the-road work with communal campfires and city-side escapes.",
    online: false,
    verified: true,
    travelStyle: "Digital nomad",
    pets: "Cat",
  },
];

// Builder Mode Profiles - Professional Directory
export const builderProfiles: BuilderProfile[] = [
  {
    id: "1",
    name: "Sarah Chen",
    businessName: "Sarah's Solar Systems",
    imageUrl: profileImages.sarah,
    location: "Denver, CO",
    rating: 4.9,
    reviewCount: 47,
    verified: true,
    expertise: ["Solar Installation", "Battery Systems", "Electrical"],
    specialties: [
      { name: "Solar", icon: "sunny" },
      { name: "Lithium", icon: "battery-charging" },
      { name: "Off-Grid", icon: "flash" },
    ],
    consultationRate: 75,
    portfolioImages: [natureImages.vanInterior, eventImages.bonfire],
    bio: "15 years electrical experience. Specialized in complete off-grid solar systems for van conversions.",
    certifications: ["NABCEP Certified", "Licensed Electrician"],
  },
  {
    id: "2",
    name: "Mike Thompson",
    businessName: "VanTech Conversions",
    imageUrl: profileImages.mike,
    location: "Portland, OR",
    rating: 4.8,
    reviewCount: 32,
    verified: true,
    expertise: ["Full Builds", "Custom Cabinetry", "Insulation"],
    specialties: [
      { name: "Full Build", icon: "construct" },
      { name: "Woodwork", icon: "cube" },
      { name: "Design", icon: "color-palette" },
    ],
    consultationRate: 100,
    portfolioImages: [natureImages.vanInterior],
    bio: "Complete van conversions from bare metal to move-in ready. Custom designs that maximize your space.",
  },
];

export default function DiscoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, setMode, theme, isPremium } = useMode();
  const { user } = useAuth();
  const [localMode, setLocalMode] = useState<AppMode>(mode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedNomad, setSelectedNomad] = useState<FriendsProfile | null>(
    null,
  );
  const [connectionSent, setConnectionSent] = useState(false);
  const [refreshingFriends, setRefreshingFriends] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] =
    useState<BuilderProfile | null>(null);
  const [showBookingModal, setShowBookingModal] =
    useState<BuilderProfile | null>(null);

  // Handler for messaging a builder
  const handleMessageBuilder = (builder: BuilderProfile) => {
    router.push("Messages");
  };

  // Handler for viewing all builders
  const handleViewAllBuilders = () => {
    router.push("/builders");
  };

  // Button press animation
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  const animateButtonPress = (callback?: () => void) => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handleConnectNomad = (profile: FriendsProfile) => {
    setSelectedNomad(profile);
    setConnectionSent(false);
    setShowConnectModal(true);
  };

  const handleMessageNomad = (profile: FriendsProfile) => {
    router.push("/messages");
  };

  const onRefreshFriends = useCallback(() => {
    setRefreshingFriends(true);
    setTimeout(() => setRefreshingFriends(false), 650);
  }, []);

  const sendConnectionRequest = () => {
    setConnectionSent(true);
    setTimeout(() => {
      setShowConnectModal(false);
      setSelectedNomad(null);
    }, 1500);
  };

  // Ember glow animation for route overlap
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Glow pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [glowAnim, pulseAnim]);

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.92, 1],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        // Check velocity first - quick flicks work even with less distance
        const isQuickSwipeRight = gestureState.vx > SWIPE_VELOCITY_THRESHOLD;
        const isQuickSwipeLeft = gestureState.vx < -SWIPE_VELOCITY_THRESHOLD;

        if (gestureState.dx > SWIPE_THRESHOLD || isQuickSwipeRight) {
          swipeRight();
        } else if (gestureState.dx < -SWIPE_THRESHOLD || isQuickSwipeLeft) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    }),
  ).current;

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 200, // Faster animation for snappier feel
      useNativeDriver: false,
    }).start(() => onSwipeComplete("like"));
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 200, // Faster animation for snappier feel
      useNativeDriver: false,
    }).start(() => onSwipeComplete("nope"));
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      tension: 80, // Higher tension = faster spring back
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const onSwipeComplete = (_action: "like" | "nope") => {
    setCurrentIndex((prev) => prev + 1);
    position.setValue({ x: 0, y: 0 });
  };

  const handleModeChange = (newMode: AppMode) => {
    if (newMode === localMode) return;
    setLocalMode(newMode);
    setMode(newMode);
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (mode !== localMode) {
      setLocalMode(mode);
    }
  }, [mode, localMode]);

  const getModeTitle = () => {
    return localMode === "friends" ? "Friends" : "Builders";
  };

  const getBackgroundVariant = () => {
    return mode === "friends" ? "forest" : "canyon";
  };

  // Render Friends Mode - Scrollable list
  const renderFriendsMode = () => {
    return (
      <ScrollView
        style={styles.friendsScrollView}
        contentContainerStyle={[
          styles.friendsScrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        alwaysBounceVertical={true}
      >
        {/* Nearby Adventures - Activity Events */}
        <OutdoorEvents />

        {/* Nearby Nomads Header */}
        <View style={styles.friendsSectionHeader}>
          <Text style={styles.friendsSectionTitle}>Find Your Road Family</Text>
          <Text style={styles.friendsSectionSubtitle}>
            Connect based on shared activities
          </Text>
        </View>

        {/* Friends Grid - Scrollable List */}
        {friendsProfiles.map((profile) => (
          <View key={profile.id} style={styles.friendsCardWrapper}>
            <FriendsProfileCard
              profile={profile}
              onConnect={() => handleConnectNomad(profile)}
              onMessage={() => handleMessageNomad(profile)}
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  // Render Builder Mode - Professional Directory (no swiping)
  const renderBuilderMode = () => {
    return (
      <ScrollView
        style={styles.builderScrollView}
        contentContainerStyle={[
          styles.builderScrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Vetted Builders Section */}
        <View style={styles.buildersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vetted Builders</Text>
            <TouchableOpacity onPress={handleViewAllBuilders}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {builderProfiles.map((builder) => (
            <BuilderProfileCard
              key={builder.id}
              profile={builder}
              onViewPortfolio={() => setShowPortfolioModal(builder)}
              onBookConsult={() => setShowBookingModal(builder)}
              onMessage={() => handleMessageBuilder(builder)}
            />
          ))}
        </View>

        {/* Quick Connect Section */}
        <View style={styles.quickConnectSection}>
          <Text style={styles.sectionTitle}>Quick Connect</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickConnectList}
          >
            {builderProfiles.map((builder) => (
              <BuilderCompactCard
                key={builder.id}
                profile={builder}
                onPress={() => setShowBookingModal(builder)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Glass Header */}
        <View style={styles.glassHeaderWrap}>
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View
            style={[
              styles.glassHeaderOverlay,
              Platform.OS !== "ios" && {
                backgroundColor: "rgba(245,239,230,0.92)",
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Logo size="small" variant="dark" />
                <Text style={styles.headerTitle}>{getModeTitle()}</Text>
              </View>
              <View style={styles.headerRight}>
                <GhostModeStatus onPress={() => setShowPaywall(true)} />
              </View>
            </View>
          </View>
        </View>

        {/* Pending Verification Banner */}
        {user && !user.selfieVerified ? (
          <View style={styles.verificationBanner}>
            <Ionicons name="time-outline" size={18} color="#7A5C00" />
            <View style={styles.verificationBannerText}>
              <Text style={styles.verificationBannerTitle}>
                Pending Verification
              </Text>
              <Text style={styles.verificationBannerSubtitle}>
                {user.selfieSubmitted
                  ? "Your account will be verified within 24 hours."
                  : "Submit a selfie to get verified and unlock all features."}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Mode Toggle */}
        <View style={styles.toggleContainer}>
          <ModeToggle
            key={localMode}
            activeMode={localMode}
            onModeChange={handleModeChange}
            showPremiumBadge={isPremium}
          />
        </View>

        {/* Your Passport - Editable Profile Summary */}
        <MiniPassport />

        {/* Mode-Specific Content */}
        {mode === "friends" ? renderFriendsMode() : null}
        {mode === "builder" ? renderBuilderMode() : null}
      </View>

      {/* Premium Paywall */}
      <ConvoyPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={(success) => {
          if (success) {
            // Update premium status through context
          }
        }}
      />

      {/* Portfolio Modal */}
      <Modal
        visible={showPortfolioModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPortfolioModal(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowPortfolioModal(null)}
          />
          <View style={styles.portfolioModalContent}>
            <View style={styles.builderModalHeader}>
              <Text style={styles.builderModalTitle}>
                {showPortfolioModal?.businessName} Portfolio
              </Text>
              <TouchableOpacity onPress={() => setShowPortfolioModal(null)}>
                <Ionicons name="close" size={24} color={colors.bark[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.portfolioScroll}
            >
              {showPortfolioModal?.portfolioImages?.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.portfolioImage}
                  contentFit="cover"
                />
              ))}
            </ScrollView>

            <Text style={styles.portfolioDescription}>
              {showPortfolioModal?.bio ||
                "Check out our recent builds and conversions."}
            </Text>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                setShowPortfolioModal(null);
                if (showPortfolioModal)
                  handleMessageBuilder(showPortfolioModal);
              }}
            >
              <Ionicons
                name="chatbubble"
                size={18}
                color={colors.text.inverse}
              />
              <Text style={styles.contactButtonText}>Contact Builder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBookingModal(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowBookingModal(null)}
          />
          <View style={styles.bookingModalContent}>
            <View style={styles.builderModalHeader}>
              <Text style={styles.builderModalTitle}>Ask for Help</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(null)}>
                <Ionicons name="close" size={24} color={colors.bark[600]} />
              </TouchableOpacity>
            </View>

            {showBookingModal ? (
              <>
                <View style={styles.builderPreview}>
                  <Image
                    source={{ uri: showBookingModal.imageUrl }}
                    style={styles.builderAvatar}
                    contentFit="cover"
                  />
                  <View>
                    <Text style={styles.builderName}>
                      {showBookingModal.businessName}
                    </Text>
                    <Text style={styles.builderLocation}>
                      {showBookingModal.location}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bookingDescription}>
                  {showBookingModal.businessName} is a community helper ready to
                  assist with your build questions.
                </Text>

                <View style={styles.bookingOptions}>
                  <TouchableOpacity
                    style={styles.bookingOption}
                    onPress={() => {
                      setShowBookingModal(null);
                      handleMessageBuilder(showBookingModal);
                    }}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={24}
                      color={colors.moss[600]}
                    />
                    <Text style={styles.bookingOptionLabel}>Send Message</Text>
                    <Text style={styles.bookingOptionDesc}>
                      Ask a quick question
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.bookingOption}
                    onPress={() => setShowBookingModal(null)}
                  >
                    <Ionicons
                      name="videocam-outline"
                      size={24}
                      color={colors.moss[600]}
                    />
                    <Text style={styles.bookingOptionLabel}>Video Call</Text>
                    <Text style={styles.bookingOptionDesc}>
                      Schedule a consultation
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Connect Request Modal */}
      <Modal
        visible={showConnectModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowConnectModal(false)}
      >
        <View style={styles.modalOverlay}>
          {Platform.OS === "ios" ? (
            <BlurView intensity={80} tint="dark" style={styles.connectModal}>
              <ConnectModalContent />
            </BlurView>
          ) : (
            <View style={[styles.connectModal, styles.connectModalAndroid]}>
              <ConnectModalContent />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );

  function ConnectModalContent() {
    if (!selectedNomad) return null;

    return (
      <View style={styles.connectModalInner}>
        <TouchableOpacity
          style={styles.closeModalBtn}
          onPress={() => setShowConnectModal(false)}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Image
          source={{ uri: selectedNomad.imageUrl }}
          style={styles.connectModalAvatar}
          contentFit="cover"
        />

        <Text style={styles.connectModalTitle}>
          {connectionSent
            ? "Request Sent!"
            : `Connect with ${selectedNomad.name}?`}
        </Text>

        {connectionSent ? (
          <View style={styles.successCheckContainer}>
            <Ionicons
              name="checkmark-circle"
              size={60}
              color={colors.moss[500]}
            />
            <Text style={styles.successText}>
              {selectedNomad.name} will be notified of your connection request
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.connectModalSubtitle}>
              {selectedNomad.name} is currently in{" "}
              {selectedNomad.currentLocation}
            </Text>

            <View style={styles.sharedActivities}>
              <Text style={styles.sharedActivitiesLabel}>Shared Interests</Text>
              <View style={styles.sharedActivitiesList}>
                {selectedNomad.availableFor
                  .slice(0, 3)
                  .map((activity, index) => (
                    <View key={index} style={styles.sharedActivityChip}>
                      <Text style={styles.sharedActivityText}>{activity}</Text>
                    </View>
                  ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.sendConnectionBtn}
              onPress={sendConnectionRequest}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={20} color="#FFFFFF" />
              <Text style={styles.sendConnectionBtnText}>
                Send Connection Request
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageInsteadBtn}
              onPress={() => {
                setShowConnectModal(false);
                handleMessageNomad(selectedNomad);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={colors.moss[500]}
              />
              <Text style={styles.messageInsteadBtnText}>Message Instead</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  verificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  verificationBannerText: {
    flex: 1,
  },
  verificationBannerTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#7A5C00",
  },
  verificationBannerSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#8B6914",
    marginTop: 2,
  },
  glassHeaderWrap: {
    overflow: "hidden",
    borderRadius: 20,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.6,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  glassHeaderOverlay: {
    paddingVertical: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[800],
    marginLeft: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },
  toggleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    zIndex: 10,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    ...shadows.glassFloat,
  },
  nextCard: {
    top: 8,
  },
  labelContainer: {
    position: "absolute",
    top: 40,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    backgroundColor: colors.glass.whiteLight,
  },
  likeLabel: {
    right: 20,
    borderColor: colors.ember[500],
    transform: [{ rotate: "15deg" }],
  },
  nopeLabel: {
    left: 20,
    borderColor: colors.clay[500],
    transform: [{ rotate: "-15deg" }],
  },
  labelText: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    letterSpacing: typography.letterSpacing.wide,
  },
  likeLabelText: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.ember[500],
    letterSpacing: typography.letterSpacing.wide,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bark[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  nopeButton: {
    borderColor: colors.clay[400] + "40",
  },
  superButton: {
    width: 48,
    height: 48,
    borderColor: colors.ember[400] + "40",
  },
  likeButton: {
    borderColor: colors.ember[400] + "40",
  },
  messageButton: {
    width: 48,
    height: 48,
    borderColor: colors.moss[400] + "40",
  },
  connectButton: {
    borderColor: colors.moss[400] + "40",
  },
  friendsScrollView: {
    flex: 1,
  },
  friendsScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  friendsSectionHeader: {
    marginBottom: spacing.lg,
  },
  friendsSectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
  },
  friendsSectionSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    marginTop: spacing.xs,
  },
  friendsCardWrapper: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    ...shadows.glassFloat,
  },
  builderScrollView: {
    flex: 1,
  },
  builderScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  buildersSection: {
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.driftwood[400],
  },
  quickConnectSection: {
    marginBottom: spacing.xl,
  },
  quickConnectList: {
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  connectModal: {
    width: "100%",
    maxWidth: 340,
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
  },
  connectModalAndroid: {
    backgroundColor: colors.bark[800],
  },
  connectModalInner: {
    padding: spacing.xl,
    alignItems: "center",
  },
  closeModalBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  connectModalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.moss[500],
  },
  connectModalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  connectModalSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  successCheckContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  successText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: spacing.md,
  },
  sharedActivities: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  sharedActivitiesLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "rgba(255,255,255,0.6)",
    marginBottom: spacing.sm,
  },
  sharedActivitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sharedActivityChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  sharedActivityText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
  },
  sendConnectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.moss[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    width: "100%",
    marginBottom: spacing.md,
  },
  sendConnectionBtnText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  messageInsteadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  messageInsteadBtnText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.moss[500],
  },
  // Portfolio Modal Styles
  portfolioModalContent: {
    backgroundColor: colors.background.primary,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: "80%",
  },
  builderModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  builderModalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.displayBold,
    color: colors.text.primary,
  },
  portfolioScroll: {
    marginBottom: spacing.md,
  },
  portfolioImage: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
  },
  portfolioDescription: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.moss[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  contactButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  // Booking Modal Styles
  bookingModalContent: {
    backgroundColor: colors.background.primary,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  builderPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  builderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  builderName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.displayBold,
    color: colors.text.primary,
  },
  builderLocation: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  bookingDescription: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  bookingOptions: {
    gap: spacing.md,
  },
  bookingOption: {
    flexDirection: "column",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  bookingOptionLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  bookingOptionDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  discoveryOffContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  discoveryOffIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.moss[500] + "12",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  discoveryOffTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: "600",
    color: "#2A2A2A",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  discoveryOffDesc: {
    fontSize: typography.fontSize.base,
    fontWeight: "300",
    color: colors.bark[500],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  discoveryOffNote: {
    fontSize: typography.fontSize.sm,
    fontWeight: "300",
    color: colors.bark[400],
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  discoveryOffButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D94848",
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
  },
  discoveryOffButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
