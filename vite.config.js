
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["funk-liz-scoring-cradle.trycloudflare.com"],
    middlewareMode: false,
  },
  plugins: [
    {
      name: "slash-normalizer",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || "/";
          // ignore assets, vite internals, and already-slashed root
          if (
            url === "/" ||
            url.includes(".") ||
            url.startsWith("/@") ||
            url.startsWith("/src/") ||
            url.startsWith("/node_modules/")
          ) return next();

          // if missing trailing slash, redirect to slash version
          if (!url.endsWith("/")) {
            res.statusCode = 308;
            res.setHeader("Location", url + "/");
            res.end();
            return;
          }

          next();
        });
      },
    },
  ],
});
