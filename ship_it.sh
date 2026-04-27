#!/bin/bash
set -e

echo "=== WilderGo Ship Script ==="
echo "Building new iOS binary with EAS..."

# Trigger a fresh build on EAS to generate a new binary with current app.json values
eas build --platform ios --profile production --non-interactive

echo "Submitting the new build to TestFlight..."
# Submit the newly created build
eas submit --platform ios --latest --non-interactive

echo "=== Done ==="
