import { defineConfig } from "#q-app/wrappers";
import { fileURLToPath } from "node:url";

export default defineConfig(() => ({
  boot: ["pinia", "theme"],

  css: ["app.scss"],

  extras: ["material-icons"],

  build: {
    target: {
      browser: ["es2022", "firefox115", "chrome115", "safari14"],
      node: "node20",
    },
    typescript: {
      strict: true,
      vueShim: true,
    },
    vueRouterMode: "history",
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    env: {
      API_BASE_URL: process.env.VITE_API_BASE_URL ?? "http://localhost:3000",
    },
  },

  devServer: {
    open: false,
    port: 9000,
  },

  framework: {
    config: {
      dark: "auto",
    },
    plugins: ["Notify", "Dark"],
  },

  animations: [],
}));
