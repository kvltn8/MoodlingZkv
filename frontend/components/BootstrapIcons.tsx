import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

// Kept under the old name so existing imports keep working.
// Now backed by @expo/vector-icons (bundled with Expo) so icons look the same on iOS, Android and web.
const map: Record<string, keyof typeof Ionicons.glyphMap> = {
  house: "home",
  "house-outline": "home-outline",
  check: "checkmark",
  checklist: "checkmark-done",
  plus: "add",
  smile: "happy",
  "smile-outline": "happy-outline",
  person: "person",
  "person-outline": "person-outline",
  arrow: "arrow-forward",
  calendar: "calendar-outline",
  trash: "trash-outline",
  logout: "log-out-outline",
  play: "play",
  pause: "pause",
  moon: "moon-outline",
  sparkles: "sparkles",
  refresh: "refresh",
};

export function BootstrapIcon({
  name,
  size = 22,
  color = colors.ink,
}: {
  name: string;
  size?: number;
  label?: string;
  color?: string;
}) {
  const icon = map[name] ?? (name as keyof typeof Ionicons.glyphMap);
  return (
    <Ionicons
      name={icon in Ionicons.glyphMap ? icon : "ellipse"}
      size={size}
      color={color}
    />
  );
}
