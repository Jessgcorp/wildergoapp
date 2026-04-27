/**
 * WilderGo Photo Verification Service
 * AI-powered selfie match verification
 * Compares live selfie with profile photo for community safety
 *
 * Note: AI image analysis is disabled in this environment.
 * Using fallback verification logic.
 */

// Stub function for image analysis (AI disabled)
async function analyzeImage(_options: {
  imageUrl: string;
  prompt: string;
}): Promise<string> {
  throw new Error("AI image analysis not available - using fallback");
}

export type VerificationStatus =
  | "pending"
  | "analyzing"
  | "passed"
  | "failed"
  | "error";

export interface VerificationResult {
  status: VerificationStatus;
  confidenceScore: number; // 0-100
  isMatch: boolean;
  feedback: string;
  details?: {
    faceDetected: boolean;
    lightingQuality: "good" | "fair" | "poor";
    imageClarity: "clear" | "blurry" | "obstructed";
    suggestions?: string[];
  };
}

export interface PhotoVerificationInput {
  profilePhotoUri: string;
  selfieUri: string;
}

// Minimum confidence score required to pass verification
const VERIFICATION_THRESHOLD = 70;

/**
 * Verify that a selfie matches the user's profile photo
 * Uses Newell AI Vision to compare facial features
 */
export async function verifyPhotoMatch(
  input: PhotoVerificationInput,
): Promise<VerificationResult> {
  const { profilePhotoUri, selfieUri } = input;

  try {
    // First, analyze the selfie to ensure it contains a clear face
    const selfieAnalysis = await analyzeImage({
      imageUrl: selfieUri,
      prompt: `Analyze this selfie photo for verification purposes. Respond in JSON format:
{
  "faceDetected": true/false,
  "faceCount": number,
  "lightingQuality": "good" | "fair" | "poor",
  "imageClarity": "clear" | "blurry" | "obstructed",
  "facialFeatures": "brief description of key facial features visible",
  "issues": ["list of any issues that might affect verification"]
}`,
    });

    // Parse selfie analysis
    let selfieData;
    try {
      const jsonMatch = selfieAnalysis.match(/\{[\s\S]*\}/);
      selfieData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      selfieData = null;
    }

    // Check if selfie has a detectable face
    if (!selfieData?.faceDetected) {
      return {
        status: "failed",
        confidenceScore: 0,
        isMatch: false,
        feedback:
          "No face detected in selfie. Please take a clear photo of your face.",
        details: {
          faceDetected: false,
          lightingQuality: selfieData?.lightingQuality || "poor",
          imageClarity: selfieData?.imageClarity || "obstructed",
          suggestions: [
            "Ensure your face is clearly visible",
            "Use good lighting",
            "Look directly at the camera",
          ],
        },
      };
    }

    // Now compare the selfie with the profile photo
    const comparisonAnalysis = await analyzeImage({
      imageUrl: profilePhotoUri,
      prompt: `Compare this profile photo with the following selfie description for identity verification.

Selfie description: ${selfieData.facialFeatures}

Analyze if these could be the same person. Consider:
1. Overall face shape and structure
2. Key distinctive features
3. General appearance characteristics

Respond in JSON format:
{
  "likelyMatch": true/false,
  "confidenceScore": 0-100,
  "matchingFeatures": ["list of features that match"],
  "differingFeatures": ["list of features that differ"],
  "verificationDecision": "pass" | "fail" | "needs_review",
  "reasoning": "brief explanation"
}`,
    });

    // Parse comparison result
    let comparisonData;
    try {
      const jsonMatch = comparisonAnalysis.match(/\{[\s\S]*\}/);
      comparisonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      comparisonData = null;
    }

    if (!comparisonData) {
      return {
        status: "error",
        confidenceScore: 0,
        isMatch: false,
        feedback: "Unable to complete verification. Please try again.",
        details: {
          faceDetected: true,
          lightingQuality: selfieData?.lightingQuality || "fair",
          imageClarity: selfieData?.imageClarity || "clear",
        },
      };
    }

    const confidenceScore = comparisonData.confidenceScore || 0;
    const isMatch = confidenceScore >= VERIFICATION_THRESHOLD;

    return {
      status: isMatch ? "passed" : "failed",
      confidenceScore,
      isMatch,
      feedback: isMatch
        ? "Photo verification successful! Your identity has been confirmed."
        : "Photo verification could not confirm your identity. Please ensure your selfie clearly shows your face.",
      details: {
        faceDetected: true,
        lightingQuality: selfieData?.lightingQuality || "fair",
        imageClarity: selfieData?.imageClarity || "clear",
        suggestions: !isMatch
          ? [
              "Ensure good lighting on your face",
              "Remove sunglasses or hats",
              "Look directly at the camera",
              "Use a recent, clear profile photo",
            ]
          : undefined,
      },
    };
  } catch (error) {
    console.error("Photo verification error:", error);
    return {
      status: "error",
      confidenceScore: 0,
      isMatch: false,
      feedback: "Verification service unavailable. Please try again later.",
      details: {
        faceDetected: false,
        lightingQuality: "poor",
        imageClarity: "obstructed",
      },
    };
  }
}

/**
 * Quick face detection check for selfie preview
 * Returns whether a face is detected in the image
 */
export async function checkFaceInImage(imageUri: string): Promise<{
  hasFace: boolean;
  quality: "good" | "fair" | "poor";
  suggestion?: string;
}> {
  try {
    const analysis = await analyzeImage({
      imageUrl: imageUri,
      prompt: `Quick check: Is there a clear human face in this image? Respond in JSON:
{
  "hasFace": true/false,
  "quality": "good" | "fair" | "poor",
  "suggestion": "brief tip if needed"
}`,
    });

    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        hasFace: data.hasFace || false,
        quality: data.quality || "poor",
        suggestion: data.suggestion,
      };
    }

    return {
      hasFace: false,
      quality: "poor",
      suggestion: "Unable to detect face",
    };
  } catch {
    return {
      hasFace: false,
      quality: "poor",
      suggestion: "Check failed - please try again",
    };
  }
}

export default {
  verifyPhotoMatch,
  checkFaceInImage,
  VERIFICATION_THRESHOLD,
};
