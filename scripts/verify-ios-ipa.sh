#!/usr/bin/env bash
set -euo pipefail

IPA_PATH="${1:-}"
if [ -z "$IPA_PATH" ] || [ ! -f "$IPA_PATH" ]; then
  echo "ERROR: provide the generated .ipa path"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
unzip -q "$IPA_PATH" -d "$TMP_DIR"
APP_PATH="$(find "$TMP_DIR/Payload" -maxdepth 1 -type d -name '*.app' | head -n 1)"
if [ -z "$APP_PATH" ]; then
  echo "ERROR: .app bundle not found in IPA"
  exit 1
fi

PLIST="$APP_PATH/Info.plist"
if [ ! -f "$PLIST" ]; then
  echo "ERROR: Info.plist missing from app bundle"
  exit 1
fi

BUNDLE_ID=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$PLIST")
VERSION=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$PLIST")
BUILD=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$PLIST")
ENCRYPTION=$(/usr/libexec/PlistBuddy -c 'Print :ITSAppUsesNonExemptEncryption' "$PLIST" 2>/dev/null || true)
DISPLAY_NAME=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleDisplayName' "$PLIST" 2>/dev/null || true)

[ "$BUNDLE_ID" = "com.cliniverse.ai" ] || { echo "ERROR: unexpected bundle id: $BUNDLE_ID"; exit 1; }
[ -n "$VERSION" ] || { echo "ERROR: empty marketing version"; exit 1; }
[ -n "$BUILD" ] && [ "$BUILD" -eq "$BUILD" ] 2>/dev/null || { echo "ERROR: build number is empty or non-numeric"; exit 1; }
[ "$ENCRYPTION" = "false" ] || { echo "ERROR: encryption declaration missing or not false"; exit 1; }
[ "$DISPLAY_NAME" = "Cliniverse AI" ] || { echo "ERROR: unexpected display name: $DISPLAY_NAME"; exit 1; }

# A generated AppIcon should result in compiled asset catalog resources in the final bundle.
[ -f "$APP_PATH/Assets.car" ] || { echo "ERROR: compiled Assets.car missing; AppIcon pipeline may be broken"; exit 1; }

# The application manifest must be at the app-bundle root. A dependency's
# nested manifest is not a substitute for the App target declaration.
PRIVACY_MANIFEST="$APP_PATH/PrivacyInfo.xcprivacy"
[ -f "$PRIVACY_MANIFEST" ] || { echo "HOLD: app-level PrivacyInfo.xcprivacy is missing"; exit 2; }
plutil -lint "$PRIVACY_MANIFEST"

# The local fallback is the native recovery surface for remote-origin failure.
[ -f "$APP_PATH/public/native-offline.html" ] || { echo "HOLD: native offline recovery page is missing"; exit 2; }

# Apple v1 does not include these native capabilities. Their presence would
# indicate binary/configuration drift and requires a separate privacy review.
for key in \
  NSHealthShareUsageDescription \
  NSHealthUpdateUsageDescription \
  NSCameraUsageDescription \
  NSMicrophoneUsageDescription \
  NSLocationWhenInUseUsageDescription \
  NSPhotoLibraryUsageDescription
do
  if /usr/libexec/PlistBuddy -c "Print :$key" "$PLIST" >/dev/null 2>&1; then
    echo "HOLD: unexpected usage-description key present: $key"
    exit 2
  fi
done

echo "PASS: IPA identity and packaging checks"
echo "PASS: app privacy manifest and offline recovery are packaged"
echo "Bundle: $BUNDLE_ID"
echo "Version: $VERSION ($BUILD)"
