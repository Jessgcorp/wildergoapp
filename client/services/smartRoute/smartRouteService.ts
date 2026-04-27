import { getRoute, decodePolyline, geocodeAddress } from "../map/mapService";
import { getRouteWeather, WeatherData } from "../weather/weatherService";
import {
  getRoadRisk,
  RoadRiskData,
  NationalAlert,
  getRoadRiskSummary,
  RoadRiskSummary,
} from "../weather/roadRiskService";

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

type LocationInput = string | RouteCoordinate;

interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

interface SafetyAnalysis {
  level: "safe" | "caution" | "warning";
  warnings: string[];
  recommendations: string[];
  score: number;
}

interface RoadRiskInfo {
  riskLevel: "low" | "moderate" | "high" | "extreme";
  riskScore: number;
  hasBlackIce: boolean;
  hasPrecipitation: boolean;
  nationalAlerts: NationalAlert[];
  roadWarnings: string[];
  summary: RoadRiskSummary;
}

interface SmartRouteWeather {
  start: WeatherData;
  middle: WeatherData;
  end: WeatherData;
  overall: string;
}

export interface SmartRouteData {
  success: boolean;
  distance?: string;
  duration?: string;
  startAddress?: string;
  endAddress?: string;
  coordinates?: RouteCoordinate[];
  polyline?: string;
  steps?: RouteStep[];
  weather?: SmartRouteWeather;
  safety?: SafetyAnalysis;
  roadRisk?: RoadRiskInfo;
  generatedAt?: string;
  aiOptimized?: boolean;
  error?: string;
}

export interface SmartRouteDisplay {
  title: string;
  subtitle: string;
  safetyColor: string;
  safetyText: string;
  weatherIcon: string;
  temperature: string;
  warnings: string[];
  recommendations: string[];
}

const resolveLocation = async (
  location: LocationInput,
): Promise<RouteCoordinate | null> => {
  if (typeof location === "string") {
    const geocodeResult = await geocodeAddress(location);
    if (
      geocodeResult.success &&
      geocodeResult.latitude &&
      geocodeResult.longitude
    ) {
      return {
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
      };
    }
    return null;
  }
  return location;
};

export const getSmartRoute = async (
  origin: LocationInput,
  destination: LocationInput,
): Promise<SmartRouteData> => {
  try {
    console.log("Getting Smart Route...");

    const originCoords = await resolveLocation(origin);
    const destCoords = await resolveLocation(destination);

    if (!originCoords || !destCoords) {
      return {
        success: false,
        error: "Could not geocode origin or destination address",
      };
    }

    console.log("Fetching route...");
    const routeData = await getRoute(originCoords, destCoords);

    if (!routeData.success) {
      return {
        success: false,
        error: "Could not calculate route: " + routeData.error,
      };
    }

    console.log("Decoding route coordinates...");
    const routeCoordinates = decodePolyline(routeData.polyline || "");

    console.log("Fetching weather data...");
    const weatherData = await getRouteWeather(routeCoordinates);

    if (!weatherData.success) {
      return {
        success: false,
        error: "Could not get weather: " + weatherData.error,
      };
    }

    console.log("Fetching road risk data...");
    const durationMinutes = parseDurationToMinutes(
      routeData.duration || "60 min",
    );
    const roadRiskData = await getRoadRisk(routeCoordinates, durationMinutes);

    const roadRiskInfo = processRoadRiskData(roadRiskData);
    const safety = analyzeRouteSafety(weatherData, roadRiskData);

    const smartRoute: SmartRouteData = {
      success: true,
      distance: routeData.distance,
      duration: routeData.duration,
      startAddress: routeData.startAddress,
      endAddress: routeData.endAddress,
      coordinates: routeCoordinates,
      polyline: routeData.polyline,
      steps: routeData.steps,
      weather: {
        start: weatherData.start!,
        middle: weatherData.middle!,
        end: weatherData.end!,
        overall: weatherData.overallCondition || "Clear",
      },
      safety: safety,
      roadRisk: roadRiskInfo,
      generatedAt: new Date().toISOString(),
      aiOptimized: true,
    };

    console.log("Smart Route generated successfully!");
    return smartRoute;
  } catch (error: any) {
    console.error("Smart Route error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const parseDurationToMinutes = (duration: string): number => {
  const hourMatch = duration.match(/(\d+)\s*hour/i);
  const minMatch = duration.match(/(\d+)\s*min/i);

  let minutes = 0;
  if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
  if (minMatch) minutes += parseInt(minMatch[1]);

  return minutes || 60;
};

const processRoadRiskData = (roadRiskData: RoadRiskData): RoadRiskInfo => {
  const summary = getRoadRiskSummary(roadRiskData);

  return {
    riskLevel: roadRiskData.overallRiskLevel,
    riskScore: roadRiskData.riskScore,
    hasBlackIce: summary.hasBlackIce,
    hasPrecipitation: summary.hasPrecipitation,
    nationalAlerts: roadRiskData.alerts,
    roadWarnings: roadRiskData.warnings,
    summary,
  };
};

const analyzeRouteSafety = (
  weatherData: any,
  roadRiskData?: RoadRiskData,
): SafetyAnalysis => {
  const { start, middle, end, overallCondition } = weatherData;

  let safetyLevel: "safe" | "caution" | "warning" = "safe";
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (overallCondition === "Thunderstorm" || overallCondition === "Tornado") {
    safetyLevel = "warning";
    warnings.push("Severe weather along route");
    recommendations.push("Consider delaying trip");
  } else if (overallCondition === "Snow") {
    safetyLevel = "caution";
    warnings.push("Snowy conditions expected");
    recommendations.push("Check road conditions before departing");
    recommendations.push("Ensure vehicle is winter-ready");
  } else if (overallCondition === "Rain") {
    safetyLevel = "caution";
    warnings.push("Rainy conditions along route");
    recommendations.push("Drive carefully on wet roads");
  }

  const winds = [
    start?.windSpeed || 0,
    middle?.windSpeed || 0,
    end?.windSpeed || 0,
  ];
  const maxWind = Math.max(...winds);
  if (maxWind > 25) {
    safetyLevel = safetyLevel === "safe" ? "caution" : safetyLevel;
    warnings.push(`High winds up to ${maxWind} mph`);
    recommendations.push("Secure loose items on vehicle");
  }

  const temps = [
    start?.temperature || 70,
    middle?.temperature || 70,
    end?.temperature || 70,
  ];
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  if (minTemp < 32) {
    warnings.push("Freezing temperatures possible");
    recommendations.push("Watch for ice on roads");
  }

  if (maxTemp > 95) {
    warnings.push("High temperatures expected");
    recommendations.push("Stay hydrated, check engine cooling");
  }

  if (roadRiskData && roadRiskData.success) {
    const summary = getRoadRiskSummary(roadRiskData);

    if (summary.hasBlackIce) {
      safetyLevel = "warning";
      warnings.push("BLACK ICE detected along route");
      recommendations.push(
        "Reduce speed significantly on bridges and overpasses",
      );
      recommendations.push("Avoid sudden braking or steering");
    }

    if (roadRiskData.alerts.length > 0) {
      const severeAlerts = roadRiskData.alerts.filter(
        (a) => a.severity === "Severe" || a.severity === "Extreme",
      );

      if (severeAlerts.length > 0) {
        safetyLevel = "warning";
        severeAlerts.forEach((alert) => {
          warnings.push(`${alert.severity.toUpperCase()}: ${alert.event}`);
        });
        recommendations.push("Monitor official weather channels");
        recommendations.push("Have emergency supplies ready");
      }

      const advisories = roadRiskData.alerts.filter(
        (a) => a.severity === "Minor" || a.severity === "Moderate",
      );
      advisories.forEach((alert) => {
        if (!warnings.includes(alert.event)) {
          warnings.push(`Advisory: ${alert.event}`);
        }
      });
    }

    if (summary.avgVisibility < 3000) {
      safetyLevel = safetyLevel === "safe" ? "caution" : safetyLevel;
      warnings.push("Low visibility conditions");
      recommendations.push("Use fog lights if available");
    }

    roadRiskData.warnings.forEach((warning) => {
      if (!warnings.some((w) => w.includes(warning.split(" ")[0]))) {
        warnings.push(warning);
      }
    });
  }

  if (warnings.length === 0) {
    recommendations.push(
      "Weather and road conditions are favorable for travel",
    );
  }

  let score = 100;
  if (safetyLevel === "warning") score = 40;
  else if (safetyLevel === "caution") score = 70;

  if (roadRiskData && roadRiskData.success) {
    score = Math.min(score, roadRiskData.riskScore);
  }

  return {
    level: safetyLevel,
    warnings: warnings,
    recommendations: recommendations,
    score: score,
  };
};

export const createSmartRouteForEvent = async (
  eventId: string,
  origin: LocationInput,
  destination: LocationInput,
): Promise<SmartRouteData> => {
  try {
    const smartRoute = await getSmartRoute(origin, destination);

    if (!smartRoute.success) {
      return smartRoute;
    }

    return smartRoute;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const formatSmartRouteDisplay = (
  smartRoute: SmartRouteData,
): SmartRouteDisplay | null => {
  if (!smartRoute || !smartRoute.success) {
    return null;
  }

  return {
    title: `${smartRoute.distance} • ${smartRoute.duration}`,
    subtitle: smartRoute.weather?.overall || "Clear",
    safetyColor:
      smartRoute.safety?.level === "safe"
        ? "#2D5A3D"
        : smartRoute.safety?.level === "caution"
          ? "#F2A154"
          : "#D94848",
    safetyText: (smartRoute.safety?.level || "safe").toUpperCase(),
    weatherIcon: smartRoute.weather?.start?.icon || "01d",
    temperature: `${smartRoute.weather?.start?.temperature || "--"}°F`,
    warnings: smartRoute.safety?.warnings || [],
    recommendations: smartRoute.safety?.recommendations || [],
  };
};
