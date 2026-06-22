# Extreme Sudoku (Web) — Tasarım Belgesi

**Tarih:** 2026-06-22
**Durum:** Onaylandı
**Platform:** Web (mobil-öncelikli), PWA, Vercel'de yayın

---

## 1. Vizyon
> **"İnanılmaz zor ama oynaması zahmetsiz, telefonda tek elle akıp giden bir Sudoku."**
Açık/göz yormayan tema, şık tamamlama efekti (konfeti), sunucusuz (yerel) skorboard.

## 2. Teknik Zemin
- **Next.js (App Router) + React + TypeScript**
- **Tailwind CSS** (özel tema; jenerik görünümden kaçınılır)
- **PWA** (manifest + service worker → ana ekrana eklenir, çevrimdışı oynanır)
- **localStorage** → skorboard, yarım oyun, ayarlar, günlük seri
- **canvas-confetti** → tamamlama konfetisi; **Framer Motion** → geçiş/efekt
- **Vercel** → otomatik deploy (her git push'ta canlı)

## 3. Oyunun Beyni (saf TypeScript, boyut-agnostik)
Tek motor tüm boyutları destekler:
| Boyut | Kutu | Semboller |
|---|---|---|
| 4×4 | 2×2 | 1–4 |
| 6×6 | 2×3 | 1–6 |
| 9×9 | 3×3 | 1–9 |
| 16×16 | 4×4 | 1–16 |

- Sonsuz üretim, **tek çözüm garantili**
- Çözücü (backtracking) + insan-teknik ipucu motoru (açıklamalı)
- Zorluk = ipucu sayısı + gereken teknik derinliği

## 4. Zorluk & Ayarlar
- 5 seviye: **Kolay · Orta · Zor · Extreme · İmkânsız**
- Tahta boyutu seçimi (4×4 / 6×6 / 9×9 / 16×16)
- İpucu yoğunluğu kaydırıcısı (çok dolu ↔ az dolu)

## 5. Oynanış (kullanıcı tarifi)
- Üstte tahta → kareye dokun (seçilir/parlar)
- Altta rakam paleti → rakama dokun → seçili kareye yerleşir
- Üstte zaman sayacı + zorluk etiketi

## 6. İlk Sürüm Özellikleri
Not modu · Aynı rakam vurgulama · Hata gösterme (aç/kapa) · Akıllı ipucu (açıklamalı) · Günlük bulmaca + seri · Haptik titreşim · Duraklat/devam · Koyu tema · Konfeti + tamamlama efekti · Yerel skorboard

## 7. Ekranlar
1. **Ayar/Başlangıç:** zorluk + boyut + yoğunluk → BAŞLA
2. **Oyun:** tahta + palet + sayaç + araçlar (geri al/sil/not/ipucu/duraklat)
3. **Tamamlama:** konfeti + süre + rekor rozeti
4. **Skorboard:** zorluk+boyuta göre en iyi süreler
5. **Ayarlar:** tema, hata gösterme, haptik

## 8. Görünüm
Açık tema varsayılan (yumuşak krem/beyaz zemin, sakin renk, tek canlı aksan), karakterli net tipografi, büyük dokunma alanları. Koyu tema opsiyonel.

## 9. Yol Haritası
A. Next.js + PWA iskeleti → Vercel deploy · B. TS motor (testli) · C. Oyun ekranı · D. Ayar ekranı · E. Tamamlama+konfeti · F. Skorboard+kolaylıklar · G. Cila+yayın

## 10. Kullanıcı Katılımı Gereken Noktalar
- Vercel hesabı (ücretsiz) — ilk yayın için bağlantı/onay
- (Opsiyonel) özel alan adı
