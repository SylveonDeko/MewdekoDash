import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const dir = fileURLToPath(new URL(".", import.meta.url));
const root = fileURLToPath(new URL("..", import.meta.url));

const server = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true },
});

try {
  const files = readdirSync(dir)
    .filter((file) => file.endsWith(".test.ts"))
    .sort();
  for (const file of files) {
    await server.ssrLoadModule(`/unit-tests/${file}`);
  }
} finally {
  await server.close();
}
