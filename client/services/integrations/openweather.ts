/**
 * OpenWeather Integration Stub
 * Live weather data for routes and locations
 *
 * To activate:
 * 1. Get API key from https://openweathermap.org/api
 * 2. Set OPENWEATHER_API_KEY in environment
 */

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  condition:
    | "clear"
    | "clouds"
    | "rain"
    | "snow"
    | "thunderstorm"
    | "fog"
    | "mist";
  description: string;
  icon: string;
  uvIndex?: number;
  visibility?: number;
  pressure?: number;
  sunrise?: Date;
  sunset?: Date;
}

export interface WeatherForecast {
  date: Date;
  high: number;
  low: number;
  condition: WeatherData["condition"];
  precipitationChance: number;
}

export interface WeatherAlert {
  id: string;
  type: "warning" | "watch" | "advisory";
  severity: "minor" | "moderate" | "severe" | "extreme";
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  areas: string[];
}

export interface RouteWeather {
  waypoint: { latitude: number; longitude: number; name: string };
  weather: WeatherData;
  estimatedArrival: Date;
}

let apiKey = "";

export const OpenWeatherService = {
  initialize: (key: string) => {
    apiKey = key;
    console.log("[OpenWeather] Initialized");
    return true;
  },

  isConfigured: () => !!apiKey,

  getCurrentWeather: async (
    latitude: number,
    longitude: number,
  ): Promise<WeatherData> => {
    console.log("[OpenWeather] Fetching current weather for:", {
      latitude,
      longitude,
    });
    return {
      location: "Moab, UT",
      temperature: 78,
      feelsLike: 80,
      humidity: 25,
      windSpeed: 8,
      windDirection: 225,
      condition: "clear",
      description: "Sunny with light breeze",
      icon: "sunny",
      uvIndex: 7,
      visibility: 10,
      pressure: 1015,
    };
  },

  getForecast: async (
    latitude: number,
    longitude: number,
    days: number = 5,
  ): Promise<WeatherForecast[]> => {
    console.log("[OpenWeather] Fetching forecast for:", {
      latitude,
      longitude,
      days,
    });
    const forecasts: WeatherForecast[] = [
      {
        date: new Date(),
        high: 82,
        low: 58,
        condition: "clear" as const,
        precipitationChance: 5,
      },
      {
        date: new Date(Date.now() + 86400000),
        high: 79,
        low: 55,
        condition: "clouds" as const,
        precipitationChance: 20,
      },
      {
        date: new Date(Date.now() + 172800000),
        high: 75,
        low: 52,
        condition: "rain" as const,
        precipitationChance: 60,
      },
      {
        date: new Date(Date.now() + 259200000),
        high: 70,
        low: 48,
        condition: "thunderstorm" as const,
        precipitationChance: 80,
      },
      {
        date: new Date(Date.now() + 345600000),
        high: 76,
        low: 51,
        condition: "clear" as const,
        precipitationChance: 10,
      },
    ];
    return forecasts.slice(0, days);
  },

  getAlerts: async (
    latitude: number,
    longitude: number,
  ): Promise<WeatherAlert[]> => {
    console.log("[OpenWeather] Checking alerts for:", { latitude, longitude });
    return [];
  },

  getRouteWeather: async (
    route: { latitude: number; longitude: number; name: string }[],
  ): Promise<RouteWeather[]> => {
    console.log(
      "[OpenWeather] Fetching route weather for",
      route.length,
      "waypoints",
    );
    return route.map((waypoint, index) => ({
      waypoint,
      weather: {
        location: waypoint.name,
        temperature: 78 - index * 3,
        feelsLike: 80 - index * 3,
        humidity: 25 + index * 5,
        windSpeed: 8 + index * 2,
        windDirection: 225,
        condition: index < 2 ? "clear" : index < 4 ? "clouds" : "rain",
        description: "Weather along route",
        icon: "sunny",
      },
      estimatedArrival: new Date(Date.now() + index * 3600000),
    }));
  },

  checkRouteSafety: async (
    route: { latitude: number; longitude: number }[],
  ): Promise<{ safe: boolean; warnings: string[] }> => {
    console.log("[OpenWeather] Checking route safety");
    return { safe: true, warnings: [] };
  },
};
