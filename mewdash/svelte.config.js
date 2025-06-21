import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter({ out: "out" }),
    prerender: {
      handleHttpError: "warn"
    },
    modulePreload: {
      enabled: false
    }
  },
  preprocess: vitePreprocess(),
};
