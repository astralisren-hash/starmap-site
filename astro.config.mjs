import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://www.starmap.direct",
  trailingSlash: "ignore",
  integrations: [react()],
});
