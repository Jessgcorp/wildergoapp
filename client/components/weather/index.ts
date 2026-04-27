export { AnimatedWeatherIcon } from "./AnimatedWeatherIcons";
export { WeatherChangeAlert } from "./WeatherChangeAlert";
export { RouteWeatherTimeline } from "./RouteWeatherTimeline";
export {
  EventWeatherForecast,
  SevereWeatherBanner,
  WeatherAlertCard,
} from "./EventWeatherForecast";

export type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "stormy"
  | "windy"
  | "foggy"
  | "partlyCloudy"
  | "clear";
export type AlertSeverity = "info" | "warning" | "danger";

export interface WeatherChange {
  location: string;
  distance: string;
  currentCondition: WeatherCondition;
  upcomingCondition: WeatherCondition;
  severity: "low" | "medium" | "high";
}

export interface RouteWeatherPoint {
  time: string;
  location: string;
  condition: WeatherCondition;
  temperature: number;
  distance: string;
}

export type {
  HourlyForecast,
  EventWeatherData,
  EventWeatherImpact,
  WeatherAlert,
} from "./EventWeatherForecast";
