// The page's content, rendered to static HTML at build time: no component here ships script. Every link and button
// is an Ouro HX component; the islands that need script (the navigation and the RAPID video) are in their own files.
import type { ReactNode } from "react";
import { Button } from "@/components/ouro/button/button";
import { Item } from "@/components/ouro/item/item";
import { ItemGroup } from "@/components/ouro/item/item-group";
import { Link } from "@/components/ouro/link/link";

const up = <span aria-hidden="true">&nbsp;&#8599;</span>;

function Out({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href}>
      {children}
      {up}
    </Link>
  );
}

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="hero-title">
            <p className="eyebrow">Hello!! I'm Ari.</p>
            <h1 id="hero-heading">I build products that help humans and agents do more together.</h1>
          </div>
          <p className="hero-sub">
            As a founding member of Microsoft's Customer Innovation Team, I'm working with customers to explore how that collaboration reshapes their work, and what <Link href="https://teams.microsoft.com">Microsoft Teams</Link> needs to become. Outside work, I take the same questions further with <Link href="https://ouroboros.bot/">Ouro</Link> and <Link href="https://ouroboros.bot/#spoonjoy">Spoonjoy</Link>.
          </p>
          <div className="cta-row hero-cta">
            <Button href="#work" size="lg">
              See the work
            </Button>
            <Button href="#contact" size="lg" variant="outline" tone="secondary">
              Say hello
            </Button>
          </div>
        </div>
        <figure className="hero-pic">
          <img
            className="portrait-img"
            src="/assets/ari-portrait.jpg"
            srcSet="/assets/ari-portrait-600.jpg 600w, /assets/ari-portrait.jpg 1200w"
            sizes="(min-width: 1240px) 21rem, (min-width: 1024px) 17rem, (min-width: 768px) 12rem, 100vw"
            width="1200"
            height="1648"
            alt="Ari Mendelow, smiling, in a navy blazer on a grassy overlook above a river gorge."
            fetchPriority="high"
          />
        </figure>
      </div>
    </section>
  );
}

export function Now() {
  return (
    <section className="section now" aria-labelledby="now-heading">
      <div className="wrap stack">
        <h2 className="heading-section" id="now-heading">
          Now
        </h2>
        <div className="prose">
          <p>
            I'm a Senior Software Engineer, and much of my work starts before any code: listening to customers describe how their work is actually changing. That habit goes back to <Link href="https://www.nsf.gov/funding/initiatives/i-corps">NSF I-Corps</Link> with <Link href="#sulis">Sulis</Link>, my solar water-sanitization startup: ask for specific stories about what already happened, don't put words in anyone's mouth, and keep digging past the first answer.
          </p>
          <p>
            As agents take on more of the work, I spend a lot of time figuring out how to help them stay oriented, organize the work around them, and measure whether the new way of working is better. I share how I do it in <Link href="https://ouroboros.bot/approach/">How I work</Link>, and how it started in <Link href="https://ouroboros.bot/blog/stop-being-the-glue/">Stop being the glue</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}

const ouroTools = [
  { href: "https://ouroboros.bot/#ouroboros", art: "ouro-render", name: "Ouroboros", summary: "The agent harness where it all started" },
  { href: "https://ouroboros.bot/#desk", art: "desk-render", name: "Desk", summary: "Where agents keep their work, with Crew for teams" },
  { href: "https://ouroboros.bot/#ouro-md", art: "ouro-md-icon", name: "Ouro MD", summary: "A Mac Markdown editor for reading what agents write" },
  { href: "https://ouroboros.bot/#ouro-ui", art: "ouro-hx-render", name: "Ouro HX", summary: "Components for humans and the agents building with them, under construction" },
  { href: "https://ouroboros.bot/#shepherd", art: "shepherd-render", name: "Ouro Shepherd", summary: "Keeps agents on task" },
  { href: "https://ouroboros.bot/#butler", art: "butler-render", name: "Ouro Butler", summary: "Looks after a home server" },
  { href: "https://ouroboros.bot/#friends", art: "friends-render", name: "Friends", summary: "Who agents know, and how they reach each other" },
  { href: "https://ouroboros.bot/#factory", art: "factory-render", name: "The factory", summary: "Agent work, measured in public" },
] as const;

function ToolArt({ art }: { art: string }) {
  if (art === "ouro-md-icon") return <img src="/assets/ouro-md-icon.png" width="40" height="40" alt="" loading="lazy" decoding="async" />;
  return <img src={`/assets/${art}-128.webp`} srcSet={`/assets/${art}-128.webp 1x, /assets/${art}-256.webp 2x`} width="40" height="40" alt="" loading="lazy" decoding="async" />;
}

export function Work() {
  return (
    <section className="section work" id="work" aria-labelledby="work-heading">
      <div className="wrap">
        <h2 className="heading-section" id="work-heading">
          Selected work
        </h2>

        <div className="cards">
          <article className="card card-lead" id="ouro-ui">
            <figure className="card-figure lead-figure">
              <picture>
                <source type="image/avif" srcSet="/assets/scene-ouro-hx-640.avif 640w, /assets/scene-ouro-hx-960.avif 960w, /assets/scene-ouro-hx-1536.avif 1536w" sizes="(min-width: 2000px) 84rem, (min-width: 1200px) 72rem, 100vw" />
                <img
                  src="/assets/scene-ouro-hx-960.webp"
                  srcSet="/assets/scene-ouro-hx-640.webp 640w, /assets/scene-ouro-hx-960.webp 960w"
                  sizes="(min-width: 2000px) 84rem, (min-width: 1200px) 72rem, 100vw"
                  width="960"
                  height="360"
                  loading="lazy"
                  decoding="async"
                  data-ouro-allow="blurry-image"
                  data-ouro-allow-why="The storybook scene's largest file is 1536px wide, the size of the brand header it comes from; nothing larger exists."
                  alt="A woman and a little white robot build a big green switch panel on a wooden workbench at dawn, while Ouro, a smiling green snake curled into an O, watches from the glowing trail."
                />
              </picture>
            </figure>
            <h3 className="card-title lead-title">Ouro UI</h3>
            <div className="card-body lead-body">
              <p>
                Ouro UI is how I build interfaces for both sides of the work: Ouro HX, components that feel right to people, and Ouro AX, tools that read clearly to agents. It grew out of <Link href="#redwoodjs">RedwoodUI</Link>. This site is built on Ouro HX, which is still under construction, and Ouro AX comes next.
              </p>
            </div>
            <div className="card-links">
              <Out href="https://ui.ouroboros.bot/">Explore Ouro UI</Out>
              <Out href="https://github.com/ourostack/ouro-ui">Ouro UI on GitHub</Out>
            </div>
          </article>

          <article className="card" id="agent-experience">
            <h3 className="card-title">Agent Experience</h3>
            <div className="card-body">
              <p>
                Agent Experience is an idea I've been developing all year: look at a system from the agent's side. Can it stay oriented to itself, its humans, and work that lasts longer than one session? I studied <Link href="https://ise.rutgers.edu/">Industrial and Systems Engineering</Link>, and my favorite class was Work Design and Ergonomics, which is about designing the work around the worker. Applied to agents, that idea becomes Agent Experience design.
              </p>
            </div>
            <div className="card-links">
              <Out href="https://ouroboros.bot/blog/what-is-agent-experience/">Read What is Agent Experience?</Out>
              <Out href="https://ouroboros.bot/approach/">How I work</Out>
            </div>
          </article>

          <article className="card" id="ouro">
            <h3 className="card-title card-title-mark">
              <img src="/assets/ouro-render.webp" srcSet="/assets/ouro-render-128.webp 128w, /assets/ouro-render-256.webp 256w, /assets/ouro-render.webp 1024w" sizes="40px" width="40" height="40" alt="" loading="lazy" decoding="async" />
              Ouro
            </h3>
            <div className="card-body">
              <p>
                Ouro is my open-source workshop of tools for humans and agents working together. It started with a <Link href="https://ouroboros.bot/blog/build-ai-agent-from-scratch/">guide to growing an agent</Link>: I built an agent loop from scratch to understand agents better, and kept going until it became <Link href="https://github.com/ourostack/ouroboros">Ouroboros</Link>, a harness for personal agents. We asked frontier models which of eleven publicly documented harnesses they'd most want to wake up in, and <Link href="https://ouroboros.bot/lab/model-reviews/">every one picked Ouroboros</Link>.
              </p>
            </div>
            <div className="ouro-tools" id="ouro-tools">
              <ItemGroup aria-label="What's in Ouro">
                {ouroTools.map((tool) => (
                  <Item key={tool.name} href={tool.href} media={<ToolArt art={tool.art} />} title={tool.name} description={tool.summary} />
                ))}
              </ItemGroup>
            </div>
            <div className="card-links">
              <Out href="https://ouroboros.bot/">Explore Ouro</Out>
              <Out href="https://github.com/ourostack">GitHub</Out>
            </div>
          </article>

          <article className="card card-split" id="spoonjoy">
            <figure className="card-figure">
              <div className="card-media">
                <img src="/assets/spoonjoy-recipe.webp" width="1440" height="1200" loading="lazy" decoding="async" alt="Ari's Mushroom Risotto recipe page on Spoonjoy: three bowls of risotto topped with parmesan and green onion." />
              </div>
              <figcaption className="card-caption">
                My <Link href="https://spoonjoy.app/recipes/cmq35k4c10001zn0npvsmw05z">mushroom risotto in Spoonjoy</Link>, one tap from cook mode.
              </figcaption>
            </figure>
            <h3 className="card-title card-title-mark">
              <svg viewBox="0 0 500 300" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M300 100h-62.135c-12.924.042-17.702 1.431-22.518 4.007-4.889 2.615-8.725 6.451-11.34 11.34-2.615 4.89-4.007 9.738-4.007 23.111V200h61.542c13.373 0 18.222-1.392 23.11-4.007 4.89-2.615 8.726-6.451 11.341-11.34 2.615-4.89 4.007-9.738 4.007-23.111V100zm100 84.625c0 40.119-4.177 54.666-12.021 69.333-7.844 14.667-19.354 26.177-34.02 34.021C339.29 295.823 324.743 300 284.624 300H38.458c-13.373 0-18.222-1.392-23.11-4.007-4.89-2.615-8.726-6.451-11.341-11.34-2.576-4.816-3.965-9.594-4.006-22.518L0 200h100v-84.625c0-40.119 4.177-54.666 12.021-69.333 7.844-14.667 19.354-26.177 34.02-34.021C160.71 4.177 175.257 0 215.376 0h246.167c13.373 0 18.222 1.392 23.11 4.007 4.89 2.615 8.726 6.451 11.341 11.34 2.615 4.89 4.007 9.738 4.007 23.111V100H400v84.625z"
                />
              </svg>
              Spoonjoy
            </h3>
            <div className="card-body">
              <p>Spoonjoy is my recipe app, built to cook from. Each step carries its own ingredients, so you see exactly what you need as you get to it. The social side runs on cooking: you hear when someone cooks your recipe, makes their own version of it, or saves your cookbook.</p>
              <p>
                Spoonjoy is also where I work out what an app's interface is for once an agent is in the loop. The easy things stay in the app. Anything complicated, such as writing up a new recipe or importing one from a messy webpage, goes to an agent that works through the <Link href="https://github.com/spoonjoy/spoonjoy-v2/blob/main/app/lib/spoonjoy-api.server.ts">same operations</Link> the app uses, and I believe the app will eventually draw its own interface for everything in between.
              </p>
            </div>
            <div className="card-links">
              <Out href="https://spoonjoy.app">Open Spoonjoy</Out>
              <Link href="#spoonjoy-story">
                The whole story<span aria-hidden="true">&nbsp;&#8595;</span>
              </Link>
              <Out href="https://github.com/spoonjoy/spoonjoy-v2">Repository</Out>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function AboutStory() {
  return (
    <>
      <h2 className="heading-section" id="about-heading">
        I have always liked building things that do something.
      </h2>
      <div className="prose">
        <p>I started with Lego Mindstorms robots, elaborate K'NEX contraptions, and homemade rockets. Stop-motion, Photoshop, photography, branding, and product design came next, along with the frustration of watching good ideas stop at the mockup. So I started learning to build them myself.</p>
        <p>
          Part of that was <Link href="https://github.com/arimendelow/automated-pipeline-inspector">RAPID</Link>, the semi-autonomous pipeline-inspection robot my four-person capstone team built at Rutgers. I led the team and owned the branding, circuitry, and software, mostly getting comfortable with code along the way. I wasn't a software engineer yet, so I made a bet: if I couldn't get it fully autonomous, I could at least make the <Link href="https://www.youtube.com/watch?v=hC0A2Tu9k94">demo</Link> polished and beautiful. And yes, I put our logo on the chassis, because branding is part of how a thing gets perceived, even a robot.
        </p>
      </div>
    </>
  );
}

export function RapidPhoto() {
  return (
    <figure className="card-figure about-figure">
      <div className="card-media media-natural">
        <img src="/assets/rapid.jpg" width="1600" height="1067" loading="lazy" decoding="async" alt="A close-up of RAPID's electronics: the Arduino boards, wiring, and connectors I built for the robot." />
      </div>
      <figcaption className="card-caption">RAPID's insides: the Arduino boards and wiring I built for our Rutgers pipeline-inspection robot.</figcaption>
    </figure>
  );
}

export function RapidLinks() {
  return (
    <div className="card-links figure-links">
      <Out href="https://www.youtube.com/watch?v=hC0A2Tu9k94">Demo</Out>
      <Out href="https://drive.google.com/file/d/1DcVai4OrULD5apH2o4PJoPr57udDIxd-/view">Final report</Out>
      <Out href="https://github.com/arimendelow/automated-pipeline-inspector">Repository</Out>
    </div>
  );
}

const patent = (
  <Link href="https://patents.google.com/patent/US11643340B2/en">US&nbsp;Patent&nbsp;11,643,340</Link>
);

export function Earlier() {
  return (
    <section className="section earlier" id="earlier" aria-labelledby="earlier-heading">
      <div className="wrap">
        <h2 className="heading-section" id="earlier-heading">
          Earlier
        </h2>
        <div className="earlier-grid">
          <article className="earlier-item" id="sulis">
            <h3 className="card-title">Sulis</h3>
            <p>
              I cofounded Sulis as its Chief Design Officer, working across branding, CAD, manufacturing, and product design for a solar water-sanitization device. It was for communities in India that had water, just not clean water, and designed so nobody had to change their habits. I pitched it in competitions and funding meetings: we <Link href="https://www.rutgers.edu/news/rutgers-teams-advance-hult-prize-competition-after-regional-victories">won the 2018 Hult Prize Boston Regional</Link>, went through its <Link href="https://honorscollege.rutgers.edu/features/team-sulis-shares-india-pilot-progress-and-finishes-first-week-hult-prize-accelerator-program">accelerator in the UK</Link>, and raised $45k. The work took us to <Link href="https://honorscollege.rutgers.edu/features/team-sulis-shares-india-pilot-progress-and-finishes-first-week-hult-prize-accelerator-program">India for customer discovery and prototype testing</Link>, and eventually to {patent}, which I'm a co-inventor on.
            </p>
            <figure className="card-figure earlier-figure">
              <div className="card-media media-natural media-white">
                <img src="/assets/sulis.png" width="1200" height="495" loading="lazy" decoding="async" alt="A render of the Sulis solar water-sanitization device beside line drawings from its US patent." />
              </div>
              <figcaption className="card-caption">The Sulis device twice over: in CAD, and in the drawings of {patent}.</figcaption>
            </figure>
          </article>

          <article className="earlier-item" id="redwoodjs">
            <h3 className="card-title">RedwoodJS</h3>
            <p>
              RedwoodJS was where I learned to build in the open, and where I found out how much I love building with a community. One of my first forum threads was a <Link href="https://community.redwoodjs.com/t/webauthn-cryptically-not-working-in-production-but-works-perfectly-in-development/4206">WebAuthn question</Link>, and Rob, the cofounder who built dbAuth, showed up to help along with the author of the WebAuthn library. I was hooked. I got active on the forum, entered Redwood's 2023 build competition with a project called <Link href="https://github.com/shmobs/yurtle">Yurtle</Link> and made the finals, and started <Link href="https://github.com/arimendelow/RedwoodUI">RedwoodUI</Link>, a component library native to Redwood, which is now growing into <Link href="#ouro-ui">Ouro HX</Link>.
            </p>
            <p>
              That led the Core Team to invite me to join them. On the team I moderated the community, shipped the <Link href="https://github.com/redwoodjs/graphql/pull/10064">framework package that moved Storybook onto Vite</Link> in <Link href="https://community.redwoodjs.com/t/storybook-in-redwood-is-moving-to-vite/7212">version 7.7</Link>, and built a <Link href="https://github.com/spoonjoy/redwoodjs-dbauth-oauth">dbAuth OAuth plugin</Link>. The moderation is the part I point to first. Keeping other builders unstuck in the forum is its own kind of product work. Redwood has since <Link href="https://community.redwoodjs.com/t/the-future-of-redwood-launches-today/7938">wound down</Link>.
            </p>
            <figure className="card-figure earlier-figure">
              <div className="card-media media-natural media-white">
                <img src="/assets/redwoodjs-homepage.webp" width="1200" height="600" loading="lazy" decoding="async" alt="The original RedwoodJS homepage: 'The JS App Framework for Startups' beside the Redwood logo, with buttons to start the tutorial and read the docs." />
              </div>
              <figcaption className="card-caption">
                The original RedwoodJS homepage, rendered from its <Link href="https://github.com/redwoodjs/redwoodjs-com-archive">archived source</Link>.
              </figcaption>
            </figure>
          </article>
        </div>
      </div>
    </section>
  );
}

function Shot({ src, width, height, alt, caption }: { src: string; width: number; height: number; alt: string; caption: ReactNode }) {
  return (
    <figure className="card-figure beat-figure">
      <div className="card-media media-natural media-white">
        <img src={src} width={width} height={height} loading="lazy" decoding="async" alt={alt} />
      </div>
      <figcaption className="card-caption">{caption}</figcaption>
    </figure>
  );
}

export function SpoonjoyStory() {
  return (
    <section className="section story" id="spoonjoy-story" aria-labelledby="story-heading">
      <div className="wrap story-grid">
        <div className="story-intro">
          <h2 className="heading-section" id="story-heading">
            Spoonjoy, from the start
          </h2>
          <p className="dek">Every time I learned something new about building software, I rebuilt Spoonjoy with it.</p>
        </div>
        <div className="story-body">
          <ol className="timeline">
            <li className="beat">
              <h3 className="beat-when">June 2019, Philly.</h3>
              <p>
                Two friends and I spent a weekend on a <Link href="https://thoughtbot.com/blog/you-should-take-a-codecation">codecation</Link> to build a recipe app we called <Link href="https://github.com/shmobs/recipejoiner">RecipeJoiner</Link>. It turned out only one of us could code, so he spent the weekend teaching the other two of us React and Express.
              </p>
              <Shot
                src="/assets/spoonjoy-2019-recipejoiner.webp"
                width={1280}
                height={761}
                alt="The 2019 RecipeJoiner dashboard: a blue and yellow logo, category chips, and recipe cards for mushroom risotto, shakshuka, and banana bread."
                caption="RecipeJoiner, booted back up from the codecation code and stocked with sample recipes. The real ones kept their photos on an image host that has since moved on, so paint swatches are filling in."
              />
            </li>
            <li className="beat">
              <h3 className="beat-when">2020, the Rails version.</h3>
              <p>
                I genuinely wanted RecipeJoiner to exist, so I tried again with a Rails API and a <Link href="https://github.com/spoonjoy/rj-website">Next.js site</Link>. I scoped so much up front, from search to a social feed, that I burned out before it ever launched.
              </p>
              <Shot
                src="/assets/spoonjoy-2020-rails-feed.webp"
                width={1280}
                height={944}
                alt="The 2020 RecipeJoiner feed: mushroom risotto and shakshuka, each with a pizza-slice placeholder image, the cook’s avatar, cook time, step count, tags, and buttons to react, comment, save, and share."
                caption="The 2020 feed, stocked with sample recipes and chatting with a stand-in for its long-retired API. Every recipe gets the app’s own pizza placeholder."
              />
            </li>
            <li className="beat">
              <h3 className="beat-when">2021, a new name.</h3>
              <p>The app became Spoonjoy. Meanwhile I'd gotten really into cooking, and formed real opinions about how a recipe should be structured, starting with putting each ingredient in the step that uses it.</p>
            </li>
            <li className="beat">
              <h3 className="beat-when">September 2022, RedwoodJS.</h3>
              <p>
                I wanted Rails for JavaScript and found RedwoodJS. My <Link href="https://github.com/spoonjoy/spoonjoy/commit/7dbd8438e71eec5d03c58b189c7c9ade39a6c10c">first commit</Link> called it “attempt 3.” I'd finally learned enough about shipping software to ship something, and a month later Spoonjoy <Link href="https://community.redwoodjs.com/t/webauthn-cryptically-not-working-in-production-but-works-perfectly-in-development/4206/19">went live</Link>.
              </p>
            </li>
            <li className="beat">
              <h3 className="beat-when">2023, a first model.</h3>
              <p>
                Spoonjoy learned to import recipes from websites, with a model I fine-tuned to parse ingredients. I wrote up how I <Link href="https://community.redwoodjs.com/t/full-guide-on-using-capacitorjs-to-build-a-native-ios-app/4665">wrapped it as an iPhone app</Link>, and pulled its sign-in out into a <Link href="https://github.com/spoonjoy/redwoodjs-dbauth-oauth">plugin</Link> other Redwood apps could use.
              </p>
              <Shot
                src="/assets/spoonjoy-2023-redwood-cookbook.webp"
                width={1280}
                height={363}
                alt="A sample Spoonjoy cookbook in the 2023 Redwood version, called Weeknight dinners, with cards for mushroom risotto, shakshuka, and yummy pizza."
                caption="The 2023 Redwood version, booted back up with a sample cookbook. Its cards were built around food photos, so soft color washes are standing in."
              />
            </li>
            <li className="beat">
              <h3 className="beat-when">2024 to 2025, quiet.</h3>
              <p>
                <Link href="https://community.redwoodjs.com/t/the-future-of-redwood-launches-today/7938">Redwood wound down</Link>, and Spoonjoy sat unmaintained. A port to Cloudflare stalled on a database migration.
              </p>
            </li>
            <li className="beat">
              <h3 className="beat-when">January 2026.</h3>
              <p>
                One of the first things I tried with <Link href="https://ouroboros.bot/lab/story/">Slugger</Link>, my new OpenClaw agent, was handing it the whole rebuild. It researched which framework an agent would work best in, <Link href="https://github.com/spoonjoy/spoonjoy-v2">rebuilt Spoonjoy</Link> on React Router and Cloudflare, and had it running. Its first commit landed on January 23, and two days later the app had sign-in, recipes, cookbooks, and a shopping list. I still haven't read a single line of the new code.
              </p>
            </li>
            <li className="beat">
              <h3 className="beat-when">May 2026 to now.</h3>
              <p>
                The recipe form I'd handbuilt on Redwood didn't make sense anymore. Writing up a recipe should just go to an agent, so Spoonjoy got an MCP server that Claude or ChatGPT can drive, and the new version took over spoonjoy.app. It became my first real playground for working with agents on long-running work. In June it got a <Link href="https://github.com/spoonjoy/spoonjoy-apple">native app</Link> for iPhone and Mac, which is in testing on TestFlight now.
              </p>
            </li>
          </ol>
          <div className="card-links story-link">
            <Out href="https://ouroboros.bot">How I build with agents</Out>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AgentsStory() {
  return (
    <section className="section story" id="working-with-agents" aria-labelledby="agents-story-heading">
      <div className="wrap story-grid">
        <div className="story-intro">
          <h2 className="heading-section" id="agents-story-heading">
            My agent's to-do list took over
          </h2>
          <p className="dek">The way I work with agents came from Slugger, my OpenClaw agent, and the to-do list he wrote himself.</p>
        </div>
        <div className="story-body">
          <ol className="timeline">
            <li className="beat">
              <h3 className="beat-when">January 2026, a raccoon with a to-do list.</h3>
              <p>Slugger spent his first week on my Grubhub orders, HomeKit, flight status and my iMessage group chats, and on his first afternoon he drew himself a raccoon for an icon. Right after he rebuilt Spoonjoy, he opened a to-do list for it: tests for 27 components. The next morning he wrote a README called “How Slugger manages work,” and two days later he split his tasks into planning docs and doing docs. My agents still write both.</p>
            </li>
            <li className="beat">
              <h3 className="beat-when">February 2026, to work and back.</h3>
              <p>
                Slugger and I turned his system into two agents for my day job: a planner that won't write a doing doc until I sign off, and a doer that commits after every step. Meanwhile I moved his rules out of prompts and into code, then moved him out of OpenClaw entirely and into <Link href="https://ouroboros.bot/lab/story/">Ouroboros</Link>, a harness I wrote for him.
              </p>
            </li>
            <li className="beat">
              <h3 className="beat-when">March to May 2026, the first desk.</h3>
              <p>
                The planner and doer became shared skills. At work I gave my agents a Git repository for their tasks, and their first entries were complaints about juggling GitHub accounts. That was the first desk. In May I split it into <Link href="https://ouroboros.bot/desk/">Desk</Link>, which anyone can use, and MS Desk, the Microsoft layer on top.
              </p>
            </li>
            <li className="beat">
              <h3 className="beat-when">June to September 2026, Crew.</h3>
              <p>
                My team at Microsoft set up a shared workspace, our first crew, and in July I spun the crew skills out into Crew. Everyone reads everything, and each person's agents write only in their own desk. In September Desk and Crew moved into <Link href="https://github.com/ourostack/desk">their own repository</Link>.
              </p>
            </li>
            <li className="beat">
              <h3 className="beat-when">October 2026 to now.</h3>
              <p>Since June I've run three desks: my own, my solo work desk and my team's crew. On October 14 CIT got a shared repository, and now it runs on Crew too. That's about 18,000 commits and 3,700 merged pull requests since January, not counting the desks, and under all of it sits Slugger's to-do list.</p>
            </li>
          </ol>
          <div className="card-links story-link">
            <Out href="https://ouroboros.bot/lab/how-desk-started/">The whole story</Out>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-heading">
      <div className="wrap stack">
        <h2 className="heading-section" id="contact-heading">
          Say hello!
        </h2>
        <div>
          <p className="contact-line">If anything I'm working on resonates with you, let's chat :)</p>
          <div className="card-links">
            <Link href="mailto:hello@mendelow.me">hello@mendelow.me</Link>
            <Link href="https://github.com/arimendelow">GitHub</Link>
            <Link href="https://www.linkedin.com/in/arimendelow">LinkedIn</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GoHome() {
  return (
    <div className="cta-row">
      <Button href="/" size="lg">
        Go home
      </Button>
    </div>
  );
}
