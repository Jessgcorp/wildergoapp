/**
 * WilderGo Nomad Journal
 * Private journal for saving photos and notes at specific coordinates
 * Features:
 * - Rich text entries
 * - Location tagging
 * - Mood tracking
 * - Weather notes
 * - Photo gallery
 * - Completely private (not shared with community)
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Image,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  borderRadius,
  spacing,
  typography,
  shadows,
  blur,
} from "@/constants/theme";
import {
  JournalEntry,
  moodConfig,
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/services/passport/nomadPassportService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface NomadJournalProps {
  userId: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}

// Journal stats header
const JournalStatsCard: React.FC<{ entries: JournalEntry[] }> = ({
  entries,
}) => {
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const entriesWithLocation = entries.filter(
      (e) => e.latitude && e.longitude,
    ).length;
    const moodCounts = entries.reduce(
      (acc, e) => {
        if (e.mood) acc[e.mood] = (acc[e.mood] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostCommonMood = Object.entries(moodCounts).sort(
      ([, a], [, b]) => b - a,
    )[0]?.[0];

    return { totalEntries, entriesWithLocation, mostCommonMood };
  }, [entries]);

  const moodInfo = stats.mostCommonMood
    ? moodConfig[stats.mostCommonMood]
    : null;

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;
  const containerProps =
    Platform.OS === "ios"
      ? {
          tint: "light" as const,
          intensity: blur.medium,
          style: styles.statsCard,
        }
      : { style: [styles.statsCard, styles.statsCardFallback] };

  return (
    <ContainerWrapper {...containerProps}>
      <View style={styles.statsHeader}>
        <Ionicons name="lock-closed" size={16} color={colors.deepTeal[500]} />
        <Text style={styles.privateLabel}>Private Journal</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalEntries}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.entriesWithLocation}</Text>
          <Text style={styles.statLabel}>Geotagged</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          {moodInfo ? (
            <View style={styles.moodIconContainer}>
              <Ionicons
                name={moodInfo.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={moodInfo.color}
              />
            </View>
          ) : (
            <Text style={styles.statValue}>-</Text>
          )}
          <Text style={styles.statLabel}>Top Mood</Text>
        </View>
      </View>
    </ContainerWrapper>
  );
};

// Mood selector
interface MoodSelectorProps {
  selectedMood: string | undefined;
  onSelectMood: (mood: string | undefined) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  const moods = Object.entries(moodConfig) as [
    string,
    (typeof moodConfig)[string],
  ][];

  return (
    <View style={styles.moodSelector}>
      {moods.map(([mood, config]) => (
        <TouchableOpacity
          key={mood}
          style={[
            styles.moodOption,
            selectedMood === mood && {
              backgroundColor: config.color + "20",
              borderColor: config.color,
            },
          ]}
          onPress={() => onSelectMood(selectedMood === mood ? undefined : mood)}
        >
          <Ionicons
            name={config.icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={selectedMood === mood ? config.color : colors.bark[400]}
          />
          <Text
            style={[
              styles.moodOptionText,
              selectedMood === mood && { color: config.color },
            ]}
          >
            {config.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Individual journal entry card
interface JournalCardProps {
  entry: JournalEntry;
  onPress: () => void;
  onDelete: () => void;
}

const JournalCard: React.FC<JournalCardProps> = ({
  entry,
  onPress,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const entryDate = new Date(entry.createdAt);
  const moodInfo = entry.mood ? moodConfig[entry.mood] : null;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;
  const containerProps =
    Platform.OS === "ios"
      ? {
          tint: "light" as const,
          intensity: blur.light,
          style: styles.journalCard,
        }
      : { style: [styles.journalCard, styles.journalCardFallback] };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={() => setShowMenu(true)}
      >
        <ContainerWrapper {...containerProps}>
          {/* Header with date and mood */}
          <View style={styles.cardHeader}>
            <View style={styles.cardDateContainer}>
              <Text style={styles.cardDate}>
                {entryDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.cardTime}>
                {entryDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View style={styles.cardHeaderRight}>
              {moodInfo && (
                <View
                  style={[
                    styles.moodBadge,
                    { backgroundColor: moodInfo.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={moodInfo.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={moodInfo.color}
                  />
                </View>
              )}
              <TouchableOpacity
                onPress={() => setShowMenu(!showMenu)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={18}
                  color={colors.bark[400]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={1}>
            {entry.title}
          </Text>

          {/* Location */}
          {entry.locationName && (
            <View style={styles.cardLocation}>
              <Ionicons
                name="location"
                size={14}
                color={colors.forestGreen[500]}
              />
              <Text style={styles.cardLocationText} numberOfLines={1}>
                {entry.locationName}
              </Text>
            </View>
          )}

          {/* Content preview */}
          <Text style={styles.cardContent} numberOfLines={3}>
            {entry.content}
          </Text>

          {/* Weather if present */}
          {entry.weather && (
            <View style={styles.weatherBadge}>
              <Ionicons
                name="cloudy-outline"
                size={14}
                color={colors.bark[400]}
              />
              <Text style={styles.weatherText}>{entry.weather}</Text>
            </View>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tagContainer}>
              {entry.tags.slice(0, 4).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Context menu */}
          {showMenu && (
            <View style={styles.contextMenu}>
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={() => {
                  setShowMenu(false);
                  onDelete();
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.status.error}
                />
                <Text
                  style={[
                    styles.contextMenuText,
                    { color: colors.status.error },
                  ]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ContainerWrapper>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Add/Edit journal entry modal
interface JournalEditorModalProps {
  visible: boolean;
  entry?: JournalEntry;
  currentLocation?: { latitude: number; longitude: number; name?: string };
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
}

const JournalEditorModal: React.FC<JournalEditorModalProps> = ({
  visible,
  entry,
  currentLocation,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [mood, setMood] = useState<string | undefined>(entry?.mood);
  const [weather, setWeather] = useState(entry?.weather || "");
  const [tags, setTags] = useState(entry?.tags?.join(", ") || "");
  const [useLocation, setUseLocation] = useState(
    !!entry?.latitude || !!currentLocation,
  );
  const [locationName, setLocationName] = useState(
    entry?.locationName || currentLocation?.name || "",
  );

  useEffect(() => {
    if (visible && !entry) {
      // Reset form for new entries
      setTitle("");
      setContent("");
      setMood(undefined);
      setWeather("");
      setTags("");
      setUseLocation(!!currentLocation);
      setLocationName(currentLocation?.name || "");
    }
  }, [visible, entry, currentLocation]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const tagArray = tags
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter((t) => t.length > 0);

    const newEntry = entry
      ? updateJournalEntry(entry.id, {
          title: title.trim(),
          content: content.trim(),
          mood: mood as JournalEntry["mood"],
          weather: weather.trim() || undefined,
          tags: tagArray.length > 0 ? tagArray : undefined,
          locationName: useLocation ? locationName.trim() : undefined,
        })
      : addJournalEntry({
          userId: "user-1",
          title: title.trim(),
          content: content.trim(),
          mood: mood as JournalEntry["mood"],
          weather: weather.trim() || undefined,
          tags: tagArray.length > 0 ? tagArray : undefined,
          latitude: useLocation ? currentLocation?.latitude : undefined,
          longitude: useLocation ? currentLocation?.longitude : undefined,
          locationName: useLocation ? locationName.trim() : undefined,
          isPrivate: true,
        });

    if (newEntry) {
      onSave(newEntry);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {entry ? "Edit Entry" : "New Entry"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.bark[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Title */}
              <Text style={styles.inputLabel}>Title</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Give your entry a title..."
                  placeholderTextColor={colors.bark[300]}
                />
              </View>

              {/* Content */}
              <Text style={styles.inputLabel}>Journal Entry</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={content}
                  onChangeText={setContent}
                  placeholder="Write your thoughts, experiences, observations..."
                  multiline
                  numberOfLines={6}
                  placeholderTextColor={colors.bark[300]}
                />
              </View>

              {/* Mood selector */}
              <Text style={styles.inputLabel}>How are you feeling?</Text>
              <MoodSelector selectedMood={mood} onSelectMood={setMood} />

              {/* Location toggle */}
              {currentLocation && (
                <>
                  <View style={styles.locationToggle}>
                    <View style={styles.locationToggleInfo}>
                      <Ionicons
                        name="location"
                        size={18}
                        color={colors.forestGreen[500]}
                      />
                      <Text style={styles.locationToggleText}>
                        Tag current location
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.toggleSwitch,
                        useLocation && styles.toggleSwitchActive,
                      ]}
                      onPress={() => setUseLocation(!useLocation)}
                    >
                      <View
                        style={[
                          styles.toggleKnob,
                          useLocation && styles.toggleKnobActive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>
                  {useLocation && (
                    <View
                      style={[styles.inputContainer, { marginTop: spacing.sm }]}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={colors.bark[400]}
                      />
                      <TextInput
                        style={styles.input}
                        value={locationName}
                        onChangeText={setLocationName}
                        placeholder="Location name (e.g., Valley of the Gods)"
                        placeholderTextColor={colors.bark[300]}
                      />
                    </View>
                  )}
                </>
              )}

              {/* Weather */}
              <Text style={styles.inputLabel}>Weather (optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="cloudy-outline"
                  size={18}
                  color={colors.bark[400]}
                />
                <TextInput
                  style={styles.input}
                  value={weather}
                  onChangeText={setWeather}
                  placeholder="e.g., Sunny, 72°F"
                  placeholderTextColor={colors.bark[300]}
                />
              </View>

              {/* Tags */}
              <Text style={styles.inputLabel}>Tags (optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="pricetag-outline"
                  size={18}
                  color={colors.bark[400]}
                />
                <TextInput
                  style={styles.input}
                  value={tags}
                  onChangeText={setTags}
                  placeholder="gratitude, sunset, milestone (comma separated)"
                  placeholderTextColor={colors.bark[300]}
                />
              </View>
            </ScrollView>

            {/* Save button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!title.trim() || !content.trim()) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!title.trim() || !content.trim()}
            >
              <LinearGradient
                colors={
                  title.trim() && content.trim()
                    ? [colors.burntSienna[500], colors.burntSienna[600]]
                    : [colors.bark[300], colors.bark[400]]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.text.inverse}
                />
                <Text style={styles.saveButtonText}>
                  {entry ? "Update Entry" : "Save Entry"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Main component
export const NomadJournal: React.FC<NomadJournalProps> = ({
  userId,
  currentLocation,
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<
    JournalEntry | undefined
  >();

  useEffect(() => {
    setEntries(getJournalEntries(userId));
  }, [userId]);

  const handleSaveEntry = (entry: JournalEntry) => {
    setEntries(getJournalEntries(userId));
    setShowEditor(false);
    setSelectedEntry(undefined);
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteJournalEntry(entryId);
    setEntries(getJournalEntries(userId));
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowEditor(true);
  };

  const handleNewEntry = () => {
    setSelectedEntry(undefined);
    setShowEditor(true);
  };

  return (
    <View style={styles.container}>
      {/* Stats card */}
      <JournalStatsCard entries={entries} />

      {/* Entries list */}
      <ScrollView
        style={styles.entriesList}
        contentContainerStyle={styles.entriesContent}
        showsVerticalScrollIndicator={false}
      >
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="journal-outline"
              size={48}
              color={colors.bark[300]}
            />
            <Text style={styles.emptyTitle}>Your journal awaits</Text>
            <Text style={styles.emptyText}>
              Capture your thoughts, moments, and memories on the road. Your
              entries are completely private.
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={handleNewEntry}
            >
              <LinearGradient
                colors={[colors.burntSienna[500], colors.burntSienna[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addFirstButtonGradient}
              >
                <Ionicons name="add" size={20} color={colors.text.inverse} />
                <Text style={styles.addFirstButtonText}>
                  Write Your First Entry
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onPress={() => handleEditEntry(entry)}
              onDelete={() => handleDeleteEntry(entry.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating add button */}
      {entries.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewEntry}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.burntSienna[500], colors.burntSienna[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="pencil" size={24} color={colors.text.inverse} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Editor modal */}
      <JournalEditorModal
        visible={showEditor}
        entry={selectedEntry}
        currentLocation={currentLocation}
        onClose={() => {
          setShowEditor(false);
          setSelectedEntry(undefined);
        }}
        onSave={handleSaveEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Stats card
  statsCard: {
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  statsCardFallback: {
    backgroundColor: colors.glass.white,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  privateLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.deepTeal[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.bark[200],
  },
  statValue: {
    fontSize: typography.fontSize["2xl"],
    fontFamily: typography.fontFamily.display,
    color: colors.burntSienna[500],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  moodIconContainer: {
    height: 32,
    justifyContent: "center",
  },
  // Mood selector
  moodSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  moodOption: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.bark[200],
    backgroundColor: colors.glass.white,
  },
  moodOptionText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
    marginTop: spacing.xxs,
  },
  // Entries list
  entriesList: {
    flex: 1,
  },
  entriesContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  // Journal card
  journalCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
    position: "relative",
  },
  journalCardFallback: {
    backgroundColor: colors.glass.white,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  cardDateContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  cardDate: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.secondary,
  },
  cardTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  moodBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
  },
  cardLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  cardLocationText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.forestGreen[600],
  },
  cardContent: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  weatherText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.burntSienna[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.burntSienna[600],
  },
  // Context menu
  contextMenu: {
    position: "absolute",
    top: 40,
    right: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    zIndex: 10,
  },
  contextMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  contextMenuText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginTop: spacing.md,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  addFirstButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  addFirstButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  addFirstButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
    borderRadius: 30,
    overflow: "hidden",
    ...shadows.lg,
  },
  fabGradient: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.bark[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
  },
  modalBody: {
    padding: spacing.lg,
    maxHeight: 500,
  },
  // Inputs
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bark[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.text.primary,
  },
  textAreaContainer: {
    alignItems: "flex-start",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  // Location toggle
  locationToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  locationToggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  locationToggleText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.primary,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bark[200],
    padding: 2,
    justifyContent: "center",
  },
  toggleSwitchActive: {
    backgroundColor: colors.forestGreen[500],
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  // Save button
  saveButton: {
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
});

export default NomadJournal;
