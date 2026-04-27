/**
 * WilderGo Build Diagnostic Service
 * AI-powered rig diagnostic and troubleshooting:
 * - Analyze rig issues based on symptoms
 * - Provide repair recommendations
 * - Suggest nearby resources
 * - Image-based damage assessment
 *
 * Note: AI text generation is disabled in this environment.
 * Using intelligent fallback logic instead.
 */

// Stub functions that throw to trigger fallback logic
import { RigSpecifications } from "@/services/passport/nomadPassportService";

async function generateText(_options: { prompt: string }): Promise<string> {
  throw new Error("AI generation not available - using fallback");
}

async function analyzeImage(_options: {
  imageUrl: string;
  prompt: string;
}): Promise<string> {
  throw new Error("AI image analysis not available - using fallback");
}

export type IssueSeverity = "minor" | "moderate" | "urgent" | "critical";
export type IssueCategory =
  | "electrical"
  | "plumbing"
  | "mechanical"
  | "solar"
  | "climate"
  | "structural"
  | "connectivity"
  | "other";

export interface DiagnosticInput {
  symptoms: string;
  category?: IssueCategory;
  rigSpecs?: Partial<RigSpecifications>;
  additionalContext?: string;
}

export interface DiagnosticResult {
  diagnosis: string;
  severity: IssueSeverity;
  possibleCauses: string[];
  immediateSteps: string[];
  toolsNeeded: string[];
  estimatedDifficulty:
    | "DIY easy"
    | "DIY moderate"
    | "DIY advanced"
    | "Professional needed";
  estimatedCost: string;
  safetyWarnings: string[];
  canContinueDriving: boolean;
  relatedSystems: string[];
}

export interface ImageDiagnosticResult {
  assessment: string;
  identifiedIssues: string[];
  severity: IssueSeverity;
  recommendations: string[];
  urgentAction: boolean;
}

/**
 * Generate AI-powered diagnostic based on symptom description
 */
export async function diagnoseBuildIssue(
  input: DiagnosticInput,
): Promise<DiagnosticResult> {
  const { symptoms, category, rigSpecs, additionalContext } = input;

  // Build context about the rig
  let rigContext = "";
  if (rigSpecs) {
    rigContext = `
Rig Details:
- Type: ${rigSpecs.rigType || "Unknown"}
- Solar: ${rigSpecs.solarWattage ? `${rigSpecs.solarWattage}W` : "Unknown"}
- Battery: ${rigSpecs.batteryCapacity ? `${rigSpecs.batteryCapacity}Ah ${rigSpecs.batteryType || ""}` : "Unknown"}
- Water: Fresh ${rigSpecs.freshWaterCapacity || "?"}gal, Grey ${rigSpecs.greyWaterCapacity || "?"}gal
- AC: ${rigSpecs.hasAC ? `Yes (${rigSpecs.acType || "type unknown"})` : "No"}
- Heater: ${rigSpecs.hasHeater ? `Yes (${rigSpecs.heaterType || "type unknown"})` : "No"}
- Generator: ${rigSpecs.hasGenerator ? "Yes" : "No"}
- Starlink: ${rigSpecs.starlinkActive ? "Active" : "No"}`;
  }

  const prompt = `You are an expert van/RV mechanic and off-grid systems specialist helping diagnose rig issues for nomads. Analyze the following problem and provide a detailed diagnosis.

SYMPTOMS REPORTED:
${symptoms}

${category ? `ISSUE CATEGORY: ${category}` : ""}
${rigContext}
${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ""}

Respond in JSON format with these fields:
{
  "diagnosis": "Clear explanation of what's likely wrong (2-3 sentences)",
  "severity": "minor|moderate|urgent|critical",
  "possibleCauses": ["List 2-4 possible causes, most likely first"],
  "immediateSteps": ["4-6 step-by-step troubleshooting instructions"],
  "toolsNeeded": ["List specific tools needed"],
  "estimatedDifficulty": "DIY easy|DIY moderate|DIY advanced|Professional needed",
  "estimatedCost": "Cost range for parts/repair",
  "safetyWarnings": ["Any safety concerns to be aware of"],
  "canContinueDriving": true or false,
  "relatedSystems": ["Other systems that might be affected"]
}

Be practical and specific. Assume the person is remote and may have limited access to parts. Prioritize safety.`;

  try {
    const response = await generateText({ prompt });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        diagnosis: parsed.diagnosis || "Unable to determine specific issue.",
        severity: validateSeverity(parsed.severity),
        possibleCauses: parsed.possibleCauses || ["Unknown cause"],
        immediateSteps: parsed.immediateSteps || ["Consult a professional"],
        toolsNeeded: parsed.toolsNeeded || [],
        estimatedDifficulty: validateDifficulty(parsed.estimatedDifficulty),
        estimatedCost: parsed.estimatedCost || "Varies",
        safetyWarnings: parsed.safetyWarnings || [],
        canContinueDriving: parsed.canContinueDriving ?? true,
        relatedSystems: parsed.relatedSystems || [],
      };
    }

    // Fallback
    return getDefaultDiagnostic(symptoms);
  } catch (error) {
    console.error("AI Diagnostic failed:", error);
    return getDefaultDiagnostic(symptoms);
  }
}

/**
 * Analyze an image of rig damage/issue
 */
export async function analyzeRigImage(
  imageUri: string,
  context?: string,
): Promise<ImageDiagnosticResult> {
  const prompt = `You are an expert van/RV mechanic. Analyze this image of a rig issue and provide a diagnostic assessment.

${context ? `Context provided: ${context}` : ""}

Please identify:
1. What the image shows (component, system, etc.)
2. Any visible damage, wear, or issues
3. Severity of the issue
4. Recommended actions

Respond in JSON format:
{
  "assessment": "Brief description of what you see",
  "identifiedIssues": ["List specific issues visible"],
  "severity": "minor|moderate|urgent|critical",
  "recommendations": ["2-4 recommended actions"],
  "urgentAction": true or false (needs immediate attention)
}`;

  try {
    const response = await analyzeImage({
      imageUrl: imageUri,
      prompt,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        assessment: parsed.assessment || "Unable to assess image.",
        identifiedIssues: parsed.identifiedIssues || [],
        severity: validateSeverity(parsed.severity),
        recommendations: parsed.recommendations || [
          "Take to a professional for inspection",
        ],
        urgentAction: parsed.urgentAction ?? false,
      };
    }

    return {
      assessment:
        response.slice(0, 200) ||
        "Image analyzed. Please consult a professional.",
      identifiedIssues: [],
      severity: "moderate",
      recommendations: ["Consult a professional for a detailed assessment"],
      urgentAction: false,
    };
  } catch (error) {
    console.error("Image analysis failed:", error);
    return {
      assessment:
        "Unable to analyze image. Please try again or describe the issue in text.",
      identifiedIssues: [],
      severity: "moderate",
      recommendations: [
        "Try uploading a clearer image",
        "Describe the issue in detail",
      ],
      urgentAction: false,
    };
  }
}

/**
 * Get quick troubleshooting tips for common issues
 */
export async function getQuickTips(category: IssueCategory): Promise<string[]> {
  const categoryTips: Record<IssueCategory, string[]> = {
    electrical: [
      "Check all fuse boxes - both vehicle and house batteries",
      "Verify battery terminals are clean and tight",
      "Test ground connections",
      "Use a multimeter to check voltage at various points",
    ],
    plumbing: [
      "Check for visible leaks under all connections",
      "Verify water pump is primed and receiving power",
      "Inspect tank vent lines for blockages",
      "Test accumulator tank pressure if applicable",
    ],
    mechanical: [
      "Check fluid levels (oil, coolant, transmission, brake)",
      "Inspect belts for wear or damage",
      "Listen for unusual sounds when engine is running",
      "Check for warning lights on dashboard",
    ],
    solar: [
      "Clean panels of dust and debris",
      "Check all wiring connections at panels and charge controller",
      "Verify charge controller settings match battery type",
      "Monitor production during peak sun hours",
    ],
    climate: [
      "Clean or replace air filters",
      "Check refrigerant levels (AC) or propane supply (heater)",
      "Verify thermostat is functioning",
      "Inspect ducting for blockages or leaks",
    ],
    structural: [
      "Inspect seals around windows and doors",
      "Check roof for soft spots or damage",
      "Look for water stains indicating leaks",
      "Verify all mounting hardware is secure",
    ],
    connectivity: [
      "Restart all devices (router, Starlink, phone)",
      "Check antenna positioning and obstructions",
      "Verify cell signal strength in the area",
      "Check for software/firmware updates",
    ],
    other: [
      "Document the issue with photos and notes",
      "Check online forums for similar issues",
      "Consult your rig manual for guidance",
      "Reach out to the community for advice",
    ],
  };

  return categoryTips[category] || categoryTips.other;
}

// Validation helpers
function validateSeverity(severity: string): IssueSeverity {
  const validSeverities: IssueSeverity[] = [
    "minor",
    "moderate",
    "urgent",
    "critical",
  ];
  return validSeverities.includes(severity as IssueSeverity)
    ? (severity as IssueSeverity)
    : "moderate";
}

function validateDifficulty(
  difficulty: string,
): DiagnosticResult["estimatedDifficulty"] {
  const validDifficulties: DiagnosticResult["estimatedDifficulty"][] = [
    "DIY easy",
    "DIY moderate",
    "DIY advanced",
    "Professional needed",
  ];
  return validDifficulties.includes(
    difficulty as DiagnosticResult["estimatedDifficulty"],
  )
    ? (difficulty as DiagnosticResult["estimatedDifficulty"])
    : "DIY moderate";
}

function getDefaultDiagnostic(symptoms: string): DiagnosticResult {
  return {
    diagnosis: `Based on the symptoms described (${symptoms.slice(0, 50)}...), we recommend a thorough inspection. The AI diagnostic was unable to complete analysis.`,
    severity: "moderate",
    possibleCauses: ["Multiple possible causes - further inspection needed"],
    immediateSteps: [
      "Document the issue with photos and notes",
      "Check for any obvious damage or loose connections",
      "Consult your rig manual for related troubleshooting",
      "Reach out to the WilderGo builder community for advice",
    ],
    toolsNeeded: ["Flashlight", "Basic tool kit", "Multimeter (if electrical)"],
    estimatedDifficulty: "DIY moderate",
    estimatedCost: "Varies based on actual issue",
    safetyWarnings: ["If unsure, consult a professional"],
    canContinueDriving: true,
    relatedSystems: [],
  };
}

export const buildDiagnosticService = {
  diagnoseBuildIssue,
  analyzeRigImage,
  getQuickTips,
};

export default buildDiagnosticService;
