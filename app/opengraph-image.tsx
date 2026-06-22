import { ImageResponse } from "next/og";

// 1200x630 — Facebook/Twitter/LinkedIn paylasiminda kullanilan standart oran.
export const alt = "Sudoku Ahmet — Telefonda oyna, saf mantık";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Marka renkleri (layout.tsx ile uyumlu)
const CORAL = "#F0502E";
const IVORY = "#FBF8F1";
const INK = "#23272E";

// 9x9 Sudoku snapshot — saglda anchor olarak gosterilecek mini izgara.
// Sadece bazi hucreler dolu; bir tanesi mercan accent ile "secili".
// 0 = bos, sayilar verilen hucre, "@" = vurgulu hucre
const SNAPSHOT: string[][] = [
  ["5", "3", "0", "0", "7", "0", "0", "0", "0"],
  ["6", "0", "0", "1", "9", "5", "0", "0", "0"],
  ["0", "9", "8", "0", "0", "0", "0", "6", "0"],
  ["8", "0", "0", "0", "6", "0", "0", "0", "3"],
  ["4", "0", "0", "8", "@", "3", "0", "0", "1"],
  ["7", "0", "0", "0", "2", "0", "0", "0", "6"],
  ["0", "6", "0", "0", "0", "0", "2", "8", "0"],
  ["0", "0", "0", "4", "1", "9", "0", "0", "5"],
  ["0", "0", "0", "0", "8", "0", "0", "7", "9"],
];

// Tek bir Sudoku hucresini renderlar. Kalin 3x3 hatlari index'e gore
// belirlenir (her 3. cizgide kalin border).
function Cell({
  value,
  row,
  col,
}: {
  value: string;
  row: number;
  col: number;
}) {
  const isHighlight = value === "@";
  const isEmpty = value === "0" || value === "@";

  // Kalin 3x3 ic hatlari: her 3. sutun/satir sonunda kalin cizgi
  const rightThick = col === 2 || col === 5;
  const bottomThick = row === 2 || row === 5;

  return (
    <div
      style={{
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isHighlight ? CORAL : "transparent",
        color: isHighlight ? IVORY : INK,
        fontSize: 28,
        fontWeight: 600,
        fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
        lineHeight: 1,
        // Ince ic hatlar (her hucrenin sag/alt kenari)
        borderRight: col < 8
          ? rightThick
            ? `2.5px solid ${INK}`
            : `1px solid rgba(35,39,46,0.18)`
          : "none",
        borderBottom: row < 8
          ? bottomThick
            ? `2.5px solid ${INK}`
            : `1px solid rgba(35,39,46,0.18)`
          : "none",
      }}
    >
      {isEmpty ? "" : value}
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: IVORY,
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Sag-ust koseden tasan mercan oval — sicak grafik anchor */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: CORAL,
            opacity: 0.92,
            display: "flex",
          }}
        />

        {/* Sol-alt mikro doku: tek bir kucuk daire detay */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 56,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: CORAL,
            display: "flex",
          }}
        />

        {/* Sol kolon: tipografi — basligin nefes alanini koruyacak padding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 0 72px 88px",
            width: 720,
            height: "100%",
          }}
        >
          {/* Ust etiket: kucuk caps, mercan accent */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 4,
              color: CORAL,
              textTransform: "uppercase",
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, sans-serif",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 36,
                height: 2,
                background: CORAL,
                display: "flex",
              }}
            />
            MOBİL SUDOKU
          </div>

          {/* Ana baslik: buyuk serif, karakterli */}
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              lineHeight: 0.92,
              color: INK,
              fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
              letterSpacing: -2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Sudoku</span>
            <span style={{ color: CORAL }}>Ahmet</span>
          </div>

          {/* Alt baslik: tagline */}
          <div
            style={{
              marginTop: 32,
              fontSize: 32,
              fontWeight: 400,
              color: INK,
              opacity: 0.72,
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, sans-serif",
              lineHeight: 1.3,
              display: "flex",
              maxWidth: 560,
            }}
          >
            Telefonda oyna · saf mantık
          </div>
        </div>

        {/* Sag kolon: 9x9 mini Sudoku izgarasi — gorsel anchor */}
        <div
          style={{
            position: "absolute",
            right: 88,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            border: `3px solid ${INK}`,
            borderRadius: 12,
            overflow: "hidden",
            background: IVORY,
            // Yumusak govde golgesi — derinlik
            boxShadow: "0 20px 48px rgba(35,39,46,0.18)",
          }}
        >
          {SNAPSHOT.map((row, rIdx) => (
            <div key={rIdx} style={{ display: "flex" }}>
              {row.map((val, cIdx) => (
                <Cell key={cIdx} value={val} row={rIdx} col={cIdx} />
              ))}
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
