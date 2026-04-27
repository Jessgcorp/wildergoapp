import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  natureImages,
} from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/Button";
const { width, height } = Dimensions.get("window");

const GlassTile: React.FC<{
  children: React.ReactNode;
  selected?: boolean;
  selectedColor?: string;
  style?: any;
}> = ({
  children,
  selected,
  selectedColor = "rgba(255,255,255,0.12)",
  style,
}) => {
  const content = (
    <View
      style={[
        glassTileStyles.inner,
        selected && { borderColor: selectedColor },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={40} tint="light" style={glassTileStyles.blur}>
        {content}
      </BlurView>
    );
  }

  return (
    <View style={[glassTileStyles.blur, glassTileStyles.androidFallback]}>
      {content}
    </View>
  );
};

const glassTileStyles = StyleSheet.create({
  blur: {
    borderRadius: 24,
    overflow: "hidden",
  },
  inner: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 0.3,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    padding: spacing.xl,
  },
  androidFallback: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

export default function DiscoveryModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedMode, setSelectedMode] = useState<
    "community" | "discovery" | null
  >("community");
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const backgroundScale = useRef(new Animated.Value(1.1)).current;
  const communityScale = useRef(new Animated.Value(1)).current;
  const discoveryScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backgroundScale, {
        toValue: 1.05,
        duration: 20000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, backgroundScale]);

  const animateSelect = (mode: "community" | "discovery") => {
    const targetAnim = mode === "community" ? communityScale : discoveryScale;
    const otherAnim = mode === "community" ? discoveryScale : communityScale;

    Animated.parallel([
      Animated.sequence([
        Animated.spring(targetAnim, {
          toValue: 0.96,
          tension: 200,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(targetAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(otherAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedMode(mode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = async () => {
    if (!selectedMode) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    router.push("/(onboarding)/selfie-verify");
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.backgroundContainer,
          { transform: [{ scale: backgroundScale }] },
        ]}
      >
        <Image
          source={{ uri: natureImages.mountainLake }}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={800}
        />
      </Animated.View>

      <View style={styles.subtleOverlay} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="button-back"
        >
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.stepLabel}>Step 4 of 5</Text>

        <Animated.View
          style={[
            styles.titleSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.titleIconContainer}>
            <Ionicons
              name="compass-outline"
              size={32}
              color="rgba(255,255,255,0.85)"
            />
          </View>
          <Text style={styles.title}>How do you want to explore?</Text>
          <Text style={styles.subtitle}>
            Choose how you&apos;d like to connect with the nomad community. You
            can always change this later.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => animateSelect("community")}
            testID="card-community"
          >
            <Animated.View style={{ transform: [{ scale: communityScale }] }}>
              <GlassTile
                selected={selectedMode === "community"}
                selectedColor="rgba(107, 142, 97, 0.5)"
              >
                <View style={styles.tileHeader}>
                  <View style={styles.tileIconWrap}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={26}
                      color="rgba(255,255,255,0.85)"
                    />
                  </View>
                  {selectedMode === "community" ? (
                    <View style={styles.selectedCheck}>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="rgba(107, 142, 97, 0.9)"
                      />
                    </View>
                  ) : (
                    <View style={styles.defaultTag}>
                      <Text style={styles.defaultTagText}>Default</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.tileTitle}>Community & Safety</Text>
                <Text style={styles.tileDescription}>
                  Connect with trail buddies, join convoys, and share
                  adventures. Perfect for those in relationships or looking for
                  genuine friendships on the road.
                </Text>

                <View style={styles.tileFeatures}>
                  <View style={styles.featureRow}>
                    <Ionicons
                      name="people-outline"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.featureText}>
                      Find trail buddies nearby
                    </Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons
                      name="car-outline"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.featureText}>
                      Join and create convoys
                    </Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons
                      name="construct-outline"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.featureText}>
                      Connect with rig builders
                    </Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons
                      name="ribbon-outline"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.featureText}>
                      Full Nomad Chronicles access
                    </Text>
                  </View>
                </View>
              </GlassTile>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => animateSelect("discovery")}
            testID="card-discovery"
          >
            <Animated.View style={{ transform: [{ scale: discoveryScale }] }}>
              <GlassTile
                selected={selectedMode === "discovery"}
                selectedColor="rgba(217, 72, 72, 0.5)"
              >
                <View style={styles.tileHeader}>
                  <View style={styles.tileIconWrap}>
                    <Ionicons
                      name="heart-outline"
                      size={26}
                      color="rgba(255,255,255,0.85)"
                    />
                  </View>
                  {selectedMode === "discovery" ? (
                    <View style={styles.selectedCheck}>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="rgba(217, 72, 72, 0.9)"
                      />
                    </View>
                  ) : null}
                </View>

                <Text style={styles.tileTitle}>Social Discovery</Text>
                <Text style={styles.tileDescription}>
                  Connect with other nomads, join convoys, and build your road
                  family community.
                </Text>

                <View style={styles.tileFeatures}>
                  <View style={styles.featureRow}>
                    <Ionicons
                      name="heart-outline"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.featureText}>
                      Route-synced matching
                    </Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons
                      name="navigate-outline"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.featureText}>
                      See who&apos;s on your path
                    </Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons
                      name="people-outline"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.featureText}>
                      All Community features included
                    </Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons
                      name="ribbon-outline"
                      size={15}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.featureText}>
                      Full Nomad Chronicles access
                    </Text>
                  </View>
                </View>
              </GlassTile>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.privacyPromise, { opacity: fadeAnim }]}>
          <Text style={styles.privacyPromiseText}>
            WilderGo is built on the spirit of the road. Whether you&apos;re
            here to find a partner or just to find your way home safely, your
            journey is your own. You can change your discovery status at any
            time in your settings.
          </Text>
        </Animated.View>

        <View style={styles.ctaSection}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="ember"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!selectedMode}
            icon={
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.text.inverse}
              />
            }
            iconPosition="right"
            testID="button-continue"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  subtleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.3,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: borderRadius.full,
  },
  progressActive: {
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  stepLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: "300",
    color: "rgba(255,255,255,0.5)",
    marginTop: spacing.md,
    letterSpacing: 0.5,
  },
  titleSection: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 28,
  },
  titleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.3,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
    marginBottom: spacing.sm,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: "300",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  cardsContainer: {
    gap: 16,
  },
  tileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tileIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCheck: {
    opacity: 0.9,
  },
  defaultTag: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 0.3,
    borderColor: "rgba(255,255,255,0.15)",
  },
  defaultTagText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "400",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.3,
  },
  tileTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  tileDescription: {
    fontSize: typography.fontSize.sm,
    fontWeight: "300",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  tileFeatures: {
    gap: 9,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "400",
    color: "rgba(255,255,255,0.6)",
  },
  privacyPromise: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  privacyPromiseText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "300",
    color: "rgba(255,255,255,0.38)",
    lineHeight: 18,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  ctaSection: {
    marginTop: "auto",
    paddingTop: 24,
    paddingBottom: spacing.lg,
  },
});
