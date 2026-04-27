/**
 * WilderGo Emergency Triage Hook
 * React hook for AI-powered emergency assistance
 */

import { useState, useCallback } from "react";
import {
  analyzeEmergencyTriage,
  generateSOSIcebreakers,
  getQuickTriageAdvice,
  TriageInput,
  TriageResult,
  IcebreakerInput,
  IcebreakerResult,
  EmergencyCategory,
  EmergencyPriority,
} from "@/services/ai/emergencyTriageService";

interface UseEmergencyTriageReturn {
  // Triage state
  triageResult: TriageResult | null;
  isAnalyzing: boolean;
  triageError: Error | null;

  // Icebreaker state
  icebreakers: IcebreakerResult | null;
  isGeneratingIcebreakers: boolean;
  icebreakerError: Error | null;

  // Actions
  analyzeTriage: (input: TriageInput) => Promise<TriageResult | null>;
  getIcebreakers: (input: IcebreakerInput) => Promise<IcebreakerResult | null>;
  getQuickAdvice: (
    category: EmergencyCategory,
    priority: EmergencyPriority,
  ) => string;
  reset: () => void;
}

export function useEmergencyTriage(): UseEmergencyTriageReturn {
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageError, setTriageError] = useState<Error | null>(null);

  const [icebreakers, setIcebreakers] = useState<IcebreakerResult | null>(null);
  const [isGeneratingIcebreakers, setIsGeneratingIcebreakers] = useState(false);
  const [icebreakerError, setIcebreakerError] = useState<Error | null>(null);

  const analyzeTriage = useCallback(
    async (input: TriageInput): Promise<TriageResult | null> => {
      setIsAnalyzing(true);
      setTriageError(null);

      try {
        const result = await analyzeEmergencyTriage(input);
        setTriageResult(result);
        return result;
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to analyze emergency");
        setTriageError(err);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const getIcebreakers = useCallback(
    async (input: IcebreakerInput): Promise<IcebreakerResult | null> => {
      setIsGeneratingIcebreakers(true);
      setIcebreakerError(null);

      try {
        const result = await generateSOSIcebreakers(input);
        setIcebreakers(result);
        return result;
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to generate icebreakers");
        setIcebreakerError(err);
        return null;
      } finally {
        setIsGeneratingIcebreakers(false);
      }
    },
    [],
  );

  const getQuickAdvice = useCallback(
    (category: EmergencyCategory, priority: EmergencyPriority): string => {
      return getQuickTriageAdvice(category, priority);
    },
    [],
  );

  const reset = useCallback(() => {
    setTriageResult(null);
    setTriageError(null);
    setIcebreakers(null);
    setIcebreakerError(null);
  }, []);

  return {
    triageResult,
    isAnalyzing,
    triageError,
    icebreakers,
    isGeneratingIcebreakers,
    icebreakerError,
    analyzeTriage,
    getIcebreakers,
    getQuickAdvice,
    reset,
  };
}

export default useEmergencyTriage;
