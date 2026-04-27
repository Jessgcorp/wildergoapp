/**
 * WilderGo Rig Maintenance Tracker
 * Log and track technical upkeep:
 * - Oil changes, tire rotations
 * - Battery health
 * - Solar panel maintenance
 * - Upcoming maintenance alerts
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
  maintenanceCategories,
} from "@/constants/theme";
import {
  MaintenanceRecord,
  getMaintenanceRecords,
  getUpcomingMaintenance,
  addMaintenanceRecord,
  getMaintenanceStats,
} from "@/services/passport/nomadPassportService";

interface MaintenanceTrackerProps {
  rigId: string;
  currentMileage?: number;
}

// Stats card
const MaintenanceStatsCard: React.FC<{ rigId: string }> = ({ rigId }) => {
  const stats = useMemo(() => getMaintenanceStats(rigId), [rigId]);
  const lastService = stats.lastServiceDate
    ? new Date(stats.lastServiceDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "N/A";

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
      <Text style={styles.statsTitle}>Maintenance Overview</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalRecords}</Text>
          <Text style={styles.statLabel}>Records</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              stats.upcomingCount > 0 && styles.statValueWarning,
            ]}
          >
            {stats.upcomingCount}
          </Text>
          <Text style={styles.statLabel}>Due Soon</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${stats.totalSpent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lastService}</Text>
          <Text style={styles.statLabel}>Last Service</Text>
        </View>
      </View>
    </ContainerWrapper>
  );
};

// Upcoming maintenance alerts
interface UpcomingAlertsProps {
  rigId: string;
  currentMileage: number;
}

const UpcomingAlerts: React.FC<UpcomingAlertsProps> = ({
  rigId,
  currentMileage,
}) => {
  const upcoming = useMemo(
    () => getUpcomingMaintenance(rigId, currentMileage),
    [rigId, currentMileage],
  );

  if (upcoming.length === 0) return null;

  return (
    <View style={styles.alertsContainer}>
      <View style={styles.alertsHeader}>
        <Ionicons name="warning" size={20} color={colors.sunsetOrange[500]} />
        <Text style={styles.alertsTitle}>Due Soon</Text>
      </View>
      {upcoming.map((record) => {
        const category = maintenanceCategories.find(
          (c) => c.id === record.categoryId,
        );
        return (
          <View key={record.id} style={styles.alertItem}>
            <Ionicons
              name={
                (category?.icon ||
                  "construct") as keyof typeof Ionicons.glyphMap
              }
              size={16}
              color={colors.sunsetOrange[500]}
            />
            <View style={styles.alertContent}>
              <Text style={styles.alertText}>{record.categoryLabel}</Text>
              {record.nextDueMileage && (
                <Text style={styles.alertMeta}>
                  Due at {record.nextDueMileage.toLocaleString()} mi
                  {currentMileage >= record.nextDueMileage && " (Overdue!)"}
                </Text>
              )}
              {record.nextDue && (
                <Text style={styles.alertMeta}>
                  Due {new Date(record.nextDue).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

// Maintenance category filter
interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      <TouchableOpacity
        style={[
          styles.filterChip,
          !selectedCategory && styles.filterChipActive,
        ]}
        onPress={() => onSelectCategory(null)}
      >
        <Text
          style={[
            styles.filterChipText,
            !selectedCategory && styles.filterChipTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {maintenanceCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.filterChip,
            selectedCategory === category.id && {
              backgroundColor: category.color + "20",
              borderColor: category.color,
            },
          ]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Ionicons
            name={category.icon as keyof typeof Ionicons.glyphMap}
            size={14}
            color={
              selectedCategory === category.id
                ? category.color
                : colors.bark[400]
            }
          />
          <Text
            style={[
              styles.filterChipText,
              selectedCategory === category.id && { color: category.color },
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Individual maintenance record card
interface RecordCardProps {
  record: MaintenanceRecord;
  onPress: () => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onPress }) => {
  const category = maintenanceCategories.find(
    (c) => c.id === record.categoryId,
  );
  const recordDate = new Date(record.date);

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;
  const containerProps =
    Platform.OS === "ios"
      ? {
          tint: "light" as const,
          intensity: blur.light,
          style: styles.recordCard,
        }
      : { style: [styles.recordCard, styles.recordCardFallback] };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <ContainerWrapper {...containerProps}>
        <View style={styles.recordHeader}>
          <View
            style={[
              styles.recordIcon,
              { backgroundColor: (category?.color || colors.bark[400]) + "20" },
            ]}
          >
            <Ionicons
              name={
                (category?.icon ||
                  "construct") as keyof typeof Ionicons.glyphMap
              }
              size={20}
              color={category?.color || colors.bark[400]}
            />
          </View>
          <View style={styles.recordInfo}>
            <Text style={styles.recordTitle}>{record.categoryLabel}</Text>
            <Text style={styles.recordDate}>
              {recordDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
          {record.cost !== undefined && record.cost > 0 && (
            <Text style={styles.recordCost}>${record.cost}</Text>
          )}
        </View>

        <View style={styles.recordDetails}>
          {record.mileage && (
            <View style={styles.recordDetailItem}>
              <Ionicons
                name="speedometer-outline"
                size={14}
                color={colors.bark[400]}
              />
              <Text style={styles.recordDetailText}>
                {record.mileage.toLocaleString()} mi
              </Text>
            </View>
          )}
          {record.provider && (
            <View style={styles.recordDetailItem}>
              <Ionicons
                name="business-outline"
                size={14}
                color={colors.bark[400]}
              />
              <Text style={styles.recordDetailText}>{record.provider}</Text>
            </View>
          )}
          {record.nextDueMileage && (
            <View style={styles.recordDetailItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.bark[400]}
              />
              <Text style={styles.recordDetailText}>
                Next: {record.nextDueMileage.toLocaleString()} mi
              </Text>
            </View>
          )}
        </View>

        {record.notes && (
          <Text style={styles.recordNotes} numberOfLines={2}>
            {record.notes}
          </Text>
        )}
      </ContainerWrapper>
    </TouchableOpacity>
  );
};

// Add maintenance record modal
interface AddMaintenanceModalProps {
  visible: boolean;
  rigId: string;
  currentMileage?: number;
  onClose: () => void;
  onSave: (record: MaintenanceRecord) => void;
}

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  visible,
  rigId,
  currentMileage,
  onClose,
  onSave,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mileage, setMileage] = useState(currentMileage?.toString() || "");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [provider, setProvider] = useState("");
  const [nextMileage, setNextMileage] = useState("");

  const selectedCategoryConfig = maintenanceCategories.find(
    (c) => c.id === selectedCategory,
  );

  const handleSave = () => {
    if (!selectedCategory || !selectedCategoryConfig) return;

    const newRecord = addMaintenanceRecord({
      rigId,
      categoryId: selectedCategory,
      categoryLabel: selectedCategoryConfig.label,
      date: new Date().toISOString(),
      mileage: mileage ? parseInt(mileage, 10) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
      notes: notes || undefined,
      provider: provider || undefined,
      nextDueMileage: nextMileage ? parseInt(nextMileage, 10) : undefined,
      isCompleted: true,
    });

    onSave(newRecord);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setMileage(currentMileage?.toString() || "");
    setCost("");
    setNotes("");
    setProvider("");
    setNextMileage("");
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
              <Text style={styles.modalTitle}>Log Maintenance</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.bark[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Category selection */}
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {maintenanceCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.id && {
                        backgroundColor: category.color + "20",
                        borderColor: category.color,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={
                        selectedCategory === category.id
                          ? category.color
                          : colors.bark[400]
                      }
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        selectedCategory === category.id && {
                          color: category.color,
                        },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Mileage input */}
              <Text style={styles.inputLabel}>Mileage</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="speedometer-outline"
                  size={18}
                  color={colors.bark[400]}
                />
                <TextInput
                  style={styles.input}
                  value={mileage}
                  onChangeText={setMileage}
                  placeholder="Current mileage"
                  keyboardType="numeric"
                  placeholderTextColor={colors.bark[300]}
                />
                <Text style={styles.inputSuffix}>mi</Text>
              </View>

              {/* Cost input */}
              <Text style={styles.inputLabel}>Cost (optional)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  style={styles.input}
                  value={cost}
                  onChangeText={setCost}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.bark[300]}
                />
              </View>

              {/* Provider input */}
              <Text style={styles.inputLabel}>Service Provider (optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={colors.bark[400]}
                />
                <TextInput
                  style={styles.input}
                  value={provider}
                  onChangeText={setProvider}
                  placeholder="Shop name or DIY"
                  placeholderTextColor={colors.bark[300]}
                />
              </View>

              {/* Next due mileage */}
              <Text style={styles.inputLabel}>Next Due Mileage (optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.bark[400]}
                />
                <TextInput
                  style={styles.input}
                  value={nextMileage}
                  onChangeText={setNextMileage}
                  placeholder="Next service at"
                  keyboardType="numeric"
                  placeholderTextColor={colors.bark[300]}
                />
                <Text style={styles.inputSuffix}>mi</Text>
              </View>

              {/* Notes */}
              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Parts used, observations, etc."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={colors.bark[300]}
                />
              </View>
            </ScrollView>

            {/* Save button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                !selectedCategory && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!selectedCategory}
            >
              <LinearGradient
                colors={
                  selectedCategory
                    ? [colors.deepTeal[500], colors.deepTeal[600]]
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
                <Text style={styles.saveButtonText}>Save Record</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Main component
export const MaintenanceTracker: React.FC<MaintenanceTrackerProps> = ({
  rigId,
  currentMileage = 45000,
}) => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setRecords(getMaintenanceRecords(rigId));
  }, [rigId]);

  const filteredRecords = useMemo(() => {
    if (!selectedCategory) return records;
    return records.filter((r) => r.categoryId === selectedCategory);
  }, [records, selectedCategory]);

  const handleSaveRecord = (record: MaintenanceRecord) => {
    setRecords(getMaintenanceRecords(rigId));
    setShowAddModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Stats card */}
      <MaintenanceStatsCard rigId={rigId} />

      {/* Upcoming alerts */}
      <UpcomingAlerts rigId={rigId} currentMileage={currentMileage} />

      {/* Records list */}
      <ScrollView
        style={styles.recordsList}
        contentContainerStyle={styles.recordsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="construct-outline"
              size={48}
              color={colors.bark[300]}
            />
            <Text style={styles.emptyTitle}>No maintenance records</Text>
            <Text style={styles.emptyText}>
              Keep your rig running smooth by logging maintenance tasks.
            </Text>
          </View>
        ) : (
          filteredRecords.map((record) => (
            <RecordCard key={record.id} record={record} onPress={() => {}} />
          ))
        )}
      </ScrollView>

      {/* Add button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[colors.deepTeal[500], colors.deepTeal[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={colors.text.inverse} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add modal */}
      <AddMaintenanceModal
        visible={showAddModal}
        rigId={rigId}
        currentMileage={currentMileage}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveRecord}
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
  statsTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.rugged,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.bark[200],
    marginHorizontal: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.display,
    color: colors.deepTeal[600],
  },
  statValueWarning: {
    color: colors.sunsetOrange[500],
  },
  statLabel: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  // Alerts
  alertsContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.sunsetOrange[50],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sunsetOrange[200],
  },
  alertsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  alertsTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.sunsetOrange[600],
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.sunsetOrange[700],
  },
  alertMeta: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.sunsetOrange[500],
    marginTop: 2,
  },
  // Filter
  filterContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.bark[200],
    backgroundColor: "#FFFFFF",
    marginRight: spacing.sm,
    minHeight: 40,
  },
  filterChipActive: {
    backgroundColor: colors.deepTeal[500],
    borderColor: colors.deepTeal[500],
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[500],
  },
  filterChipTextActive: {
    color: colors.text.inverse,
  },
  // Records list
  recordsList: {
    flex: 1,
  },
  recordsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  // Record card
  recordCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  recordCardFallback: {
    backgroundColor: colors.glass.white,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  recordDate: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  recordCost: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.display,
    color: colors.deepTeal[600],
  },
  recordDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  recordDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  recordDetailText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
  },
  recordNotes: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    fontStyle: "italic",
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
  inputPrefix: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[400],
  },
  inputSuffix: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  textAreaContainer: {
    alignItems: "flex-start",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  // Category grid
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.bark[200],
    backgroundColor: colors.glass.white,
  },
  categoryOptionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[500],
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

export default MaintenanceTracker;
