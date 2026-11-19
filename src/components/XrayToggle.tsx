// "Show me", beside the tea's invitation: turns on Ouro HX's X-ray, which outlines every Ouro HX component on the page
// with its name, linked to its docs, and lists them in a bar at the bottom. The same X-ray the Nautilus ends on at
// ui.ouroboros.bot, so the claim beside it ("every cup, step and button here is a live Ouro HX component") is one press
// from proof, across the whole page. An island that hydrates when it scrolls into view (client:visible); with no
// script it renders nothing, and the "See them all" link stays.
import { useState } from "react";
import { Button } from "@/components/ouro/button/button";
import { Inspector } from "@/components/ouro/inspector/inspector";

export function XrayToggle() {
  const [on, setOn] = useState(false);
  return (
    <>
      <Button variant="soft" size="sm" aria-pressed={on} onClick={() => setOn((now) => !now)}>
        {on ? "Hide the parts" : "Show me the parts"}
      </Button>
      <Inspector open={on} onOpenChange={setOn} spotlight="checklist" />
    </>
  );
}
