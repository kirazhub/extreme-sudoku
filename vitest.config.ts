import { defineConfig } from "vitest/config";

// Vitest yapilandirmasi: sadece motor testlerini calistir, Next.js dosyalarina dokunma.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    // 16x16 generator yavas olabilir, makul bir timeout verelim.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
