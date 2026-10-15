import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@data": root("./data"),
      "@content": root("./content"),
      "@": root("./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "data/**/*.test.ts", "content/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
