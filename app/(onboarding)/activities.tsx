import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "@/hooks/useRouterCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

interface Activity {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const activities: Activity[] = [
  { id: "hiking", name: "Hiking", icon: "walk" },
  { id: "camping", name: "Camping", icon: "bonfire" },
  { id: "fishing", name: "Fishing", icon: "fish" },
  { id: "mountain-biking", name: "Mountain Biking", icon: "bicycle" },
  { id: "rock-climbing", name: "Rock Climbing", icon: "trending-up" },
  { id: "kayaking", name: "Kayaking", icon: "boat" },
  { id: "skiing", name: "Skiing", icon: "snow" },
  { id: "surfing", name: "Surfing", icon: "water" },
  { id: "trail-running", name: "Trail Running", icon: "fitness" },
  { id: "overlanding", name: "Overlanding", icon: "car-sport" },
  { id: "photography", name: "Photography", icon: "camera" },
  { id: "stargazing", name: "Stargazing", icon: "star" },
  { id: "sup", name: "Paddleboarding", icon: "body" },
  { id: "dirt-biking", name: "Dirt Biking", icon: "speedometer" },
  { id: "foraging", name: "Foraging", icon: "leaf" },
  { id: "birdwatching", name: "Birdwatching", icon: "eye" },
  { id: "backpacking", name: "Backpacking", icon: "bag-handle" },
  { id: "yoga", name: "Outdoor Yoga", icon: "flower" },
];

export default function ActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleContinue = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.replace("/(tabs)/discovery");
    setLoading(false);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="button-back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.bark[700]} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Logo size="small" variant="dark" />
        </View>

        <Text style={styles.title}>Which activities do you like?</Text>
        <Text style={styles.subtitle}>
          Tell us what you love so we can connect you with like-minded
          adventurers in your area
        </Text>

        <View style={styles.activitiesGrid}>
          {activities.map((activity) => {
            const isSelected = selectedActivities.includes(activity.id);
            return (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityChip,
                  isSelected && styles.activityChipSelected,
                ]}
                onPress={() => toggleActivity(activity.id)}
                activeOpacity={0.7}
                testID={`button-activity-${activity.id}`}
              >
                <Ionicons
                  name={activity.icon}
                  size={20}
                  color={isSelected ? colors.text.inverse : colors.bark[500]}
                />
                <Text
                  style={[
                    styles.activityText,
                    isSelected && styles.activityTextSelected,
                  ]}
                >
                  {activity.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedActivities.length > 0 ? (
          <Text style={styles.selectedCount}>
            {selectedActivities.length} selected
          </Text>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.bottomSection,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <Button
          title={loading ? "Getting started..." : "Next"}
          onPress={handleContinue}
          variant="ember"
          size="lg"
          fullWidth
          disabled={loading}
          icon={
            <Ionicons
              name="arrow-forward"
              size={20}
              color={colors.text.inverse}
            />
          }
          testID="button-continue-activities"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bark[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    lineHeight: 22,
    marginBottom: spacing["2xl"],
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  activityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bark[100],
    borderRadius: borderRadius.xl,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: colors.bark[200],
    width: "48%",
    flexGrow: 0,
  },
  activityChipSelected: {
    backgroundColor: colors.moss[500],
    borderColor: colors.moss[600],
  },
  activityText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[700],
    flex: 1,
  },
  activityTextSelected: {
    color: colors.text.inverse,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  selectedCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.moss[600],
    textAlign: "center",
    marginTop: spacing.lg,
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bark[100],
  },
});
