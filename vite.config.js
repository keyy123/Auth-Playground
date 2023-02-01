import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  root: "./src",
  server: {
    https: true,
    host: true,
  },
  plugins: [react(), mkcert()],
});
