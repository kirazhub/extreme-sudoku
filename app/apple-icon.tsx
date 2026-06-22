import { ImageResponse } from "next/og";

// Apple touch icon: 180x180 onerilen boyut. iOS koseleri otomatik yuvarlar.
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Marka renkleri
const CORAL = "#F0502E";
const IVORY = "#FBF8F1";
const INK = "#23272E";

// Mini bir 3x3 Sudoku izgarasi — her hucre 40px, toplam 120px (180 icinde
// rahat ortalanir). Bazi hucrelere klasik Sudoku rakamlari koyduk; bir
// hucre mercan accent ile "secili" gibi vurgulandi.
export default function AppleIcon() {
  // Sudoku icin tipik bir baslangic dizilimi — sadece 3 rakam goruyoruz
  const cells: { v?: string; highlight?: boolean }[] = [
    { v: "5" }, {}, { v: "3" },
    {}, { v: "7", highlight: true }, {},
    { v: "1" }, {}, { v: "9" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: IVORY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Apple koseleri yuvarladigi icin kare zemin yeterli; ince ic
          // golge ile derinlik hissi veriyoruz.
          boxShadow: "inset 0 0 0 4px rgba(35,39,46,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            // 3x3 izgaranin dis cercevesi — sudoku'nun "kalin" hatlari
            border: `3px solid ${INK}`,
            borderRadius: 8,
            background: IVORY,
            overflow: "hidden",
          }}
        >
          {[0, 1, 2].map((row) => (
            <div key={row} style={{ display: "flex" }}>
              {[0, 1, 2].map((col) => {
                const idx = row * 3 + col;
                const cell = cells[idx];
                return (
                  <div
                    key={col}
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      // Ince ic hatlar — sag ve alt kenara cizgi, son satir/
                      // sutunda kapatiliyor
                      borderRight:
                        col < 2 ? `1.5px solid ${INK}` : "none",
                      borderBottom:
                        row < 2 ? `1.5px solid ${INK}` : "none",
                      background: cell.highlight ? CORAL : "transparent",
                      color: cell.highlight ? IVORY : INK,
                      fontSize: 26,
                      fontWeight: 700,
                      // Sistem fontu — ImageResponse default serif/sans
                      fontFamily:
                        "ui-sans-serif, system-ui, -apple-system, sans-serif",
                      // tabular figures hissi icin sayilari merkezde tutar
                      lineHeight: 1,
                    }}
                  >
                    {cell.v ?? ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
