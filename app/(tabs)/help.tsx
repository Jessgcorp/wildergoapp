/**
 * Help Tab Screen
 * Emergency Help Mode - SOS Ecosystem
 * Liquid iOS aesthetic with Russo One headers
 */

import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  EmergencyDashboard,
  HelpRequestForm,
  ActiveRequestHUD,
  HelpAlertModal,
  EmergencyCategory,
  HelpRequest,
  HelpResponse,
  NearbyAlert,
} from "@/components/emergency";
import { useEmergencyTriage } from "@/hooks/useEmergencyTriage";

type HelpScreenState = "dashboard" | "form" | "active";

export default function HelpScreen() {
  const [screenState, setScreenState] = useState<HelpScreenState>("dashboard");
  const [selectedCategory, setSelectedCategory] =
    useState<EmergencyCategory | null>(null);
  const [activeRequest, setActiveRequest] = useState<HelpRequest | null>(null);
  const [responses, setResponses] = useState<HelpResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For demo: incoming help alert
  const [showAlert, setShowAlert] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState<NearbyAlert | null>(null);

  // AI Icebreakers for responders
  const [aiIcebreakers, setAiIcebreakers] = useState<string[]>([]);
  const [respondedToAlert, setRespondedToAlert] = useState(false);

  // AI Triage hook for generating icebreakers
  const { getIcebreakers } = useEmergencyTriage();

  // Simulate incoming alerts (for demo purposes)
  useEffect(() => {
    // Show a demo alert after 30 seconds on the dashboard
    const timer = setTimeout(() => {
      if (screenState === "dashboard" && !activeRequest) {
        // Create demo incoming alert
        const demoAlert: NearbyAlert = {
          request: {
            id: "incoming-1",
            userId: "user-123",
            userName: "Sarah M.",
            rigName: "2020 Sprinter",
            category: "mechanical",
            priority: "urgent",
            description:
              "My van broke down on the highway. Engine is overheating and I am stuck at a pull-off. Would really appreciate some help checking it out.",
            status: "broadcasting",
            location: {
              latitude: 38.5833,
              longitude: -109.5598,
              address: "Highway 191, near Moab",
            },
            nomadicPulse: {
              heading: "Arches NP",
              currentLocation: "Moab, UT",
              travelingWith: 0,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            respondersCount: 0,
            respondersNotified: 8,
          },
          distance: 3.2,
          direction: "NE",
          estimatedTime: "8 min",
        };

        // Generate AI icebreakers using Newell AI
        generateIcebreakersForAlert(demoAlert);

        setIncomingAlert(demoAlert);
        setShowAlert(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [screenState, activeRequest]);

  // Generate AI icebreakers for an incoming alert
  const generateIcebreakersForAlert = useCallback(
    async (alert: NearbyAlert) => {
      try {
        const result = await getIcebreakers({
          category: alert.request.category,
          priority: alert.request.priority,
          description: alert.request.description,
          responderDistance: alert.distance,
        });

        if (result?.messages) {
          setAiIcebreakers(result.messages);
        } else {
          // Fallback icebreakers
          setAiIcebreakers([
            "I'm nearby and can help - hang tight!",
            "I have tools in my rig, heading your way now",
          ]);
        }
      } catch {
        // Fallback icebreakers on error
        setAiIcebreakers([
          "I'm nearby and can help - hang tight!",
          "Fellow nomad here - on my way!",
        ]);
      }
    },
    [getIcebreakers],
  );

  const handleSelectCategory = useCallback((category: EmergencyCategory) => {
    setSelectedCategory(category);
    setScreenState("form");
  }, []);

  const handleFormCancel = useCallback(() => {
    setSelectedCategory(null);
    setScreenState("dashboard");
  }, []);

  const handleFormSubmit = useCallback(
    async (requestData: Partial<HelpRequest>) => {
      setIsSubmitting(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create the active request
      const newRequest: HelpRequest = {
        id: `request-${Date.now()}`,
        userId: "current-user",
        userName: "You",
        ...requestData,
        status: "broadcasting",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        respondersCount: 0,
        respondersNotified: 12, // Simulated count
      } as HelpRequest;

      setActiveRequest(newRequest);
      setIsSubmitting(false);
      setScreenState("active");

      // Simulate responses coming in
      simulateResponses();
    },
    [],
  );

  const simulateResponses = useCallback(() => {
    // Simulate first responder after 5 seconds
    setTimeout(() => {
      setResponses((prev) => [
        ...prev,
        {
          id: "response-1",
          requestId: activeRequest?.id || "",
          responderId: "responder-1",
          responderName: "Mike T.",
          message: "I'm about 4 miles away, heading your way!",
          eta: "12 min",
          distance: 4.2,
          status: "en_route",
          createdAt: new Date().toISOString(),
        },
      ]);

      // Update notified count
      setActiveRequest((prev) =>
        prev ? { ...prev, respondersCount: 1 } : null,
      );
    }, 5000);

    // Simulate second responder after 8 seconds
    setTimeout(() => {
      setResponses((prev) => [
        ...prev,
        {
          id: "response-2",
          requestId: activeRequest?.id || "",
          responderId: "responder-2",
          responderName: "Alex K.",
          message: "I have some basic tools if you need them",
          eta: "18 min",
          distance: 6.8,
          status: "offered",
          createdAt: new Date().toISOString(),
        },
      ]);

      setActiveRequest((prev) =>
        prev ? { ...prev, respondersCount: 2 } : null,
      );
    }, 8000);
  }, [activeRequest?.id]);

  const handleCancelRequest = useCallback(() => {
    setActiveRequest(null);
    setResponses([]);
    setScreenState("dashboard");
  }, []);

  const handleViewActiveRequest = useCallback(() => {
    if (activeRequest) {
      setScreenState("active");
    }
  }, [activeRequest]);

  const handleAlertRespond = useCallback(() => {
    setRespondedToAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setRespondedToAlert(false);
      setScreenState("active");
      setActiveRequest({
        id: incomingAlert?.request.id || "response-1",
        userId: "current-user",
        userName: "You",
        category: incomingAlert?.request.category || "mechanical",
        priority: incomingAlert?.request.priority || "urgent",
        description: `Responding to ${incomingAlert?.request.userName}'s request: ${incomingAlert?.request.description}`,
        status: "responded",
        location: incomingAlert?.request.location || {
          latitude: 0,
          longitude: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        respondersCount: 1,
        respondersNotified: 0,
      } as HelpRequest);
    }, 1500);
  }, [incomingAlert]);

  const handleAlertDismiss = useCallback(() => {
    setShowAlert(false);
    setIncomingAlert(null);
  }, []);

  const handleAITriageResponse = useCallback((advice: string) => {
    // Update active request with AI advice
    setActiveRequest((prev) =>
      prev ? { ...prev, aiTriageAdvice: advice } : null,
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Dashboard State */}
      {screenState === "dashboard" && (
        <EmergencyDashboard
          onSelectCategory={handleSelectCategory}
          activeRequests={activeRequest ? 1 : 0}
          onViewActiveRequest={handleViewActiveRequest}
        />
      )}

      {/* Form State */}
      {screenState === "form" && selectedCategory && (
        <HelpRequestForm
          category={selectedCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          onAITriageResponse={handleAITriageResponse}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Active Request State */}
      {screenState === "active" && activeRequest && (
        <ActiveRequestHUD
          request={activeRequest}
          responses={responses}
          onCancel={handleCancelRequest}
        />
      )}

      {/* Incoming Help Alert Modal */}
      <HelpAlertModal
        visible={showAlert}
        alert={incomingAlert}
        onRespond={handleAlertRespond}
        onDismiss={handleAlertDismiss}
        aiIcebreakers={aiIcebreakers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EFE6", // Warm Cream
  },
});
