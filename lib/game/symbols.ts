// Hucre degeri -> ekranda gosterilecek sembol.
// 1..9 olduklari gibi, 10..16 icin A..G (16x16 standart).
export function symbolFor(value: number): string {
  if (value === 0) return "";
  if (value <= 9) return String(value);
  return String.fromCharCode("A".charCodeAt(0) + (value - 10));
}

// Boyut basina rakam paleti listesi (1..size).
export function valuesForSize(size: number): number[] {
  const out: number[] = [];
  for (let v = 1; v <= size; v++) out.push(v);
  return out;
}
