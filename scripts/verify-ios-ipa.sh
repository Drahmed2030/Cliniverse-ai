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

[ "$BUNDLE_ID" = "com.cliniverse.ai" ] || { echo "ERROR: unexpected bundle id: $BUNDLE_ID"; exit 1; }
[ -n "$VERSION" ] || { echo "ERROR: empty marketing version"; exit 1; }
[ -n "$BUILD" ] || { echo "ERROR: empty build number"; exit 1; }
[ "$ENCRYPTION" = "false" ] || { echo "ERROR: encryption declaration missing or not false"; exit 1; }

# A generated AppIcon should result in compiled asset catalog resources in the final bundle.
[ -f "$APP_PATH/Assets.car" ] || { echo "ERROR: compiled Assets.car missing; AppIcon pipeline may be broken"; exit 1; }

# Privacy manifest is a release gate. We do not invent declarations here.
if find "$APP_PATH" -name 'PrivacyInfo.xcprivacy' -print -quit | grep -q .; then
  echo "PASS: privacy manifest present in final app bundle"
else
  echo "HOLD: PrivacyInfo.xcprivacy is not present in final app bundle"
  exit 2
fi

echo "PASS: IPA identity and packaging checks"
echo "Bundle: $BUNDLE_ID"
echo "Version: $VERSION ($BUILD)"
