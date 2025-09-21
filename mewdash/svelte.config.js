import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter({ out: "out" }),
    prerender: {
      handleHttpError: "warn"
    }
  },
  preprocess: vitePreprocess(),
};
