const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

if (!OPENWEATHER_API_KEY) {
  console.warn(
    "[WeatherService] EXPO_PUBLIC_OPENWEATHER_API_KEY is not set - weather features will not work",
  );
}

export interface WeatherData {
  success: boolean;
  temperature?: number;
  feelsLike?: number;
  condition?: string;
  description?: string;
  icon?: string;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  visibility?: number;
  cloudCover?: number;
  sunrise?: Date;
  sunset?: Date;
  error?: string;
}

export interface ForecastDay {
  date: string;
  temperature: number;
  tempMin?: number;
  tempMax?: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rain: number;
}

export interface HourlyForecast {
  time: string;
  hour: number;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface HourlyForecastData {
  success: boolean;
  hourly?: HourlyForecast[];
  error?: string;
}

export interface DetailedForecastData {
  success: boolean;
  current?: WeatherData;
  hourly?: HourlyForecast[];
  daily?: ForecastDay[];
  locationName?: string;
  error?: string;
}

export interface ForecastData {
  success: boolean;
  forecasts?: ForecastDay[];
  error?: string;
}

export interface WeatherAlert {
  type: "warning" | "advisory";
  title: string;
  description: string;
}

export interface AlertsData {
  success: boolean;
  alerts?: WeatherAlert[];
  currentWeather?: WeatherData;
  error?: string;
}

export interface RouteWeatherData {
  success: boolean;
  start?: WeatherData;
  middle?: WeatherData;
  end?: WeatherData;
  overallCondition?: string;
  error?: string;
}

export const getCurrentWeather = async (
  latitude: number,
  longitude: number,
): Promise<WeatherData> => {
  try {
    if (!OPENWEATHER_API_KEY) {
      return { success: false, error: "OpenWeather API key not configured" };
    }
    const url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=imperial`;
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Weather unavailable (${response.status})`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      windDirection: data.wind.deg,
      visibility: data.visibility,
      cloudCover: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
    };
  } catch (error: any) {
    console.log("Weather fetch issue:", error?.message?.substring(0, 60));
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getForecast = async (
  latitude: number,
  longitude: number,
): Promise<ForecastData> => {
  try {
    if (!OPENWEATHER_API_KEY) {
      return { success: false, error: "OpenWeather API key not configured" };
    }
    const url = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=imperial`;
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Forecast unavailable (${response.status})`,
      };
    }

    const data = await response.json();

    const dailyForecasts: ForecastDay[] = [];
    const days: { [key: string]: any[] } = {};

    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!days[date]) {
        days[date] = [];
      }
      days[date].push(item);
    });

    Object.keys(days).forEach((date) => {
      const dayData = days[date];
      const noonIndex = Math.floor(dayData.length / 2);
      const forecast = dayData[noonIndex];

      dailyForecasts.push({
        date: date,
        temperature: Math.round(forecast.main.temp),
        condition: forecast.weather[0].main,
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon,
        humidity: forecast.main.humidity,
        windSpeed: Math.round(forecast.wind.speed),
        rain: forecast.rain ? forecast.rain["3h"] : 0,
      });
    });

    return {
      success: true,
      forecasts: dailyForecasts.slice(0, 5),
    };
  } catch (error: any) {
    console.log("Forecast fetch issue:", error?.message?.substring(0, 60));
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getWeatherAlerts = async (
  latitude: number,
  longitude: number,
): Promise<AlertsData> => {
  try {
    const weather = await getCurrentWeather(latitude, longitude);

    if (!weather.success) return { success: false, error: weather.error };

    const alerts: WeatherAlert[] = [];

    if (weather.condition === "Thunderstorm") {
      alerts.push({
        type: "warning",
        title: "Thunderstorm Warning",
        description: "Thunderstorms in the area. Exercise caution.",
      });
    }

    if (weather.condition === "Snow") {
      alerts.push({
        type: "advisory",
        title: "Snow Advisory",
        description: "Snowy conditions. Roads may be slippery.",
      });
    }

    if (weather.windSpeed && weather.windSpeed > 25) {
      alerts.push({
        type: "advisory",
        title: "High Wind Advisory",
        description: `Wind speeds reaching ${weather.windSpeed} mph.`,
      });
    }

    return {
      success: true,
      alerts: alerts,
      currentWeather: weather,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export const getRouteWeather = async (
  routeCoordinates: RouteCoordinate[],
): Promise<RouteWeatherData> => {
  try {
    if (!routeCoordinates || routeCoordinates.length < 2) {
      return { success: false, error: "Invalid route coordinates" };
    }

    const startPoint = routeCoordinates[0];
    const middlePoint =
      routeCoordinates[Math.floor(routeCoordinates.length / 2)];
    const endPoint = routeCoordinates[routeCoordinates.length - 1];

    const [startWeather, middleWeather, endWeather] = await Promise.all([
      getCurrentWeather(startPoint.latitude, startPoint.longitude),
      getCurrentWeather(middlePoint.latitude, middlePoint.longitude),
      getCurrentWeather(endPoint.latitude, endPoint.longitude),
    ]);

    return {
      success: true,
      start: startWeather,
      middle: middleWeather,
      end: endWeather,
      overallCondition: getMostSevereCondition([
        startWeather.condition || "Clear",
        middleWeather.condition || "Clear",
        endWeather.condition || "Clear",
      ]),
    };
  } catch (error: any) {
    console.log("Route weather fetch issue:", error?.message?.substring(0, 60));
    return {
      success: false,
      error: error.message,
    };
  }
};

const getMostSevereCondition = (conditions: string[]): string => {
  const severity: { [key: string]: number } = {
    Thunderstorm: 5,
    Tornado: 5,
    Snow: 4,
    Rain: 3,
    Drizzle: 2,
    Clouds: 1,
    Clear: 0,
  };

  let mostSevere = "Clear";
  let highestSeverity = 0;

  conditions.forEach((condition) => {
    const level = severity[condition] || 0;
    if (level > highestSeverity) {
      highestSeverity = level;
      mostSevere = condition;
    }
  });

  return mostSevere;
};

export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export const getWindDirection = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const getDetailedForecast = async (
  latitude: number,
  longitude: number,
): Promise<DetailedForecastData> => {
  try {
    if (!OPENWEATHER_API_KEY) {
      return { success: false, error: "OpenWeather API key not configured" };
    }
    const forecastUrl = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=imperial`;

    const [currentWeather, forecastResponse] = await Promise.all([
      getCurrentWeather(latitude, longitude),
      fetch(forecastUrl),
    ]);

    if (!forecastResponse.ok) {
      return {
        success: false,
        error: `Forecast unavailable (${forecastResponse.status})`,
      };
    }

    const forecastData = await forecastResponse.json();
    const locationName = forecastData.city?.name || "Current Location";

    const hourlyForecasts: HourlyForecast[] = forecastData.list
      .slice(0, 12)
      .map((item: any) => {
        const date = new Date(item.dt * 1000);
        return {
          time: date.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          }),
          hour: date.getHours(),
          temperature: Math.round(item.main.temp),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed),
          precipitation: item.pop ? Math.round(item.pop * 100) : 0,
        };
      });

    const dailyMap: { [key: string]: any[] } = {};
    forecastData.list.forEach((item: any) => {
      const dateKey = new Date(item.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = [];
      }
      dailyMap[dateKey].push(item);
    });

    const dailyForecasts: ForecastDay[] = Object.entries(dailyMap)
      .slice(0, 5)
      .map(([date, items]) => {
        const temps = items.map((i: any) => i.main.temp);
        const midItem = items[Math.floor(items.length / 2)];

        return {
          date,
          temperature: Math.round(midItem.main.temp),
          tempMin: Math.round(Math.min(...temps)),
          tempMax: Math.round(Math.max(...temps)),
          condition: midItem.weather[0].main,
          description: midItem.weather[0].description,
          icon: midItem.weather[0].icon,
          humidity: midItem.main.humidity,
          windSpeed: Math.round(midItem.wind.speed),
          rain: midItem.rain ? midItem.rain["3h"] || 0 : 0,
        };
      });

    return {
      success: true,
      current: currentWeather.success ? currentWeather : undefined,
      hourly: hourlyForecasts,
      daily: dailyForecasts,
      locationName,
    };
  } catch (error: any) {
    console.log(
      "Detailed forecast fetch issue:",
      error?.message?.substring(0, 60),
    );
    return {
      success: false,
      error: error.message,
    };
  }
};
