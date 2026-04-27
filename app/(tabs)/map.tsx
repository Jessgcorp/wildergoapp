import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import { NativeMap } from "@/components/map/NativeMap";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  eventImages,
  mapboxConfig,
  markerTypes,
} from "@/constants/theme";
import { ModeToggle, AppMode } from "@/components/ui/ModeToggle";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { NatureBackground } from "@/components/ui/NatureBackground";
import { Logo } from "@/components/ui/Logo";
import { MapMarker } from "@/components/map/MapMarker";
import { MapControls } from "@/components/map/MapControls";
import { MapSocialSheet } from "@/components/map/MapSocialSheet";
import { AIRoutePlanner } from "@/components/map/AIRoutePlanner";
import { SmartRouteWeather } from "@/components/map/SmartRouteWeather";
import { SmartRouteScreen } from "@/components/map/SmartRouteScreen";
import {
  GhostModeMarker,
  GhostModeIndicator,
} from "@/components/map/GhostModeMarker";
import { LookAheadRadar } from "@/components/radar/LookAheadRadar";
import { NotificationBanner } from "@/components/radar/RouteOverlapNotifications";
import { EnhancedWeatherHUD } from "@/components/map/EnhancedWeatherHUD";
import {
  DynamicWeatherOverlay,
  WeatherOverlayData,
} from "@/components/map/DynamicWeatherOverlay";
import {
  WeatherChangeAlert,
  RouteWeatherTimeline,
  WeatherChange,
  RouteWeatherPoint,
} from "@/components/weather";
import { WeatherDetailModal } from "@/components/weather/WeatherDetailModal";
import {
  EnhancedCampfireMarker,
  ClusterVibeSheet,
  useEnhancedClustering,
  EnhancedCluster,
} from "@/components/map/EnhancedCampfireCluster";
import { useGhostMode, useMode } from "@/contexts/ModeContext";
import {
  radarService,
  RouteOverlapNotification,
} from "@/services/radar/radarService";
import {
  mapService,
  MapMarkerData,
  SmartRouteSuggestion,
} from "@/services/map/mapService";
import { getWeatherForLocation } from "@/services/map/advancedMapService";
import { getCurrentWeather } from "@/services/weather/weatherService";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ActivityEvent {
  id: string;
  title: string;
  type: "social" | "activity" | "convoy";
  attendees: number;
  maxAttendees?: number;
  host: string;
  time: string;
  location: string;
  imageUrl?: string;
  description?: string;
}

// Helper to map weather condition strings to overlay types
function mapWeatherCondition(
  condition: string,
): WeatherOverlayData["condition"] {
  const lower = condition.toLowerCase();
  if (lower.includes("storm") || lower.includes("thunder")) return "storm";
  if (lower.includes("rain") || lower.includes("shower")) return "rain";
  if (lower.includes("snow") || lower.includes("sleet")) return "snow";
  if (lower.includes("fog") || lower.includes("mist")) return "fog";
  if (lower.includes("wind") || lower.includes("gust")) return "windy";
  if (lower.includes("cloud") || lower.includes("overcast")) return "cloudy";
  return "clear";
}

function getWindDirectionString(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

const nearbyEvents: ActivityEvent[] = [
  {
    id: "1",
    title: "Sunset Bonfire",
    type: "social",
    attendees: 12,
    maxAttendees: 20,
    host: "Alex",
    time: "Tonight at 7pm",
    location: "Moab Desert Overlook",
    imageUrl: eventImages.bonfire,
    description:
      "Join us for an evening under the stars with good company and warm vibes.",
  },
  {
    id: "2",
    title: "Climbing Partner Needed",
    type: "activity",
    attendees: 3,
    host: "Jordan",
    time: "Tomorrow 6am",
    location: "Red Rock Canyon",
    imageUrl: eventImages.climbing,
    description:
      "Looking for experienced climbers to tackle the Fisher Towers.",
  },
  {
    id: "3",
    title: "Morning Hike",
    type: "activity",
    attendees: 8,
    host: "Sam",
    time: "Saturday 5am",
    location: "Delicate Arch Trail",
    imageUrl: eventImages.hiking,
  },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { mode: globalMode, setMode, setPremium } = useMode();
  const [activeMode, setActiveMode] = useState<AppMode>(globalMode);
  const [showEvents, setShowEvents] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(
    null,
  );
  const [sheetVisible, setSheetVisible] = useState(false);
  const [routePlannerVisible, setRoutePlannerVisible] = useState(false);
  const [lookAheadVisible, setLookAheadVisible] = useState(false);
  const [markers, setMarkers] = useState<MapMarkerData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [routeOverlapNotification, setRouteOverlapNotification] =
    useState<RouteOverlapNotification | null>(null);
  const [showWeatherOverlay] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherOverlayData | null>(
    null,
  );
  const [selectedCluster, setSelectedCluster] =
    useState<EnhancedCluster | null>(null);
  const [clusterSheetVisible, setClusterSheetVisible] = useState(false);
  const [weatherChanges, setWeatherChanges] = useState<WeatherChange[]>([]);
  const [routeWeatherPoints, setRouteWeatherPoints] = useState<
    RouteWeatherPoint[]
  >([]);
  const [showWeatherAlerts, setShowWeatherAlerts] = useState(true);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [alertsShownOnce, setAlertsShownOnce] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeSmartRoute, setActiveSmartRoute] =
    useState<SmartRouteSuggestion | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] =
    useState<Location.PermissionStatus | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [liveWeather, setLiveWeather] = useState<{
    temperature: number;
    condition: string;
    description: string;
  } | null>(null);
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [droppedPins, setDroppedPins] = useState<
    { id: string; latitude: number; longitude: number; title: string }[]
  >([]);
  const [showSmartRouteScreen, setShowSmartRouteScreen] = useState(false);

  // Ghost mode state from context
  const { isGhostMode, toggleGhostMode, isPremium } = useGhostMode();

  // Map reference
  const mapRef = useRef<MapView>(null);

  // Map region state
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: mapboxConfig.defaultCenter.latitude,
    longitude: mapboxConfig.defaultCenter.longitude,
    latitudeDelta: 2.5,
    longitudeDelta: 2.5,
  });

  // Current user position (center of map for demo)
  const currentUserPosition = {
    top: "45%" as `${number}%`,
    left: "45%" as `${number}%`,
  };

  // Default map center coordinates
  const mapCenter = {
    latitude: mapboxConfig.defaultCenter.latitude,
    longitude: mapboxConfig.defaultCenter.longitude,
  };

  // Enhanced clustering for campfire markers
  const { clusters, unclustered } = useEnhancedClustering(markers, 14);

  // Request location permission on mount
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermission(status);

        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error("Error checking location permission:", error);
      }
    };

    checkLocationPermission();
  }, []);

  // Fetch live weather when user location changes
  useEffect(() => {
    const fetchLiveWeather = async () => {
      const locationToUse = userLocation || mapCenter;
      try {
        const weather = await getCurrentWeather(
          locationToUse.latitude,
          locationToUse.longitude,
        );
        if (weather.success) {
          setLiveWeather({
            temperature: weather.temperature || 0,
            condition: weather.condition || "Clear",
            description: weather.description || "clear sky",
          });

          const overlayData: WeatherOverlayData = {
            windSpeed: weather.windSpeed || 0,
            windDirection: getWindDirectionString(weather.windDirection || 0),
            condition: mapWeatherCondition(weather.condition || "clear"),
            stormCells: [],
          };
          setWeatherData(overlayData);
        } else {
          console.warn("Weather API returned error:", weather.error);
          if (!liveWeather) {
            setLiveWeather({
              temperature: 0,
              condition: "Clear",
              description: "Weather unavailable",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching live weather:", error);
        if (!liveWeather) {
          setLiveWeather({
            temperature: 0,
            condition: "Clear",
            description: "Weather unavailable",
          });
        }
      }
    };

    fetchLiveWeather();
    const weatherInterval = setInterval(fetchLiveWeather, 5 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, [userLocation]);

  // Load route overlap notifications
  useEffect(() => {
    // Mock user ID for demo - in real app would come from auth context
    const currentUserId = "current-user";
    const notifications =
      radarService.getRouteOverlapNotifications(currentUserId);
    if (notifications.length > 0) {
      // Show the highest priority notification
      setRouteOverlapNotification(notifications[0]);
    }
  }, []);

  // Initialize route weather data for demo
  useEffect(() => {
    const demoWeatherChanges: WeatherChange[] = [
      {
        location: "Near Denver, CO",
        distance: "45 miles",
        currentCondition: "sunny",
        upcomingCondition: "stormy",
        severity: "high",
      },
      {
        location: "Colorado Springs",
        distance: "120 miles",
        currentCondition: "cloudy",
        upcomingCondition: "snowy",
        severity: "medium",
      },
    ];

    const demoRouteWeather: RouteWeatherPoint[] = [
      {
        time: "2:00 PM",
        location: "Moab, UT",
        condition: "sunny",
        temperature: 75,
        distance: "Start",
      },
      {
        time: "4:30 PM",
        location: "Green River",
        condition: "cloudy",
        temperature: 68,
        distance: "52 mi",
      },
      {
        time: "6:45 PM",
        location: "Price",
        condition: "rainy",
        temperature: 58,
        distance: "115 mi",
      },
      {
        time: "8:30 PM",
        location: "Spanish Fork",
        condition: "stormy",
        temperature: 52,
        distance: "178 mi",
      },
      {
        time: "10:00 PM",
        location: "Salt Lake City",
        condition: "cloudy",
        temperature: 55,
        distance: "232 mi",
      },
    ];

    setWeatherChanges(demoWeatherChanges);
    setRouteWeatherPoints(demoRouteWeather);
  }, []);

  // Auto-dismiss and rotate weather alerts - show only ONE at a time
  useEffect(() => {
    if (weatherChanges.length > 0 && showWeatherAlerts && !alertsShownOnce) {
      const dismissTimer = setTimeout(() => {
        const nextIndex = currentAlertIndex + 1;
        if (nextIndex >= weatherChanges.length) {
          // We've shown all alerts, stop showing
          setShowWeatherAlerts(false);
          setAlertsShownOnce(true);
          setCurrentAlertIndex(0);
        } else {
          // Show next alert
          setCurrentAlertIndex(nextIndex);
        }
      }, 8000); // Show each alert for 8 seconds

      return () => clearTimeout(dismissTimer);
    }
  }, [
    showWeatherAlerts,
    currentAlertIndex,
    weatherChanges.length,
    alertsShownOnce,
  ]);

  // Load markers based on active mode
  useEffect(() => {
    const filteredMarkers = mapService.getMarkersForMode(activeMode);
    setMarkers(filteredMarkers);
  }, [activeMode]);

  // Load weather data for overlay
  useEffect(() => {
    const loadWeather = () => {
      try {
        const weather = getWeatherForLocation(
          mapCenter.latitude,
          mapCenter.longitude,
        );
        if (weather) {
          // Convert to overlay format
          const overlayData: WeatherOverlayData = {
            windSpeed: weather.windSpeed || 0,
            windDirection: weather.windDirection || "N",
            condition: mapWeatherCondition(weather.condition || "clear"),
            // Storm cells would come from weather alerts service
            stormCells: [],
          };
          setWeatherData(overlayData);
        }
      } catch (error) {
        console.error("Error loading weather for overlay:", error);
        // Set default mild weather
        setWeatherData({
          windSpeed: 8,
          windDirection: "SW",
          condition: "clear",
        });
      }
    };
    loadWeather();
  }, [mapCenter.latitude, mapCenter.longitude]);

  // Sync local active mode with context and keep the map mode state consistent
  useEffect(() => {
    if (activeMode !== globalMode) {
      setActiveMode(globalMode);
    }
  }, [globalMode]);

  useEffect(() => {
    if (activeMode !== globalMode) {
      setMode(activeMode);
    }
  }, [activeMode, globalMode, setMode]);

  // Handle Look Ahead button press
  const handleLookAhead = useCallback(() => {
    setLookAheadVisible(true);
  }, []);

  // Handle notification dismiss
  const handleNotificationDismiss = useCallback(() => {
    setRouteOverlapNotification(null);
  }, []);

  // Handle notification action
  const handleNotificationPress = useCallback(() => {
    console.log("View overlap details:", routeOverlapNotification);
    // Could navigate to route comparison or user profile
    setRouteOverlapNotification(null);
  }, [routeOverlapNotification]);

  const handleMarkerPress = useCallback((marker: MapMarkerData) => {
    setSelectedMarker(marker);
    setSheetVisible(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
    setTimeout(() => setSelectedMarker(null), 300);
  }, []);

  const handleDropPin = useCallback(() => {
    const location = userLocation || mapCenter;
    const newPin = {
      id: `pin-${Date.now()}`,
      latitude: location.latitude,
      longitude: location.longitude,
      title: `Pin ${droppedPins.length + 1}`,
    };
    setDroppedPins((prev) => [...prev, newPin]);
  }, [userLocation, mapCenter, droppedPins.length]);

  const handleRecenter = useCallback(async () => {
    setIsLocating(true);
    try {
      if (locationPermission !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);

        if (status !== "granted") {
          if (Platform.OS !== "web") {
            Alert.alert(
              "Location Permission Required",
              "Please enable location services in Settings to use this feature.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Open Settings",
                  onPress: () => {
                    try {
                      Linking.openSettings();
                    } catch (e) {
                      console.error("Could not open settings");
                    }
                  },
                },
              ],
            );
          }
          setIsLocating(false);
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(newLocation);

      mapRef.current?.animateToRegion(
        {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500,
      );

      console.log("Centered on user location:", newLocation);
    } catch (error) {
      console.error("Error getting location:", error);
      mapRef.current?.animateToRegion(
        {
          latitude: mapboxConfig.defaultCenter.latitude,
          longitude: mapboxConfig.defaultCenter.longitude,
          latitudeDelta: 2.5,
          longitudeDelta: 2.5,
        },
        500,
      );
    } finally {
      setIsLocating(false);
    }
  }, [locationPermission]);

  const handleSearchArea = useCallback(() => {
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setIsSearching(false);
    }, 1500);
  }, []);

  const handleZoomIn = useCallback(() => {
    console.log("Zooming in");
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log("Zooming out");
  }, []);

  const handleSmartRoute = useCallback(() => {
    setShowSmartRouteScreen(true);
  }, []);

  const handleRouteSelect = useCallback((route: SmartRouteSuggestion) => {
    console.log("Selected route:", route.name);
    setActiveSmartRoute(route);
    // Highlight route on map
  }, []);

  const handleClearRoute = useCallback(() => {
    setActiveSmartRoute(null);
  }, []);

  const handleAskToJoin = useCallback((marker: MapMarkerData) => {
    console.log("Ask to join:", marker.id);
    // Send join request
  }, []);

  const handleViewProfile = useCallback((marker: MapMarkerData) => {
    console.log("View profile:", marker.id);
    // Navigate to profile
  }, []);

  const handleMessage = useCallback((marker: MapMarkerData) => {
    console.log("Message:", marker.id);
    // Open chat
  }, []);

  const handleHire = useCallback((marker: MapMarkerData) => {
    console.log("Hire builder:", marker.id);
    // Open hire flow
  }, []);

  // Handle cluster press - show vibe panel
  const handleClusterPress = useCallback((cluster: EnhancedCluster) => {
    setSelectedCluster(cluster);
    setClusterSheetVisible(true);
  }, []);

  // Handle cluster sheet close
  const handleClusterSheetClose = useCallback(() => {
    setClusterSheetVisible(false);
    setTimeout(() => setSelectedCluster(null), 300);
  }, []);

  // Handle marker selection from cluster
  const handleClusterMarkerSelect = useCallback((marker: MapMarkerData) => {
    setClusterSheetVisible(false);
    setTimeout(() => {
      setSelectedMarker(marker);
      setSheetVisible(true);
    }, 300);
  }, []);

  // Marker positions for stylized map
  const markerPositions: { top: `${number}%`; left: `${number}%` }[] = [
    { top: "22%", left: "18%" },
    { top: "32%", left: "52%" },
    { top: "48%", left: "28%" },
    { top: "42%", left: "68%" },
    { top: "62%", left: "42%" },
    { top: "55%", left: "75%" },
    { top: "70%", left: "20%" },
  ];

  // Show Smart Route Screen when active
  if (showSmartRouteScreen) {
    return (
      <SmartRouteScreen
        origin={userLocation || { latitude: 39.7392, longitude: -104.9903 }}
        originName={userLocation ? "Your Location" : "Denver, CO"}
        onClose={() => setShowSmartRouteScreen(false)}
        onStartNavigation={(destination, destName) => {
          setShowSmartRouteScreen(false);
          const { latitude, longitude } = destination;
          const label = encodeURIComponent(destName || "Destination");
          // Apple Maps on iOS, Google Maps on Android / web
          const url = Platform.select({
            ios: `maps://app?daddr=${latitude},${longitude}&dirflg=d`,
            android: `google.navigation:q=${latitude},${longitude}&mode=d`,
            default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
          });
          Linking.canOpenURL(url!).then((supported) => {
            if (supported) {
              Linking.openURL(url!);
            } else {
              const fallback = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
              Linking.openURL(fallback);
            }
          });
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.screenContainer,
        { paddingTop: isMapExpanded ? 0 : insets.top },
      ]}
    >
      {/* MAP SECTION - Takes 55% of screen, or full screen when expanded */}
      <View
        style={[
          styles.mapSection,
          isMapExpanded && [
            styles.mapSectionExpanded,
            { height: SCREEN_HEIGHT, paddingTop: insets.top },
          ],
        ]}
      >
        <View style={styles.mapArea}>
          {/* Dynamic Weather Overlay */}
          {weatherData && (
            <DynamicWeatherOverlay
              data={weatherData}
              visible={showWeatherOverlay}
            />
          )}

          {/* Map Component - Google Maps on native, placeholder on web */}
          <NativeMap
            ref={mapRef}
            region={mapRegion}
            onRegionChange={setMapRegion}
            markers={[
              ...markers,
              ...droppedPins.map((pin) => ({
                id: pin.id,
                type: "pin" as const,
                latitude: pin.latitude,
                longitude: pin.longitude,
                name: pin.title,
                title: pin.title,
                isDroppedPin: true,
              })),
            ]}
            onMarkerPress={handleMarkerPress}
            showUserLocation={!isGhostMode}
            ghostModeMarker={isGhostMode ? mapCenter : null}
            userLocation={userLocation}
          />

          {/* ONLY ESSENTIAL OVERLAYS ON MAP */}
          {/* Expand/Collapse Button - Top Right */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsMapExpanded(!isMapExpanded)}
          >
            <Ionicons
              name={isMapExpanded ? "contract" : "expand"}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Live Weather Widget - Bottom Right (Tappable for detailed forecast) */}
          {liveWeather ? (
            <TouchableOpacity
              style={styles.liveWeatherWidget}
              onPress={() => {
                const loc = userLocation || mapCenter;
                setWeatherLocation(loc);
                setShowWeatherDetail(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={
                  liveWeather.condition === "Clear"
                    ? "sunny"
                    : liveWeather.condition === "Clouds"
                      ? "cloudy"
                      : liveWeather.condition === "Rain"
                        ? "rainy"
                        : liveWeather.condition === "Snow"
                          ? "snow"
                          : liveWeather.condition === "Thunderstorm"
                            ? "thunderstorm"
                            : "partly-sunny"
                }
                size={20}
                color={colors.sunsetOrange[500]}
              />
              {liveWeather.temperature > 0 ? (
                <Text style={styles.liveWeatherTemp}>
                  {liveWeather.temperature}°F
                </Text>
              ) : null}
              <Text style={styles.liveWeatherCondition}>
                {liveWeather.description}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.liveWeatherWidget}>
              <ActivityIndicator
                size="small"
                color={colors.sunsetOrange[500]}
              />
              <Text style={styles.liveWeatherCondition}>
                Loading weather...
              </Text>
            </View>
          )}

          {/* Recenter Button - Bottom Right */}
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={handleRecenter}
            disabled={isLocating}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#2C2C2C" />
            ) : (
              <Ionicons name="locate" size={20} color="#2C2C2C" />
            )}
          </TouchableOpacity>

          {/* Ghost Mode Indicator (when active) */}
          {isGhostMode && (
            <View style={styles.ghostModeIndicatorCompact}>
              <Ionicons name="eye-off" size={16} color={colors.text.inverse} />
            </View>
          )}
        </View>
      </View>

      {/* CONTROLS SECTION - Below Map (hidden when expanded) */}
      {!isMapExpanded && (
        <ScrollView
          style={styles.controlsSection}
          contentContainerStyle={styles.controlsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Selector - Compact Horizontal */}
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                activeMode === "friends" && styles.modeButtonActiveFriends,
              ]}
              onPress={() => setActiveMode("friends")}
            >
              <Ionicons
                name="people"
                size={16}
                color={activeMode === "friends" ? "#FFFFFF" : "#4A4A4A"}
              />
              <Text
                style={[
                  styles.modeLabel,
                  activeMode === "friends" && styles.modeLabelActive,
                ]}
              >
                Friends
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                activeMode === "builder" && styles.modeButtonActiveBuilder,
              ]}
              onPress={() => setActiveMode("builder")}
            >
              <Ionicons
                name="construct"
                size={16}
                color={activeMode === "builder" ? "#FFFFFF" : "#4A4A4A"}
              />
              <Text
                style={[
                  styles.modeLabel,
                  activeMode === "builder" && styles.modeLabelActive,
                ]}
              >
                Builder
              </Text>
            </TouchableOpacity>
          </View>

          {/* Smart Features Row */}
          <View style={styles.smartFeaturesRow}>
            <TouchableOpacity
              style={styles.featureButton}
              onPress={handleLookAhead}
            >
              <Ionicons name="radio-outline" size={16} color="#FFFFFF" />
              <Text style={styles.featureButtonText}>Look Ahead</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.featureButton, styles.featureButtonPrimary]}
              onPress={handleSmartRoute}
            >
              <Ionicons name="map-outline" size={16} color="#FFFFFF" />
              <Text style={styles.featureButtonText}>Smart Route</Text>
            </TouchableOpacity>
          </View>

          {/* Discover Banner */}
          <View style={styles.discoverBanner}>
            <Ionicons
              name={activeMode === "friends" ? "compass" : "construct"}
              size={18}
              color="#2C2C2C"
            />
            <Text style={styles.discoverText}>
              {activeMode === "friends"
                ? "Discover travelers and nearby events"
                : "Find skilled builders and mechanics"}
            </Text>
          </View>

          {/* Weather Alert (if any) - Compact inline */}
          {showWeatherAlerts &&
            weatherChanges.length > 0 &&
            currentAlertIndex < weatherChanges.length && (
              <TouchableOpacity
                style={styles.inlineWeatherAlert}
                onPress={() => setShowWeatherAlerts(false)}
              >
                <Ionicons name="warning" size={16} color="#FF6B35" />
                <Text style={styles.inlineAlertText} numberOfLines={1}>
                  {weatherChanges[currentAlertIndex].currentCondition} expected
                  - {weatherChanges[currentAlertIndex].severity}
                </Text>
                <Ionicons name="close" size={14} color="#666" />
              </TouchableOpacity>
            )}

          {/* Nearby Activities - Compact Cards */}
          <View style={styles.activitiesSection}>
            <View style={styles.activitiesHeader}>
              <Text style={styles.activitiesTitle}>
                {activeMode === "builder"
                  ? "Nearby Builders"
                  : "Nearby Activities"}
              </Text>
              <TouchableOpacity onPress={() => setShowEvents(!showEvents)}>
                <Ionicons
                  name={showEvents ? "chevron-down" : "chevron-up"}
                  size={18}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {showEvents && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activitiesScroll}
              >
                {nearbyEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.activityCard}
                    onPress={() => {
                      const eventMarker: MapMarkerData = {
                        id: event.id,
                        type: "campfire",
                        name: event.title,
                        latitude: 38.5,
                        longitude: -109.5,
                        eventName: event.title,
                        eventType: event.type,
                        attendees: event.attendees,
                        maxAttendees: event.maxAttendees,
                        participants: event.attendees,
                        host: event.host,
                        eventTime: event.time,
                        time: event.time,
                        subtitle: event.location,
                        location: event.location,
                        description: event.description,
                        imageUrl: event.imageUrl,
                      };
                      setSelectedMarker(eventMarker);
                      setSheetVisible(true);
                    }}
                  >
                    <View style={styles.activityImageWrap}>
                      <Image
                        source={{ uri: event.imageUrl }}
                        style={styles.activityImage}
                        contentFit="cover"
                      />
                      <View
                        style={[
                          styles.activityTypeBadge,
                          {
                            backgroundColor:
                              event.type === "social"
                                ? colors.ember[500]
                                : colors.moss[500],
                          },
                        ]}
                      >
                        <Ionicons
                          name={event.type === "social" ? "flame" : "walk"}
                          size={10}
                          color="#FFFFFF"
                        />
                      </View>
                    </View>
                    <Text style={styles.activityCardTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.activityCardMeta}>
                      {event.attendees} going
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Drop a Pin Button */}
          <TouchableOpacity
            style={styles.dropPinButton}
            onPress={handleDropPin}
            activeOpacity={0.8}
          >
            <Ionicons
              name={activeMode === "builder" ? "search" : "location"}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.dropPinText}>
              {activeMode === "builder" ? "Find Builder" : "Drop a Pin"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Enhanced Liquid Sheet for marker details */}
      {selectedMarker && (
        <MapSocialSheet
          visible={sheetVisible}
          marker={selectedMarker}
          onClose={handleSheetClose}
          onAskToJoin={handleAskToJoin}
          onViewProfile={handleViewProfile}
          onMessage={handleMessage}
          onHire={handleHire}
          currentMode={activeMode}
        />
      )}

      {/* AI Route Planner Modal */}
      <AIRoutePlanner
        visible={routePlannerVisible}
        onClose={() => setRoutePlannerVisible(false)}
        onRouteSelect={handleRouteSelect}
        currentLocation={{
          latitude: mapboxConfig.defaultCenter.latitude,
          longitude: mapboxConfig.defaultCenter.longitude,
        }}
        destination={{
          latitude: 40.7128,
          longitude: -111.891,
          name: "Salt Lake City, UT",
        }}
      />

      {/* Smart Route Weather Panel - shown when a route is active */}
      {activeSmartRoute ? (
        <View style={styles.smartRouteWeatherContainer}>
          <SmartRouteWeather
            route={activeSmartRoute}
            onClose={handleClearRoute}
            onWaypointSelect={(waypoint, index) => {
              console.log(
                "Selected waypoint:",
                waypoint.name,
                "at index",
                index,
              );
            }}
          />
        </View>
      ) : null}

      {/* Advanced Radar Look Ahead Modal */}
      <LookAheadRadar
        visible={lookAheadVisible}
        onClose={() => setLookAheadVisible(false)}
        isPremium={isPremium}
        onUpgrade={() => {
          setPremium(true);
          setLookAheadVisible(false);
          setTimeout(() => setLookAheadVisible(true), 300);
        }}
      />

      {/* Weather Detail Modal */}
      {weatherLocation ? (
        <WeatherDetailModal
          visible={showWeatherDetail}
          onClose={() => setShowWeatherDetail(false)}
          latitude={weatherLocation.latitude}
          longitude={weatherLocation.longitude}
        />
      ) : null}

      {/* Cluster Vibe Sheet */}
      {selectedCluster && (
        <ClusterVibeSheet
          visible={clusterSheetVisible}
          cluster={selectedCluster}
          onClose={handleClusterSheetClose}
          onMemberPress={handleClusterMarkerSelect}
          currentMode={activeMode}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F5EFE6",
  },
  mapSection: {
    height: SCREEN_HEIGHT * 0.55,
    width: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  mapSectionExpanded: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    zIndex: 1000,
    borderRadius: 0,
  },
  mapArea: {
    flex: 1,
    position: "relative",
    borderRadius: 0,
    overflow: "hidden",
  },
  expandButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2C2C2C",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recenterButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  liveWeatherWidget: {
    position: "absolute",
    bottom: 70,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: borderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  liveWeatherTemp: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.primary,
  },
  liveWeatherCondition: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    maxWidth: 80,
  },
  ghostModeIndicatorCompact: {
    position: "absolute",
    top: 16,
    left: 80,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsSection: {
    flex: 1,
  },
  controlsContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 6,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: colors.ember[500],
  },
  modeButtonActiveFriends: {
    backgroundColor: "#3A6B4A",
  },
  modeButtonActiveBuilder: {
    backgroundColor: colors.driftwood[500],
  },
  modeLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 13,
    color: "#4A4A4A",
  },
  modeLabelActive: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  smartFeaturesRow: {
    flexDirection: "row",
    gap: 12,
  },
  featureButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B8E7F",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  featureButtonPrimary: {
    backgroundColor: "#3A6B4A",
  },
  featureButtonText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  discoverBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  discoverText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
    color: "#2C2C2C",
    flex: 1,
  },
  inlineWeatherAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  inlineAlertText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 13,
    color: "#E65100",
    flex: 1,
  },
  activitiesSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  activitiesTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 15,
    color: "#2C2C2C",
  },
  activitiesScroll: {
    gap: 10,
    paddingRight: 4,
  },
  activityCard: {
    width: 120,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    overflow: "hidden",
  },
  activityImageWrap: {
    height: 70,
    position: "relative",
  },
  activityImage: {
    width: "100%",
    height: "100%",
  },
  activityTypeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  activityCardTitle: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: "#2C2C2C",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  activityCardMeta: {
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
    color: "#888",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  dropPinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ember[500],
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  dropPinText: {
    fontFamily: typography.fontFamily.bodySemiBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#2A2A2A",
    marginLeft: spacing.sm,
    textShadowRadius: 4,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: "uppercase",
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.whiteMedium,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.glass,
  },
  toggleContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  modeBanner: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  modeBannerCard: {
    backgroundColor: colors.glass.whiteSubtle,
  },
  modeBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  modeBannerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[600],
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  mapGradient: {
    flex: 1,
    position: "relative",
  },
  mapView: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  terrainFeature: {
    position: "absolute",
    borderRadius: borderRadius.xl,
    opacity: 0.5,
  },
  roadLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: mapboxConfig.style.road,
    opacity: 0.5,
  },
  roadLineVertical: {
    width: 3,
    height: "100%",
    left: "35%",
    top: 0,
    bottom: 0,
  },
  mapRegionLabel: {
    position: "absolute",
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: mapboxConfig.style.textLight,
    fontStyle: "italic",
    opacity: 0.6,
  },
  mapLegend: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.glass.white,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[600],
  },
  eventsPanel: {
    borderTopLeftRadius: borderRadius["2xl"],
    borderTopRightRadius: borderRadius["2xl"],
    paddingTop: spacing.lg,
    marginHorizontal: spacing.sm,
  },
  eventsPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  eventsPanelTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
  },
  eventsScroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  eventCard: {
    width: 160,
    backgroundColor: colors.glass.whiteSubtle,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  eventImageContainer: {
    height: 80,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  eventTypeBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  eventInfo: {
    padding: spacing.md,
  },
  eventTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.bark[800],
    marginBottom: spacing.xs,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  eventAttendees: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "#4A5568",
  },
  joinButton: {
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.moss[500],
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  joinButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  dropPinContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  // Current user marker styles
  currentUserMarker: {
    position: "absolute",
    zIndex: 100,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  currentUserPreciseMarker: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  currentUserPreciseInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.moss[500],
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
    borderWidth: 2,
    borderColor: colors.text.inverse,
  },
  currentUserPulse: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.moss[500] + "30",
  },
  // Look Ahead button styles
  lookAheadButton: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.glass,
  },
  lookAheadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  lookAheadButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: colors.text.inverse,
  },
  premiumBadgeMini: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.xs,
  },
  // Ghost mode indicator
  ghostModeIndicatorContainer: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
  },
  // Route overlap notification
  notificationBannerContainer: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
  // Weather HUD container
  weatherHudContainer: {
    position: "absolute",
    top: spacing.lg + 50, // Below the Look Ahead button
    left: spacing.lg,
    zIndex: 50,
  },
  // Weather timeline container
  weatherTimelineContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  // Smart Route Weather container
  smartRouteWeatherContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 100,
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
});
