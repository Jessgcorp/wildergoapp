/**
 * WilderGo AI Services
 * Newell AI integrations for app features
 */

export {
  analyzeEmergencyTriage,
  generateSOSIcebreakers,
  getQuickTriageAdvice,
  type TriageInput,
  type TriageResult,
  type IcebreakerInput,
  type IcebreakerResult,
} from "./emergencyTriageService";

export {
  diagnoseBuildIssue,
  analyzeRigImage,
  getQuickTips,
  type DiagnosticInput,
  type DiagnosticResult,
  type ImageDiagnosticResult,
} from "./buildDiagnosticService";
