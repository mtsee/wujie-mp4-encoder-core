import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import vitePluginImp from "vite-plugin-imp";
import mkcert from "vite-plugin-mkcert";

//@ts-ignore
const resolve = (url) => path.resolve(__dirname, url);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@config": resolve("./src/config"),
      "@utils": resolve("./src/utils"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"], // 省略扩展名
  },
  plugins: [
    mkcert({
      source: "coding",
    }),
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-private-methods", { loose: true }],
          ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
          ["@babel/plugin-proposal-decorators", { legacy: true }],
          ["@babel/plugin-proposal-class-properties", { loose: true }],
        ],
      },
    }),
  ],
  css: {
    modules: {
      generateScopedName: "[name]__[local]__[hash:5]",
    },
    preprocessorOptions: {
      less: {
        // 支持内联 javascript
        javascriptEnabled: true,
      },
    },
  },
  // 入口
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve("index.html"),
      },
    },
  },
  base: "/", // 公共基础路径
  server: {
    https: true,
    host: "0.0.0.0",
    port: 3000,
  },
});
