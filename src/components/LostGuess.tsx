// The 404 page's guess: the place on the home page an address most likely meant, from its last part, so /spoonjoy,
// /recipes and /spoonjoyy all offer Spoonjoy. Borrowed from ui.ouroboros.bot's lost-at-sea page. The address is read
// only in the browser (useSyncExternalStore's server snapshot is null), so the server HTML and the first render agree:
// Go home alone. A guess takes the lead, and Go home steps back beside it.
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ouro/button/button";

interface Place {
  /** What the button says: "Take me to Spoonjoy". */
  name: string;
  href: string;
  /** Words an address might use for it. */
  words: readonly string[];
}

export const PLACES: readonly Place[] = [
  { name: "the tea set", href: "/#ouro-ui", words: ["tea", "teaset", "ouroui", "ui", "hx", "ourohx", "showcase"] },
  { name: "Spoonjoy", href: "/#spoonjoy", words: ["spoonjoy", "recipes", "recipe", "cookbook"] },
  { name: "Spoonjoy's story", href: "/#spoonjoy-story", words: ["story", "history", "timeline"] },
  { name: "Ouro", href: "/#ouro", words: ["ouro", "ouroboros", "tools", "desk", "crew"] },
  { name: "working with agents", href: "/#working-with-agents", words: ["agents", "slugger", "workingwithagents", "openclaw"] },
  { name: "Agent Experience", href: "/#agent-experience", words: ["ax", "agentexperience"] },
  { name: "Selected work", href: "/#work", words: ["work", "projects", "portfolio"] },
  { name: "About", href: "/#about", words: ["about", "rapid", "robot", "me", "bio"] },
  { name: "Earlier", href: "/#earlier", words: ["earlier", "sulis", "redwood", "redwoodjs", "redwoodui"] },
  { name: "Contact", href: "/#contact", words: ["contact", "email", "hello", "hi"] },
];

const plain = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

/** How many single-letter edits turn one word into the other. */
function edits(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(row[j]! + 1, next[j - 1]! + 1, row[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    row = next;
  }
  return row[b.length]!;
}

/**
 * The place an address most likely meant, from its last part: an exact word, or one within an edit for every four of
 * its letters (one edit at least, and none for a word of two letters, so /me isn't read as /ax).
 */
export function guess(path: string): Place | undefined {
  const last = plain(decodeURIComponent(path).split("/").filter(Boolean).at(-1)?.replace(/\.html?$/, "") ?? "");
  if (!last) return undefined;
  let best: { place: Place; distance: number } | undefined;
  for (const place of PLACES) {
    for (const word of place.words) {
      const distance = edits(last, word);
      if (!best || distance < best.distance) best = { place, distance };
    }
  }
  const allowed = last.length <= 2 ? 0 : Math.max(1, Math.floor(last.length / 4));
  return best && best.distance <= allowed ? best.place : undefined;
}

const never = () => () => {};

/** The 404 page's way on: Go home, or, when the address names a place, the way there first and Go home beside it. */
export function LostGuess() {
  const path = useSyncExternalStore(never, () => window.location.pathname, () => null);
  const place = path ? guess(path) : undefined;
  if (!place) {
    return (
      <div className="cta-row">
        <Button href="/" size="lg">
          Go home
        </Button>
      </div>
    );
  }
  return (
    <div className="lost-guess showcase-ready" data-lost-guess="">
      <p className="lost-guess-line">Were you after {place.name}? It lives on the home page now.</p>
      <div className="cta-row">
        <Button href={place.href} size="lg">
          {`Take me to ${place.name}`}
        </Button>
        <Button href="/" size="lg" variant="soft">
          Go home
        </Button>
      </div>
    </div>
  );
}
