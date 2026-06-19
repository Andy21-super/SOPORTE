import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/SOPORTE/" : "/",
  plugins: [react()],
  build: {
    minify: process.env.CPANEL_BUILD === "true" ? false : "esbuild"
  },
  server: {
    port: 5173
  }
});
