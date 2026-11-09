// The Ouro UI entry's showcase: a little tea set to play with, built from real Ouro HX components. An island that
// hydrates when it scrolls into view (client:visible), so the rest of the page ships no extra script; its server HTML
// is the whole scene in its starting state.
import { useEffect, useRef, useState } from "react";
import { Celebrate } from "@/components/ouro/celebrate/celebrate";
import { Checklist, type ChecklistItemData } from "@/components/ouro/checklist/checklist";
import { SegmentedControl } from "@/components/ouro/segmented-control/segmented-control";
import { Slider } from "@/components/ouro/slider/slider";
import { Timer } from "@/components/ouro/timer/timer";

const strengths = [
  { word: "light", tea: "#e2b860" },
  { word: "mellow", tea: "#cf933a" },
  { word: "medium", tea: "#b06a24" },
  { word: "strong", tea: "#8a4416" },
  { word: "very strong", tea: "#5c290c" },
] as const;

const cupChoices = ["1", "2", "3", "4"].map((value) => ({ value, label: value }));

function Cup({ tea, index }: { tea: string; index: number }) {
  const clip = `showcase-cup-${index}`;
  return (
    <svg className="showcase-cup" viewBox="0 0 100 100" aria-hidden="true" style={{ animationDelay: `${index * 60}ms` }}>
      <defs>
        <clipPath id={clip}>
          <path d="M14 38h60v20a30 30 0 0 1-30 30a30 30 0 0 1-30-30z" />
        </clipPath>
      </defs>
      <g className="showcase-steam" fill="none" strokeLinecap="round" strokeWidth="3">
        <path d="M30 28c-4-5 4-9 0-14s4-9 0-12" />
        <path d="M44 30c-4-5 4-9 0-14s4-9 0-12" />
        <path d="M58 28c-4-5 4-9 0-14s4-9 0-12" />
      </g>
      <ellipse className="showcase-saucer" cx="44" cy="94" rx="40" ry="4.5" />
      <path className="showcase-handle" d="M74 46h5a10 10 0 0 1 0 20h-7" fill="none" strokeWidth="5" />
      <path className="showcase-cup-body" d="M12 36h64v22a32 32 0 0 1-32 32a32 32 0 0 1-32-32z" />
      <g clipPath={`url(#${clip})`}>
        <rect className="showcase-tea" x="0" y="44" width="100" height="56" fill={tea} />
        <ellipse cx="44" cy="44" rx="30" ry="3" fill="#ffffff" opacity="0.18" />
      </g>
    </svg>
  );
}

export function OuroShowcase() {
  const [cups, setCups] = useState("2");
  const [strength, setStrength] = useState(3);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [steeping, setSteeping] = useState(false);
  // A new key brings the timer back to its start: after it ends (its red "Time's up" has done its job once the step
  // is ticked) and when the visitor starts again.
  const [round, setRound] = useState(0);
  const timer = useRef<HTMLDivElement>(null);
  const { word, tea } = strengths[strength - 1]!;
  const count = Number(cups);

  // The timer keeps its own state; the scene follows it, so the cups steam while it runs.
  useEffect(() => {
    const node = timer.current;
    if (!node) return;
    const sync = () => setSteeping(node.dataset.status === "running");
    sync();
    const watch = new MutationObserver(sync);
    watch.observe(node, { attributes: true, attributeFilter: ["data-status"] });
    return () => watch.disconnect();
  }, [round]);

  const steps: ChecklistItemData[] = [
    { id: "warm", label: "Warm the pot", checked: !!done.warm },
    { id: "leaves", label: "Add the leaves", value: `${count} tsp`, checked: !!done.leaves },
    { id: "steep", label: "Steep", description: "The timer ticks this off", checked: !!done.steep },
    { id: "pour", label: count === 1 ? "Pour a cup" : `Pour ${count} cups`, checked: !!done.pour },
  ];
  const ready = steps.every((step) => step.checked);

  return (
    <div className="showcase" data-steaming={steeping ? "" : undefined}>
      <div className="showcase-scene">
        <div className="showcase-cups" role="img" aria-label={`${count === 1 ? "One cup" : `${count} cups`} of ${word} tea${steeping ? ", steeping" : ready ? ", ready" : ""}.`}>
          {Array.from({ length: count }, (_, index) => (
            <Cup key={index} index={index} tea={tea} />
          ))}
        </div>
        <Celebrate show={ready} message="Tea's ready" className="showcase-celebrate" />
      </div>
      <div className="showcase-controls">
        <SegmentedControl label="Cups" fullWidth value={cups} onValueChange={setCups} items={cupChoices} />
        <Slider label="Strength" description={`${word[0]!.toUpperCase()}${word.slice(1)}`} min={1} max={5} value={strength} onValueChange={setStrength} />
        <Timer
          key={round}
          ref={timer}
          label="Steep"
          duration={20}
          onDone={() => {
            setDone((now) => ({ ...now, steep: true }));
            window.setTimeout(() => setRound((n) => n + 1), 2500);
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
          setRound((n) => n + 1);
        }}
        clearLabel="Start again"
      />
    </div>
  );
}
