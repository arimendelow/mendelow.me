// The site's own navigation: an island, because its phone menu and the colour scheme switch need script.
// The links are in the server HTML from 640px up, so they work before it loads. On a phone the family bar is hidden,
// so the menu lists the family's sites too, under a heading of their own, with this one marked.
import { useId } from "react";
import { ColorSchemeToggle } from "@/components/ouro/color-scheme-toggle/color-scheme-toggle";
import { Link } from "@/components/ouro/link/link";
import { Navbar } from "@/components/ouro/navbar/navbar";
import family from "@/family.json";
import { ColorSchemeProvider } from "@/lib/ouro/color-scheme";
import { gutters, schemeKey } from "@/site";

const items = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Earlier", href: "/#earlier" },
  { label: "Contact", href: "/#contact" },
];

function PhoneMenu() {
  const heading = useId();
  return (
    <div className="phone-menu">
      <ul className="phone-menu-list">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} tone="secondary" inline={false} className="phone-menu-link">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="phone-menu-family">
        <h3 id={heading} className="phone-menu-heading">
          Ouro family
        </h3>
        <ul className="phone-menu-list" aria-labelledby={heading}>
          {family.links.map((site) => {
            const here = site.id === "ari";
            return (
              <li key={site.id} className="phone-menu-row">
                <Link href={site.href} tone="secondary" inline={false} aria-current={here ? "true" : undefined} className="phone-menu-link phone-menu-site">
                  {site.label}
                </Link>
                {here && (
                  <span className="phone-menu-here" aria-hidden="true">
                    this site
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
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
        actions={<ColorSchemeToggle label="Light, dark or system" />}
      />
    </ColorSchemeProvider>
  );
}
