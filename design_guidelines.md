# WilderGo Design Guidelines

## Brand Identity

**Purpose**: WilderGo helps outdoor adventurers make informed decisions about their wilderness activities through real-time weather monitoring and trail conditions.

**Aesthetic Direction**: Organic/natural with bold accents. The app should feel rugged yet refined—like premium outdoor gear. Think earth tones meeting sharp, high-contrast alerts. The interface breathes with generous whitespace, mimicking open wilderness.

**Memorable Element**: The weather HUD that expands/collapses like opening a topographic map, revealing layered information depth.

## Navigation Architecture

**Root Navigation**: Tab Navigation (4 tabs with FAB)

Tabs:
1. **Explore** - Discover trails, view map with weather overlays
2. **Weather** - Detailed weather forecasting and alerts
3. **Core Action (FAB)**: Check In - Quick location-based weather snapshot
4. **Profile** - User stats, saved locations, settings

## Screen Specifications

### Explore Screen
- **Header**: Transparent with location search (left: menu, right: filter)
- **Layout**: Map view as main content with overlaid weather pins
- **Safe Area**: Top inset = headerHeight + 16, Bottom = tabBarHeight + 16
- **Components**: Interactive map, floating weather HUD card (top), trail cards (bottom sheet)
- **Empty State**: "No trails nearby" with mountain illustration

### Weather Screen
- **Header**: Default opaque (title: "Weather", right: settings icon)
- **Layout**: Scrollable with weather cards
- **Safe Area**: Top inset = 16, Bottom = tabBarHeight + 16
- **Components**: Current conditions card, hourly forecast horizontal scroll, 7-day forecast list, weather alerts banner
- **Empty State**: "Weather data unavailable" with cloud illustration

### Check In (Modal)
- **Header**: None (native modal with close button top-left)
- **Layout**: Fixed centered content
- **Safe Area**: Top = insets.top + 24, Bottom = insets.bottom + 24
- **Components**: Large current weather display, location name, timestamp, "Save" button
- **Visual**: Full-screen gradient background matching current weather conditions

### Profile Screen
- **Header**: Transparent (title: avatar + name)
- **Layout**: Scrollable form
- **Safe Area**: Top = headerHeight + 16, Bottom = tabBarHeight + 16
- **Components**: Avatar (editable), stats cards (adventures logged, distance), saved locations list, settings section
- **No auth required** - single-user local app

## Color Palette

**Primary**: Forest Green #2D5016 (dominant, used for primary actions, active states)
**Accent**: Amber Alert #FF9500 (weather warnings, important CTAs)
**Background**: Warm Off-White #F8F6F2
**Surface**: Card White #FFFFFF
**Surface Secondary**: Mist Gray #E8E6E3
**Text Primary**: Charcoal #1C1C1E
**Text Secondary**: Slate #6C6C70
**Semantic Success**: Mountain Pine #34C759
**Semantic Warning**: Sunset Orange #FF9500
**Semantic Danger**: Storm Red #FF3B30

## Typography

**Primary Font**: Montserrat (bold, distinctive outdoor feel)
**Body Font**: System San Francisco (legibility)

**Type Scale**:
- Hero: Montserrat Bold, 32pt
- Title 1: Montserrat SemiBold, 24pt
- Title 2: System Bold, 20pt
- Body: System Regular, 16pt
- Caption: System Regular, 13pt

## Visual Design

- Cards: 12pt border radius, no shadows (except floating elements)
- Floating elements shadow: offset (0, 2), opacity 0.10, radius 2
- Buttons: High-contrast fills, 8pt radius, active state scales to 0.97
- Icons: Feather icon set, 24pt standard size
- Weather HUD: Glassmorphic effect (semi-transparent white with 8pt blur backdrop)

## Assets to Generate

**Required**:
1. **icon.png** - Compass rose overlaid on mountain peak silhouette, forest green on white
2. **splash-icon.png** - Same as app icon
3. **empty-trails.png** - Minimalist line-art mountain range, used on Explore screen when no trails found
4. **empty-weather.png** - Simple cloud with disconnected wifi symbol, used on Weather screen when data unavailable
5. **avatar-preset.png** - Silhouette of hiker with backpack, forest green on warm off-white, used as default profile avatar

**Recommended**:
6. **onboarding-location.png** - Illustrated map pin with concentric circles, used on location permission screen
7. **weather-clear.png** - Sun icon for clear weather conditions
8. **weather-rain.png** - Rain cloud for precipitation
9. **weather-snow.png** - Snowflake for winter conditions

All illustrations should use line-art style with the forest green color palette, maintaining organic curves and avoiding harsh geometric shapes.