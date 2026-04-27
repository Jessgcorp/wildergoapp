/**
 * WilderGo AI Build Assistant
 * Professional Assessment Report generator using Newell AI
 * Provides personalized rig recommendations and build planning
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  blur,
} from "@/constants/theme";
import { GlassCard } from "@/components/ui/GlassCard";

// Build assessment questionnaire
const assessmentQuestions = [
  {
    id: "vehicle",
    question: "What type of vehicle are you building?",
    icon: "car-sport",
    options: [
      "Sprinter Van",
      "Transit",
      "Promaster",
      "School Bus",
      "Box Truck",
      "Trailer",
      "Other",
    ],
  },
  {
    id: "lifestyle",
    question: "What's your primary nomad lifestyle?",
    icon: "compass",
    options: [
      "Full-time nomad",
      "Weekend warrior",
      "Seasonal traveler",
      "Remote worker",
      "Adventure seeker",
    ],
  },
  {
    id: "climate",
    question: "Which climates will you primarily travel in?",
    icon: "thermometer",
    options: [
      "Hot desert",
      "Cold mountain",
      "Coastal/humid",
      "All seasons",
      "Primarily moderate",
    ],
  },
  {
    id: "power",
    question: "What are your power needs?",
    icon: "flash",
    options: [
      "Basic (lights, phone)",
      "Moderate (laptop, fridge)",
      "High (AC, microwave)",
      "Off-grid capable",
    ],
  },
  {
    id: "budget",
    question: "What's your approximate build budget?",
    icon: "cash",
    options: [
      "Under $5,000",
      "$5,000 - $15,000",
      "$15,000 - $30,000",
      "$30,000 - $50,000",
      "Over $50,000",
    ],
  },
  {
    id: "skills",
    question: "What's your DIY skill level?",
    icon: "construct",
    options: [
      "Beginner",
      "Intermediate",
      "Advanced",
      "Professional",
      "Prefer hiring pros",
    ],
  },
];

interface AssessmentReport {
  summary: string;
  recommendations: {
    category: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    estimatedCost: string;
  }[];
  builderMatches: {
    name: string;
    specialty: string;
    matchScore: number;
  }[];
  timeline: {
    phase: string;
    duration: string;
    tasks: string[];
  }[];
  totalEstimate: {
    low: number;
    high: number;
  };
}

interface AIBuildAssistantProps {
  onComplete?: (report: AssessmentReport) => void;
  onFindBuilders?: () => void;
}

export const AIBuildAssistant: React.FC<AIBuildAssistantProps> = ({
  onComplete,
  onFindBuilders,
}) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<AssessmentReport | null>(null);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
  const reportAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep / assessmentQuestions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.spring(stepAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [currentStep, progressAnim, stepAnim]);

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));

    // Animate to next step
    stepAnim.setValue(0);

    if (currentStep < assessmentQuestions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 200);
    }
  };

  const generateAssessment = async () => {
    setIsGenerating(true);

    try {
      const API_URL = process.env.EXPO_PUBLIC_NEWELL_API_URL;

      if (!API_URL) {
        // Mock response for development
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const mockReport = generateMockReport(answers);
        setReport(mockReport);
        onComplete?.(mockReport);

        Animated.spring(reportAnim, {
          toValue: 1,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }).start();
        return;
      }

      const prompt = `You are an expert van life and nomad rig build consultant. Based on the following assessment answers, provide a detailed professional build assessment report.

Assessment Answers:
- Vehicle Type: ${answers.vehicle || "Not specified"}
- Lifestyle: ${answers.lifestyle || "Not specified"}
- Climate: ${answers.climate || "Not specified"}
- Power Needs: ${answers.power || "Not specified"}
- Budget: ${answers.budget || "Not specified"}
- DIY Skill Level: ${answers.skills || "Not specified"}
- Additional Notes: ${additionalNotes || "None"}

Please provide a comprehensive build assessment including:
1. Executive summary of the recommended build approach
2. Specific recommendations with priority levels and cost estimates
3. Suggested timeline with phases
4. Key considerations for this specific build

Format your response as a structured assessment report.`;

      const response = await fetch(`${API_URL}/v1/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          prompt,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate assessment");
      }

      const data = await response.json();

      // Parse the AI response into structured report
      const generatedReport = parseAIResponse(data.text, answers);
      setReport(generatedReport);
      onComplete?.(generatedReport);

      Animated.spring(reportAnim, {
        toValue: 1,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Error generating assessment:", error);
      // Fallback to mock report
      const mockReport = generateMockReport(answers);
      setReport(mockReport);
      onComplete?.(mockReport);

      Animated.spring(reportAnim, {
        toValue: 1,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQuestion = assessmentQuestions[currentStep];
  const isComplete = Object.keys(answers).length === assessmentQuestions.length;

  const ContainerWrapper = Platform.OS === "ios" ? BlurView : View;

  // Show report if generated
  if (report) {
    return (
      <Animated.ScrollView
        style={[
          styles.container,
          {
            opacity: reportAnim,
            transform: [
              {
                translateY: reportAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Report Header */}
        <View style={styles.reportHeader}>
          <LinearGradient
            colors={[
              colors.driftwood[400],
              colors.driftwood[500],
              colors.driftwood[600],
            ]}
            style={styles.reportBadge}
          >
            <Ionicons
              name="document-text"
              size={18}
              color={colors.text.inverse}
            />
            <Text style={styles.reportBadgeText}>AI BUILD ASSESSMENT</Text>
          </LinearGradient>
          <Text style={styles.reportTitle}>Professional Assessment Report</Text>
          <Text style={styles.reportSubtitle}>
            Personalized recommendations for your {answers.vehicle} build
          </Text>
        </View>

        {/* Summary Card */}
        <GlassCard variant="medium" padding="lg" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="sparkles" size={20} color={colors.ember[500]} />
            <Text style={styles.summaryTitle}>Executive Summary</Text>
          </View>
          <Text style={styles.summaryText}>{report.summary}</Text>
        </GlassCard>

        {/* Budget Estimate */}
        <GlassCard variant="frost" padding="lg" style={styles.estimateCard}>
          <Text style={styles.estimateTitle}>Estimated Total Build Cost</Text>
          <View style={styles.estimateRange}>
            <Text style={styles.estimateLow}>
              ${report.totalEstimate.low.toLocaleString()}
            </Text>
            <Text style={styles.estimateDash}>—</Text>
            <Text style={styles.estimateHigh}>
              ${report.totalEstimate.high.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.estimateNote}>
            Based on {answers.budget} budget and {answers.skills} skill level
          </Text>
        </GlassCard>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Key Recommendations</Text>
        {report.recommendations.map((rec, index) => (
          <GlassCard
            key={index}
            variant="light"
            padding="lg"
            style={styles.recCard}
          >
            <View style={styles.recHeader}>
              <View style={styles.recCategoryBadge}>
                <Text style={styles.recCategory}>{rec.category}</Text>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  rec.priority === "high" && styles.priorityHigh,
                  rec.priority === "medium" && styles.priorityMedium,
                  rec.priority === "low" && styles.priorityLow,
                ]}
              >
                <Text style={styles.priorityText}>
                  {rec.priority.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.recTitle}>{rec.title}</Text>
            <Text style={styles.recDescription}>{rec.description}</Text>
            <View style={styles.recCostRow}>
              <Ionicons
                name="cash-outline"
                size={14}
                color={colors.moss[500]}
              />
              <Text style={styles.recCost}>{rec.estimatedCost}</Text>
            </View>
          </GlassCard>
        ))}

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Suggested Build Timeline</Text>
        <GlassCard variant="medium" padding="lg" style={styles.timelineCard}>
          {report.timeline.map((phase, index) => (
            <View key={index} style={styles.timelinePhase}>
              <View style={styles.timelineDot}>
                <View style={styles.timelineDotInner} />
              </View>
              {index < report.timeline.length - 1 && (
                <View style={styles.timelineLine} />
              )}
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.phaseName}>{phase.phase}</Text>
                  <Text style={styles.phaseDuration}>{phase.duration}</Text>
                </View>
                <View style={styles.taskList}>
                  {phase.tasks.map((task, taskIndex) => (
                    <View key={taskIndex} style={styles.taskItem}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={14}
                        color={colors.moss[500]}
                      />
                      <Text style={styles.taskText}>{task}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </GlassCard>

        {/* Builder Matches */}
        <Text style={styles.sectionTitle}>Recommended Builders</Text>
        <GlassCard variant="frost" padding="lg" style={styles.buildersCard}>
          {report.builderMatches.map((builder, index) => (
            <View key={index} style={styles.builderMatch}>
              <View style={styles.builderInfo}>
                <Text style={styles.builderName}>{builder.name}</Text>
                <Text style={styles.builderSpecialty}>{builder.specialty}</Text>
              </View>
              <View style={styles.matchScore}>
                <Text style={styles.matchScoreValue}>
                  {builder.matchScore}%
                </Text>
                <Text style={styles.matchScoreLabel}>Match</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.findBuildersButton}
            onPress={onFindBuilders}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[
                colors.driftwood[400],
                colors.driftwood[500],
                colors.driftwood[600],
              ]}
              style={styles.findBuildersGradient}
            >
              <Ionicons name="search" size={18} color={colors.text.inverse} />
              <Text style={styles.findBuildersText}>Browse All Builders</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        {/* Share/Save Actions */}
        <View style={styles.reportActions}>
          <TouchableOpacity style={styles.reportActionButton}>
            <Ionicons
              name="share-outline"
              size={20}
              color={colors.driftwood[600]}
            />
            <Text style={styles.reportActionText}>Share Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportActionButton}>
            <Ionicons
              name="download-outline"
              size={20}
              color={colors.driftwood[600]}
            />
            <Text style={styles.reportActionText}>Save PDF</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.aiIconContainer}>
            <LinearGradient
              colors={[
                colors.driftwood[400],
                colors.driftwood[500],
                colors.driftwood[600],
              ]}
              style={styles.aiIcon}
            >
              <Ionicons name="sparkles" size={28} color={colors.text.inverse} />
            </LinearGradient>
          </View>
          <Text style={styles.title}>AI BUILD ASSISTANT</Text>
          <Text style={styles.subtitle}>
            Answer a few questions and get a personalized professional
            assessment
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentStep + 1} of {assessmentQuestions.length}
        </Text>

        {/* Question Card */}
        {!isComplete && (
          <Animated.View
            style={[
              styles.questionCard,
              {
                opacity: stepAnim,
                transform: [
                  {
                    translateX: stepAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ContainerWrapper
              {...(Platform.OS === "ios"
                ? {
                    tint: "light" as const,
                    intensity: blur.medium,
                    style: styles.questionCardInner,
                  }
                : {
                    style: [
                      styles.questionCardInner,
                      styles.questionCardFallback,
                    ],
                  })}
            >
              <View style={styles.questionIconContainer}>
                <Ionicons
                  name={currentQuestion.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={colors.driftwood[500]}
                />
              </View>
              <Text style={styles.questionText}>
                {currentQuestion.question}
              </Text>

              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      answers[currentQuestion.id] === option &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() =>
                      handleSelectOption(currentQuestion.id, option)
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        answers[currentQuestion.id] === option &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {answers[currentQuestion.id] === option && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.driftwood[600]}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ContainerWrapper>
          </Animated.View>
        )}

        {/* Additional Notes (shown when all questions answered) */}
        {isComplete && !isGenerating && (
          <GlassCard variant="light" padding="lg" style={styles.notesCard}>
            <Text style={styles.notesTitle}>Anything else we should know?</Text>
            <Text style={styles.notesHint}>
              Add specific requirements, constraints, or questions for your
              build assessment
            </Text>
            <TextInput
              style={styles.notesInput}
              placeholder="E.g., I need space for mountain bikes, planning to spend winters in cold climates..."
              placeholderTextColor={colors.bark[300]}
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateAssessment}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[
                  colors.driftwood[400],
                  colors.driftwood[500],
                  colors.driftwood[600],
                ]}
                style={styles.generateButtonGradient}
              >
                <Ionicons
                  name="sparkles"
                  size={20}
                  color={colors.text.inverse}
                />
                <Text style={styles.generateButtonText}>
                  GENERATE ASSESSMENT
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Loading State */}
        {isGenerating && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color={colors.driftwood[500]} />
            </View>
            <Text style={styles.loadingTitle}>Analyzing Your Build...</Text>
            <Text style={styles.loadingText}>
              Our AI is creating your personalized professional assessment
              report
            </Text>
          </View>
        )}

        {/* Navigation Buttons */}
        {!isComplete && currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.bark[500]} />
            <Text style={styles.backButtonText}>Previous Question</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Helper functions
function generateMockReport(answers: Record<string, string>): AssessmentReport {
  const budgetRanges: Record<string, { low: number; high: number }> = {
    "Under $5,000": { low: 3000, high: 5000 },
    "$5,000 - $15,000": { low: 5000, high: 15000 },
    "$15,000 - $30,000": { low: 15000, high: 30000 },
    "$30,000 - $50,000": { low: 30000, high: 50000 },
    "Over $50,000": { low: 50000, high: 80000 },
  };

  const estimate = budgetRanges[answers.budget] || { low: 10000, high: 25000 };

  return {
    summary: `Based on your assessment, we recommend a ${answers.lifestyle || "versatile"} build approach for your ${answers.vehicle || "van"}. Given your ${answers.climate || "varied"} climate needs and ${answers.power || "moderate"} power requirements, we suggest focusing on insulation and a robust electrical system. Your ${answers.skills || "intermediate"} skill level means you can handle most installations with proper guidance.`,
    recommendations: [
      {
        category: "Insulation",
        title: "Thinsulate + Closed-Cell Foam Combo",
        description:
          "For your climate needs, a hybrid insulation approach will provide the best thermal performance.",
        priority: "high",
        estimatedCost: "$800 - $1,500",
      },
      {
        category: "Electrical",
        title: "400Ah Lithium Battery System",
        description:
          "Based on your power needs, a 400Ah lithium iron phosphate system with 400W solar.",
        priority: "high",
        estimatedCost: "$3,000 - $5,000",
      },
      {
        category: "Water",
        title: "Fresh Water System with Pump",
        description:
          "30-gallon fresh water tank with 12V pump and simple sink setup.",
        priority: "medium",
        estimatedCost: "$400 - $800",
      },
      {
        category: "Climate Control",
        title: "Diesel Heater + Roof Vent Fan",
        description:
          "Espar/Webasto heater for winter and MaxxAir fan for ventilation.",
        priority: "medium",
        estimatedCost: "$1,000 - $2,000",
      },
    ],
    builderMatches: [
      {
        name: "Nomad Builds Co.",
        specialty: "Sprinter Specialists",
        matchScore: 94,
      },
      {
        name: "Vantastic Conversions",
        specialty: "Off-Grid Systems",
        matchScore: 89,
      },
      {
        name: "Road Ready Rigs",
        specialty: "Full Custom Builds",
        matchScore: 85,
      },
    ],
    timeline: [
      {
        phase: "Planning & Materials",
        duration: "2-4 weeks",
        tasks: ["Finalize design", "Order materials", "Prep vehicle"],
      },
      {
        phase: "Structural Work",
        duration: "2-3 weeks",
        tasks: ["Insulation", "Wall panels", "Floor installation"],
      },
      {
        phase: "Electrical & Plumbing",
        duration: "2-4 weeks",
        tasks: [
          "Wire runs",
          "Battery install",
          "Solar mounting",
          "Water system",
        ],
      },
      {
        phase: "Finishing",
        duration: "2-3 weeks",
        tasks: ["Cabinetry", "Bed platform", "Final touches"],
      },
    ],
    totalEstimate: estimate,
  };
}

function parseAIResponse(
  text: string,
  answers: Record<string, string>,
): AssessmentReport {
  // In production, parse the AI response into structured data
  // For now, return mock report
  return generateMockReport(answers);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  aiIconContainer: {
    marginBottom: spacing.lg,
  },
  aiIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.pill,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glass,
  },
  title: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["2xl"],
    color: colors.bark[800],
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.bark[500],
    textAlign: "center",
    lineHeight: 22,
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.driftwood[100],
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.driftwood[500],
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  questionCard: {
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  questionCardInner: {
    padding: spacing.xl,
    borderRadius: borderRadius["2xl"],
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  questionCardFallback: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  questionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.driftwood[100],
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  questionText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.lg,
    color: colors.bark[800],
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    borderColor: colors.driftwood[500],
    backgroundColor: colors.driftwood[50],
  },
  optionText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.base,
    color: colors.bark[600],
  },
  optionTextSelected: {
    color: colors.driftwood[700],
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  notesCard: {
    marginBottom: spacing.xl,
  },
  notesTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.bark[700],
    marginBottom: spacing.xs,
  },
  notesHint: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    marginBottom: spacing.lg,
  },
  notesInput: {
    minHeight: 120,
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.bark[700],
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: spacing.xl,
  },
  generateButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.glow,
  },
  generateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  generateButtonText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.md,
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.wide,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
  },
  loadingSpinner: {
    marginBottom: spacing.xl,
  },
  loadingTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.lg,
    color: colors.bark[700],
    marginBottom: spacing.sm,
  },
  loadingText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  backButtonText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
  },

  // Report styles
  reportHeader: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  reportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  reportBadgeText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.wider,
  },
  reportTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["2xl"],
    color: colors.bark[800],
    marginBottom: spacing.sm,
  },
  reportSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.bark[500],
    textAlign: "center",
  },
  summaryCard: {
    marginBottom: spacing.xl,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.md,
    color: colors.bark[700],
  },
  summaryText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    color: colors.bark[600],
    lineHeight: 24,
  },
  estimateCard: {
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  estimateTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  estimateRange: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  estimateLow: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["2xl"],
    color: colors.moss[600],
  },
  estimateDash: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xl,
    color: colors.bark[300],
  },
  estimateHigh: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize["2xl"],
    color: colors.bark[700],
  },
  estimateNote: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[400],
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.md,
    color: colors.bark[700],
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    letterSpacing: typography.letterSpacing.wide,
  },
  recCard: {
    marginBottom: spacing.md,
  },
  recHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  recCategoryBadge: {
    backgroundColor: colors.driftwood[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  recCategory: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.xs,
    color: colors.driftwood[700],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priorityHigh: {
    backgroundColor: colors.ember[100],
  },
  priorityMedium: {
    backgroundColor: colors.moss[100],
  },
  priorityLow: {
    backgroundColor: colors.bark[100],
  },
  priorityText: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  recTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[800],
    marginBottom: spacing.xs,
  },
  recDescription: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  recCostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  recCost: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.sm,
    color: colors.moss[600],
  },
  timelineCard: {
    marginBottom: spacing.xl,
  },
  timelinePhase: {
    flexDirection: "row",
    position: "relative",
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.driftwood[100],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  timelineDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.driftwood[500],
  },
  timelineLine: {
    position: "absolute",
    left: 11,
    top: 24,
    bottom: 0,
    width: 2,
    backgroundColor: colors.driftwood[200],
  },
  timelineContent: {
    flex: 1,
    marginLeft: spacing.md,
    paddingBottom: spacing.xl,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  phaseName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[700],
  },
  phaseDuration: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.driftwood[500],
  },
  taskList: {
    gap: spacing.xs,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  taskText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[500],
  },
  buildersCard: {
    marginBottom: spacing.xl,
  },
  builderMatch: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.borderLight,
  },
  builderInfo: {
    flex: 1,
  },
  builderName: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: typography.fontSize.base,
    color: colors.bark[700],
  },
  builderSpecialty: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
  },
  matchScore: {
    alignItems: "center",
  },
  matchScoreValue: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.lg,
    color: colors.moss[600],
  },
  matchScoreLabel: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    color: colors.bark[400],
  },
  findBuildersButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginTop: spacing.lg,
  },
  findBuildersGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  findBuildersText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    letterSpacing: typography.letterSpacing.wide,
  },
  reportActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing["2xl"],
  },
  reportActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  reportActionText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    color: colors.driftwood[600],
  },
});

export default AIBuildAssistant;
