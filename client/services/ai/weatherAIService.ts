/**
 * WilderGo Weather AI Service
 * Generates "Nomadic Outlook" summaries
 * Provides personalized weather-based advice for nomadic lifestyle
 *
 * Note: AI text generation is disabled in this environment.
 * Using intelligent fallback logic instead.
 */

// Stub function that returns empty string - uses fallback logic instead
async function generateText(_options: { prompt: string }): Promise<string> {
  throw new Error("AI generation not available - using fallback");
}

export interface WeatherConditions {
  temperature: number; // Fahrenheit
  feelsLike: number;
  humidity: number;
  windSpeed: number; // mph
  windDirection: string;
  condition: string; // clear, cloudy, rain, storm, snow, windy, fog
  uvIndex: number;
  visibility: number; // miles
  forecast?: {
    day: string;
    high: number;
    low: number;
    condition: string;
    precipChance: number;
  }[];
}

export interface NomadicOutlook {
  summary: string;
  headline: string;
  advice: string[];
  activitySuggestions: string[];
  warnings: string[];
  overallRating: "excellent" | "good" | "fair" | "caution" | "warning";
}

/**
 * Generate a "Nomadic Outlook" summary based on current weather conditions
 * Uses Newell AI to create personalized advice for van lifers and nomads
 */
export async function generateNomadicOutlook(
  weather: WeatherConditions,
  locationName?: string,
): Promise<NomadicOutlook> {
  const forecastSummary = weather.forecast
    ? weather.forecast
        .slice(0, 3)
        .map(
          (f) =>
            `${f.day}: ${f.condition}, ${f.high}°/${f.low}°, ${f.precipChance}% rain`,
        )
        .join("; ")
    : "No forecast available";

  const prompt = `You are a helpful weather advisor for nomads, van lifers, and RV travelers. Generate a brief, friendly "Nomadic Outlook" summary based on these conditions${locationName ? ` at ${locationName}` : ""}:

Current Weather:
- Temperature: ${weather.temperature}°F (Feels like ${weather.feelsLike}°F)
- Condition: ${weather.condition}
- Wind: ${weather.windSpeed} mph from ${weather.windDirection}
- Humidity: ${weather.humidity}%
- UV Index: ${weather.uvIndex}
- Visibility: ${weather.visibility} miles

Upcoming Forecast: ${forecastSummary}

Respond in JSON format ONLY with this exact structure:
{
  "headline": "A catchy 3-5 word headline for today (e.g., 'Perfect Bonfire Night Ahead')",
  "summary": "A 1-2 sentence friendly summary of conditions and what nomads should expect. Be specific and helpful. Use casual, warm language.",
  "advice": ["3-4 specific tips for van lifers based on these conditions, e.g., 'Secure your awnings before tonight's winds' or 'Great day for solar charging'"],
  "activitySuggestions": ["2-3 outdoor activities that would be ideal for these conditions"],
  "warnings": ["Any important weather-related warnings for mobile living (empty array if none)"],
  "overallRating": "One of: excellent, good, fair, caution, warning - based on conditions for nomadic living"
}`;

  try {
    const response = await generateText({ prompt });

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        headline: parsed.headline || "Weather Update",
        summary: parsed.summary || "Check conditions before heading out.",
        advice: parsed.advice || [],
        activitySuggestions: parsed.activitySuggestions || [],
        warnings: parsed.warnings || [],
        overallRating: parsed.overallRating || "good",
      };
    }

    // Fallback if parsing fails
    return generateFallbackOutlook(weather);
  } catch (error) {
    console.error("Error generating nomadic outlook:", error);
    return generateFallbackOutlook(weather);
  }
}

/**
 * Generate a fallback outlook when AI is unavailable
 */
function generateFallbackOutlook(weather: WeatherConditions): NomadicOutlook {
  const { temperature, windSpeed, condition, humidity } = weather;

  let headline = "Decent Day Ahead";
  let summary = "";
  const advice: string[] = [];
  const activitySuggestions: string[] = [];
  const warnings: string[] = [];
  let overallRating: NomadicOutlook["overallRating"] = "good";

  // Temperature-based advice
  if (temperature >= 75 && temperature <= 85) {
    headline = "Perfect Nomad Weather";
    summary = "Ideal conditions for outdoor activities and exploring.";
    overallRating = "excellent";
    activitySuggestions.push("Hiking", "Outdoor cooking");
  } else if (temperature > 90) {
    headline = "Hot Day Ahead";
    summary = "Stay hydrated and seek shade during peak hours.";
    advice.push("Park in shaded areas when possible");
    advice.push("Run your fans and consider finding higher elevation");
    overallRating = "caution";
  } else if (temperature < 40) {
    headline = "Chilly Conditions";
    summary = "Bundle up and ensure your heating system is ready.";
    advice.push("Check your propane levels");
    advice.push("Insulate windows if camping overnight");
    overallRating = "fair";
  }

  // Wind-based advice
  if (windSpeed > 25) {
    warnings.push("High winds expected—secure awnings and outdoor gear");
    headline = "Windy Conditions";
    overallRating = "caution";
  } else if (windSpeed > 15) {
    advice.push(
      "Moderate winds—good day for ventilation but secure loose items",
    );
  }

  // Condition-based advice
  if (condition === "clear" || condition === "sunny") {
    advice.push("Great day for solar charging");
    activitySuggestions.push("Stargazing tonight");
  } else if (condition === "rain" || condition === "storm") {
    warnings.push("Rain expected—check for leaks and low-lying areas");
    advice.push("Find level ground away from potential runoff");
    overallRating = condition === "storm" ? "warning" : "caution";
  }

  // Humidity advice
  if (humidity > 70) {
    advice.push(
      "High humidity—crack windows for ventilation to prevent condensation",
    );
  }

  // Default suggestions if empty
  if (activitySuggestions.length === 0) {
    activitySuggestions.push(
      "Explore local trails",
      "Visit nearby attractions",
    );
  }
  if (advice.length === 0) {
    advice.push("Check weather updates throughout the day");
  }

  if (!summary) {
    summary = `Current conditions are ${condition} with temps around ${temperature}°F. ${windSpeed > 10 ? "Some wind to be aware of." : "Calm conditions."}`;
  }

  return {
    headline,
    summary,
    advice: advice.slice(0, 4),
    activitySuggestions: activitySuggestions.slice(0, 3),
    warnings,
    overallRating,
  };
}

/**
 * Get a quick weather summary suitable for a HUD display
 */
export async function getQuickWeatherSummary(
  weather: WeatherConditions,
): Promise<string> {
  const prompt = `Based on these weather conditions, give a ONE sentence (max 15 words) friendly summary for a nomad:
Temperature: ${weather.temperature}°F, Feels like: ${weather.feelsLike}°F
Condition: ${weather.condition}, Wind: ${weather.windSpeed} mph
Example: "Perfect for a bonfire tonight, but high winds expected tomorrow—secure your awnings"
Just respond with the sentence, nothing else.`;

  try {
    const response = await generateText({ prompt });
    // Clean up the response
    return response.trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    console.log("Using fallback weather summary:", error);
    // Fallback summary
    if (weather.windSpeed > 20) {
      return "Windy conditions ahead—secure your awnings and outdoor gear.";
    }
    if (weather.temperature > 85) {
      return "Hot day ahead—find shade and stay hydrated.";
    }
    if (weather.condition === "rain" || weather.condition === "storm") {
      return "Wet weather coming—check for leaks and avoid low areas.";
    }
    if (weather.temperature >= 65 && weather.temperature <= 80) {
      return "Perfect weather for outdoor adventures today!";
    }
    return `${weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)} skies with temps around ${weather.temperature}°F.`;
  }
}

/**
 * Get rating color based on overall rating
 */
export function getOutlookRatingColor(
  rating: NomadicOutlook["overallRating"],
): string {
  switch (rating) {
    case "excellent":
      return "#4A6B50"; // Forest green
    case "good":
      return "#5A6658"; // Sage
    case "fair":
      return "#D97706"; // Amber
    case "caution":
      return "#E87A47"; // Orange
    case "warning":
      return "#DC2626"; // Red
    default:
      return "#6B7280"; // Gray
  }
}

/**
 * Get rating icon based on overall rating
 */
export function getOutlookRatingIcon(
  rating: NomadicOutlook["overallRating"],
): string {
  switch (rating) {
    case "excellent":
      return "sunny";
    case "good":
      return "partly-sunny";
    case "fair":
      return "cloudy";
    case "caution":
      return "alert-circle";
    case "warning":
      return "warning";
    default:
      return "help-circle";
  }
}

export default {
  generateNomadicOutlook,
  getQuickWeatherSummary,
  getOutlookRatingColor,
  getOutlookRatingIcon,
};
