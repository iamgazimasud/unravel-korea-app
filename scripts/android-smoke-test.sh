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

# Fails if the bottom tab bar shows fewer than 4 icons (icon-font glyphs with a real size). Icons are found
# through the accessibility tree; if it exposes no icon glyphs at all, the check is skipped with a warning.
check_tab_icons() {
  local result
  dump >"$OUT/my-trip-ui.xml"
  result=$(python3 - "$OUT/my-trip-ui.xml" <<'PY'
import html, re, sys
xml = open(sys.argv[1], encoding="utf-8").read()
nodes = [dict(re.findall(r'([\w-]+)="([^"]*)"', n)) for n in re.findall(r"<node [^>]*>", xml)]
bottom = max(int(re.findall(r"\d+", n["bounds"])[3]) for n in nodes if "bounds" in n)
glyphs = tab_icons = 0
for n in nodes:
    text = html.unescape(n.get("text", ""))
    if len(text) == 1 and 0xE000 <= ord(text) <= 0xF8FF:  # Ionicons glyphs live in the private-use area
        glyphs += 1
        x1, y1, x2, y2 = map(int, re.findall(r"\d+", n["bounds"]))
        if x2 > x1 and y2 > y1 and (y1 + y2) / 2 > bottom * 0.85:
            tab_icons += 1
print(glyphs, tab_icons)
PY
)
  read -r glyphs tab_icons <<<"$result"
  if [ "$glyphs" -eq 0 ]; then
    echo "::warning::No icon glyphs in the accessibility tree, so tab bar icons could not be checked"
  elif [ "$tab_icons" -lt 4 ]; then
    fail "tab bar icons are missing (found $tab_icons of 4)"
  else
    echo "  ✓ sees $tab_icons tab bar icons"
  fi
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
check_tab_icons
check_alive
shot 2-my-trip

echo "3. Every tab opens"
tap "Places"
wait_for "places we.ve actually been to" # uiautomator escapes & as &amp; but leaves ' as-is
check_alive
shot 3-places
tap "Korean"
wait_for "안녕하세요"
check_alive
shot 4-korean
tap "Read"
wait_for "Seoul Sip"
check_alive
shot 5-read
tap "My Trip"
wait_for "Your days"

echo "4. Opening a day shows what's next"
tap "Day 1: Royal Seoul"
wait_for "NEXT UP"
wait_for "Directions"
check_alive
shot 6-day

echo "5. A friend's share link opens the trip preview"
adb shell am start -W -a android.intent.action.VIEW \
  -d "'unravelkorea://import?n=Shared%20trip&d=bukchon.myeongdong&t=Hanok%20morning'" "$PKG" >/dev/null
wait_for "Use this trip"
wait_for "Hanok morning"
check_alive
shot 7-shared-link

echo "Smoke test passed"
