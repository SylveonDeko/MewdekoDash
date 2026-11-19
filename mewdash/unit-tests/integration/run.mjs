import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const url = process.env.WIKI_TEST_DATABASE_URL;
const file = process.argv[2];

if (!url) {
  console.log("Skipped: WIKI_TEST_DATABASE_URL is not set.");
  process.exit(0);
}
if (!file) {
  console.error("Usage: node unit-tests/integration/run.mjs <file>.int.ts");
  process.exit(1);
}

const host = new URL(url).hostname;
if (host !== "127.0.0.1" && host !== "localhost") {
  console.error(`Refusing to run against ${host}. Only localhost is allowed.`);
  process.exit(1);
}

const root = fileURLToPath(new URL("../..", import.meta.url));
const stubs = fileURLToPath(new URL("./stubs/", import.meta.url));

const server = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true },
  resolve: {
    alias: [
      { find: /^\$env\/dynamic\/private$/, replacement: `${stubs}env.ts` },
      { find: /^\$app\/environment$/, replacement: `${stubs}environment.ts` },
      { find: /^\$lib\/wiki\/render$/, replacement: `${stubs}render.ts` },
      { find: /^\$lib\//, replacement: `${root}src/lib/` },
    ],
  },
});

try {
  await server.ssrLoadModule(`/unit-tests/integration/${file}`);
} finally {
  await server.close();
}
