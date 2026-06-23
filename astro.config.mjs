// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Your published site URL. For a user/org page served from a repo named
  // `getsec.github.io`, this is the root and no `base` is needed.
  site: "https://getsec.github.io",
  vite: {
    plugins: [tailwindcss()],
  },
});
