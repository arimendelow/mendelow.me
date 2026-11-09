// The Ouro UI entry's showcase: a pot of tea to make, built from real Ouro HX components. The cups are a Carousel: swipe
// to change the tea. The steps are a Reorderable: drag them into order, then Brew, and the list ticks off each step in
// turn. The order matters: a wrong one makes the tea gently wrong, and says why. A right one fills the cups, and
// Celebrate bursts over them. An island that hydrates when it scrolls into view (client:visible), so the rest of the
// page ships no extra script; its server HTML is the whole scene in its starting state.
import { useEffect, useState, type CSSProperties } from "react";
import { Button } from "@/components/ouro/button/button";
import { Carousel } from "@/components/ouro/carousel/carousel";
import { Celebrate } from "@/components/ouro/celebrate/celebrate";
import { Item } from "@/components/ouro/item/item";
import { Reorderable } from "@/components/ouro/reorderable/reorderable";

const teas = [
  { id: "breakfast", name: "English breakfast", line: "Malty and bold", tea: "#5a2a0e" },
  { id: "earl-grey", name: "Earl Grey", line: "Black tea and bergamot", tea: "#7a3d16" },
  { id: "sencha", name: "Sencha", line: "Grassy green tea", tea: "#9a9a34" },
  { id: "rooibos", name: "Rooibos", line: "Red bush, sweet and round", tea: "#a8401c" },
  { id: "chamomile", name: "Chamomile", line: "Golden and calm", tea: "#d6a83f" },
] as const;

const steps = [
  { id: "boil", label: "Boil the water", doing: "Boiling the water" },
  { id: "warm", label: "Warm the pot", doing: "Warming the pot" },
  { id: "leaves", label: "Add the leaves", doing: "Adding the leaves" },
  { id: "pour", label: "Pour on the water", doing: "Pouring on the water" },
  { id: "steep", label: "Let it steep", doing: "Steeping" },
] as const;
type StepId = (typeof steps)[number]["id"];
// The order the steps start in, so there's something to put right.
const shuffled: StepId[] = ["leaves", "boil", "steep", "warm", "pour"];
// How long each step takes as the list ticks it off.
const STEP_MS = 1100;

interface Brew {
  /** How much of the tea's colour comes through, out of 100. */
  strength: number;
  hot: boolean;
  /** What went wrong, kindly, or nothing when the order was right. */
  note: string | null;
}

// The first thing the order got wrong, from the start of the brew, and what it did to the tea.
function brew(order: readonly StepId[]): Brew {
  const at = (id: StepId) => order.indexOf(id);
  if (at("pour") < at("boil")) return { strength: 30, hot: false, note: "The water went in before it boiled, so the tea is weak and cool." };
  if (at("warm") < at("boil")) return { strength: 85, hot: false, note: "The pot was warmed before the water boiled, so the tea is lukewarm." };
  if (at("pour") < at("leaves")) return { strength: 45, hot: true, note: "The water went in before the leaves, so the tea came out thin." };
  if (at("leaves") < at("warm")) return { strength: 70, hot: true, note: "The leaves went into a cold pot, so the tea is a little weak." };
  if (at("steep") < at("pour")) return { strength: 40, hot: true, note: "It steeped before the water was in, so the tea is thin." };
  return { strength: 100, hot: true, note: null };
}

// Each step's icon, drawn in the text colour: a kettle, a teapot, a leaf, a pour and a timer.
function StepIcon({ id }: { id: StepId }) {
  const paths: Record<StepId, string> = {
    boil: "M6 19h12M7 19l1-8h8l1 8M9 11V9a3 3 0 0 1 6 0v2M17 13l3-2M10 6c0-1 1-1.5 1-2.5M13 6c0-1 1-1.5 1-2.5",
    warm: "M5 12h12v3a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM17 13h1.5a2 2 0 0 1 0 4H16M9 12V10h4v2M4 20h14",
    leaves: "M6 18c0-7 5-12 13-12c0 8-5 13-12 13zM6 18l7-7",
    pour: "M4 9h9l-1 9H5zM13 11h2a2 2 0 0 1 0 4h-2M14 4l4 0l1 3M19 7c0 2-1 3-1 5",
    steep: "M12 8v4l2.5 2.5M12 21a8 8 0 1 0 0-16a8 8 0 0 0 0 16zM10 2h4",
  };
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[id]} />
    </svg>
  );
}

// Where a step stands in the brew: a tick once done, a soft pulse while it's the one under way.
function StepMark({ state }: { state: "done" | "now" | "todo" }) {
  if (state === "todo") return null;
  return state === "done" ? (
    <svg className="showcase-tick" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="12" r="11" />
      <path d="m7 12.5 3.2 3.2L17 9" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <span className="showcase-now" aria-hidden="true" />
  );
}

// The porcelain, the cup's inside and the steam's blur, defined once for every cup.
function CupDefs() {
  return (
    <svg className="showcase-defs" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="tea-porcelain" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" className="showcase-stop-shade" />
          <stop offset="0.3" className="showcase-stop-hi" />
          <stop offset="0.55" className="showcase-stop-hi" />
          <stop offset="1" className="showcase-stop-lo" />
        </linearGradient>
        <linearGradient id="tea-inside" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" className="showcase-stop-lo" />
          <stop offset="1" className="showcase-stop-hi" />
        </linearGradient>
        <linearGradient id="tea-saucer" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" className="showcase-stop-hi" />
          <stop offset="1" className="showcase-stop-lo" />
        </linearGradient>
        <clipPath id="tea-opening">
          <ellipse cx="70" cy="45" rx="42" ry="9" />
        </clipPath>
        <filter id="tea-steam-blur" x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
    </svg>
  );
}

// A porcelain cup on its saucer, seen from a little above, with the tea's surface inside its rim.
function Cup({ tea, pour }: { tea: string; pour: number }) {
  return (
    <svg className="showcase-cup" viewBox="0 0 140 120" aria-hidden="true" focusable="false">
      <g className="showcase-steam" filter="url(#tea-steam-blur)" fill="none" strokeLinecap="round" strokeWidth="3.5">
        <path d="M56 34c-6-6 6-11 0-17s6-11 0-15" />
        <path d="M70 36c-6-6 6-11 0-17s6-11 0-15" />
        <path d="M84 34c-6-6 6-11 0-17s6-11 0-15" />
      </g>
      <ellipse className="showcase-table-shadow" cx="70" cy="108" rx="60" ry="9" />
      <ellipse cx="70" cy="104" rx="58" ry="11" fill="url(#tea-saucer)" className="showcase-edge" />
      <ellipse className="showcase-well" cx="70" cy="103" rx="34" ry="6" />
      <ellipse className="showcase-cup-shadow" cx="70" cy="100" rx="30" ry="4.5" />
      <path className="showcase-handle-edge" d="M111 54c22-4 24 26-4 30" fill="none" strokeWidth="9.5" strokeLinecap="round" />
      <path className="showcase-handle" d="M111 54c22-4 24 26-4 30" fill="none" strokeWidth="8" strokeLinecap="round" />
      <path className="showcase-handle-hi" d="M112 56c17-2 18 22-3 25" fill="none" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 44c0 34 18 56 46 56s46-22 46-56z" fill="url(#tea-porcelain)" className="showcase-edge" />
      <path className="showcase-band" d="M27 56c10 6 26 9 43 9s33-3 43-9" fill="none" strokeWidth="1.6" />
      <ellipse cx="70" cy="44" rx="46" ry="11" className="showcase-rim showcase-edge" />
      <ellipse cx="70" cy="45" rx="42" ry="9" fill="url(#tea-inside)" />
      <g clipPath="url(#tea-opening)">
        <g className="showcase-tea" key={pour}>
          <ellipse cx="70" cy="48" rx="40" ry="7.6" className="showcase-tea-surface" style={{ fill: tea }} />
          <ellipse cx="60" cy="46.5" rx="15" ry="2" fill="#ffffff" opacity="0.22" />
        </g>
      </g>
    </svg>
  );
}

export function OuroShowcase() {
  const [tea, setTea] = useState(0);
  const [order, setOrder] = useState<StepId[]>(shuffled);
  // idle: nothing brewed yet; brewing: the list ticks off `step`; done: `result` is in the cups.
  const [phase, setPhase] = useState<"idle" | "brewing" | "done">("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Brew | null>(null);
  const [pours, setPours] = useState(0);
  // The tea the brew was made with: Celebrate bursts there once, not again on every swipe after.
  const [brewed, setBrewed] = useState(0);

  // The brew: each step in the list's order is under way for STEP_MS, then ticked; after the last, the tea is poured.
  useEffect(() => {
    if (phase !== "brewing") return;
    if (step < order.length) {
      const next = window.setTimeout(() => setStep((n) => n + 1), STEP_MS);
      return () => window.clearTimeout(next);
    }
    setResult(brew(order));
    setBrewed(tea);
    setPours((n) => n + 1);
    setPhase("done");
  }, [phase, step, order, tea]);

  const start = () => {
    setResult(null);
    setStep(0);
    setPhase("brewing");
  };
  // A new order after a brew goes back to the start, so the list never shows ticks for steps it didn't take.
  const reorder = (ids: string[]) => {
    setOrder(ids as StepId[]);
    if (phase === "done") {
      setPhase("idle");
      setResult(null);
    }
  };

  const brewing = phase === "brewing";
  const ready = phase === "done" && result?.note === null;
  // The cups hold a hint of the chosen tea until it's brewed; then the brew's strength, poured fresh.
  const strength = result ? result.strength : 22;
  const colour = (hex: string) => `color-mix(in oklab, ${hex} ${strength}%, #f6efe2)`;
  const steaming = phase === "done" && result?.hot;
  const doing = brewing && step < order.length ? steps.find((s) => s.id === order[step])!.doing : null;

  return (
    <div className="showcase" data-steaming={steaming ? "" : undefined} data-ready={ready ? "" : undefined} style={{ "--showcase-step": `${STEP_MS}ms` } as CSSProperties}>
      <CupDefs />
      <div className="showcase-stage">
        <Carousel label="Teas" slideLabel="{n} of {total}" onIndexChange={setTea}>
          {teas.map((t, index) => {
            const here = index === brewed;
            return (
              <div key={t.id} className="showcase-slide" data-ready={ready && here ? "" : undefined}>
                <div className="showcase-cups" role="img" aria-label={`Two cups of ${t.name}${ready ? ", ready" : phase === "done" ? ", not quite right" : ""}.`}>
                  <Cup tea={colour(t.tea)} pour={pours} />
                  <Cup tea={colour(t.tea)} pour={pours} />
                  {/* The payoff bursts from the cups themselves, across their whole width, not from a chip. */}
                  <span className="showcase-burst">
                    <Celebrate show={ready && here} message={`Your ${t.name} is ready`} hideMessage className="absolute inset-0" />
                  </span>
                </div>
                {ready ? (
                  <>
                    <p className="showcase-tea-name showcase-ready">Your {t.name} is ready.</p>
                    <p className="showcase-tea-line">Fresh from the pot.</p>
                  </>
                ) : (
                  <>
                    <p className="showcase-tea-name">{t.name}</p>
                    <p className="showcase-tea-line">{phase === "done" ? "Not quite right this time." : t.line}</p>
                  </>
                )}
              </div>
            );
          })}
        </Carousel>
      </div>
      <div className="showcase-work">
        <p className="showcase-hint" id="showcase-hint">
          {ready ? (
            "Just right. Swipe to try another tea, or brew again."
          ) : phase === "done" && result ? (
            <>
              <strong className="showcase-off">Not quite.</strong> {result.note} Drag the steps and brew again.
            </>
          ) : (
            "Swipe to choose a tea, drag the steps into order, then brew."
          )}
        </p>
        <Reorderable
          label="Steps"
          disabled={brewing}
          items={order.map((id, index) => {
            const s = steps.find((x) => x.id === id)!;
            const state = phase === "done" || (brewing && index < step) ? "done" : brewing && index === step ? "now" : "todo";
            return {
              id,
              label: s.label,
              content: <Item variant="outline" size="sm" className="my-1" media={<StepIcon id={id} />} mediaSize="icon" title={s.label} actions={<StepMark state={state} />} data-state={state} />,
            };
          })}
          onReorder={reorder}
        />
        <div className="showcase-brew">
          <Button size="lg" loading={brewing} loadingLabel="Brewing" onClick={start} aria-describedby="showcase-hint">
            {phase === "done" ? "Brew again" : "Brew"}
          </Button>
          <p className="showcase-doing" aria-live="polite">
            {doing ? `${doing}…` : ""}
            {/* Celebrate says when it's ready; a tea that came out wrong says so here. */}
            <span className="sr-only">{phase === "done" && result?.note ? `Not quite. ${result.note}` : ""}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
