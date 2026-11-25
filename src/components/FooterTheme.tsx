// The look choice, kept quiet in the footer: the header carries only the light/dark switch. An island, as it needs script.
import { ThemePicker } from "@/components/ouro/theme-picker/theme-picker";

const presets = [
  { name: "ouroboros", label: "Ouroboros", mood: "Warm paper by day, a serpent's night by dark" },
  { name: "pearl", label: "Pearl", mood: "Clean white, soft glass and one clear blue" },
  { name: "abyss", label: "Abyss", mood: "Pale aqua, then a cyan glow in the dark" },
  { name: "brass", label: "Brass", mood: "Ivory, walnut and polished brass" },
  { name: "coral", label: "Coral", mood: "Warm sand, kelp and coral" },
];

export function FooterTheme() {
  return <ThemePicker presets={presets} defaultPreset="ouroboros" />;
}
