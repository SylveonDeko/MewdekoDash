import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin, ViteDevServer } from "vite";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

const mobileMusicWsPlugin: Plugin = {
  name: "mobile-music-ws",
  configureServer(server: ViteDevServer) {
    attachUpgradeHandler(server);
  },
};

function attachUpgradeHandler(server: ViteDevServer) {
  server.httpServer?.on("upgrade", async (req, socket, head) => {
    if (!req.url?.startsWith("/api/mobile/music/ws")) return;
    try {
      const mod = await server.ssrLoadModule("/src/lib/server/mobileMusicSocket.ts");
      const handler = (mod as {
        handleMobileMusicUpgrade: (
          req: unknown,
          socket: unknown,
          head: unknown,
        ) => Promise<boolean>;
      }).handleMobileMusicUpgrade;
      await handler(req, socket, head);
    } catch (err) {
      console.error("mobile music ws upgrade failed", err);
      try { socket.destroy(); } catch { /* already destroyed */ }
    }
  });
}

export default defineConfig(({ command }) => ({
  plugins: [
    sentrySvelteKit({
      autoUploadSourceMaps: Boolean(process.env.SENTRY_AUTH_TOKEN),
      sourceMapsUploadOptions: {
        org: "mewdeko-2i",
        project: "mewdash",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
    tailwindcss(),
    sveltekit(),
    mobileMusicWsPlugin,
    ...(command === "serve" ? [mkcert()] : []),
  ],
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
}));
