// The Ouro UI entry's showcase: a little tea set to play with, built from real Ouro HX components. An island that
// hydrates when it scrolls into view (client:visible), so the rest of the page ships no extra script; its server HTML
// is the whole scene in its starting state.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ouro/button/button";
import { Carousel } from "@/components/ouro/carousel/carousel";
import { Item } from "@/components/ouro/item/item";
import { Celebrate } from "@/components/ouro/celebrate/celebrate";
import { Reorderable } from "@/components/ouro/reorderable/reorderable";
import { Timer } from "@/components/ouro/timer/timer";

const teas = [
  { id: "breakfast", name: "English breakfast", line: "Malty and bold", tea: "#5a2a0e" },
  { id: "earl-grey", name: "Earl Grey", line: "Black tea and bergamot", tea: "#7a3d16" },
  { id: "sencha", name: "Sencha", line: "Grassy green tea", tea: "#a3a33c" },
  { id: "rooibos", name: "Rooibos", line: "Red bush, sweet and round", tea: "#a8401c" },
  { id: "chamomile", name: "Chamomile", line: "Golden and calm", tea: "#d6a83f" },
] as const;

const steps = [
  { id: "boil", label: "Boil the water" },
  { id: "warm", label: "Warm the pot" },
  { id: "leaves", label: "Add the leaves" },
  { id: "pour", label: "Pour it in" },
] as const;
const inOrder = steps.map((step) => step.id).join();
// The order the steps start in, so there's something to put right.
const shuffled = ["leaves", "boil", "pour", "warm"];

// The steep, in seconds; the tea darkens over the same time (--showcase-steep in site.css).
const STEEP = 8;

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
function Cup({ tea }: { tea: string }) {
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
        <g className="showcase-tea">
          <ellipse cx="70" cy="48" rx="40" ry="7.6" className="showcase-tea-surface" style={{ fill: tea }} />
          <ellipse cx="60" cy="46.5" rx="15" ry="2" fill="#ffffff" opacity="0.22" />
        </g>
      </g>
    </svg>
  );
}

export function OuroShowcase() {
  const [tea, setTea] = useState(0);
  const [order, setOrder] = useState<string[]>(shuffled);
  const [steeped, setSteeped] = useState(false);
  const [status, setStatus] = useState("idle");
  // A new key brings the timer back to its start: just after it ends (the tea says so, without leaving its red
  // "Time's up" beside it) and when the visitor starts again.
  const [round, setRound] = useState(0);
  const timer = useRef<HTMLDivElement>(null);
  const chosen = teas[tea]!;

  // The timer keeps its own state; the scene follows it, so the cups steam and darken while it runs.
  useEffect(() => {
    const node = timer.current;
    if (!node) return;
    const sync = () => setStatus(node.dataset.status ?? "idle");
    sync();
    const watch = new MutationObserver(sync);
    watch.observe(node, { attributes: true, attributeFilter: ["data-status"] });
    return () => watch.disconnect();
  }, [round]);

  const steeping = status === "running";
  const ordered = order.join() === inOrder;
  const ready = ordered && steeped;
  // The cups hold hot water, faintly tinted toward the chosen tea, and take its full colour as it steeps.
  const full = steeped || steeping || status === "paused";
  const colour = `color-mix(in oklab, ${chosen.tea} ${full ? 100 : 14}%, #f6efe2)`;
  const hint = ready
    ? null
    : steeping
      ? "Steeping…"
      : ordered && !steeped
        ? "In order. Now press Start to steep it."
        : steeped
          ? "Steeped. Now put the steps in order."
          : "Put the steps in order, then steep the tea.";

  const again = () => {
    setOrder(shuffled);
    setSteeped(false);
    setRound((n) => n + 1);
  };

  return (
    <div className="showcase" data-steaming={steeping ? "" : undefined} data-ready={ready ? "" : undefined} style={{ "--showcase-steep": `${STEEP}s` } as CSSProperties}>
      <CupDefs />
      <div className="showcase-scene">
        <div className="showcase-cups" role="img" aria-label={`Two cups of ${chosen.name}${steeping ? ", steeping" : ready ? ", ready" : ""}.`}>
          <Cup tea={colour} />
          <Cup tea={colour} />
        </div>
        <div className="showcase-ending">
          <Celebrate show={ready} message="Tea's ready" />
          {hint ? <p className="showcase-hint">{hint}</p> : <Button variant="outline" tone="secondary" onClick={again}>Make another pot</Button>}
        </div>
        <p className="sr-only" aria-live="polite">
          {steeping ? "Steeping." : steeped && !ready ? "Steeped." : ""}
        </p>
      </div>
      <div className="showcase-teas">
        <Carousel label="Teas" slideLabel="{n} of {total}" onIndexChange={setTea}>
          {teas.map((t) => (
            <div key={t.id} className="showcase-tea-card">
              <span className="showcase-swatch" style={{ background: t.tea }} aria-hidden="true" />
              <span className="showcase-tea-name">{t.name}</span>
              <span className="showcase-tea-line">{t.line}</span>
            </div>
          ))}
        </Carousel>
      </div>
      <div className="showcase-steps">
        <p className="showcase-label" aria-hidden="true">
          Drag the steps into order
        </p>
        <Reorderable
          label="Steps, to drag into order"
          items={order.map((id) => {
            const label = steps.find((step) => step.id === id)!.label;
            return { id, label, content: <Item title={label} /> };
          })}
          onReorder={(ids) => setOrder(ids)}
        />
      </div>
      <div className="showcase-steep">
        <Timer
          key={round}
          ref={timer}
          label="Steep"
          duration={STEEP}
          // No chime or buzz from a visitor's speakers: the tea darkening says it's done.
          silent
          onDone={() => {
            setSteeped(true);
            // Only if it is still showing its end: a Restart in the meantime keeps its new steep.
            window.setTimeout(() => {
              if (timer.current?.dataset.status === "done") setRound((n) => n + 1);
            }, 600);
          }}
        />
      </div>
    </div>
  );
}
