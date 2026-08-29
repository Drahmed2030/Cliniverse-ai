#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$ROOT_DIR/build/apple-screenshot-work"
OUTPUT_DIR="$ROOT_DIR/build/apple-screenshot-evidence"
DERIVED_DATA="$WORK_DIR/DerivedData"
SCHEME="CliniverseScreenshots"
PROJECT_WORKSPACE="$ROOT_DIR/ios/App/App.xcworkspace"

IPHONE_UDID=""
IPAD_UDID=""

fail() {
  echo "RC SCREENSHOT BLOCKED: $*" >&2
  exit 1
}

cleanup() {
  local simulator
  for simulator in "$IPHONE_UDID" "$IPAD_UDID"; do
    if [[ -n "$simulator" ]]; then
      xcrun simctl status_bar "$simulator" clear >/dev/null 2>&1 || true
      xcrun simctl shutdown "$simulator" >/dev/null 2>&1 || true
      xcrun simctl delete "$simulator" >/dev/null 2>&1 || true
    fi
  done
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

for command in jq node plutil sips xcodebuild xcrun; do
  command -v "$command" >/dev/null || fail "Required command is unavailable: $command"
done

[[ -d "$PROJECT_WORKSPACE" ]] || fail "Generated Xcode workspace is missing"
[[ -n "${SCREENSHOT_REVIEW_EMAIL:-}" ]] || fail "SCREENSHOT_REVIEW_EMAIL is not configured as a secure Codemagic variable"
[[ -n "${SCREENSHOT_REVIEW_PASSWORD:-}" ]] || fail "SCREENSHOT_REVIEW_PASSWORD is not configured as a secure Codemagic variable"

rm -rf "$WORK_DIR" "$OUTPUT_DIR"
mkdir -p "$WORK_DIR" "$OUTPUT_DIR/iphone-6.9" "$OUTPUT_DIR/ipad-13"

DEVICE_TYPES_JSON="$WORK_DIR/device-types.json"
RUNTIMES_JSON="$WORK_DIR/runtimes.json"
xcrun simctl list devicetypes -j > "$DEVICE_TYPES_JSON"
xcrun simctl list runtimes available -j > "$RUNTIMES_JSON"

IPHONE_TYPE="$(jq -r '
  [
    "com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro-Max",
    "com.apple.CoreSimulator.SimDeviceType.iPhone-16-Pro-Max",
    "com.apple.CoreSimulator.SimDeviceType.iPhone-15-Pro-Max"
  ] as $preferred
  | $preferred[] as $id
  | first(.devicetypes[] | select(.identifier == $id) | .identifier) // empty
' "$DEVICE_TYPES_JSON" | head -n 1)"

IPAD_TYPE="$(jq -r '
  [
    "com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch-M5-12GB",
    "com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch-M5",
    "com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch-M4-16GB",
    "com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch-M4-8GB",
    "com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch-M4"
  ] as $preferred
  | $preferred[] as $id
  | first(.devicetypes[] | select(.identifier == $id) | .identifier) // empty
' "$DEVICE_TYPES_JSON" | head -n 1)"

IOS_RUNTIME="$(jq -r '
  [.runtimes[] | select(.isAvailable and (.name | startswith("iOS")))]
  | sort_by(.version | split(".") | map(tonumber))
  | last
  | .identifier // empty
' "$RUNTIMES_JSON")"

[[ -n "$IPHONE_TYPE" ]] || fail "No App Store-compatible Pro Max simulator type is available"
[[ -n "$IPAD_TYPE" ]] || fail "No App Store-compatible 13-inch iPad Pro simulator type is available"
[[ -n "$IOS_RUNTIME" ]] || fail "No available iOS Simulator runtime was found"

IPHONE_UDID="$(xcrun simctl create "Cliniverse Evidence iPhone ${BUILD_NUMBER:-local}" "$IPHONE_TYPE" "$IOS_RUNTIME")"
IPAD_UDID="$(xcrun simctl create "Cliniverse Evidence iPad ${BUILD_NUMBER:-local}" "$IPAD_TYPE" "$IOS_RUNTIME")"

configure_simulator() {
  local udid="$1"
  xcrun simctl boot "$udid"
  xcrun simctl bootstatus "$udid" -b
  xcrun simctl ui "$udid" appearance dark
  xcrun simctl status_bar "$udid" override \
    --time 9:41 \
    --batteryState charged \
    --batteryLevel 100 \
    --wifiBars 3 \
    --cellularBars 4
}

configure_simulator "$IPHONE_UDID"
configure_simulator "$IPAD_UDID"

image_dimensions() {
  local image="$1"
  local width height
  width="$(sips -g pixelWidth "$image" | awk '/pixelWidth/{print $2}')"
  height="$(sips -g pixelHeight "$image" | awk '/pixelHeight/{print $2}')"
  printf '%sx%s' "$width" "$height"
}

CALIBRATION_IPHONE="$WORK_DIR/iphone-calibration.png"
CALIBRATION_IPAD="$WORK_DIR/ipad-calibration.png"
xcrun simctl io "$IPHONE_UDID" screenshot "$CALIBRATION_IPHONE" >/dev/null
xcrun simctl io "$IPAD_UDID" screenshot "$CALIBRATION_IPAD" >/dev/null
IPHONE_DIMENSIONS="$(image_dimensions "$CALIBRATION_IPHONE")"
IPAD_DIMENSIONS="$(image_dimensions "$CALIBRATION_IPAD")"

case "$IPHONE_DIMENSIONS" in
  1320x2868|1290x2796|1260x2736) ;;
  *) fail "iPhone simulator produced unsupported App Store dimensions: $IPHONE_DIMENSIONS" ;;
esac

case "$IPAD_DIMENSIONS" in
  2064x2752|2048x2732) ;;
  *) fail "iPad simulator produced unsupported App Store dimensions: $IPAD_DIMENSIONS" ;;
esac

xcodebuild -quiet \
  -workspace "$PROJECT_WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -sdk iphonesimulator \
  -destination "id=$IPHONE_UDID" \
  -derivedDataPath "$DERIVED_DATA" \
  -parallel-testing-enabled NO \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  build-for-testing

BASE_XCTESTRUN="$(find "$DERIVED_DATA/Build/Products" -name '*.xctestrun' -print -quit)"
[[ -n "$BASE_XCTESTRUN" ]] || fail "Xcode did not produce an xctestrun file"

export_attachments() {
  local result_bundle="$1"
  local destination="$2"
  local expected_dimensions="$3"
  local attachment_dir="$WORK_DIR/attachments-$(basename "$destination")"
  local manifest="$attachment_dir/manifest.json"
  local records="$attachment_dir/records.tsv"

  mkdir -p "$attachment_dir"
  xcrun xcresulttool export attachments \
    --path "$result_bundle" \
    --output-path "$attachment_dir" \
    --filter '*.png' >/dev/null

  [[ -s "$manifest" ]] || fail "XCTest attachment manifest is missing"

  jq -er '
    [
      .[].attachments[]?
      | select(.isAssociatedWithFailure == false)
      | select(.suggestedHumanReadableName | test("^(01-home|02-care|03-care-detail|04-intelligence|05-atlas|06-me-privacy)(_[^/]*)?\\.png$"))
      | {
          exported: .exportedFileName,
          stable: (.suggestedHumanReadableName | sub("_[^/]*\\.png$"; ".png"))
        }
    ] as $items
    | select(($items | length) == 6)
    | select(($items | map(.stable) | unique | length) == 6)
    | $items[]
    | [.exported, .stable]
    | @tsv
  ' "$manifest" > "$records" || fail "Exactly six successful, distinct release screenshots were not exported"

  while IFS=$'\t' read -r exported stable; do
    [[ "$exported" =~ ^[A-Za-z0-9._-]+$ ]] || fail "Unsafe attachment filename: $exported"
    [[ "$stable" =~ ^(01-home|02-care|03-care-detail|04-intelligence|05-atlas|06-me-privacy)\.png$ ]] || fail "Unexpected screenshot name: $stable"
    local source="$attachment_dir/$exported"
    [[ -s "$source" ]] || fail "Exported screenshot is missing: $exported"
    [[ "$(/usr/bin/file -b --mime-type "$source")" == "image/png" ]] || fail "Exported attachment is not PNG: $exported"
    [[ "$(image_dimensions "$source")" == "$expected_dimensions" ]] || fail "Screenshot $stable has incorrect dimensions"
    [[ "$(sips -g hasAlpha "$source" | awk '/hasAlpha/{print $2}')" == "no" ]] || fail "Screenshot $stable contains an alpha channel"
    cp "$source" "$destination/$stable"
  done < "$records"
}

export_failure_diagnostics() {
  local result_bundle="$1"
  local device_class="$2"
  local diagnostic_dir="$OUTPUT_DIR/diagnostics/$device_class"

  mkdir -p "$diagnostic_dir"
  xcrun xcresulttool get test-results summary \
    --path "$result_bundle" \
    --compact \
    | tee "$diagnostic_dir/test-summary.json" || true
  xcrun xcresulttool get test-results tests \
    --path "$result_bundle" \
    --compact \
    | tee "$diagnostic_dir/test-details.json" || true
  xcrun xcresulttool export attachments \
    --path "$result_bundle" \
    --output-path "$diagnostic_dir/attachments" >/dev/null || true
}

run_device_test() {
  local device_class="$1"
  local udid="$2"
  local dimensions="$3"
  local destination="$4"
  local xctestrun_root
  xctestrun_root="$(dirname "$BASE_XCTESTRUN")"
  local xctestrun_json="$WORK_DIR/$device_class.xctestrun.json"
  # Keep the configured xctestrun beside the file emitted by Xcode. Paths in
  # the document use __TESTROOT__, which xcodebuild resolves relative to the
  # xctestrun location. Moving it to WORK_DIR makes Xcode look for the runner
  # outside DerivedData and report a missing embedded .xctest product.
  local xctestrun="$xctestrun_root/$device_class.xctestrun"
  local result_bundle="$WORK_DIR/$device_class.xcresult"

  plutil -convert json -o "$xctestrun_json" "$BASE_XCTESTRUN"
  node "$ROOT_DIR/scripts/configure-ios-screenshot-xctestrun.mjs" \
    "$xctestrun_json" "$xctestrun_json.configured" "$device_class"
  plutil -convert binary1 -o "$xctestrun" "$xctestrun_json.configured"

  set +e
  xcodebuild \
    -xctestrun "$xctestrun" \
    -destination "id=$udid" \
    -parallel-testing-enabled NO \
    -resultBundlePath "$result_bundle" \
    -only-testing:CliniverseScreenshots/CliniverseScreenshotTests/testAppleReleaseScreenshots \
    test-without-building
  local test_status=$?
  set -e

  if (( test_status != 0 )); then
    export_failure_diagnostics "$result_bundle" "$device_class"
    fail "$device_class screenshot test failed with xcodebuild status $test_status"
  fi

  local summary
  summary="$(xcrun xcresulttool get test-results summary --path "$result_bundle" --compact)"
  jq -e '
    .result == "Passed"
    and .totalTestCount == 1
    and .passedTests == 1
    and .failedTests == 0
    and .skippedTests == 0
  ' <<< "$summary" >/dev/null || fail "$device_class screenshot test did not pass exactly once"

  export_attachments "$result_bundle" "$destination" "$dimensions"
}

run_device_test "iphone-6.9" "$IPHONE_UDID" "$IPHONE_DIMENSIONS" "$OUTPUT_DIR/iphone-6.9"
run_device_test "ipad-13" "$IPAD_UDID" "$IPAD_DIMENSIONS" "$OUTPUT_DIR/ipad-13"

jq -n \
  --arg commit "${CM_COMMIT:-$(git -C "$ROOT_DIR" rev-parse HEAD)}" \
  --arg origin "https://www.cliniverseai.com" \
  --arg xcode "$(xcodebuild -version | tr '\n' ' ' | sed 's/[[:space:]]*$//')" \
  --arg runtime "$IOS_RUNTIME" \
  --arg iphoneDevice "$IPHONE_TYPE" \
  --arg iphoneDimensions "$IPHONE_DIMENSIONS" \
  --arg ipadDevice "$IPAD_TYPE" \
  --arg ipadDimensions "$IPAD_DIMENSIONS" \
  '{
    schemaVersion: 1,
    gitCommit: $commit,
    releaseOrigin: $origin,
    xcode: $xcode,
    simulatorRuntime: $runtime,
    captures: {
      iphone: { deviceType: $iphoneDevice, dimensions: $iphoneDimensions, count: 6 },
      ipad: { deviceType: $ipadDevice, dimensions: $ipadDimensions, count: 6 }
    }
  }' > "$OUTPUT_DIR/manifest.json"

find "$OUTPUT_DIR" -type f -name '*.png' | wc -l | awk '$1 == 12 { found = 1 } END { exit !found }' \
  || fail "Expected twelve final screenshots"

echo "Verified twelve App Store screenshot candidates in $OUTPUT_DIR"
