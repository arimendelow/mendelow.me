// Where the visitor's light or dark choice is kept. "theme" is the key the site used before Ouro HX, so a choice
// made then still holds.
export const schemeKey = "theme";

// Side padding for the full-width bars (the family bar, the navbar and the family footer), so their contents line up
// with the page's container: the gutter, or the room beside the container on a wide screen.
export const gutters = "ps-[max(var(--gutter),calc(50%_-_var(--maxw)/2))] pe-[max(var(--gutter),calc(50%_-_var(--maxw)/2))]";

// The family bar's links carry their own inline padding, so the bar starts that much earlier and its first link's text
// lines up with the wordmark and the page.
export const familyBarGutters = "ps-[max(calc(var(--gutter)_-_0.625rem),calc(50%_-_var(--maxw)/2_-_0.625rem))] pe-[max(var(--gutter),calc(50%_-_var(--maxw)/2))]";
