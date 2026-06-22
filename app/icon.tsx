import { ImageResponse } from "next/og";

// Favicon metadata — Next.js bu sabitleri okuyup <link> etiketini olusturur.
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Marka renkleri (referans: layout.tsx tema sabitleri)
const CORAL = "#F0502E"; // accent: mercan
const IVORY = "#FBF8F1"; // bg: fildisi
const INK = "#23272E"; // foreground: koyu murekkep

// 32x32'de detay okunmuyor, bu yuzden 3x3 izgarayi yuvarlak hucrelerle
// soyutluyoruz; orta hucre koyu murekkep ile vurgulu (Sudoku'nun "secili
// hucre" duygusunu hatirlatir).
export default function Icon() {
  // Tek bir kucuk daire/hucre — flex grid icinde tekrarlanir
  const cell = (filled: boolean) => (
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: 2,
        background: filled ? INK : IVORY,
      }}
    />
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: CORAL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* 3 satir x 3 sutun, ortadaki hucre koyu murekkep ile vurgulu */}
          <div style={{ display: "flex", gap: 2 }}>
            {cell(false)}
            {cell(false)}
            {cell(false)}
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {cell(false)}
            {cell(true)}
            {cell(false)}
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {cell(false)}
            {cell(false)}
            {cell(false)}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
