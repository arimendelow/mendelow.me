// The site's own navigation: an island, because its phone menu and the colour scheme switch need script.
// The links are in the server HTML from 640px up, so they work before it loads. The family's sites are the strip above
// the navbar (Family.tsx), on a phone too, so the menu lists only this site's sections.
import { ColorSchemeToggle } from "@/components/ouro/color-scheme-toggle/color-scheme-toggle";
import { Link } from "@/components/ouro/link/link";
import { ThemePicker } from "@/components/ouro/theme-picker/theme-picker";
import { Navbar } from "@/components/ouro/navbar/navbar";
import { ColorSchemeProvider } from "@/lib/ouro/color-scheme";
import { gutters, schemeKey } from "@/site";

const presets = [
  { name: "ouroboros", label: "Ouroboros", mood: "Warm paper by day, a serpent's night by dark" },
  { name: "pearl", label: "Pearl", mood: "Clean white, soft glass and one clear blue" },
  { name: "abyss", label: "Abyss", mood: "Pale aqua, then a cyan glow in the dark" },
  { name: "brass", label: "Brass", mood: "Ivory, walnut and polished brass" },
  { name: "coral", label: "Coral", mood: "Warm sand, kelp and coral" },
];

const items = [
  { label: "Agents", href: "/#working-with-agents" },
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Earlier", href: "/#earlier" },
  { label: "Contact", href: "/#contact" },
];

function PhoneMenu() {
  return (
    <div className="phone-menu">
      <ThemePicker presets={presets} defaultPreset="ouroboros" />
      <ul className="phone-menu-list">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} tone="secondary" inline={false} className="flex pointer-coarse:flex phone-menu-link">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteNav() {
  return (
    <ColorSchemeProvider storageKey={schemeKey}>
      <Navbar
        label="Primary"
        // Sticky under the family bar, with its contents lined up with the page's container.
        className={`sticky top-0 z-40 ${gutters}`}
        // The brand is the site's own wordmark, as on ui.ouroboros.bot: the way home.
        brand={
          <a href="/" className="wordmark" data-site-brand="">
            Ari Mendelow
          </a>
        }
        items={items}
        menu={<PhoneMenu />}
        actions={
          <>
            <ThemePicker presets={presets} defaultPreset="ouroboros" size="md" className="hidden sm:grid" />
            <ColorSchemeToggle label="Light, dark or system" />
          </>
        }
      />
    </ColorSchemeProvider>
  );
}
