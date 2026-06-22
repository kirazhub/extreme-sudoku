import { defineConfig } from "vitest/config";
import path from "node:path";

// Vitest yapilandirmasi: sadece motor testlerini calistir, Next.js dosyalarina dokunma.
export default defineConfig({
  resolve: {
    alias: {
      // "@/..." yolunu proje koklerine baglar (tsconfig paths ile ayni).
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    include: ["lib/**/*.test.ts"],
    // 16x16 generator yavas olabilir, makul bir timeout verelim.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
