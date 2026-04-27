/**
 * WilderGo Convoy AI Service
 * AI-powered features for convoy coordination:
 * - Convoy Introductions: Generate personalized welcome messages for new members
 * - Smart conversation starters based on shared interests/routes
 *
 * Note: AI text generation is disabled in this environment.
 * Using intelligent fallback logic instead.
 */

// Stub function that throws to trigger fallback logic
async function generateText(_options: { prompt: string }): Promise<string> {
  throw new Error("AI generation not available - using fallback");
}

export interface ConvoyMember {
  id: string;
  name: string;
  rigType?: string;
  destination?: string;
  interests?: string[];
  routeOverlap?: number;
  skills?: string[];
}

export interface ConvoyIntroduction {
  welcomeMessage: string;
  conversationStarters: string[];
  sharedInterests: string[];
  suggestedActivities: string[];
}

/**
 * Generate a personalized welcome message for a new convoy member
 */
export async function generateConvoyIntroduction(
  newMember: ConvoyMember,
  existingMembers: ConvoyMember[],
  convoyName: string,
): Promise<ConvoyIntroduction> {
  // Build context about the convoy
  const memberSummary = existingMembers
    .slice(0, 5)
    .map((m) => `${m.name} (${m.rigType || "Nomad"})`)
    .join(", ");

  const allInterests = [
    ...new Set(existingMembers.flatMap((m) => m.interests || [])),
  ].slice(0, 8);
  const allSkills = [
    ...new Set(existingMembers.flatMap((m) => m.skills || [])),
  ].slice(0, 6);

  const prompt = `You are a friendly AI assistant for a nomad/vanlife community app called WilderGo. Generate a warm, welcoming introduction for a new convoy member.

New Member Details:
- Name: ${newMember.name}
- Rig Type: ${newMember.rigType || "Not specified"}
- Destination: ${newMember.destination || "Exploring"}
- Interests: ${(newMember.interests || []).join(", ") || "Not specified"}

Convoy "${convoyName}" has ${existingMembers.length} members including: ${memberSummary}
Common interests in the group: ${allInterests.join(", ") || "Various"}
Skills available: ${allSkills.join(", ") || "Various"}

Please respond in JSON format with these fields:
{
  "welcomeMessage": "A warm, personalized 2-3 sentence welcome message",
  "conversationStarters": ["3 specific questions to help them connect with the group"],
  "sharedInterests": ["List any interests they share with the group"],
  "suggestedActivities": ["2-3 activities they could do with the convoy"]
}

Keep the tone friendly, outdoor-focused, and supportive of the nomadic lifestyle. Use rugged/adventure vocabulary.`;

  try {
    const response = await generateText({ prompt });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        welcomeMessage:
          parsed.welcomeMessage ||
          getDefaultWelcome(newMember.name, convoyName),
        conversationStarters:
          parsed.conversationStarters || getDefaultStarters(),
        sharedInterests: parsed.sharedInterests || [],
        suggestedActivities:
          parsed.suggestedActivities || getDefaultActivities(),
      };
    }

    // Fallback if parsing fails
    return {
      welcomeMessage:
        response.slice(0, 200) || getDefaultWelcome(newMember.name, convoyName),
      conversationStarters: getDefaultStarters(),
      sharedInterests: findSharedInterests(
        newMember.interests || [],
        allInterests,
      ),
      suggestedActivities: getDefaultActivities(),
    };
  } catch (error) {
    console.error("AI Introduction generation failed:", error);
    // Return fallback data
    return {
      welcomeMessage: getDefaultWelcome(newMember.name, convoyName),
      conversationStarters: getDefaultStarters(),
      sharedInterests: findSharedInterests(
        newMember.interests || [],
        allInterests,
      ),
      suggestedActivities: getDefaultActivities(),
    };
  }
}

/**
 * Generate icebreaker messages for route-matched nomads
 */
export async function generateRouteMatchIcebreaker(
  user1: ConvoyMember,
  user2: ConvoyMember,
  overlapPercentage: number,
): Promise<string[]> {
  const prompt = `Generate 3 friendly icebreaker messages for two nomads who have a ${overlapPercentage}% route overlap.

Person 1: ${user1.name}, driving a ${user1.rigType || "van"}, heading to ${user1.destination || "adventure"}
Person 2: ${user2.name}, driving a ${user2.rigType || "van"}, heading to ${user2.destination || "adventure"}

Person 1's interests: ${(user1.interests || []).join(", ") || "exploring"}
Person 2's interests: ${(user2.interests || []).join(", ") || "exploring"}

Create 3 short, friendly icebreaker messages (1-2 sentences each) that Person 1 could send to Person 2. Focus on their shared route or overlapping interests. Keep the tone casual and adventure-focused.

Respond as a JSON array of 3 strings:
["message1", "message2", "message3"]`;

  try {
    const response = await generateText({ prompt });

    // Parse JSON array
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 3);
      }
    }

    return getDefaultIcebreakers(overlapPercentage);
  } catch (error) {
    console.error("Icebreaker generation failed:", error);
    return getDefaultIcebreakers(overlapPercentage);
  }
}

// Fallback functions
function getDefaultWelcome(name: string, convoyName: string): string {
  return `Welcome to ${convoyName}, ${name}! 🏕️ We're stoked to have you join the convoy. Looking forward to sharing the road and some great campfire stories with you!`;
}

function getDefaultStarters(): string[] {
  return [
    "What's the best spot you've camped at so far?",
    "Any must-see places on your current route?",
    "How long have you been on the road?",
  ];
}

function getDefaultActivities(): string[] {
  return [
    "Group sunset viewing at the next scenic overlook",
    "Potluck dinner at the campsite",
    "Morning coffee meetup before rolling out",
  ];
}

function getDefaultIcebreakers(overlap: number): string[] {
  return [
    `Hey! Looks like we're heading the same direction – ${overlap}% route overlap! Want to convoy together?`,
    "Nice rig! I'm heading your way if you want to meet up at the next good camping spot.",
    "Fellow nomad on a similar path! Let me know if you want to grab coffee at the next stop.",
  ];
}

function findSharedInterests(
  userInterests: string[],
  groupInterests: string[],
): string[] {
  const userLower = userInterests.map((i) => i.toLowerCase());
  return groupInterests.filter((i) => userLower.includes(i.toLowerCase()));
}

export const convoyAIService = {
  generateConvoyIntroduction,
  generateRouteMatchIcebreaker,
};

export default convoyAIService;
