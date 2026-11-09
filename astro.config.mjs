// @ts-check
// mendelow.me: static pages, rendered from React on the server with Ouro HX. Only the islands that need script
// (the navigation and the RAPID video) ship any.
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mendelow.me",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
