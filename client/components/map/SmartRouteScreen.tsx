/**
 * SmartRouteScreen
 * Complete Smart Route UI with Map, Weather, Road Risk, and Destination Search
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  TextInput,
  FlatList,
  Keyboard,
} from "react-native";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  getSmartRoute,
  getWeatherIconName,
  getRoadRiskColor,
  searchPlaces,
  getPlaceCoordinates,
  SmartRouteData,
  Coordinate,
  PlaceSuggestion,
} from "@/services/smartRouteService";
import { colors, typography, spacing, borderRadius } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

const COLORS = {
  warmCream: "#F5EFE6",
  lightCream: "#FAF6F2",
  desertSand: "#E8C5A5",
  sandDark: "#D9B894",
  skyBlue: "#4A90E2",
  skyBlueLight: "#E3F0FF",
  skyBlueDark: "#3B7BC8",
  amber: "#F2A154",
  amberLight: "#FFF9F0",
  amberDark: "#D48A3A",
  forestGreenLight: "#E8F5E9",
  forestGreenDark: "#2D5A3D",
};

interface SmartRouteScreenProps {
  origin?: Coordinate;
  destination?: Coordinate;
  originName?: string;
  destinationName?: string;
  onClose?: () => void;
  onStartNavigation?: (
    destination: Coordinate,
    destinationName: string,
  ) => void;
}

export function SmartRouteScreen({
  origin = { latitude: 39.7392, longitude: -104.9903 },
  destination: initialDestination,
  originName: initialOriginName = "Your Location",
  destinationName: initialDestinationName,
  onClose,
  onStartNavigation,
}: SmartRouteScreenProps) {
  const insets = useSafeAreaInsets();
  const [smartRoute, setSmartRoute] = useState<SmartRouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(!initialDestination);
  const [selectedDestination, setSelectedDestination] =
    useState<Coordinate | null>(initialDestination || null);
  const [destinationName, setDestinationName] = useState(
    initialDestinationName || "",
  );
  const [originNameState] = useState(initialOriginName);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  const [mapRegion, setMapRegion] = useState({
    latitude: origin.latitude,
    longitude: origin.longitude,
    latitudeDelta: 2,
    longitudeDelta: 2,
  });

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlaces(text);
        setSuggestions(results);
      } catch (error) {
        console.warn("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const [error, setError] = useState<string | null>(null);

  const handleSelectPlace = useCallback(
    async (place: PlaceSuggestion) => {
      Keyboard.dismiss();
      setSuggestions([]);
      setSearchQuery(place.mainText);
      setShowSearch(false);
      setLoading(true);
      setError(null);

      try {
        console.log(
          "[SmartRoute] Getting coordinates for:",
          place.mainText,
          place.placeId,
        );
        const result = await getPlaceCoordinates(
          place.placeId,
          place.description,
        );
        console.log(
          "[SmartRoute] Place coordinates result:",
          result ? "success" : "null",
        );

        if (!result) {
          setError("Could not find location. Please try another search.");
          setShowSearch(true);
          setLoading(false);
          return;
        }

        setSelectedDestination(result.coordinate);
        setDestinationName(result.name);

        const midLat = (origin.latitude + result.coordinate.latitude) / 2;
        const midLon = (origin.longitude + result.coordinate.longitude) / 2;
        setMapRegion({
          latitude: midLat,
          longitude: midLon,
          latitudeDelta: Math.max(
            Math.abs(result.coordinate.latitude - origin.latitude) * 1.8,
            0.5,
          ),
          longitudeDelta: Math.max(
            Math.abs(result.coordinate.longitude - origin.longitude) * 1.8,
            0.5,
          ),
        });

        console.log(
          "[SmartRoute] Fetching route from",
          origin,
          "to",
          result.coordinate,
        );
        const route = await getSmartRoute(origin, result.coordinate);
        console.log(
          "[SmartRoute] Route result:",
          route.success,
          route.distance,
        );

        if (route.success) {
          setSmartRoute(route);
        } else {
          setError("Could not calculate route. Please try again.");
          setShowSearch(true);
        }
      } catch (err: any) {
        console.error("[SmartRoute] Error selecting place:", err);
        setError("Something went wrong. Please try again.");
        setShowSearch(true);
      } finally {
        setLoading(false);
      }
    },
    [origin],
  );

  const loadSmartRoute = useCallback(async () => {
    if (!selectedDestination) return;
    setLoading(true);
    try {
      const route = await getSmartRoute(origin, selectedDestination);
      if (route.success) {
        setSmartRoute(route);

        const midLat = (origin.latitude + selectedDestination.latitude) / 2;
        const midLon = (origin.longitude + selectedDestination.longitude) / 2;
        setMapRegion({
          latitude: midLat,
          longitude: midLon,
          latitudeDelta:
            Math.abs(selectedDestination.latitude - origin.latitude) * 1.5,
          longitudeDelta:
            Math.abs(selectedDestination.longitude - origin.longitude) * 1.5,
        });
      }
    } catch (error) {
      console.error("Error loading Smart Route:", error);
    } finally {
      setLoading(false);
    }
  }, [origin, selectedDestination]);

  useEffect(() => {
    if (initialDestination && !smartRoute) {
      setSelectedDestination(initialDestination);
      loadSmartRoute();
    }
  }, []);

  const handleChangeDestination = useCallback(() => {
    setSmartRoute(null);
    setShowSearch(true);
    setSearchQuery("");
    setSuggestions([]);
    setTimeout(() => searchInputRef.current?.focus(), 300);
  }, []);

  const renderWeatherMarker = (
    coordinate: Coordinate,
    weather: { temperature: number; condition: string },
    title: string,
    markerStyle: object,
  ) => (
    <Marker
      coordinate={coordinate}
      title={title}
      description={`${weather.temperature}°F - ${weather.condition}`}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.marker, markerStyle]}>
          <Ionicons
            name={
              getWeatherIconName(
                weather.condition,
              ) as keyof typeof Ionicons.glyphMap
            }
            size={24}
            color={colors.sunsetOrange[600]}
          />
          <Text style={styles.markerTemp}>{weather.temperature}°</Text>
        </View>
        <View style={styles.markerArrow} />
      </View>
    </Marker>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerContent}>
          {onClose ? (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              testID="smart-route-close"
            >
              <Ionicons name="close" size={24} color={colors.bark[700]} />
            </TouchableOpacity>
          ) : null}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Smart Route</Text>
            <Text style={styles.headerSubtitle}>
              Real-Time Weather Navigation
            </Text>
          </View>
          {selectedDestination ? (
            <TouchableOpacity
              onPress={loadSmartRoute}
              style={styles.refreshButton}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={colors.sunsetOrange[500]}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Search Section */}
      {showSearch ? (
        <View style={styles.searchSection}>
          {/* Error Message */}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#D32F2F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.routeInputs}>
            <View style={styles.inputRow}>
              <View
                style={[
                  styles.inputDot,
                  { backgroundColor: colors.forestGreen[500] },
                ]}
              />
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>FROM</Text>
                <Text style={styles.originText} numberOfLines={1}>
                  {originNameState}
                </Text>
              </View>
            </View>
            <View style={styles.inputDivider} />
            <View style={styles.inputRow}>
              <View
                style={[
                  styles.inputDot,
                  { backgroundColor: colors.sunsetOrange[500] },
                ]}
              />
              <View style={styles.inputFieldActive}>
                <Text style={styles.inputLabel}>TO</Text>
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search destination (e.g. Copper Mountain)"
                  placeholderTextColor={colors.bark[400]}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoFocus
                  returnKeyType="search"
                  testID="destination-search-input"
                />
              </View>
              {isSearching ? (
                <ActivityIndicator
                  size="small"
                  color={colors.sunsetOrange[500]}
                />
              ) : null}
            </View>
          </View>

          {/* Search Results */}
          {suggestions.length > 0 ? (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.placeId}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelectPlace(item)}
                    testID={`suggestion-${item.placeId}`}
                  >
                    <Ionicons
                      name="location"
                      size={20}
                      color={colors.sunsetOrange[500]}
                    />
                    <View style={styles.suggestionText}>
                      <Text style={styles.suggestionMain} numberOfLines={1}>
                        {item.mainText}
                      </Text>
                      <Text
                        style={styles.suggestionSecondary}
                        numberOfLines={1}
                      >
                        {item.secondaryText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : null}

          {/* Popular Destinations */}
          {searchQuery.length === 0 ? (
            <View style={styles.popularSection}>
              <Text style={styles.popularTitle}>Popular Destinations</Text>
              {[
                { name: "Copper Mountain, CO", lat: 39.5022, lng: -106.1497 },
                { name: "Moab, UT", lat: 38.5733, lng: -109.5498 },
                { name: "Sedona, AZ", lat: 34.8697, lng: -111.761 },
                {
                  name: "Yellowstone National Park",
                  lat: 44.428,
                  lng: -110.5885,
                },
                { name: "Big Sur, CA", lat: 36.2704, lng: -121.8081 },
              ].map((dest) => (
                <TouchableOpacity
                  key={dest.name}
                  style={styles.popularItem}
                  onPress={() => {
                    setShowSearch(false);
                    setLoading(true);
                    setError(null);
                    setSelectedDestination({
                      latitude: dest.lat,
                      longitude: dest.lng,
                    });
                    setDestinationName(dest.name);
                    const midLat = (origin.latitude + dest.lat) / 2;
                    const midLon = (origin.longitude + dest.lng) / 2;
                    setMapRegion({
                      latitude: midLat,
                      longitude: midLon,
                      latitudeDelta: Math.max(
                        Math.abs(dest.lat - origin.latitude) * 1.8,
                        0.5,
                      ),
                      longitudeDelta: Math.max(
                        Math.abs(dest.lng - origin.longitude) * 1.8,
                        0.5,
                      ),
                    });
                    getSmartRoute(origin, {
                      latitude: dest.lat,
                      longitude: dest.lng,
                    })
                      .then((route) => {
                        if (route.success) {
                          setSmartRoute(route);
                        } else {
                          setError(
                            "Could not calculate route. Please try again.",
                          );
                          setShowSearch(true);
                        }
                      })
                      .catch(() => {
                        setError("Something went wrong. Please try again.");
                        setShowSearch(true);
                      })
                      .finally(() => setLoading(false));
                  }}
                >
                  <Ionicons
                    name="compass"
                    size={20}
                    color={colors.sunsetOrange[500]}
                  />
                  <Text style={styles.popularText}>{dest.name}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.bark[400]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.sunsetOrange[500]} />
          <Text style={styles.loadingText}>Fetching real weather data...</Text>
          <Text style={styles.loadingSubtext}>
            Analyzing conditions along your route
          </Text>
        </View>
      ) : null}

      {/* Map + Route Info (shown after route is calculated) */}
      {!showSearch && !loading && smartRoute ? (
        <>
          {/* Change Destination Button */}
          <TouchableOpacity
            style={styles.changeDestButton}
            onPress={handleChangeDestination}
            testID="change-destination"
          >
            <Ionicons
              name="search"
              size={16}
              color={colors.sunsetOrange[600]}
            />
            <Text style={styles.changeDestText}>Change Destination</Text>
          </TouchableOpacity>

          {/* Map */}
          <MapView
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {smartRoute.coordinates ? (
              <Polyline
                coordinates={smartRoute.coordinates}
                strokeColor={colors.sunsetOrange[500]}
                strokeWidth={5}
              />
            ) : null}

            {renderWeatherMarker(
              origin,
              smartRoute.weather.start,
              `Start: ${originNameState}`,
              styles.startMarker,
            )}

            {smartRoute.coordinates
              ? renderWeatherMarker(
                  smartRoute.coordinates[
                    Math.floor(smartRoute.coordinates.length / 2)
                  ],
                  smartRoute.weather.middle,
                  "Midpoint",
                  styles.middleMarker,
                )
              : null}

            {selectedDestination
              ? renderWeatherMarker(
                  selectedDestination,
                  smartRoute.weather.end,
                  `Destination: ${destinationName}`,
                  styles.endMarker,
                )
              : null}
          </MapView>

          {/* Bottom Info Card */}
          <ScrollView
            style={styles.infoCardContainer}
            contentContainerStyle={[
              styles.infoCard,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Live Data Badge */}
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveBadgeText}>LIVE WEATHER DATA</Text>
            </View>

            {/* Route Info */}
            <View style={styles.routeInfo}>
              <View style={styles.routeEndpoints}>
                <View style={styles.endpointRow}>
                  <View
                    style={[
                      styles.endpointDot,
                      { backgroundColor: colors.forestGreen[500] },
                    ]}
                  />
                  <Text style={styles.endpointText} numberOfLines={1}>
                    {originNameState}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.endpointRow}>
                  <View
                    style={[
                      styles.endpointDot,
                      { backgroundColor: colors.sunsetOrange[500] },
                    ]}
                  />
                  <Text style={styles.endpointText} numberOfLines={1}>
                    {destinationName}
                  </Text>
                </View>
              </View>
              <View style={styles.routeStats}>
                <Text style={styles.distance}>{smartRoute.distance}</Text>
                <Text style={styles.duration}>{smartRoute.duration}</Text>
              </View>
            </View>

            {/* Road Risk Indicator */}
            <View
              style={[
                styles.roadRiskBadge,
                { backgroundColor: getRoadRiskColor(smartRoute.safety.level) },
              ]}
            >
              <View style={styles.roadRiskHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                <Text style={styles.roadRiskLabel}>ROAD RISK</Text>
              </View>
              <Text style={styles.roadRiskLevel}>
                {smartRoute.safety.level.toUpperCase()}
              </Text>
              <View style={styles.roadRiskScoreContainer}>
                <Text style={styles.roadRiskScore}>
                  {smartRoute.safety.score}
                </Text>
                <Text style={styles.roadRiskScoreMax}>/100</Text>
              </View>
            </View>

            {/* Weather Summary */}
            <View style={styles.weatherSummary}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="partly-sunny"
                  size={20}
                  color={colors.sunsetOrange[500]}
                />
                <Text style={styles.sectionTitle}>
                  Live Weather Along Route
                </Text>
              </View>
              <View style={styles.weatherRow}>
                <View style={styles.weatherPoint}>
                  <View
                    style={[
                      styles.weatherIconContainer,
                      { backgroundColor: COLORS.forestGreenLight },
                    ]}
                  >
                    <Ionicons
                      name={
                        getWeatherIconName(
                          smartRoute.weather.start.condition,
                        ) as keyof typeof Ionicons.glyphMap
                      }
                      size={28}
                      color={COLORS.forestGreenDark}
                    />
                  </View>
                  <Text style={styles.weatherTemp}>
                    {smartRoute.weather.start.temperature}°F
                  </Text>
                  <Text style={styles.weatherCondition}>
                    {smartRoute.weather.start.condition}
                  </Text>
                  <Text style={styles.weatherLabel}>Start</Text>
                </View>
                <View style={styles.weatherDivider} />
                <View style={styles.weatherPoint}>
                  <View
                    style={[
                      styles.weatherIconContainer,
                      { backgroundColor: COLORS.skyBlueLight },
                    ]}
                  >
                    <Ionicons
                      name={
                        getWeatherIconName(
                          smartRoute.weather.middle.condition,
                        ) as keyof typeof Ionicons.glyphMap
                      }
                      size={28}
                      color={COLORS.skyBlueDark}
                    />
                  </View>
                  <Text style={styles.weatherTemp}>
                    {smartRoute.weather.middle.temperature}°F
                  </Text>
                  <Text style={styles.weatherCondition}>
                    {smartRoute.weather.middle.condition}
                  </Text>
                  <Text style={styles.weatherLabel}>Midpoint</Text>
                </View>
                <View style={styles.weatherDivider} />
                <View style={styles.weatherPoint}>
                  <View
                    style={[
                      styles.weatherIconContainer,
                      { backgroundColor: colors.sunsetOrange[100] },
                    ]}
                  >
                    <Ionicons
                      name={
                        getWeatherIconName(
                          smartRoute.weather.end.condition,
                        ) as keyof typeof Ionicons.glyphMap
                      }
                      size={28}
                      color={colors.sunsetOrange[600]}
                    />
                  </View>
                  <Text style={styles.weatherTemp}>
                    {smartRoute.weather.end.temperature}°F
                  </Text>
                  <Text style={styles.weatherCondition}>
                    {smartRoute.weather.end.condition}
                  </Text>
                  <Text style={styles.weatherLabel}>Destination</Text>
                </View>
              </View>

              {/* Wind & Humidity Details */}
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="water" size={16} color={COLORS.skyBlue} />
                  <Text style={styles.weatherDetailText}>
                    Humidity: {smartRoute.weather.start.humidity}% -{" "}
                    {smartRoute.weather.end.humidity}%
                  </Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="flag" size={16} color={COLORS.skyBlue} />
                  <Text style={styles.weatherDetailText}>
                    Wind: {smartRoute.weather.start.windSpeed} -{" "}
                    {smartRoute.weather.end.windSpeed} mph
                  </Text>
                </View>
              </View>
            </View>

            {/* Warnings */}
            {smartRoute.safety.warnings.length > 0 ? (
              <View style={styles.warningsContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="warning"
                    size={20}
                    color={colors.sunsetOrange[600]}
                  />
                  <Text style={styles.warningsTitle}>Warnings</Text>
                </View>
                {smartRoute.safety.warnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <View style={styles.warningBullet} />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Recommendations */}
            {smartRoute.safety.recommendations.length > 0 ? (
              <View style={styles.recommendationsContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bulb" size={20} color={COLORS.amberDark} />
                  <Text style={styles.recommendationsTitle}>
                    Recommendations
                  </Text>
                </View>
                {smartRoute.safety.recommendations
                  .slice(0, 3)
                  .map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <View
                        style={[
                          styles.recommendationBullet,
                          { backgroundColor: COLORS.amber },
                        ]}
                      />
                      <Text style={styles.recommendationText}>{rec}</Text>
                    </View>
                  ))}
              </View>
            ) : null}

            {/* AI Badge */}
            <View style={styles.aiBadge}>
              <Ionicons
                name="sparkles"
                size={16}
                color={colors.sunsetOrange[500]}
              />
              <Text style={styles.aiBadgeText}>Powered by Live Data</Text>
            </View>

            {/* Start Navigation Button */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                if (selectedDestination) {
                  onStartNavigation?.(selectedDestination, destinationName);
                }
              }}
              activeOpacity={0.8}
              testID="start-navigation"
            >
              <LinearGradient
                colors={[colors.sunsetOrange[500], colors.sunsetOrange[600]]}
                style={styles.startButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start Navigation</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCream,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.warmCream,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.bark[700],
    fontWeight: "600",
  },
  loadingSubtext: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.bark[400],
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.desertSand,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: "bold",
    color: colors.bark[800],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.sunsetOrange[500],
    fontWeight: "600",
  },
  refreshButton: {
    padding: spacing.sm,
    backgroundColor: colors.sunsetOrange[100],
    borderRadius: borderRadius.full,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#FFCDD2",
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: "#D32F2F",
    fontWeight: "500",
    flex: 1,
  },
  searchSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  routeInputs: {
    padding: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 48,
  },
  inputDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  inputField: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  inputFieldActive: {
    flex: 1,
    backgroundColor: "#F8F6F3",
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: colors.sunsetOrange[300],
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.bark[400],
    letterSpacing: 1,
    marginBottom: 2,
  },
  originText: {
    fontSize: typography.fontSize.lg,
    color: colors.bark[700],
    fontWeight: "500",
  },
  searchInput: {
    fontSize: 18,
    color: colors.bark[800],
    fontWeight: "500",
    padding: 0,
    paddingVertical: Platform.OS === "ios" ? spacing.sm : spacing.xs,
    minHeight: 40,
  },
  inputDivider: {
    height: 20,
    width: 2,
    backgroundColor: "#E0E0E0",
    marginLeft: 5,
    marginVertical: 4,
  },
  suggestionsContainer: {
    maxHeight: 300,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  suggestionText: {
    flex: 1,
  },
  suggestionMain: {
    fontSize: typography.fontSize.md,
    color: colors.bark[800],
    fontWeight: "500",
  },
  suggestionSecondary: {
    fontSize: typography.fontSize.xs,
    color: colors.bark[400],
    marginTop: 2,
  },
  popularSection: {
    padding: spacing.lg,
  },
  popularTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: "700",
    color: colors.bark[500],
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  popularItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  popularText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.bark[700],
    fontWeight: "500",
  },
  changeDestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sunsetOrange[50],
    paddingVertical: 16,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.desertSand,
  },
  changeDestText: {
    fontSize: 17,
    color: colors.sunsetOrange[600],
    fontWeight: "700",
  },
  map: {
    height: height * 0.35,
    width: "100%",
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    borderWidth: 3,
    alignItems: "center",
    minWidth: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startMarker: {
    borderColor: colors.forestGreen[500],
  },
  middleMarker: {
    borderColor: COLORS.skyBlue,
  },
  endMarker: {
    borderColor: colors.sunsetOrange[500],
  },
  markerTemp: {
    fontSize: typography.fontSize.sm,
    fontWeight: "bold",
    color: colors.bark[800],
    marginTop: 2,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
    marginTop: -1,
  },
  infoCardContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  infoCard: {
    padding: spacing.lg,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2E7D32",
    letterSpacing: 1,
  },
  routeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.desertSand,
  },
  routeEndpoints: {
    flex: 1,
    marginRight: spacing.md,
  },
  endpointRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  endpointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  endpointText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.sandDark,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeStats: {
    alignItems: "flex-end",
  },
  distance: {
    fontSize: typography.fontSize.xl,
    fontWeight: "bold",
    color: colors.bark[800],
  },
  duration: {
    fontSize: typography.fontSize.md,
    color: colors.bark[500],
    fontWeight: "600",
  },
  roadRiskBadge: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  roadRiskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  roadRiskLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginLeft: spacing.xs,
  },
  roadRiskLevel: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  roadRiskScoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  roadRiskScore: {
    fontSize: typography.fontSize.xl,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  roadRiskScoreMax: {
    fontSize: typography.fontSize.md,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  weatherSummary: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
    color: colors.bark[800],
    marginLeft: spacing.sm,
  },
  weatherRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.lightCream,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  weatherPoint: {
    alignItems: "center",
    flex: 1,
  },
  weatherDivider: {
    width: 1,
    backgroundColor: COLORS.desertSand,
  },
  weatherIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  weatherTemp: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.bark[800],
  },
  weatherCondition: {
    fontSize: typography.fontSize.xs,
    color: colors.bark[500],
    marginTop: 1,
  },
  weatherLabel: {
    fontSize: 10,
    color: colors.bark[400],
    marginTop: 2,
    fontWeight: "600",
  },
  weatherDetails: {
    marginTop: spacing.md,
    backgroundColor: COLORS.lightCream,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  weatherDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  weatherDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.bark[600],
  },
  warningsContainer: {
    backgroundColor: colors.sunsetOrange[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.sunsetOrange[500],
  },
  warningsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
    color: colors.sunsetOrange[700],
    marginLeft: spacing.sm,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.sm,
  },
  warningBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sunsetOrange[500],
    marginTop: 6,
    marginRight: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
    lineHeight: 20,
  },
  recommendationsContainer: {
    backgroundColor: COLORS.amberLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.amber,
  },
  recommendationsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
    color: COLORS.amberDark,
    marginLeft: spacing.sm,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.sm,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.bark[700],
    lineHeight: 20,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sunsetOrange[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  aiBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.sunsetOrange[600],
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  startButton: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    shadowColor: colors.sunsetOrange[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  startButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: spacing.sm,
  },
});

export default SmartRouteScreen;
