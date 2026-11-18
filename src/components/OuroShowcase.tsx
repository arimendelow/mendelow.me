// The Ouro UI entry's showcase: a pot of tea to make, built from real Ouro HX components. The cups are a Carousel: swipe
// to change the tea. The steps are a Checklist that knows their order: tick them as you'd make tea, and the pot gets
// stronger with each step done in turn. A step ticked too early turns amber and says which step comes first, and turns
// right on its own once that one is done. All five fill the cups, and Celebrate bursts over them. An island that
// hydrates when it scrolls into view (client:visible), so the rest of the page ships no extra script; its server HTML
// is the whole scene in its starting state.
import { useState } from "react";
import { Carousel } from "@/components/ouro/carousel/carousel";
import { Celebrate } from "@/components/ouro/celebrate/celebrate";
import { Checklist } from "@/components/ouro/checklist/checklist";

const teas = [
  { id: "breakfast", name: "English breakfast", line: "Malty and bold", tea: "#5a2a0e" },
  { id: "earl-grey", name: "Earl Grey", line: "Black tea and bergamot", tea: "#7a3d16" },
  { id: "sencha", name: "Sencha", line: "Grassy green tea", tea: "#9a9a34" },
  { id: "rooibos", name: "Rooibos", line: "Red bush, sweet and round", tea: "#a8401c" },
  { id: "chamomile", name: "Chamomile", line: "Golden and calm", tea: "#d6a83f" },
] as const;

// The steps in the order they're done, which is the order the checklist holds them to.
const steps = [
  { id: "boil", label: "Boil the water" },
  { id: "warm", label: "Warm the pot" },
  { id: "leaves", label: "Add the leaves" },
  { id: "pour", label: "Pour on the water" },
  { id: "steep", label: "Let it steep" },
] as const;
type StepId = (typeof steps)[number]["id"];
const order: StepId[] = steps.map((step) => step.id);
// The order the steps are shown in, so there's an order to find.
const shown: StepId[] = ["leaves", "boil", "steep", "warm", "pour"];

// Each step's icon, drawn in the soft tile at the start of its row.
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
  const [done, setDone] = useState<ReadonlySet<StepId>>(new Set());
  // The steps done in turn: the pot is as strong as the run of steps from the first with none skipped.
  const inTurn = order.findIndex((id) => !done.has(id));
  const brewed = inTurn === -1 ? order.length : inTurn;
  const ready = brewed === order.length;
  // The cups hold a hint of each tea, and fill toward its full colour as the steps are done in turn.
  const strength = 22 + Math.round((78 * brewed) / order.length);
  const colour = (index: number) => `color-mix(in oklab, ${teas[index]!.tea} ${strength}%, #f6efe2)`;
  const name = teas[tea]!.name;

  return (
    <div className="showcase" data-ready={ready ? "" : undefined}>
      <CupDefs />
      <div className="showcase-stage">
        <Carousel label="Teas" slideLabel="{n} of {total}" onIndexChange={setTea}>
          {teas.map((t, index) => (
            <div key={t.id} className="showcase-slide" data-steaming={ready ? "" : undefined}>
              <div className="showcase-cups" role="img" aria-label={`Two cups of ${t.name}${ready ? ", ready" : ""}.`}>
                <Cup tea={colour(index)} pour={brewed} />
                <Cup tea={colour(index)} pour={brewed} />
              </div>
              <p className={ready ? "showcase-tea-name showcase-ready" : "showcase-tea-name"}>{ready ? `Your ${t.name} is ready` : t.name}</p>
              <p className="showcase-tea-line">{ready ? "Fresh from the pot." : t.line}</p>
            </div>
          ))}
        </Carousel>
        {/* The payoff bursts over the cups, once, when every step is done in turn. */}
        <span className="showcase-burst">
          <Celebrate show={ready} message={`Your ${name} is ready`} hideMessage className="absolute inset-0" />
        </span>
      </div>
      <div className="showcase-work">
        <Checklist
          label="Steps"
          description="Tick each one in the order you'd do it."
          variant="outline"
          ordered={order}
          items={shown.map((id) => {
            const step = steps.find((s) => s.id === id)!;
            return { id, label: step.label, media: <StepIcon id={id} />, checked: done.has(id) };
          })}
          onCheckedChange={(id, checked) =>
            setDone((now) => {
              const next = new Set(now);
              if (checked) next.add(id as StepId);
              else next.delete(id as StepId);
              return next;
            })
          }
          onClearChecked={() => setDone(new Set())}
          clearLabel="Start over"
        />
      </div>
    </div>
  );
}
