/**
 * WilderGo Photo Verification Hook
 * React hook for AI-powered selfie match verification
 */

import { useState, useCallback } from "react";
import {
  verifyPhotoMatch,
  checkFaceInImage,
  VerificationResult,
  VerificationStatus,
  PhotoVerificationInput,
} from "@/services/ai/photoVerificationService";

interface UsePhotoVerificationReturn {
  // State
  result: VerificationResult | null;
  status: VerificationStatus;
  isVerifying: boolean;
  error: Error | null;

  // Actions
  verify: (input: PhotoVerificationInput) => Promise<VerificationResult | null>;
  checkFace: (
    imageUri: string,
  ) => Promise<{ hasFace: boolean; quality: string }>;
  reset: () => void;
}

export function usePhotoVerification(): UsePhotoVerificationReturn {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const verify = useCallback(
    async (
      input: PhotoVerificationInput,
    ): Promise<VerificationResult | null> => {
      setIsVerifying(true);
      setStatus("analyzing");
      setError(null);

      try {
        const verificationResult = await verifyPhotoMatch(input);
        setResult(verificationResult);
        setStatus(verificationResult.status);
        return verificationResult;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Verification failed");
        setError(error);
        setStatus("error");
        return null;
      } finally {
        setIsVerifying(false);
      }
    },
    [],
  );

  const checkFace = useCallback(async (imageUri: string) => {
    try {
      const result = await checkFaceInImage(imageUri);
      return { hasFace: result.hasFace, quality: result.quality };
    } catch {
      return { hasFace: false, quality: "poor" };
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setStatus("pending");
    setError(null);
    setIsVerifying(false);
  }, []);

  return {
    result,
    status,
    isVerifying,
    error,
    verify,
    checkFace,
    reset,
  };
}

export default usePhotoVerification;
