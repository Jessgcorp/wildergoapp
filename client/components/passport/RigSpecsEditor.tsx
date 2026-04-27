/**
 * WilderGo Rig Specs Editor
 * Detailed editor for tracking rig specifications:
 * - Solar wattage, battery capacity
 * - Water system details
 * - Starlink/connectivity status
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
  rigSpecs,
} from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  RigSpecifications,
  nomadPassportService,
} from "@/services/passport/nomadPassportService";

interface RigSpecsEditorProps {
  specs: RigSpecifications;
  onSave: (specs: Partial<RigSpecifications>) => void;
  onClose?: () => void;
}

export const RigSpecsEditor: React.FC<RigSpecsEditorProps> = ({
  specs,
  onSave,
  onClose,
}) => {
  const [editedSpecs, setEditedSpecs] = useState<RigSpecifications>(specs);
  const [activeSection, setActiveSection] = useState<
    "power" | "water" | "connectivity" | "climate" | "general"
  >("power");

  const updateSpec = <K extends keyof RigSpecifications>(
    key: K,
    value: RigSpecifications[K],
  ) => {
    setEditedSpecs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(editedSpecs);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="car-sport" size={24} color={colors.deepTeal[600]} />
          <View>
            <Text style={styles.rigName}>{editedSpecs.rigName}</Text>
            <Text style={styles.rigType}>{editedSpecs.rigType}</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.bark[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Section Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {(
          ["power", "water", "connectivity", "climate", "general"] as const
        ).map((section) => (
          <TouchableOpacity
            key={section}
            style={[styles.tab, activeSection === section && styles.activeTab]}
            onPress={() => setActiveSection(section)}
          >
            <Ionicons
              name={getSectionIcon(section)}
              size={18}
              color={
                activeSection === section
                  ? colors.deepTeal[600]
                  : colors.bark[400]
              }
            />
            <Text
              style={[
                styles.tabText,
                activeSection === section && styles.activeTabText,
              ]}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeSection === "power" && (
          <PowerSection specs={editedSpecs} updateSpec={updateSpec} />
        )}
        {activeSection === "water" && (
          <WaterSection specs={editedSpecs} updateSpec={updateSpec} />
        )}
        {activeSection === "connectivity" && (
          <ConnectivitySection specs={editedSpecs} updateSpec={updateSpec} />
        )}
        {activeSection === "climate" && (
          <ClimateSection specs={editedSpecs} updateSpec={updateSpec} />
        )}
        {activeSection === "general" && (
          <GeneralSection specs={editedSpecs} updateSpec={updateSpec} />
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient
            colors={[colors.deepTeal[500], colors.deepTeal[600]]}
            style={styles.saveGradient}
          >
            <Ionicons name="save" size={20} color={colors.text.inverse} />
            <Text style={styles.saveText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Section Components
interface SectionProps {
  specs: RigSpecifications;
  updateSpec: <K extends keyof RigSpecifications>(
    key: K,
    value: RigSpecifications[K],
  ) => void;
}

const PowerSection: React.FC<SectionProps> = ({ specs, updateSpec }) => {
  return (
    <View style={sectionStyles.container}>
      {/* Solar */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons name="sunny" size={20} color={colors.sunsetOrange[500]} />
          <Text style={sectionStyles.cardTitle}>Solar System</Text>
        </View>

        <SpecSlider
          label="Solar Wattage"
          value={specs.solarWattage}
          onChange={(v) => updateSpec("solarWattage", v)}
          min={0}
          max={2000}
          unit="W"
          presets={rigSpecs.solarWattage.presets}
          color={colors.sunsetOrange[500]}
        />
      </GlassCard>

      {/* Battery */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons
            name="battery-charging"
            size={20}
            color={colors.forestGreen[500]}
          />
          <Text style={sectionStyles.cardTitle}>Battery System</Text>
        </View>

        <SpecSlider
          label="Battery Capacity"
          value={specs.batteryCapacity}
          onChange={(v) => updateSpec("batteryCapacity", v)}
          min={0}
          max={1000}
          unit="Ah"
          presets={rigSpecs.batteryCapacity.presets}
          color={colors.forestGreen[500]}
        />

        <View style={sectionStyles.selectRow}>
          <Text style={sectionStyles.selectLabel}>Battery Type</Text>
          <View style={sectionStyles.selectOptions}>
            {(["lithium", "agm", "lead-acid", "other"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  sectionStyles.selectOption,
                  specs.batteryType === type &&
                    sectionStyles.selectOptionActive,
                ]}
                onPress={() => updateSpec("batteryType", type)}
              >
                <Text
                  style={[
                    sectionStyles.selectOptionText,
                    specs.batteryType === type &&
                      sectionStyles.selectOptionTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </GlassCard>

      {/* Auxiliary Power */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons name="flash" size={20} color={colors.deepTeal[500]} />
          <Text style={sectionStyles.cardTitle}>Auxiliary Power</Text>
        </View>

        <ToggleRow
          label="Shore Power"
          value={specs.hasShorepower}
          onChange={(v) => updateSpec("hasShorepower", v)}
          icon="flash"
        />

        <ToggleRow
          label="Generator"
          value={specs.hasGenerator}
          onChange={(v) => updateSpec("hasGenerator", v)}
          icon="hardware-chip"
        />

        {specs.hasGenerator && (
          <TextInput
            style={sectionStyles.textInput}
            value={specs.generatorType || ""}
            onChangeText={(v) => updateSpec("generatorType", v)}
            placeholder="Generator type (e.g., Honda EU2200i)"
            placeholderTextColor={colors.bark[300]}
          />
        )}
      </GlassCard>
    </View>
  );
};

const WaterSection: React.FC<SectionProps> = ({ specs, updateSpec }) => {
  return (
    <View style={sectionStyles.container}>
      {/* Water Tanks */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons name="water" size={20} color={colors.deepTeal[500]} />
          <Text style={sectionStyles.cardTitle}>Water Tanks</Text>
        </View>

        <SpecSlider
          label="Fresh Water"
          value={specs.freshWaterCapacity}
          onChange={(v) => updateSpec("freshWaterCapacity", v)}
          min={0}
          max={200}
          unit="gal"
          presets={rigSpecs.waterCapacity.presets}
          color={colors.deepTeal[500]}
        />

        <SpecSlider
          label="Grey Water"
          value={specs.greyWaterCapacity}
          onChange={(v) => updateSpec("greyWaterCapacity", v)}
          min={0}
          max={100}
          unit="gal"
          presets={[10, 20, 30, 40, 50, 60, 80, 100]}
          color={colors.bark[400]}
        />

        <SpecSlider
          label="Black Water"
          value={specs.blackWaterCapacity}
          onChange={(v) => updateSpec("blackWaterCapacity", v)}
          min={0}
          max={50}
          unit="gal"
          presets={[0, 10, 20, 30, 40, 50]}
          color={colors.bark[600]}
        />
      </GlassCard>

      {/* Water Amenities */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons name="options" size={20} color={colors.forestGreen[500]} />
          <Text style={sectionStyles.cardTitle}>Water Amenities</Text>
        </View>

        <ToggleRow
          label="Water Filter"
          value={specs.hasWaterFilter}
          onChange={(v) => updateSpec("hasWaterFilter", v)}
          icon="filter"
        />

        <ToggleRow
          label="Water Heater"
          value={specs.hasWaterHeater}
          onChange={(v) => updateSpec("hasWaterHeater", v)}
          icon="thermometer"
        />
      </GlassCard>
    </View>
  );
};

const ConnectivitySection: React.FC<SectionProps> = ({ specs, updateSpec }) => {
  return (
    <View style={sectionStyles.container}>
      {/* Starlink */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons name="globe" size={20} color={colors.deepTeal[600]} />
          <Text style={sectionStyles.cardTitle}>Internet</Text>
        </View>

        <View style={sectionStyles.selectRow}>
          <Text style={sectionStyles.selectLabel}>Primary Connection</Text>
          <View style={sectionStyles.selectOptions}>
            {rigSpecs.connectivityTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  sectionStyles.selectOption,
                  specs.connectivityType === type &&
                    sectionStyles.selectOptionActive,
                ]}
                onPress={() => updateSpec("connectivityType", type)}
              >
                <Text
                  style={[
                    sectionStyles.selectOptionText,
                    specs.connectivityType === type &&
                      sectionStyles.selectOptionTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ToggleRow
          label="Starlink Active"
          value={specs.starlinkActive}
          onChange={(v) => updateSpec("starlinkActive", v)}
          icon="radio"
          highlight
        />
      </GlassCard>

      {/* Cellular */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons
            name="cellular"
            size={20}
            color={colors.sunsetOrange[500]}
          />
          <Text style={sectionStyles.cardTitle}>Cellular</Text>
        </View>

        <TextInput
          style={sectionStyles.textInput}
          value={specs.cellularCarrier || ""}
          onChangeText={(v) => updateSpec("cellularCarrier", v)}
          placeholder="Carrier (e.g., Verizon, AT&T)"
          placeholderTextColor={colors.bark[300]}
        />

        <ToggleRow
          label="Cell Booster"
          value={specs.hasBooster}
          onChange={(v) => updateSpec("hasBooster", v)}
          icon="trending-up"
        />
      </GlassCard>
    </View>
  );
};

const ClimateSection: React.FC<SectionProps> = ({ specs, updateSpec }) => {
  return (
    <View style={sectionStyles.container}>
      {/* Cooling */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons name="snow" size={20} color={colors.deepTeal[400]} />
          <Text style={sectionStyles.cardTitle}>Cooling</Text>
        </View>

        <ToggleRow
          label="Air Conditioning"
          value={specs.hasAC}
          onChange={(v) => updateSpec("hasAC", v)}
          icon="snow"
        />

        {specs.hasAC && (
          <TextInput
            style={sectionStyles.textInput}
            value={specs.acType || ""}
            onChangeText={(v) => updateSpec("acType", v)}
            placeholder="AC Type (e.g., Roof-mounted, Mini-split)"
            placeholderTextColor={colors.bark[300]}
          />
        )}
      </GlassCard>

      {/* Heating */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons name="flame" size={20} color={colors.sunsetOrange[500]} />
          <Text style={sectionStyles.cardTitle}>Heating</Text>
        </View>

        <ToggleRow
          label="Heater"
          value={specs.hasHeater}
          onChange={(v) => updateSpec("hasHeater", v)}
          icon="flame"
        />

        {specs.hasHeater && (
          <TextInput
            style={sectionStyles.textInput}
            value={specs.heaterType || ""}
            onChangeText={(v) => updateSpec("heaterType", v)}
            placeholder="Heater Type (e.g., Diesel, Propane)"
            placeholderTextColor={colors.bark[300]}
          />
        )}
      </GlassCard>
    </View>
  );
};

const GeneralSection: React.FC<SectionProps> = ({ specs, updateSpec }) => {
  return (
    <View style={sectionStyles.container}>
      {/* Rig Info */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons
            name="car-sport"
            size={20}
            color={colors.burntSienna[500]}
          />
          <Text style={sectionStyles.cardTitle}>Rig Details</Text>
        </View>

        <View style={sectionStyles.inputRow}>
          <Text style={sectionStyles.inputLabel}>Rig Name</Text>
          <TextInput
            style={sectionStyles.textInput}
            value={specs.rigName}
            onChangeText={(v) => updateSpec("rigName", v)}
            placeholder="Give your rig a name"
            placeholderTextColor={colors.bark[300]}
          />
        </View>

        <View style={sectionStyles.selectRow}>
          <Text style={sectionStyles.selectLabel}>Rig Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={sectionStyles.selectOptions}>
              {rigSpecs.rigTypes.slice(0, 6).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    sectionStyles.selectOption,
                    specs.rigType === type && sectionStyles.selectOptionActive,
                  ]}
                  onPress={() => updateSpec("rigType", type)}
                >
                  <Text
                    style={[
                      sectionStyles.selectOptionText,
                      specs.rigType === type &&
                        sectionStyles.selectOptionTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </GlassCard>

      {/* Amenities */}
      <GlassCard variant="frost" padding="md" style={sectionStyles.card}>
        <View style={sectionStyles.cardHeader}>
          <Ionicons name="bed" size={20} color={colors.forestGreen[500]} />
          <Text style={sectionStyles.cardTitle}>Amenities</Text>
        </View>

        <View style={sectionStyles.inputRow}>
          <Text style={sectionStyles.inputLabel}>Sleeps</Text>
          <View style={sectionStyles.numberInput}>
            <TouchableOpacity
              style={sectionStyles.numberButton}
              onPress={() =>
                updateSpec("sleeps", Math.max(1, specs.sleeps - 1))
              }
            >
              <Ionicons name="remove" size={18} color={colors.bark[500]} />
            </TouchableOpacity>
            <Text style={sectionStyles.numberValue}>{specs.sleeps}</Text>
            <TouchableOpacity
              style={sectionStyles.numberButton}
              onPress={() =>
                updateSpec("sleeps", Math.min(10, specs.sleeps + 1))
              }
            >
              <Ionicons name="add" size={18} color={colors.bark[500]} />
            </TouchableOpacity>
          </View>
        </View>

        <ToggleRow
          label="Kitchen"
          value={specs.hasKitchen}
          onChange={(v) => updateSpec("hasKitchen", v)}
          icon="restaurant"
        />

        <ToggleRow
          label="Bathroom"
          value={specs.hasBathroom}
          onChange={(v) => updateSpec("hasBathroom", v)}
          icon="water"
        />
      </GlassCard>
    </View>
  );
};

// Reusable Components
interface SpecSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string;
  presets: number[];
  color: string;
}

const SpecSlider: React.FC<SpecSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  presets,
  color,
}) => {
  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.header}>
        <Text style={sliderStyles.label}>{label}</Text>
        <Text style={[sliderStyles.value, { color }]}>
          {value} {unit}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={sliderStyles.presets}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                sliderStyles.preset,
                value === preset && {
                  backgroundColor: color + "20",
                  borderColor: color,
                },
              ]}
              onPress={() => onChange(preset)}
            >
              <Text
                style={[sliderStyles.presetText, value === preset && { color }]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon: string;
  highlight?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  value,
  onChange,
  icon,
  highlight,
}) => {
  return (
    <View
      style={[
        toggleStyles.container,
        highlight && value && toggleStyles.highlighted,
      ]}
    >
      <View style={toggleStyles.left}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={value ? colors.forestGreen[500] : colors.bark[400]}
        />
        <Text style={[toggleStyles.label, value && toggleStyles.labelActive]}>
          {label}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: colors.bark[200],
          true: colors.forestGreen[400],
        }}
        thumbColor={value ? colors.forestGreen[500] : colors.bark[300]}
        ios_backgroundColor={colors.bark[200]}
      />
    </View>
  );
};

// Helper functions
function getSectionIcon(section: string): keyof typeof Ionicons.glyphMap {
  switch (section) {
    case "power":
      return "flash";
    case "water":
      return "water";
    case "connectivity":
      return "wifi";
    case "climate":
      return "thermometer";
    case "general":
      return "settings";
    default:
      return "ellipse";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rigName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
  },
  rigType: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.whiteLight,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsScroll: {
    maxHeight: 50,
    marginBottom: spacing.md,
  },
  tabsContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  activeTab: {
    backgroundColor: colors.deepTeal[50],
    borderColor: colors.deepTeal[300],
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[500],
  },
  activeTabText: {
    color: colors.deepTeal[600],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  footer: {
    padding: spacing.xl,
    paddingTop: spacing.md,
  },
  saveButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  saveText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    borderRadius: borderRadius.xl,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  selectRow: {
    marginTop: spacing.md,
  },
  selectLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[600],
    marginBottom: spacing.sm,
  },
  selectOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  selectOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  selectOptionActive: {
    backgroundColor: colors.deepTeal[50],
    borderColor: colors.deepTeal[400],
  },
  selectOptionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
  },
  selectOptionTextActive: {
    color: colors.deepTeal[600],
    fontFamily: typography.fontFamily.bodyMedium,
  },
  textInput: {
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[800],
    borderWidth: 1,
    borderColor: colors.bark[200],
    marginTop: spacing.sm,
  },
  inputRow: {
    marginTop: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[600],
    marginBottom: spacing.xs,
  },
  numberInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass.whiteLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  numberValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
    minWidth: 30,
    textAlign: "center",
  },
});

const sliderStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[600],
  },
  value: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  presets: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  preset: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass.whiteLight,
    borderWidth: 1,
    borderColor: colors.bark[200],
  },
  presetText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
  },
});

const toggleStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
  },
  highlighted: {
    backgroundColor: colors.forestGreen[50],
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
  },
  labelActive: {
    color: colors.bark[800],
    fontFamily: typography.fontFamily.bodyMedium,
  },
});

export default RigSpecsEditor;
