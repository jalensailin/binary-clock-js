// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  base: "/binary-clock-js/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Add any global SCSS variables or mixins here if needed
      },
    },
  },
  server: {
    open: true,
  },
});
