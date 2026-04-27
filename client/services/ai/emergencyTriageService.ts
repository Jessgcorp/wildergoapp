/**
 * WilderGo Emergency Triage AI Service
 * AI-powered emergency assistance:
 * - Analyze help request descriptions and provide immediate safety advice
 * - Generate reassuring icebreaker messages for responders
 * - Prioritize emergency responses based on severity
 *
 * Note: AI text generation is disabled in this environment.
 * Using intelligent fallback logic instead.
 */

// Stub function that throws to trigger fallback logic
async function generateText(_options: { prompt: string }): Promise<string> {
  throw new Error("AI generation not available - using fallback");
}

export type EmergencyCategory =
  | "mechanical"
  | "medical"
  | "security"
  | "supplies";
export type EmergencyPriority = "critical" | "urgent" | "assistance";

export interface TriageInput {
  category: EmergencyCategory;
  description: string;
  priority: EmergencyPriority;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  userContext?: {
    rigType?: string;
    travelingAlone?: boolean;
    hasTools?: boolean;
  };
}

export interface TriageResult {
  safetyAdvice: string;
  immediateActions: string[];
  thingsToAvoid: string[];
  whatToExpect: string;
  estimatedWaitMessage: string;
}

export interface IcebreakerInput {
  category: EmergencyCategory;
  priority: EmergencyPriority;
  description: string;
  responderDistance?: number; // in miles
  responderHasTools?: boolean;
}

export interface IcebreakerResult {
  messages: string[];
  suggestedActions: string[];
}

/**
 * Analyze emergency description and provide immediate safety advice
 * Called when user submits a help request - provides guidance while waiting for responders
 */
export async function analyzeEmergencyTriage(
  input: TriageInput,
): Promise<TriageResult> {
  const { category, description, priority, location, userContext } = input;

  const categoryContext = getCategoryContext(category);
  const priorityLevel =
    priority === "critical"
      ? "life-threatening"
      : priority === "urgent"
        ? "serious"
        : "non-urgent";

  const prompt = `You are an emergency triage assistant for nomadic travelers (van lifers, RVers). Analyze this ${priorityLevel} ${category} emergency and provide immediate safety advice.

SITUATION:
Category: ${category}
Priority: ${priority}
Description: ${description}
${location?.address ? `Location: ${location.address}` : ""}
${userContext?.rigType ? `Vehicle: ${userContext.rigType}` : ""}
${userContext?.travelingAlone !== undefined ? `Traveling alone: ${userContext.travelingAlone ? "Yes" : "No"}` : ""}

${categoryContext}

Respond in this exact JSON format:
{
  "safetyAdvice": "Main safety guidance paragraph (2-3 sentences, reassuring but practical)",
  "immediateActions": ["Action 1", "Action 2", "Action 3"],
  "thingsToAvoid": ["Thing to avoid 1", "Thing to avoid 2"],
  "whatToExpect": "Brief description of what help will look like when it arrives",
  "estimatedWaitMessage": "Reassuring message about wait time"
}

Keep advice practical, calm, and specific to nomadic/vehicle living situations. Be reassuring but prioritize safety.`;

  try {
    const response = await generateText({ prompt });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        safetyAdvice:
          parsed.safetyAdvice || getDefaultSafetyAdvice(category, priority),
        immediateActions:
          parsed.immediateActions || getDefaultActions(category),
        thingsToAvoid: parsed.thingsToAvoid || getDefaultAvoidances(category),
        whatToExpect:
          parsed.whatToExpect ||
          "Nearby nomads are being notified and may reach out to help.",
        estimatedWaitMessage:
          parsed.estimatedWaitMessage ||
          "Help is on the way. Stay safe and someone will contact you soon.",
      };
    }

    // Fallback if JSON parsing fails
    return getDefaultTriageResult(category, priority);
  } catch (error) {
    // AI not available - using default triage (this is expected behavior)
    return getDefaultTriageResult(category, priority);
  }
}

/**
 * Generate reassuring icebreaker messages for responders
 * Called when a responder is about to reach out to someone in distress
 */
export async function generateSOSIcebreakers(
  input: IcebreakerInput,
): Promise<IcebreakerResult> {
  const {
    category,
    priority,
    description,
    responderDistance,
    responderHasTools,
  } = input;

  const prompt = `You are helping a Good Samaritan nomad traveler respond to someone who needs ${category} help. Generate 3 short, reassuring first-contact messages they can send.

SITUATION THEY'RE RESPONDING TO:
Category: ${category}
Priority: ${priority}
Their description: "${description}"
${responderDistance ? `Responder is ${responderDistance.toFixed(1)} miles away` : ""}
${responderHasTools !== undefined ? `Responder has tools: ${responderHasTools ? "Yes" : "Maybe"}` : ""}

Respond in this exact JSON format:
{
  "messages": [
    "Short friendly first message (under 50 chars)",
    "Second option message (under 50 chars)",
    "Third option with specific offer (under 60 chars)"
  ],
  "suggestedActions": [
    "Quick action the responder could offer",
    "Another helpful action"
  ]
}

Messages should be:
- Warm and reassuring
- Not overly formal
- Show they're coming to help
- Appropriate for nomad/van life community`;

  try {
    const response = await generateText({ prompt });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        messages:
          parsed.messages || getDefaultIcebreakers(category, responderDistance),
        suggestedActions:
          parsed.suggestedActions || getDefaultSuggestedActions(category),
      };
    }

    return {
      messages: getDefaultIcebreakers(category, responderDistance),
      suggestedActions: getDefaultSuggestedActions(category),
    };
  } catch (error) {
    // AI not available - using default icebreakers (this is expected behavior)
    return {
      messages: getDefaultIcebreakers(category, responderDistance),
      suggestedActions: getDefaultSuggestedActions(category),
    };
  }
}

/**
 * Quick triage assessment without full AI call (for immediate UI feedback)
 * Uses predefined responses based on category and priority
 */
export function getQuickTriageAdvice(
  category: EmergencyCategory,
  priority: EmergencyPriority,
): string {
  const adviceMap: Record<
    EmergencyCategory,
    Record<EmergencyPriority, string>
  > = {
    mechanical: {
      critical:
        "Turn on hazard lights and get to safety if possible. Do not attempt repairs in traffic. Help is being notified.",
      urgent:
        "Stay with your vehicle in a safe location. Turn on hazard lights. Nearby nomads with mechanical experience are being alerted.",
      assistance:
        "Document the issue with photos if safe. Nearby nomads who may be able to help are being notified.",
    },
    medical: {
      critical:
        "Call 911 immediately for life-threatening emergencies. Keep the person comfortable and still. Help is on the way.",
      urgent:
        "Stay calm and rest. Gather any relevant medical information. Nearby nomads are being notified.",
      assistance:
        "Rest and stay hydrated. Nearby nomads who may have supplies or experience are being contacted.",
    },
    security: {
      critical:
        "If in immediate danger, call 911. Lock doors and stay in your vehicle. Nearby nomads are being alerted.",
      urgent:
        "Trust your instincts. Lock your vehicle. Keep your phone charged. Help is being coordinated.",
      assistance:
        "Stay aware of your surroundings. Nearby community members are being notified.",
    },
    supplies: {
      critical:
        "Conserve what resources you have. Stay sheltered. Emergency supplies assistance is being coordinated.",
      urgent:
        "Ration your current supplies. Nearby nomads who can help are being notified.",
      assistance:
        "Help with supplies is on the way. Nearby nomads are being contacted.",
    },
  };

  return adviceMap[category][priority];
}

// Helper functions for context and defaults

function getCategoryContext(category: EmergencyCategory): string {
  const contexts: Record<EmergencyCategory, string> = {
    mechanical: `MECHANICAL EMERGENCY CONTEXT:
- Common van/RV issues: flat tires, dead batteries, overheating, alternator failure, transmission issues
- Important: Many nomads carry basic tools and have mechanical knowledge
- Safety considerations: Traffic, weather, remote locations`,
    medical: `MEDICAL EMERGENCY CONTEXT:
- For life-threatening emergencies, always recommend calling 911 first
- Consider: Nearest hospital access, limited medical supplies on road
- Many nomads have first aid kits and basic training`,
    security: `SECURITY EMERGENCY CONTEXT:
- Safety is paramount - validate their instincts
- Consider: Remote locations, limited cell service possible
- Community support can provide presence and escort`,
    supplies: `SUPPLIES EMERGENCY CONTEXT:
- Common needs: Water, fuel, food, propane, medication
- Consider: Distance to nearest town, weather conditions
- Nomad community often shares resources`,
  };
  return contexts[category];
}

function getDefaultTriageResult(
  category: EmergencyCategory,
  priority: EmergencyPriority,
): TriageResult {
  return {
    safetyAdvice: getDefaultSafetyAdvice(category, priority),
    immediateActions: getDefaultActions(category),
    thingsToAvoid: getDefaultAvoidances(category),
    whatToExpect:
      "Nearby nomads are being notified and someone will reach out to help shortly.",
    estimatedWaitMessage:
      "Help is on the way. Stay safe and keep your phone accessible.",
  };
}

function getDefaultSafetyAdvice(
  category: EmergencyCategory,
  priority: EmergencyPriority,
): string {
  if (priority === "critical") {
    if (category === "medical") {
      return "For life-threatening emergencies, please call 911 immediately. Keep the person as comfortable as possible while waiting for help.";
    }
    if (category === "security") {
      return "If you are in immediate danger, call 911. Lock your vehicle and stay inside until help arrives.";
    }
  }

  const defaults: Record<EmergencyCategory, string> = {
    mechanical:
      "Stay safe and visible. Turn on your hazard lights if stopped on the road. Do not attempt risky repairs alone.",
    medical:
      "Rest and stay calm. Gather any relevant health information. Help from nearby nomads is being coordinated.",
    security:
      "Trust your instincts and prioritize your safety. Lock your vehicle and stay aware of your surroundings.",
    supplies:
      "Conserve your current resources. Help with supplies is being coordinated from nearby community members.",
  };

  return defaults[category];
}

function getDefaultActions(category: EmergencyCategory): string[] {
  const actions: Record<EmergencyCategory, string[]> = {
    mechanical: [
      "Turn on hazard lights",
      "Move to a safe location if possible",
      "Document the issue with photos",
    ],
    medical: [
      "Rest in a comfortable position",
      "Stay hydrated if possible",
      "Have any medications or medical info ready",
    ],
    security: [
      "Lock all doors and windows",
      "Keep your phone charged and accessible",
      "Note descriptions of any concerns",
    ],
    supplies: [
      "Take inventory of current supplies",
      "Conserve water and fuel",
      "Stay sheltered from weather",
    ],
  };
  return actions[category];
}

function getDefaultAvoidances(category: EmergencyCategory): string[] {
  const avoidances: Record<EmergencyCategory, string[]> = {
    mechanical: [
      "Do not attempt repairs in traffic",
      "Avoid opening hot radiator caps",
    ],
    medical: ["Do not ignore worsening symptoms", "Avoid strenuous activity"],
    security: [
      "Do not confront suspicious individuals",
      "Do not share your exact location publicly",
    ],
    supplies: [
      "Do not ration too severely - help is coming",
      "Avoid unnecessary travel to conserve fuel",
    ],
  };
  return avoidances[category];
}

function getDefaultIcebreakers(
  category: EmergencyCategory,
  distance?: number,
): string[] {
  const distanceText = distance ? `${distance.toFixed(0)} min away` : "nearby";

  const defaults: Record<EmergencyCategory, string[]> = {
    mechanical: [
      `Hey! I'm ${distanceText} and can help - hang tight!`,
      "Fellow nomad here - what tools do you need?",
      "On my way! I have a basic toolkit with me",
    ],
    medical: [
      `I'm ${distanceText} - how can I help?`,
      "Nearby and have a first aid kit - coming to check on you",
      "Fellow traveler here - what do you need most?",
    ],
    security: [
      `I'm ${distanceText} - can come provide some company`,
      "Fellow nomad here - happy to come hang nearby",
      "On my way to check on you - stay safe!",
    ],
    supplies: [
      `Hey! I'm ${distanceText} and have supplies to share`,
      "Fellow traveler - what do you need most urgently?",
      "Happy to help! What supplies are you low on?",
    ],
  };

  return defaults[category];
}

function getDefaultSuggestedActions(category: EmergencyCategory): string[] {
  const actions: Record<EmergencyCategory, string[]> = {
    mechanical: [
      "Offer to take a look at the issue",
      "Share tools or spare parts if available",
      "Help search for nearby mechanics",
    ],
    medical: [
      "Offer first aid supplies",
      "Help locate nearest medical facility",
      "Provide company and reassurance",
    ],
    security: [
      "Offer to park nearby for company",
      "Help scout the area",
      "Provide escort to a safer location",
    ],
    supplies: [
      "Share water, fuel, or food",
      "Help locate nearest supply point",
      "Offer to make a supply run",
    ],
  };
  return actions[category];
}

export default {
  analyzeEmergencyTriage,
  generateSOSIcebreakers,
  getQuickTriageAdvice,
};
