import React from "react";
import { useRouter } from "@/hooks/useRouterCompat";
import PaywallScreen from "@/components/PaywallScreen";
import { useAuth } from "@/contexts/AuthContext";

export default function OnboardingPaywall() {
  const router = useRouter();
  const { updateProfile } = useAuth();

  const handleComplete = async () => {
    await updateProfile({ onboardingComplete: true });
  };

  return <PaywallScreen onComplete={handleComplete} showSkip={true} />;
}
