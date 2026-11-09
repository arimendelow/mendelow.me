// The Ouro UI entry's showcase: a little tea set to play with, built from real Ouro HX components. An island that
// hydrates when it scrolls into view (client:visible), so the rest of the page ships no extra script; its server HTML
// is the whole scene in its starting state.
import { useEffect, useRef, useState } from "react";
import { Celebrate } from "@/components/ouro/celebrate/celebrate";
import { Checklist, type ChecklistItemData } from "@/components/ouro/checklist/checklist";
import { ReactionBar, type Reaction, type ReactionOption } from "@/components/ouro/reaction-bar/reaction-bar";
import { SegmentedControl } from "@/components/ouro/segmented-control/segmented-control";
import { Slider } from "@/components/ouro/slider/slider";
import { Timer } from "@/components/ouro/timer/timer";

const strengths = [
  { word: "light", tea: "#d9a54e" },
  { word: "mellow", tea: "#c27f2f" },
  { word: "medium", tea: "#a15a1d" },
  { word: "strong", tea: "#7a3913" },
  { word: "very strong", tea: "#4f210a" },
] as const;

const cupChoices = ["1", "2", "3", "4"].map((value) => ({ value, label: value }));
const ratings: ReactionOption[] = [
  { key: "lovely", label: "Lovely", emoji: "☕" },
  { key: "honey", label: "Needs honey", emoji: "🍯" },
  { key: "love", label: "Love it", emoji: "💚" },
];
// The steep, in seconds; site.css darkens the tea over the same time.
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
  const [cups, setCups] = useState("2");
  const [strength, setStrength] = useState(3);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState("idle");
  const [rating, setRating] = useState<Reaction[]>([]);
  // A new key brings the timer back to its start: just after it ends (the ticked step says so, without leaving its red
  // "Time's up" beside the finished tea) and when the visitor starts again.
  const [round, setRound] = useState(0);
  const timer = useRef<HTMLDivElement>(null);
  const { word, tea } = strengths[strength - 1]!;
  const count = Number(cups);

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
  // The cups hold hot water, faintly tinted toward the chosen tea, and take its full colour as it steeps.
  const steeped = !!done.steep || status === "running" || status === "paused";
  const colour = `color-mix(in oklab, ${tea} ${steeped ? 100 : 14}%, #f6efe2)`;

  const steps: ChecklistItemData[] = [
    { id: "boil", label: "Boil the water", checked: !!done.boil },
    { id: "leaves", label: "Add the leaves", value: `${count} tsp`, checked: !!done.leaves },
    { id: "steep", label: "Steep", description: "The timer ticks this off", checked: !!done.steep, disabled: !done.steep },
    { id: "out", label: "Take out the leaves", checked: !!done.out },
  ];
  const ready = steps.every((step) => step.checked);

  return (
    <div className="showcase" data-steaming={steeping ? "" : undefined} data-ready={ready ? "" : undefined}>
      <CupDefs />
      <div className="showcase-scene">
        <div className="showcase-cups" role="img" aria-label={`${count === 1 ? "One cup" : `${count} cups`} of ${word} tea${steeping ? ", steeping" : ready ? ", ready" : ""}.`}>
          {Array.from({ length: count }, (_, index) => (
            <Cup key={index} tea={colour} />
          ))}
        </div>
        <div className="showcase-ending">
          <Celebrate show={ready} message="Tea's ready" cap={{ times: 1, per: "day", key: "mendelow-tea-ready" }} />
          {ready ? (
            <div className="showcase-rating">
              <span className="showcase-rating-label">How's your cup?</span>
              <ReactionBar
                label="Rate your cup"
                reactions={rating}
                quick={ratings}
                onReact={(key) =>
                  setRating((now) => (now.some((r) => r.key === key && r.mine) ? now.filter((r) => r.key !== key) : [...now, { ...ratings.find((r) => r.key === key)!, count: 1, mine: true }]))
                }
              />
            </div>
          ) : null}
        </div>
        <p className="sr-only" aria-live="polite">
          {steeping ? "Steeping." : done.steep ? "Steeped." : ""}
        </p>
      </div>
      <div className="showcase-controls">
        <SegmentedControl label="Cups" fullWidth value={cups} onValueChange={setCups} items={cupChoices} />
        <Slider label="Strength" description={`${word[0]!.toUpperCase()}${word.slice(1)}`} min={1} max={5} value={strength} onValueChange={setStrength} />
        <Timer
          key={round}
          ref={timer}
          label="Steep"
          duration={STEEP}
          // No chime or buzz from a visitor's speakers: the tea darkening and the ticked step say it's done.
          silent
          onDone={() => {
            setDone((now) => ({ ...now, steep: true }));
            // Only if it is still showing its end: a Restart in the meantime keeps its new steep.
            window.setTimeout(() => {
              if (timer.current?.dataset.status === "done") setRound((n) => n + 1);
            }, 600);
          }}
        />
      </div>
      <Checklist
        label="Make the tea"
        className="showcase-steps"
        items={steps}
        onCheckedChange={(id, checked) => setDone((now) => ({ ...now, [id]: checked }))}
        onClearChecked={() => {
          setDone({});
          setRating([]);
          setRound((n) => n + 1);
        }}
        clearLabel="Start again"
      />
    </div>
  );
}
