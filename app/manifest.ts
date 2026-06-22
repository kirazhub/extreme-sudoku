import type { MetadataRoute } from "next";

// Web App Manifest — telefonda "ana ekrana ekle" deneyimi icin.
// Next 16 otomatik /manifest.webmanifest endpoint'i uretir.
// Ikonlar: app/icon.tsx (32px) ve app/apple-icon.tsx (180px) zaten metadata
// olarak servis ediliyor; burada ek olarak farkli boyutlarda referans veriyoruz.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sudoku Ahmet",
    short_name: "Sudoku Ahmet",
    description:
      "Telefonda oyna: kolaydan imkansiza Sudoku. Gunluk bulmaca ve seri takibiyle.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FBF8F1",
    theme_color: "#F0502E",
    lang: "tr",
    icons: [
      // Next.js'in dinamik favicon'unu farkli boyutlarda ima eder.
      // Ikon endpoint'i 32x32 dondurur ama "any" purpose ile her boyutta
      // referans verilebilir (cihaz olcekler).
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      // PWA icin gereken buyuk boyutlar — apple-icon yine kullanilabilir
      // (yuksek ozellikli ikon: maskable degil, "any" olarak gecer).
      {
        src: "/apple-icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
