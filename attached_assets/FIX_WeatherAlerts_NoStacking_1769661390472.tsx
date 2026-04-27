/* eslint-disable */
// FIX 1: WEATHER ALERTS - Stop Stacking & Auto-Dismiss
// =====================================================

// PROBLEM: Multiple weather alerts stack on top of each other, creating clutter
// SOLUTION: Show only ONE alert at a time, rotate through them, auto-dismiss

// In your Map screen component (map.tsx or similar):

import React, { useState, useEffect } from "react";
import { WeatherChangeAlert } from "./WeatherChangeAlert";

export const MapScreen = () => {
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (weatherAlerts.length > 0 && showAlert) {
      const dismissTimer = setTimeout(() => {
        setShowAlert(false);

        // Move to next alert after 1 second (transition time)
        setTimeout(() => {
          setCurrentAlertIndex((prev) => {
            const nextIndex = (prev + 1) % weatherAlerts.length;
            if (nextIndex === 0) {
              // We've shown all alerts, stop showing
              return 0;
            }
            setShowAlert(true);
            return nextIndex;
          });
        }, 1000);
      }, 8000); // Show for 8 seconds

      return () => clearTimeout(dismissTimer);
    }
  }, [showAlert, currentAlertIndex, weatherAlerts]);

  // Show first alert when new alerts arrive
  useEffect(() => {
    if (weatherAlerts.length > 0 && !showAlert) {
      setShowAlert(true);
      setCurrentAlertIndex(0);
    }
  }, [weatherAlerts]);

  return (
    <View style={{ flex: 1 }}>
      {/* Your map component */}

      {/* FIXED: Only show ONE alert at a time */}
      {showAlert && weatherAlerts.length > 0 && (
        <WeatherChangeAlert
          weatherChanges={[weatherAlerts[currentAlertIndex]]} // Only pass ONE alert
          visible={showAlert}
          onDismiss={() => setShowAlert(false)}
        />
      )}
    </View>
  );
};

// SUMMARY OF CHANGES:
// 1. Only shows ONE alert at a time (not all stacked)
// 2. Auto-dismisses after 8 seconds
// 3. Rotates through alerts if there are multiple
// 4. After showing all alerts once, stops showing them
// 5. User can manually dismiss by tapping (if you add that feature)
