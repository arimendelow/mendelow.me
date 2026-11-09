// The family bar and footer: the same links, in the same order, on every Ouro family site (src/family.json is a
// byte-for-byte copy of ourostack/.github brand/family.json). Pure links, rendered to HTML with no script.
import { FamilyBar } from "@/components/ouro/family-bar/family-bar";
import { FamilyFooter } from "@/components/ouro/family-bar/family-footer";
import { Link } from "@/components/ouro/link/link";
import family from "@/family.json";
import { familyBarGutters, gutters } from "@/site";

const current = "ari";

export function SiteFamilyBar() {
  // Hidden below 40rem by the stylesheet, with no script: on a phone the menu lists the family instead.
  return (
    <div className="family-bar-wrap">
      <FamilyBar links={family.links} current={current} label="Sites" className={familyBarGutters} />
    </div>
  );
}

export function SiteFooter() {
  return (
    <>
      <div className="wrap footer-band">
        <p className="footer-line">
          <span>You bring judgment.</span> <span>Your agents bring the rest.</span>
        </p>
      </div>
      <FamilyFooter links={family.links} current={current} label="All sites" className={gutters}>
        <span>&copy; 2026 Ari Mendelow</span>
        <Link href="https://github.com/arimendelow" tone="secondary">
          My GitHub
        </Link>
        <Link href="https://www.linkedin.com/in/arimendelow" tone="secondary">
          LinkedIn
        </Link>
      </FamilyFooter>
    </>
  );
}
