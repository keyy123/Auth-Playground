import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// import url from "url";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    root: "./src",
    plugins: [react()],
    resolve: {
      alias: {
        url: "url",
        http: "stream-http",
        https: "https-browserify",
      },
    },
  });
};
