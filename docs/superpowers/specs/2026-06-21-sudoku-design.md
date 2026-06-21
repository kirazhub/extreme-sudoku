# Sudoku iOS Oyunu — Tasarım Belgesi

**Tarih:** 2026-06-21
**Durum:** Onaylandı (kullanıcı tarafından)
**Hedef Platform:** iOS (iPhone öncelikli, iPad uyumlu)

---

## 1. Oyunun Ruhu (Vizyon)

> **"Uzmanın derinliğini sunan ama herkesin zahmetsizce oynayabildiği bir Sudoku."**

- **Hedef kitle:** Öncelikle bulmaca tutkunları / uzman oyuncular; ama arayüz o kadar sade ki yeni başlayan da rahatça oynar.
- **Karakter:** Sade, dikkat dağıtmayan, sakin, modern.
- **İş modeli:** Tamamen **ücretsiz ve reklamsız**. Satın alma yok, premium yok, reklam yok. Herkese her şey açık.

---

## 2. Bulmaca Dünyası

### 2.1 Bulmaca Türleri
1. **Klasik 9x9 Sudoku** (ana mod)
2. **Killer Sudoku** — kafeslere (cage) bölünmüş, her kafesin toplamı verilen ipuçlu varyasyon
3. **X-Sudoku** — iki ana köşegende de 1-9 kuralının geçerli olduğu varyasyon

### 2.2 Zorluk Seviyeleri (6 kademe)
Kolay → Orta → Zor → Uzman → İfrit → Usta

Zorluk, bulmacanın **çözümü için gereken insan tekniklerinin zorluğuna** göre belirlenir (sadece açık hücre sayısına göre değil). Örneğin "İfrit" ve "Usta", X-Wing / Swordfish gibi ileri teknikler gerektiren bulmacalardır.

### 2.3 Bulmaca Üretimi (Generator)
- Bulmacalar **cihazda anında üretilir** → sonsuz bulmaca, internet gerekmez.
- Her üretilen bulmacanın **tek (benzersiz) çözümü** matematiksel olarak garanti edilir.
- Üretim algoritması:
  1. Tam dolu geçerli bir tahta üret (backtracking + rastgeleleştirme).
  2. Hücreleri tek tek boşalt; her boşaltmadan sonra "çözüm hâlâ tek mi?" kontrolü yap.
  3. Hedef zorluğa ulaşana kadar devam et (zorluk = çözücü motorunun bulmacayı çözmek için kullanması gereken en zor teknik).

---

## 3. Oyun Ekranı & Oynanış (Oynaması Kolay)

### 3.1 Akıllı Giriş
- Rakam seç → tahtadaki **aynı rakamlar** ve seçili hücrenin **satır / sütun / 3x3 kutusu** otomatik vurgulanır.
- İki giriş yöntemi (ayardan seçilir): "önce hücre sonra rakam" veya "önce rakam sonra hücre".

### 3.2 Kalem İşaretleri (Notlar / Pencil Marks)
- Bir hücreye olası rakamları küçük not olarak yazma.
- **Otomatik not** seçeneği: oyun, her hücre için geçerli adayları otomatik tutar ve sen rakam girdikçe günceller.

### 3.3 Hata Gösterme
- Yanlış (çözümle çelişen) rakam girince hücre kırmızıyla işaretlenir.
- **Aç/Kapa ayarı:** Saf/zorlu deneyim isteyenler için kapatılabilir.

### 3.4 Düzenleme Araçları
- Sınırsız **Geri Al / İleri Al** (Undo/Redo)
- Hücre temizleme, bir hücrenin tüm notlarını silme
- "Notları yeniden hesapla" düğmesi

### 3.5 Yerleşim
- Tek elle rahat ulaşılır: tahta üstte, rakam tuş takımı altta.
- Büyük dokunma alanları, net kontrast.

---

## 4. Akıllı İpucu & Öğretici Motor (Solver / Hint Engine)

Oyunun "ileri derece" kalbi. Bir çözücü motoru, gerçek **insan tekniklerini** mantık sırasına göre dener:

| Seviye | Teknik (TR) | Teknik (EN) |
|---|---|---|
| Temel | Tek aday | Naked Single |
| Temel | Gizli tek | Hidden Single |
| Orta | İkili/Üçlü (açık/gizli) | Naked/Hidden Pairs & Triples |
| Orta | Kilitli adaylar | Pointing / Box-Line Reduction |
| İleri | X-Kanat | X-Wing |
| İleri | Kılıç balığı | Swordfish |
| İleri | Zincirler (opsiyonel, sonraki sürüm) | XY-Wing / Chains |

İpucu istendiğinde motor:
1. Mevcut tahtada uygulanabilir **en kolay** tekniği bulur.
2. İlgili hücreleri vurgular.
3. **Hangi tekniği** kullandığını sade Türkçe ile açıklar (öğretici).
4. İstenirse hamleyi otomatik uygular.

> Not: Bu motor aynı zamanda **bulmaca üreticisinin zorluk derecelendirmesi** için de kullanılır (tek motor, çift görev).

---

## 5. Bağlılık Sistemi (Retention)

### 5.1 Günlük Bulmaca
- Her gün, herkese **aynı** günlük bulmaca (tarihten türetilen sabit tohum/seed ile üretilir → sunucu gerekmez, ama herkeste aynı bulmaca çıkar).
- **Seri (streak)** takibi: kaç gün üst üste günlük bulmacayı bitirdin.

### 5.2 Detaylı İstatistikler
- Toplam çözülen bulmaca (tür ve zorluk bazında)
- En hızlı süre, ortalama süre
- Başarı oranı (başlanan vs. bitirilen)
- İpucusuz bitirme sayısı, en uzun seri

### 5.3 Başarımlar / Rozetler (Achievements)
Örnekler: "İlk İfrit", "İpucusuz Usta", "7 Günlük Seri", "100 Bulmaca", "Killer Ustası". Game Center başarımlarıyla eşlenir.

### 5.4 Sıralama Tablosu (Leaderboard)
- Apple **Game Center** üzerinden (kendi sunucumuz yok → bakım/masraf yok, güvenli, gizli).
- Günlük bulmaca süresi sıralaması + toplam puan sıralaması.

### 5.5 Kaydet & Devam
- Yarım kalan bulmaca otomatik kaydedilir, kaldığın yerden devam.
- Birden fazla bulmaca aynı anda açık kalabilir (her tür/zorluk için ayrı slot).

---

## 6. Görünüm (Görsel Tasarım)

- **Minimalist & modern:** Bol boşluk, ince çizgiler, sade tipografi, sakin renk vurguları.
- **Açık + Koyu tema:** Sistem ayarından otomatik; ayrıca elle de seçilebilir.
- Yumuşak, abartısız animasyonlar (rakam yerleşme, bulmaca bitirme kutlaması).
- Erişilebilirlik: yüksek kontrast seçeneği, Dynamic Type (yazı boyutu) desteği, renk körlüğü dostu vurgu paleti.

---

## 7. Teknik Temel

| Konu | Karar | Neden |
|---|---|---|
| Dil & Arayüz | **Swift + SwiftUI** | Apple'ın modern standardı; açık/koyu tema, animasyon, erişilebilirlik yerleşik |
| Mimari | MVVM + saf Swift "çekirdek" (engine) katmanı | Bulmaca üretici & çözücü, arayüzden bağımsız ve **test edilebilir** olsun |
| Veri saklama | **SwiftData** (yerel, cihazda) | İstatistik, kayıtlı oyunlar, ayarlar; internetsiz, gizli |
| Sıralama & başarım | **GameKit / Game Center** | Sunucusuz, güvenli, ücretsiz |
| Minimum iOS | iOS 17+ | SwiftData ve modern SwiftUI için |
| Test | Birim testler (engine için kritik) | Üretici "tek çözüm" garantisi ve çözücü doğruluğu test edilmeli |

### 7.1 Katmanlar (Modüler Yapı)
1. **SudokuEngine** (saf Swift, arayüzsüz): tahta modeli, üretici, çözücü/ipucu motoru, varyasyon kuralları. → Tamamen birim test edilir.
2. **Veri Katmanı** (SwiftData): kayıtlı oyunlar, istatistik, ayarlar.
3. **Servisler:** Game Center entegrasyonu, günlük bulmaca tohum üreteci.
4. **Arayüz (SwiftUI):** Ana menü, oyun ekranı, istatistik, ayarlar, başarımlar.

---

## 8. Ekranlar (Uygulama Haritası)

1. **Ana Menü:** Devam Et / Yeni Oyun (tür + zorluk seç) / Günlük Bulmaca / İstatistikler / Sıralama / Ayarlar
2. **Oyun Ekranı:** tahta + tuş takımı + araç çubuğu (geri al, not modu, ipucu, sil) + süre + duraklat
3. **Bulmaca Bitti:** süre, kullanılan ipucu, seri/rozet kutlaması, paylaş
4. **İstatistikler:** grafikler + özet kartlar
5. **Başarımlar:** rozet vitrini
6. **Ayarlar:** tema, hata gösterme, otomatik not, giriş yöntemi, erişilebilirlik, ses/titreşim

---

## 9. Kapsam Notu (Decomposition)

Kullanıcı "tek büyük plan / hepsi birden" tercih etti — **tasarım** eksiksizdir. Ancak **yapım (implementation)**, çalışan ara sürümler verecek şekilde modüllere bölünerek ilerleyecektir (önce SudokuEngine + klasik oynanış, sonra varyasyonlar, sonra bağlılık sistemi, en son Game Center & App Store hazırlığı). Bu, teknik bir inşa stratejisidir; özellik kapsamından ödün vermez.

---

## 10. Açık Riskler / Kullanıcı Katılımı Gereken Noktalar

- **Xcode** gerekir (derleme/çalıştırma macOS'ta Xcode ister).
- **Apple Developer Program** üyeliği (99$/yıl) — App Store'a yüklemek için zorunlu, sadece kullanıcı açabilir.
- Gerçek cihazda test ve son "Yayınla" adımı kullanıcının onay/etkileşimini gerektirir.
- Game Center özellikleri App Store Connect'te yapılandırma gerektirir.

Bu noktalara gelindiğinde kullanıcı adım adım yönlendirilecektir.
