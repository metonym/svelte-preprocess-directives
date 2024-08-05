import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { componentDirectives } from "svelte-preprocess-directives";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    svelte({
      preprocess: [vitePreprocess(), componentDirectives()],
    }),
  ],
};
