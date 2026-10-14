#!/usr/bin/env bash
# End-to-end smoke test on a running Android emulator or USB-connected phone (needs `adb` and python3).
# Installs the APK, goes through first launch like a new user would, and fails on any crash.
#
#   scripts/android-smoke-test.sh <path/to/app.apk> [output-dir]
#
# Screenshots of each step (and logcat on failure) are saved to the output dir.
set -euo pipefail

APK=$1
OUT=${2:-smoke-test}
PKG=com.unravelkorea.app
mkdir -p "$OUT"

fail() {
  echo "SMOKE TEST FAILED: $*"
  adb exec-out screencap -p >"$OUT/failure.png" || true
  adb logcat -d >"$OUT/logcat.txt" || true
  dump >"$OUT/failure-ui.xml" || true
  exit 1
}

# The screen's UI tree (visible text and accessibility labels) as XML.
dump() {
  adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1 && adb shell cat /sdcard/ui.xml
}

# Waits up to ~90s for text or an accessibility label matching an extended regex.
wait_for() {
  for _ in $(seq 1 45); do
    if dump | grep -Eq "$1"; then
      echo "  ✓ sees \"$1\""
      return 0
    fi
    sleep 2
  done
  fail "\"$1\" never appeared on screen"
}

# Taps the centre of the first element whose text or accessibility label starts with $1.
tap() {
  local point
  point=$(dump | python3 -c '
import html, re, sys
prefix = sys.argv[1]
for node in re.findall(r"<node [^>]*>", sys.stdin.read()):
    attrs = {k: html.unescape(v) for k, v in re.findall(r"([\w-]+)=\"([^\"]*)\"", node)}
    if attrs.get("text", "").startswith(prefix) or attrs.get("content-desc", "").startswith(prefix):
        x1, y1, x2, y2 = map(int, re.findall(r"\d+", attrs["bounds"]))
        print((x1 + x2) // 2, (y1 + y2) // 2)
        break
' "$1")
  [ -n "$point" ] || fail "found nothing to tap for \"$1\""
  echo "  → taps \"$1\""
  # shellcheck disable=SC2086 # "x y" must split into two arguments
  adb shell input tap $point
}

check_alive() {
  if adb logcat -d | grep -E "FATAL EXCEPTION|JavascriptException|Unhandled JS Exception"; then
    fail "the app crashed"
  fi
  adb shell pidof "$PKG" >/dev/null || fail "the app is no longer running"
}

shot() {
  adb exec-out screencap -p >"$OUT/$1.png"
}

echo "Installing $APK"
adb install -r "$APK"
adb logcat -c

echo "1. First launch shows the welcome question"
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null
wait_for "How long is your trip"
check_alive
shot 1-welcome

echo "2. Picking a plan builds the whole trip"
tap "3 days in Seoul"
wait_for "Your days"
wait_for "Royal Seoul"
wait_for "Gangnam &amp; the Han River"
check_alive
shot 2-my-trip

echo "3. Opening a day shows what's next"
tap "Day 1: Royal Seoul"
wait_for "NEXT UP"
wait_for "Directions"
check_alive
shot 3-day

echo "4. A friend's share link opens the trip preview"
adb shell am start -W -a android.intent.action.VIEW \
  -d "'unravelkorea://import?n=Shared%20trip&d=bukchon.myeongdong&t=Hanok%20morning'" "$PKG" >/dev/null
wait_for "Use this trip"
wait_for "Hanok morning"
check_alive
shot 4-shared-link

echo "Smoke test passed"
