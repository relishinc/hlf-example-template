import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig((config) => ({
  ...config,
  build: {
    outDir: "dist",
    target: "esnext",
    emptyOutDir: true,
    manifest: true,
  },
  logLevel: "info",
  root: "src",
  base: process.env.NODE_ENV === "development" ? "/" : "/dist/",
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    host: true,
    port: 8080,
  },
  plugins: [
    viteStaticCopy({
      watch: true,
      targets: [
        {
          src: "src/assets/images/spritesheets/_output/*",
          dest: "images/spritesheets",
          globOptions: { dot: false },
        },
        {
          src: "src/assets/images/static/**/*",
          dest: "images/static",
          globOptions: { dot: false },
        },
        {
          src: "src/assets/audio/output/**/*",
          dest: "audio",
          globOptions: { dot: false },
        },
        {
          src: "src/assets/fonts/**/*",
          dest: "fonts",
          globOptions: { dot: false, ignore: ["**/*.bmfc"] },
        },
        {
          src: "src/assets/json/**/*",
          dest: "json",
          globOptions: { dot: false, ignore: ["**/*.ogmo"] },
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "html-living-framework": path.resolve(__dirname, "../relish-hlf/src"),
    },
  },
}));
