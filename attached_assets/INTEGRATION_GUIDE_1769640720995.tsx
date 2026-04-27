/* eslint-disable */
// INTEGRATION GUIDE FOR ANIMATED WEATHER COMPONENTS
// =================================================

import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { AnimatedWeatherIcon } from "./AnimatedWeatherIcons";
import { WeatherChangeAlert } from "./WeatherChangeAlert";
import { RouteWeatherTimeline } from "./RouteWeatherTimeline";

// EXAMPLE 1: Basic Animated Weather Icon Usage
// ---------------------------------------------
export const BasicWeatherIconExample = () => {
  return (
    <View style={styles.container}>
      {/* Single animated weather icon */}
      <AnimatedWeatherIcon condition="rainy" size={64} color="#FF6B35" />
    </View>
  );
};

// EXAMPLE 2: Weather Change Alert on Map Screen
// ----------------------------------------------
export const MapScreenWithWeatherAlerts = () => {
  const [showAlert, setShowAlert] = useState(true);

  // Example weather changes data
  const weatherChanges = [
    {
      location: "Near Denver, CO",
      distance: "45 miles",
      currentCondition: "sunny" as const,
      upcomingCondition: "stormy" as const,
      severity: "high" as const,
    },
    {
      location: "Colorado Springs",
      distance: "120 miles",
      currentCondition: "cloudy" as const,
      upcomingCondition: "snowy" as const,
      severity: "medium" as const,
    },
  ];

  return (
    <View style={styles.mapContainer}>
      {/* Your existing map component */}
      {/* ... */}

      {/* Weather change alert overlay */}
      <WeatherChangeAlert
        weatherChanges={weatherChanges}
        visible={showAlert}
        onDismiss={() => setShowAlert(false)}
      />
    </View>
  );
};

// EXAMPLE 3: Route Weather Timeline
// ----------------------------------
export const RouteScreenWithWeatherTimeline = () => {
  // Example route weather data
  const routeWeather = [
    {
      time: "2:00 PM",
      location: "Moab, UT",
      condition: "sunny" as const,
      temperature: 75,
      distance: "Start",
    },
    {
      time: "4:30 PM",
      location: "Green River",
      condition: "cloudy" as const,
      temperature: 68,
      distance: "52 mi",
    },
    {
      time: "6:45 PM",
      location: "Price",
      condition: "rainy" as const,
      temperature: 58,
      distance: "115 mi",
    },
    {
      time: "8:30 PM",
      location: "Spanish Fork",
      condition: "stormy" as const,
      temperature: 52,
      distance: "178 mi",
    },
    {
      time: "10:00 PM",
      location: "Salt Lake City",
      condition: "cloudy" as const,
      temperature: 55,
      distance: "232 mi",
    },
  ];

  return (
    <View style={styles.routeContainer}>
      <RouteWeatherTimeline weatherPoints={routeWeather} />
    </View>
  );
};

// EXAMPLE 4: Integrating into Existing Map Tab
// ---------------------------------------------
export const IntegratedMapTabExample = () => {
  const [currentWeather, setCurrentWeather] = useState<
    "sunny" | "rainy" | "stormy"
  >("sunny");
  const [weatherAlerts, setWeatherAlerts] = useState([]);

  // Simulating real-time weather updates
  useEffect(() => {
    // Your weather API call here
    const fetchWeatherData = async () => {
      // const data = await weatherAPI.getRouteWeather(route);
      // setWeatherAlerts(data.alerts);
      // setCurrentWeather(data.current);
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.fullScreen}>
      {/* Current location weather icon */}
      <View style={styles.currentWeatherBadge}>
        <AnimatedWeatherIcon
          condition={currentWeather}
          size={32}
          color="#FF6B35"
        />
      </View>

      {/* Map component */}
      {/* <MapView ... /> */}

      {/* Weather alerts */}
      <WeatherChangeAlert
        weatherChanges={weatherAlerts}
        visible={weatherAlerts.length > 0}
        onDismiss={() => setWeatherAlerts([])}
      />
    </View>
  );
};

// EXAMPLE 5: Weather Conditions Reference
// ----------------------------------------
export const ALL_WEATHER_CONDITIONS = {
  sunny: {
    animation: "Rotating sun",
    useCase: "Clear skies",
    color: "#FFD700",
  },
  cloudy: {
    animation: "Floating clouds",
    useCase: "Overcast",
    color: "#B0B0B0",
  },
  rainy: {
    animation: "Pulsing rain",
    useCase: "Rain showers",
    color: "#4A90E2",
  },
  snowy: {
    animation: "Gentle falling snow",
    useCase: "Snow conditions",
    color: "#E8F4F8",
  },
  stormy: {
    animation: "Intense shaking",
    useCase: "Thunderstorms",
    color: "#5A5A5A",
  },
  windy: {
    animation: "Swaying motion",
    useCase: "High winds",
    color: "#87CEEB",
  },
  foggy: {
    animation: "Fade in/out",
    useCase: "Low visibility",
    color: "#D3D3D3",
  },
};

// STYLING
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5EFE6",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#F5EFE6",
  },
  routeContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5EFE6",
  },
  fullScreen: {
    flex: 1,
    backgroundColor: "#F5EFE6",
  },
  currentWeatherBadge: {
    position: "absolute",
    top: 80,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 50,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
});

// INSTALLATION NOTES:
// -------------------
// 1. Copy all three component files to your project:
//    - AnimatedWeatherIcons.tsx
//    - WeatherChangeAlert.tsx
//    - RouteWeatherTimeline.tsx
//
// 2. Make sure you have @expo/vector-icons installed:
//    npm install @expo/vector-icons
//
// 3. Import the components you need in your Map screen
//
// 4. Connect to your weather API to get real-time data
//
// 5. Customize colors to match your brand (currently using #FF6B35 burnt sienna)

// API INTEGRATION EXAMPLE:
// ------------------------
/*
const getRouteWeather = async (routeCoordinates) => {
  try {
    // Replace with your actual weather API
    const response = await fetch(
      `https://api.weather.com/route?coords=${routeCoordinates}&apikey=${API_KEY}`
    );
    const data = await response.json();
    
    return {
      current: data.currentCondition,
      alerts: data.upcomingChanges.map(change => ({
        location: change.locationName,
        distance: `${change.distanceMiles} miles`,
        currentCondition: change.from,
        upcomingCondition: change.to,
        severity: change.severity,
      })),
      timeline: data.hourlyForecast.map(hour => ({
        time: hour.time,
        location: hour.location,
        condition: hour.condition,
        temperature: hour.temp,
        distance: hour.distanceFromStart,
      })),
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
};
*/
