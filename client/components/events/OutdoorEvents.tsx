import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  natureImages,
  profileImages,
} from "@/constants/theme";

export type ActivityType =
  | "backpacking"
  | "mtb"
  | "fishing"
  | "ski"
  | "snowboard"
  | "kayak"
  | "skateboard"
  | "touringski"
  | "surf"
  | "snowmobile"
  | "dirtbike"
  | "motorcycle"
  | "offroad"
  | "climb"
  | "camp"
  | "sup"
  | "explore"
  | "photography";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "stormy"
  | "windy"
  | "foggy"
  | "partlyCloudy"
  | "clear";
type WeatherImpactRating = "excellent" | "good" | "fair" | "poor" | "dangerous";

interface EventWeather {
  condition: WeatherCondition;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipChance: number;
  uvIndex: number;
  cloudCover: number;
  visibility: number;
  sunriseTime: string;
  sunsetTime: string;
  moonPhase: string;
  impactRating: WeatherImpactRating;
  impactNotes: string[];
  goldenHour?: { start: string; end: string };
  blueHour?: { start: string; end: string };
  stargazingRating?: "excellent" | "good" | "fair" | "poor";
  hourlyForecast: {
    hour: string;
    temp: number;
    condition: WeatherCondition;
    wind: number;
    precip: number;
  }[];
  alerts?: {
    severity: "info" | "warning" | "danger";
    title: string;
    message: string;
    safetyActions: string[];
  }[];
}

type CellServiceQuality = "good" | "fair" | "bad" | "none";

interface OutdoorEvent {
  id: string;
  title: string;
  description: string;
  activityType: ActivityType;
  skillLevel: SkillLevel;
  hostName: string;
  hostImage: string;
  location: string;
  date: string;
  time: string;
  maxAttendees: number;
  currentAttendees: number;
  imageUrl: string;
  schedule?: string[];
  weather?: EventWeather;
  cellService?: CellServiceQuality;
}

const EVENT_CARD_WIDTH = 220;

const activityIcons: Record<ActivityType, keyof typeof Ionicons.glyphMap> = {
  backpacking: "walk",
  mtb: "bicycle",
  fishing: "fish",
  ski: "snow",
  snowboard: "snow",
  kayak: "boat",
  skateboard: "flash",
  touringski: "trending-up",
  surf: "water",
  snowmobile: "speedometer",
  dirtbike: "speedometer",
  motorcycle: "bicycle",
  offroad: "car",
  climb: "trending-up",
  camp: "bonfire",
  sup: "boat",
  explore: "compass",
  photography: "camera",
};

const activityLabels: Record<ActivityType, string> = {
  backpacking: "Backpacking",
  mtb: "MTB",
  fishing: "Fishing",
  ski: "Ski",
  snowboard: "Snowboard",
  kayak: "Kayak",
  skateboard: "Skateboard",
  touringski: "Tour/Uphill Ski",
  surf: "Surf",
  snowmobile: "Snowmobile",
  dirtbike: "Dirt Bike",
  motorcycle: "Motorcycle",
  offroad: "Off Road/SxS",
  climb: "Climb",
  camp: "Camp",
  sup: "SUP",
  explore: "Explore",
  photography: "Photography",
};

const skillLevelLabels: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const skillLevelColors: Record<SkillLevel, string> = {
  beginner: colors.moss[400],
  intermediate: colors.ember[500],
  advanced: colors.clay[600],
};

const impactRatingColors: Record<WeatherImpactRating, string> = {
  excellent: "#22C55E",
  good: "#84CC16",
  fair: "#F59E0B",
  poor: "#EF4444",
  dangerous: "#DC2626",
};

const getWeatherIcon = (
  condition: WeatherCondition,
): keyof typeof Ionicons.glyphMap => {
  const icons: Record<WeatherCondition, keyof typeof Ionicons.glyphMap> = {
    sunny: "sunny",
    cloudy: "cloudy",
    rainy: "rainy",
    snowy: "snow",
    stormy: "thunderstorm",
    windy: "flag",
    foggy: "cloud",
    partlyCloudy: "partly-sunny",
    clear: "moon",
  };
  return icons[condition];
};

const getCellServiceDisplay = (quality: CellServiceQuality) => {
  const displays: Record<
    CellServiceQuality,
    {
      icon: keyof typeof Ionicons.glyphMap;
      color: string;
      label: string;
      bars: number;
    }
  > = {
    good: {
      icon: "cellular",
      color: colors.forestGreen[500],
      label: "Good",
      bars: 4,
    },
    fair: {
      icon: "cellular",
      color: colors.sunsetOrange[400],
      label: "Fair",
      bars: 2,
    },
    bad: {
      icon: "cellular",
      color: colors.sunsetOrange[600],
      label: "Bad",
      bars: 1,
    },
    none: { icon: "cellular", color: colors.bark[400], label: "None", bars: 0 },
  };
  return displays[quality];
};

const sampleEvents: OutdoorEvent[] = [
  {
    id: "0",
    title: "Weekend Backpacking Trip",
    description:
      "Heading into the backcountry for a 2-night trip. Looking for nomads who want to explore the wilderness together!",
    activityType: "backpacking",
    skillLevel: "intermediate",
    hostName: "Alex",
    hostImage: profileImages.alex,
    location: "San Juan Wilderness, CO",
    date: "Feb 10, 2026",
    time: "7:00 AM",
    maxAttendees: 6,
    currentAttendees: 3,
    imageUrl: natureImages.canyonVista,
    schedule: [
      "7:00 AM - Meet at trailhead",
      "12:00 PM - Lunch at alpine lake",
      "5:00 PM - Set up camp",
    ],
    cellService: "bad",
    weather: {
      condition: "sunny",
      temperature: 58,
      feelsLike: 55,
      humidity: 35,
      windSpeed: 8,
      windDirection: "SW",
      precipChance: 10,
      uvIndex: 6,
      cloudCover: 15,
      visibility: 10,
      sunriseTime: "6:45 AM",
      sunsetTime: "6:12 PM",
      moonPhase: "Waxing Gibbous",
      impactRating: "excellent",
      impactNotes: [
        "Perfect hiking weather with mild temps",
        "Low wind for easy tent setup",
        "Clear skies expected overnight",
      ],
      hourlyForecast: [
        { hour: "7AM", temp: 48, condition: "sunny", wind: 5, precip: 0 },
        { hour: "10AM", temp: 55, condition: "sunny", wind: 8, precip: 0 },
        {
          hour: "1PM",
          temp: 62,
          condition: "partlyCloudy",
          wind: 10,
          precip: 5,
        },
        { hour: "4PM", temp: 58, condition: "sunny", wind: 8, precip: 0 },
        { hour: "7PM", temp: 50, condition: "clear", wind: 5, precip: 0 },
      ],
    },
  },
  {
    id: "1",
    title: "MTB Shuttle Day",
    description:
      "Got my van set up for shuttles! Lets hit some epic downhill runs. Intermediate riders welcome.",
    activityType: "mtb",
    skillLevel: "intermediate",
    hostName: "Jake",
    hostImage: profileImages.mike,
    location: "Durango, CO",
    date: "Feb 15, 2026",
    time: "9:00 AM",
    maxAttendees: 5,
    currentAttendees: 2,
    imageUrl: natureImages.mountainLake,
    schedule: [
      "9:00 AM - Meet at lot",
      "9:30 AM - First run",
      "12:00 PM - Lunch",
      "1:00 PM - Afternoon runs",
    ],
    cellService: "good",
    weather: {
      condition: "partlyCloudy",
      temperature: 52,
      feelsLike: 48,
      humidity: 45,
      windSpeed: 12,
      windDirection: "NW",
      precipChance: 25,
      uvIndex: 4,
      cloudCover: 40,
      visibility: 8,
      sunriseTime: "6:52 AM",
      sunsetTime: "5:58 PM",
      moonPhase: "Full Moon",
      impactRating: "good",
      impactNotes: [
        "Trails may be slightly tacky - good grip",
        "Afternoon showers possible - pack rain gear",
        "Comfortable riding temps",
      ],
      hourlyForecast: [
        { hour: "9AM", temp: 45, condition: "cloudy", wind: 8, precip: 5 },
        {
          hour: "11AM",
          temp: 52,
          condition: "partlyCloudy",
          wind: 12,
          precip: 15,
        },
        { hour: "1PM", temp: 55, condition: "cloudy", wind: 15, precip: 30 },
        { hour: "3PM", temp: 53, condition: "rainy", wind: 12, precip: 45 },
        { hour: "5PM", temp: 48, condition: "cloudy", wind: 10, precip: 20 },
      ],
    },
  },
  {
    id: "2",
    title: "Backcountry Ski Tour",
    description:
      "Skinning up for fresh pow! Need AT gear and avalanche safety knowledge. Advanced terrain.",
    activityType: "touringski",
    skillLevel: "advanced",
    hostName: "Dakota",
    hostImage: profileImages.jordan,
    location: "Silverton, CO",
    date: "Feb 20, 2026",
    time: "6:00 AM",
    maxAttendees: 4,
    currentAttendees: 2,
    imageUrl: natureImages.canyonVista,
    schedule: [
      "6:00 AM - Beacon check",
      "6:30 AM - Skin up",
      "10:00 AM - Summit",
      "11:00 AM - Ski down",
    ],
    cellService: "none",
    weather: {
      condition: "stormy",
      temperature: 22,
      feelsLike: 8,
      humidity: 75,
      windSpeed: 35,
      windDirection: "W",
      precipChance: 85,
      uvIndex: 2,
      cloudCover: 95,
      visibility: 2,
      sunriseTime: "6:48 AM",
      sunsetTime: "6:02 PM",
      moonPhase: "Waning Crescent",
      impactRating: "dangerous",
      impactNotes: [
        "High avalanche danger - check CAIC forecast",
        "Whiteout conditions expected above treeline",
        "Consider postponing trip",
      ],
      hourlyForecast: [
        { hour: "6AM", temp: 20, condition: "snowy", wind: 25, precip: 70 },
        { hour: "9AM", temp: 22, condition: "stormy", wind: 40, precip: 90 },
        { hour: "12PM", temp: 24, condition: "stormy", wind: 45, precip: 85 },
        { hour: "3PM", temp: 22, condition: "snowy", wind: 35, precip: 75 },
      ],
      alerts: [
        {
          severity: "danger",
          title: "Winter Storm Warning",
          message:
            "Heavy snow and high winds expected. 12-18 inches possible above 10,000ft. Travel extremely hazardous in backcountry.",
          safetyActions: [
            "Check avalanche forecast before departure",
            "Consider postponing to safer day",
            "Carry emergency shelter and overnight gear",
            "File trip plan with contact",
          ],
        },
      ],
    },
  },
  {
    id: "3",
    title: "Golden Hour Photography Session",
    description:
      "Capture epic sunset shots outside of town with fellow photographers and storytellers.",
    activityType: "photography",
    skillLevel: "intermediate",
    hostName: "Lila",
    hostImage: profileImages.sarah,
    location: "Red Rocks, CO",
    date: "Feb 18, 2026",
    time: "5:30 PM",
    maxAttendees: 6,
    currentAttendees: 4,
    imageUrl: natureImages.starryNight,
    schedule: [
      "5:30 PM - Meet at trailhead",
      "6:00 PM - Scout locations",
      "6:45 PM - Golden hour shoot",
      "8:30 PM - Share edits",
    ],
    cellService: "fair",
    weather: {
      condition: "partlyCloudy",
      temperature: 52,
      feelsLike: 48,
      humidity: 45,
      windSpeed: 10,
      windDirection: "NW",
      precipChance: 10,
      uvIndex: 3,
      cloudCover: 30,
      visibility: 10,
      sunriseTime: "6:25 AM",
      sunsetTime: "6:05 PM",
      moonPhase: "Waxing Crescent",
      impactRating: "excellent",
      impactNotes: [
        "Great light for landscapes",
        "Low chance of rain",
        "Cool evening with crisp air",
      ],
      hourlyForecast: [
        {
          hour: "5PM",
          temp: 55,
          condition: "partlyCloudy",
          wind: 8,
          precip: 5,
        },
        {
          hour: "6PM",
          temp: 53,
          condition: "partlyCloudy",
          wind: 10,
          precip: 10,
        },
        { hour: "7PM", temp: 50, condition: "clear", wind: 8, precip: 0 },
        { hour: "8PM", temp: 46, condition: "clear", wind: 6, precip: 0 },
      ],
    },
  },
  {
    id: "4",
    title: "Nomad Fishing Trip",
    description:
      "Fly fishing at a secret alpine lake. All skill levels welcome! Ill teach beginners the basics.",
    activityType: "fishing",
    skillLevel: "beginner",
    hostName: "Kody",
    hostImage: profileImages.sam,
    location: "Grand Mesa, CO",
    date: "Mar 1, 2026",
    time: "6:00 AM",
    maxAttendees: 4,
    currentAttendees: 1,
    imageUrl: natureImages.mistyForest,
    schedule: [
      "6:00 AM - Meet up",
      "7:00 AM - Hike in",
      "8:00 AM - Fish!",
      "2:00 PM - Head out",
    ],
    cellService: "fair",
    weather: {
      condition: "foggy",
      temperature: 42,
      feelsLike: 38,
      humidity: 85,
      windSpeed: 5,
      windDirection: "E",
      precipChance: 15,
      uvIndex: 3,
      cloudCover: 70,
      visibility: 3,
      sunriseTime: "6:38 AM",
      sunsetTime: "6:18 PM",
      moonPhase: "New Moon",
      impactRating: "good",
      impactNotes: [
        "Morning fog great for fishing - fish are active",
        "Low light conditions early - easy on the eyes",
        "Expect fog to burn off by 10AM",
      ],
      hourlyForecast: [
        { hour: "6AM", temp: 38, condition: "foggy", wind: 3, precip: 0 },
        { hour: "8AM", temp: 42, condition: "foggy", wind: 5, precip: 5 },
        {
          hour: "10AM",
          temp: 52,
          condition: "partlyCloudy",
          wind: 8,
          precip: 5,
        },
        { hour: "12PM", temp: 58, condition: "sunny", wind: 10, precip: 0 },
        { hour: "2PM", temp: 60, condition: "sunny", wind: 8, precip: 0 },
      ],
    },
  },
  {
    id: "4",
    title: "Stargazing & Night Photography",
    description:
      "Capturing the Milky Way at a dark sky location. Bring tripods and warm layers. Clear skies expected!",
    activityType: "explore",
    skillLevel: "beginner",
    hostName: "Maria",
    hostImage: profileImages.sarah,
    location: "Dead Horse Point, UT",
    date: "Mar 8, 2026",
    time: "8:00 PM",
    maxAttendees: 8,
    currentAttendees: 4,
    imageUrl: natureImages.starryNight,
    cellService: "good",
    weather: {
      condition: "clear",
      temperature: 45,
      feelsLike: 40,
      humidity: 20,
      windSpeed: 8,
      windDirection: "N",
      precipChance: 0,
      uvIndex: 0,
      cloudCover: 5,
      visibility: 15,
      sunriseTime: "6:32 AM",
      sunsetTime: "6:28 PM",
      moonPhase: "New Moon",
      impactRating: "excellent",
      impactNotes: [
        "New moon = perfect dark sky conditions",
        "Minimal cloud cover for clear viewing",
        "Low humidity means crisp star visibility",
      ],
      goldenHour: { start: "5:48 PM", end: "6:28 PM" },
      blueHour: { start: "6:28 PM", end: "7:02 PM" },
      stargazingRating: "excellent",
      hourlyForecast: [
        { hour: "6PM", temp: 52, condition: "sunny", wind: 10, precip: 0 },
        { hour: "8PM", temp: 48, condition: "clear", wind: 8, precip: 0 },
        { hour: "10PM", temp: 42, condition: "clear", wind: 5, precip: 0 },
        { hour: "12AM", temp: 38, condition: "clear", wind: 3, precip: 0 },
      ],
    },
  },
  {
    id: "5",
    title: "Off-Road Adventure Day",
    description:
      "Taking the rigs on some 4x4 trails! Need high clearance. Winch and recovery gear recommended.",
    activityType: "offroad",
    skillLevel: "intermediate",
    hostName: "Sam",
    hostImage: profileImages.sam,
    location: "Moab, UT",
    date: "Feb 22, 2026",
    time: "9:00 AM",
    maxAttendees: 6,
    currentAttendees: 3,
    imageUrl: natureImages.mistyForest,
    schedule: [
      "9:00 AM - Air down tires",
      "10:00 AM - Hit the trail",
      "1:00 PM - Lunch break",
      "4:00 PM - Return",
    ],
    cellService: "bad",
    weather: {
      condition: "windy",
      temperature: 65,
      feelsLike: 60,
      humidity: 25,
      windSpeed: 28,
      windDirection: "SW",
      precipChance: 5,
      uvIndex: 7,
      cloudCover: 20,
      visibility: 8,
      sunriseTime: "6:42 AM",
      sunsetTime: "6:15 PM",
      moonPhase: "First Quarter",
      impactRating: "fair",
      impactNotes: [
        "High winds may kick up dust on trails",
        "Watch for blowing sand reducing visibility",
        "Secure loose items on rigs",
      ],
      alerts: [
        {
          severity: "warning",
          title: "High Wind Advisory",
          message:
            "Gusts up to 45 mph expected. Blowing dust may reduce visibility. Use caution when towing or driving high-profile vehicles.",
          safetyActions: [
            "Secure all loose gear",
            "Keep windows up in dusty areas",
            "Watch for debris on trails",
          ],
        },
      ],
      hourlyForecast: [
        { hour: "9AM", temp: 55, condition: "windy", wind: 20, precip: 0 },
        { hour: "11AM", temp: 62, condition: "windy", wind: 28, precip: 0 },
        { hour: "1PM", temp: 68, condition: "windy", wind: 32, precip: 0 },
        { hour: "3PM", temp: 65, condition: "windy", wind: 25, precip: 5 },
        {
          hour: "5PM",
          temp: 58,
          condition: "partlyCloudy",
          wind: 18,
          precip: 0,
        },
      ],
    },
  },
];

interface OutdoorEventsProps {
  onEventSelect?: (event: OutdoorEvent) => void;
}

export function OutdoorEvents({ onEventSelect }: OutdoorEventsProps) {
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | "all">(
    "all",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<OutdoorEvent | null>(null);

  const filteredEvents =
    selectedFilter === "all"
      ? sampleEvents
      : sampleEvents.filter((e) => e.activityType === selectedFilter);

  const filters: (ActivityType | "all")[] = [
    "all",
    "backpacking",
    "mtb",
    "ski",
    "snowboard",
    "climb",
    "camp",
    "fishing",
    "kayak",
    "photography",
    "sup",
    "surf",
    "offroad",
    "motorcycle",
    "explore",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nomad Meetups</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Host</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled={true}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.filterScroll}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            {filter !== "all" && (
              <Ionicons
                name={activityIcons[filter]}
                size={14}
                color={selectedFilter === filter ? "#FFFFFF" : colors.bark[500]}
              />
            )}
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter === "all" ? "All" : activityLabels[filter]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled={true}
        decelerationRate="fast"
        snapToInterval={EVENT_CARD_WIDTH + spacing.md}
        snapToAlignment="start"
        nestedScrollEnabled={true}
        contentContainerStyle={[
          styles.eventsScroll,
          { paddingRight: spacing.lg },
        ]}
      >
        {filteredEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => setSelectedEvent(event)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.eventImage}
              contentFit="cover"
            />
            <View style={styles.eventBadge}>
              <Ionicons
                name={activityIcons[event.activityType]}
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.eventBadgeText}>
                {activityLabels[event.activityType]}
              </Text>
            </View>
            <View
              style={[
                styles.skillBadge,
                { backgroundColor: skillLevelColors[event.skillLevel] },
              ]}
            >
              <Text style={styles.skillBadgeText}>
                {skillLevelLabels[event.skillLevel]}
              </Text>
            </View>
            {event.weather ? (
              <View style={styles.weatherBadgeContainer}>
                <View
                  style={[
                    styles.weatherBadge,
                    {
                      backgroundColor:
                        impactRatingColors[event.weather.impactRating],
                    },
                  ]}
                >
                  <Ionicons
                    name={getWeatherIcon(event.weather.condition)}
                    size={12}
                    color="#FFFFFF"
                  />
                  <Text style={styles.weatherBadgeTemp}>
                    {event.weather.temperature}°
                  </Text>
                </View>
                {event.weather.alerts && event.weather.alerts.length > 0 ? (
                  <View
                    style={[
                      styles.alertIndicator,
                      {
                        backgroundColor:
                          event.weather.alerts[0].severity === "danger"
                            ? "#EF4444"
                            : "#F59E0B",
                      },
                    ]}
                  >
                    <Ionicons name="warning" size={10} color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
            ) : null}
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaRow}>
                  <Ionicons
                    name="location"
                    size={12}
                    color={colors.bark[400]}
                  />
                  <Text style={styles.eventMetaText}>{event.location}</Text>
                </View>
                <View style={styles.eventMetaRow}>
                  <Ionicons
                    name="calendar"
                    size={12}
                    color={colors.bark[400]}
                  />
                  <Text style={styles.eventMetaText}>{event.date}</Text>
                </View>
              </View>
              {event.weather ? (
                <View style={styles.eventWeatherPreview}>
                  <Text
                    style={[
                      styles.weatherImpactLabel,
                      { color: impactRatingColors[event.weather.impactRating] },
                    ]}
                  >
                    {event.weather.impactRating.charAt(0).toUpperCase() +
                      event.weather.impactRating.slice(1)}{" "}
                    Conditions
                  </Text>
                  {event.weather.alerts && event.weather.alerts.length > 0 ? (
                    <Text style={styles.alertPreviewText} numberOfLines={1}>
                      {event.weather.alerts[0].title}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              <View style={styles.eventHostRow}>
                <View style={styles.eventHost}>
                  <Image
                    source={{ uri: event.hostImage }}
                    style={styles.hostAvatar}
                    contentFit="cover"
                  />
                  <Text style={styles.hostName}>
                    Hosted by {event.hostName}
                  </Text>
                </View>
                {event.cellService ? (
                  <View
                    style={[
                      styles.cellServiceBadge,
                      {
                        backgroundColor:
                          getCellServiceDisplay(event.cellService).color + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={getCellServiceDisplay(event.cellService).icon}
                      size={12}
                      color={getCellServiceDisplay(event.cellService).color}
                    />
                    <Text
                      style={[
                        styles.cellServiceText,
                        {
                          color: getCellServiceDisplay(event.cellService).color,
                        },
                      ]}
                    >
                      {getCellServiceDisplay(event.cellService).label}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.attendeeBar}>
                <View
                  style={[
                    styles.attendeeFill,
                    {
                      width: `${(event.currentAttendees / event.maxAttendees) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.attendeeText}>
                {event.currentAttendees}/{event.maxAttendees} spots filled
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <EventDetailModal
        event={selectedEvent}
        visible={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
      />

      <CreateEventModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}

interface EventDetailModalProps {
  event: OutdoorEvent | null;
  visible: boolean;
  onClose: () => void;
}

function EventDetailModal({ event, visible, onClose }: EventDetailModalProps) {
  const [joined, setJoined] = useState(false);
  if (!event) return null;

  const ModalContent = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Image
        source={{ uri: event.imageUrl }}
        style={styles.detailImage}
        contentFit="cover"
      />
      <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.detailContent}>
        <View style={styles.detailBadges}>
          <View style={styles.detailBadge}>
            <Ionicons
              name={activityIcons[event.activityType]}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.detailBadgeText}>
              {activityLabels[event.activityType]}
            </Text>
          </View>
          <View
            style={[
              styles.detailSkillBadge,
              { backgroundColor: skillLevelColors[event.skillLevel] },
            ]}
          >
            <Text style={styles.detailSkillText}>
              {skillLevelLabels[event.skillLevel]}
            </Text>
          </View>
        </View>

        <Text style={styles.detailTitle}>{event.title}</Text>

        <View style={styles.detailHost}>
          <Image
            source={{ uri: event.hostImage }}
            style={styles.detailHostAvatar}
            contentFit="cover"
          />
          <View>
            <Text style={styles.detailHostLabel}>Hosted by</Text>
            <Text style={styles.detailHostName}>{event.hostName}</Text>
          </View>
        </View>

        <View style={styles.detailInfo}>
          <View style={styles.detailInfoRow}>
            <Ionicons name="location" size={18} color={colors.deepTeal[500]} />
            <Text style={styles.detailInfoText}>{event.location}</Text>
          </View>
          <View style={styles.detailInfoRow}>
            <Ionicons name="calendar" size={18} color={colors.deepTeal[500]} />
            <Text style={styles.detailInfoText}>
              {event.date} at {event.time}
            </Text>
          </View>
          <View style={styles.detailInfoRow}>
            <Ionicons name="people" size={18} color={colors.deepTeal[500]} />
            <Text style={styles.detailInfoText}>
              {event.currentAttendees}/{event.maxAttendees} adventurers
            </Text>
          </View>
        </View>

        <Text style={styles.detailSectionTitle}>About This Adventure</Text>
        <Text style={styles.detailDescription}>{event.description}</Text>

        {event.schedule && event.schedule.length > 0 ? (
          <>
            <Text style={styles.detailSectionTitle}>Schedule</Text>
            {event.schedule.map((item, index) => (
              <View key={index} style={styles.scheduleItem}>
                <View style={styles.scheduleDot} />
                <Text style={styles.scheduleText}>{item}</Text>
              </View>
            ))}
          </>
        ) : null}

        {event.weather ? (
          <>
            <Text style={styles.detailSectionTitle}>Weather Forecast</Text>

            {event.weather.alerts && event.weather.alerts.length > 0 ? (
              <View style={styles.weatherAlertSection}>
                {event.weather.alerts.map((alert, index) => (
                  <View
                    key={index}
                    style={[
                      styles.weatherAlertCard,
                      {
                        backgroundColor:
                          alert.severity === "danger"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(245, 158, 11, 0.15)",
                        borderColor:
                          alert.severity === "danger" ? "#EF4444" : "#F59E0B",
                      },
                    ]}
                  >
                    <View style={styles.alertHeaderRow}>
                      <Ionicons
                        name={
                          alert.severity === "danger"
                            ? "warning"
                            : "alert-circle"
                        }
                        size={20}
                        color={
                          alert.severity === "danger" ? "#EF4444" : "#F59E0B"
                        }
                      />
                      <Text
                        style={[
                          styles.alertTitleText,
                          {
                            color:
                              alert.severity === "danger"
                                ? "#EF4444"
                                : "#F59E0B",
                          },
                        ]}
                      >
                        {alert.title}
                      </Text>
                    </View>
                    <Text style={styles.alertMessageText}>{alert.message}</Text>
                    {alert.safetyActions.length > 0 ? (
                      <View style={styles.safetyActionsBox}>
                        <Text style={styles.safetyActionsHeader}>
                          Safety Actions:
                        </Text>
                        {alert.safetyActions.map((action, idx) => (
                          <View key={idx} style={styles.safetyActionItem}>
                            <Ionicons
                              name="shield-checkmark"
                              size={14}
                              color={colors.moss[500]}
                            />
                            <Text style={styles.safetyActionItemText}>
                              {action}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.weatherMainCard}>
              <View style={styles.weatherMainRow}>
                <View style={styles.weatherConditionBox}>
                  <Ionicons
                    name={getWeatherIcon(event.weather.condition)}
                    size={40}
                    color={colors.ember[500]}
                  />
                  <Text style={styles.weatherTempLarge}>
                    {event.weather.temperature}°F
                  </Text>
                  <Text style={styles.weatherConditionLabel}>
                    {event.weather.condition.charAt(0).toUpperCase() +
                      event.weather.condition.slice(1)}
                  </Text>
                  <Text style={styles.weatherFeelsLike}>
                    Feels like {event.weather.feelsLike}°F
                  </Text>
                </View>
                <View
                  style={[
                    styles.weatherImpactBadgeLarge,
                    {
                      backgroundColor:
                        impactRatingColors[event.weather.impactRating],
                    },
                  ]}
                >
                  <Text style={styles.weatherImpactBadgeText}>
                    {event.weather.impactRating.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.weatherDetailsGrid}>
                <View style={styles.weatherDetailBox}>
                  <Ionicons name="water" size={16} color={colors.bark[400]} />
                  <Text style={styles.weatherDetailLabel}>Humidity</Text>
                  <Text style={styles.weatherDetailValue}>
                    {event.weather.humidity}%
                  </Text>
                </View>
                <View style={styles.weatherDetailBox}>
                  <Ionicons
                    name="speedometer"
                    size={16}
                    color={colors.bark[400]}
                  />
                  <Text style={styles.weatherDetailLabel}>Wind</Text>
                  <Text style={styles.weatherDetailValue}>
                    {event.weather.windSpeed} mph {event.weather.windDirection}
                  </Text>
                </View>
                <View style={styles.weatherDetailBox}>
                  <Ionicons name="rainy" size={16} color={colors.bark[400]} />
                  <Text style={styles.weatherDetailLabel}>Precip</Text>
                  <Text style={styles.weatherDetailValue}>
                    {event.weather.precipChance}%
                  </Text>
                </View>
                <View style={styles.weatherDetailBox}>
                  <Ionicons name="sunny" size={16} color={colors.bark[400]} />
                  <Text style={styles.weatherDetailLabel}>UV Index</Text>
                  <Text style={styles.weatherDetailValue}>
                    {event.weather.uvIndex}
                  </Text>
                </View>
                <View style={styles.weatherDetailBox}>
                  <Ionicons name="eye" size={16} color={colors.bark[400]} />
                  <Text style={styles.weatherDetailLabel}>Visibility</Text>
                  <Text style={styles.weatherDetailValue}>
                    {event.weather.visibility} mi
                  </Text>
                </View>
                <View style={styles.weatherDetailBox}>
                  <Ionicons name="cloud" size={16} color={colors.bark[400]} />
                  <Text style={styles.weatherDetailLabel}>Clouds</Text>
                  <Text style={styles.weatherDetailValue}>
                    {event.weather.cloudCover}%
                  </Text>
                </View>
              </View>

              <View style={styles.sunMoonRow}>
                <View style={styles.sunMoonItem}>
                  <Ionicons
                    name="sunny-outline"
                    size={16}
                    color={colors.ember[500]}
                  />
                  <Text style={styles.sunMoonLabel}>Sunrise</Text>
                  <Text style={styles.sunMoonValue}>
                    {event.weather.sunriseTime}
                  </Text>
                </View>
                <View style={styles.sunMoonItem}>
                  <Ionicons
                    name="moon-outline"
                    size={16}
                    color={colors.bark[500]}
                  />
                  <Text style={styles.sunMoonLabel}>Sunset</Text>
                  <Text style={styles.sunMoonValue}>
                    {event.weather.sunsetTime}
                  </Text>
                </View>
                <View style={styles.sunMoonItem}>
                  <Ionicons name="moon" size={16} color={colors.bark[400]} />
                  <Text style={styles.sunMoonLabel}>Moon</Text>
                  <Text style={styles.sunMoonValue}>
                    {event.weather.moonPhase}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.detailSubSectionTitle}>
              Hour-by-Hour Forecast
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.hourlyScroll}
            >
              {event.weather.hourlyForecast.map((hour, index) => (
                <View key={index} style={styles.hourlyForecastCard}>
                  <Text style={styles.hourlyTimeText}>{hour.hour}</Text>
                  <Ionicons
                    name={getWeatherIcon(hour.condition)}
                    size={22}
                    color={colors.ember[400]}
                  />
                  <Text style={styles.hourlyTempText}>{hour.temp}°</Text>
                  <View style={styles.hourlyWindRow}>
                    <Ionicons
                      name="speedometer-outline"
                      size={10}
                      color={colors.bark[400]}
                    />
                    <Text style={styles.hourlyWindText}>{hour.wind}</Text>
                  </View>
                  {hour.precip > 15 ? (
                    <View style={styles.hourlyPrecipRow}>
                      <Ionicons name="water" size={10} color="#3B82F6" />
                      <Text style={styles.hourlyPrecipText}>
                        {hour.precip}%
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>

            <Text style={styles.detailSubSectionTitle}>
              Event-Specific Weather Impact
            </Text>
            <View style={styles.impactNotesCard}>
              {event.weather.impactNotes.map((note, index) => (
                <View key={index} style={styles.impactNoteRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.moss[500]}
                  />
                  <Text style={styles.impactNoteText}>{note}</Text>
                </View>
              ))}
            </View>

            {event.weather.goldenHour ? (
              <View style={styles.lightingInfoRow}>
                <View style={styles.goldenHourBadge}>
                  <Ionicons name="sunny" size={12} color="#FFFFFF" />
                  <Text style={styles.lightingBadgeText}>Golden Hour</Text>
                </View>
                <Text style={styles.lightingTimeText}>
                  {event.weather.goldenHour.start} -{" "}
                  {event.weather.goldenHour.end}
                </Text>
              </View>
            ) : null}

            {event.weather.blueHour ? (
              <View style={styles.lightingInfoRow}>
                <View style={styles.blueHourBadge}>
                  <Ionicons name="moon" size={12} color="#FFFFFF" />
                  <Text style={styles.lightingBadgeText}>Blue Hour</Text>
                </View>
                <Text style={styles.lightingTimeText}>
                  {event.weather.blueHour.start} - {event.weather.blueHour.end}
                </Text>
              </View>
            ) : null}

            {event.weather.stargazingRating ? (
              <View style={styles.stargazingInfoRow}>
                <Ionicons name="star" size={16} color={colors.bark[400]} />
                <Text style={styles.stargazingLabel}>
                  Stargazing Conditions:
                </Text>
                <Text
                  style={[
                    styles.stargazingRating,
                    {
                      color: impactRatingColors[event.weather.stargazingRating],
                    },
                  ]}
                >
                  {event.weather.stargazingRating.charAt(0).toUpperCase() +
                    event.weather.stargazingRating.slice(1)}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}

        <TouchableOpacity
          style={[styles.joinButton, joined && { backgroundColor: "#4ADE80" }]}
          onPress={() => setJoined(true)}
          disabled={joined}
        >
          <Ionicons
            name={joined ? "checkmark-circle" : "add-circle"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.joinButtonText}>
            {joined ? "Joined!" : "Join This Adventure"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={90} tint="dark" style={styles.detailModal}>
            <ModalContent />
          </BlurView>
        ) : (
          <View style={[styles.detailModal, styles.modalFallback]}>
            <ModalContent />
          </View>
        )}
      </View>
    </Modal>
  );
}

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
}

function CreateEventModal({ visible, onClose }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activityType: "backpacking" as ActivityType,
    skillLevel: "intermediate" as SkillLevel,
    location: "",
    date: "",
    time: "",
    maxAttendees: "8",
    schedule: "",
  });

  const activityOptions: ActivityType[] = [
    "backpacking",
    "mtb",
    "fishing",
    "ski",
    "snowboard",
    "kayak",
    "sup",
    "surf",
    "climb",
    "camp",
    "offroad",
    "motorcycle",
    "dirtbike",
    "snowmobile",
    "explore",
  ];

  const handleCreate = () => {
    onClose();
  };

  const ModalContent = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.createHeader}>
        <Text style={styles.createTitle}>Host a Nomad Meetup</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeCreateButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Activity Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.activitySelector}>
            {activityOptions.map((activity) => (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.activityOption,
                  formData.activityType === activity &&
                    styles.activityOptionActive,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, activityType: activity }))
                }
              >
                <Ionicons
                  name={activityIcons[activity]}
                  size={20}
                  color={
                    formData.activityType === activity
                      ? "#FFFFFF"
                      : colors.bark[400]
                  }
                />
                <Text
                  style={[
                    styles.activityOptionText,
                    formData.activityType === activity &&
                      styles.activityOptionTextActive,
                  ]}
                >
                  {activityLabels[activity]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Skill Level</Text>
        <View style={styles.skillSelector}>
          {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map(
            (level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.skillOption,
                  formData.skillLevel === level && {
                    backgroundColor: skillLevelColors[level],
                  },
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, skillLevel: level }))
                }
              >
                <Text
                  style={[
                    styles.skillOptionText,
                    formData.skillLevel === level &&
                      styles.skillOptionTextActive,
                  ]}
                >
                  {skillLevelLabels[level]}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Event Title</Text>
        <TextInput
          style={styles.formInput}
          value={formData.title}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, title: text }))
          }
          placeholder="e.g., Sunrise Photography at the Dunes"
          placeholderTextColor={colors.bark[300]}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Description</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          value={formData.description}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, description: text }))
          }
          placeholder="Tell adventurers what to expect..."
          placeholderTextColor={colors.bark[300]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>Location</Text>
          <TextInput
            style={styles.formInput}
            value={formData.location}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, location: text }))
            }
            placeholder="Where?"
            placeholderTextColor={colors.bark[300]}
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.formLabel}>Date</Text>
          <TextInput
            style={styles.formInput}
            value={formData.date}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, date: text }))
            }
            placeholder="Feb 15, 2026"
            placeholderTextColor={colors.bark[300]}
          />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>Time</Text>
          <TextInput
            style={styles.formInput}
            value={formData.time}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, time: text }))
            }
            placeholder="4:00 PM"
            placeholderTextColor={colors.bark[300]}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Max Attendees</Text>
        <TextInput
          style={styles.formInput}
          value={formData.maxAttendees}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, maxAttendees: text }))
          }
          placeholder="8"
          placeholderTextColor={colors.bark[300]}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Schedule (optional)</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          value={formData.schedule}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, schedule: text }))
          }
          placeholder="Add timeline items, one per line..."
          placeholderTextColor={colors.bark[300]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.createEventButton} onPress={handleCreate}>
        <Ionicons name="megaphone" size={20} color="#FFFFFF" />
        <Text style={styles.createEventButtonText}>Create Adventure</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={90} tint="dark" style={styles.createModal}>
            <ModalContent />
          </BlurView>
        ) : (
          <View style={[styles.createModal, styles.modalFallback]}>
            <ModalContent />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[900],
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.deepTeal[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  createButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.deepTeal[500],
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  eventsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  eventCard: {
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginRight: spacing.md,
  },
  eventImage: {
    width: "100%",
    height: 100,
  },
  eventBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  eventBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
  },
  skillBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  skillBadgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  weatherBadgeContainer: {
    position: "absolute",
    top: spacing.sm + 28,
    right: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  weatherBadgeTemp: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodyBold,
    color: "#FFFFFF",
  },
  alertIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  eventWeatherPreview: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  weatherImpactLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  alertPreviewText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    color: colors.clay[500],
    marginTop: 2,
  },
  eventContent: {
    padding: spacing.sm,
  },
  eventTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.heading,
    color: colors.bark[700],
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  eventMeta: {
    marginBottom: spacing.sm,
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  eventMetaText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  eventHostRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  eventHost: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  hostAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  hostName: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[500],
  },
  cellServiceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  cellServiceText: {
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontFamily.bodySemiBold,
  },
  attendeeBar: {
    height: 4,
    backgroundColor: colors.bark[100],
    borderRadius: 2,
    marginBottom: 4,
  },
  attendeeFill: {
    height: "100%",
    backgroundColor: colors.deepTeal[400],
    borderRadius: 2,
  },
  attendeeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[400],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  detailModal: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalFallback: {
    backgroundColor: colors.bark[800],
  },
  detailImage: {
    width: "100%",
    height: 200,
  },
  closeModalButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    padding: spacing.xl,
  },
  detailBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.deepTeal[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
  },
  detailBadgeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
  },
  detailSkillBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  detailSkillText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  detailTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
    marginBottom: spacing.md,
  },
  detailHost: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  detailHostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  detailHostLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.6)",
  },
  detailHostName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
  },
  detailInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  detailInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailInfoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "#FFFFFF",
  },
  detailSectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
    marginBottom: spacing.sm,
  },
  detailDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  scheduleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.deepTeal[400],
  },
  scheduleText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.8)",
  },
  weatherAlertSection: {
    marginBottom: spacing.md,
  },
  weatherAlertCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  alertHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  alertTitleText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyBold,
  },
  alertMessageText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  safetyActionsBox: {
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  safetyActionsHeader: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  safetyActionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  safetyActionItemText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.85)",
  },
  weatherMainCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  weatherMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  weatherConditionBox: {
    alignItems: "center",
    gap: 4,
  },
  weatherTempLarge: {
    fontSize: 32,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
  },
  weatherConditionLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  weatherFeelsLike: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.6)",
  },
  weatherImpactBadgeLarge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  weatherImpactBadgeText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodyBold,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  weatherDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  weatherDetailBox: {
    width: "30%",
    alignItems: "center",
    gap: 4,
  },
  weatherDetailLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.6)",
  },
  weatherDetailValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  sunMoonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  sunMoonItem: {
    alignItems: "center",
    gap: 4,
  },
  sunMoonLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.6)",
  },
  sunMoonValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  detailSubSectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  hourlyScroll: {
    marginBottom: spacing.md,
  },
  hourlyForecastCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginRight: spacing.sm,
    minWidth: 60,
    gap: 4,
  },
  hourlyTimeText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "rgba(255, 255, 255, 0.8)",
  },
  hourlyTempText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyBold,
    color: "#FFFFFF",
  },
  hourlyWindRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  hourlyWindText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.6)",
  },
  hourlyPrecipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  hourlyPrecipText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.body,
    color: "#60A5FA",
  },
  impactNotesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  impactNoteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  impactNoteText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 20,
  },
  lightingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  goldenHourBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  blueHourBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#3B82F6",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  lightingBadgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  lightingTimeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodySemiBold,
    color: "#FFFFFF",
  },
  stargazingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  stargazingLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: "rgba(255, 255, 255, 0.7)",
  },
  stargazingRating: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyBold,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.ember[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  joinButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
  },
  createModal: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: "90%",
    overflow: "hidden",
  },
  createHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  createTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    color: "#FFFFFF",
  },
  closeCreateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formRow: {
    flexDirection: "row",
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: spacing.xs,
  },
  formInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  formTextArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  activitySelector: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  activityOption: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 80,
  },
  activityOptionActive: {
    backgroundColor: colors.deepTeal[500],
  },
  activityOptionText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.bark[300],
    marginTop: 4,
  },
  activityOptionTextActive: {
    color: "#FFFFFF",
  },
  skillSelector: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  skillOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  skillOptionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyMedium,
    color: colors.bark[300],
  },
  skillOptionTextActive: {
    color: "#FFFFFF",
  },
  createEventButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.ember[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  createEventButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodyMedium,
    color: "#FFFFFF",
  },
});
