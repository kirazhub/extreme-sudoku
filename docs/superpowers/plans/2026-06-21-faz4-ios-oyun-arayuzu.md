# Sudoku iOS — Faz 4: Oynanabilir Klasik Oyun Arayüzü Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faz 1'deki SudokuEngine'i kullanan, iPhone simülatöründe gerçekten derlenip oynanabilen, minimalist tasarımlı klasik 9x9 Sudoku uygulaması.

**Architecture:** XcodeGen ile üretilen bir iOS App hedefi (`SudokuApp`), Faz 1'deki `SudokuEngine`'i local Swift package olarak tüketir. MVVM: `GameViewModel` (test edilebilir oyun mantığı) + SwiftUI View'lar. Tasarım sistemi (renk/tipografi/tema) merkezi.

**Tech Stack:** Swift 6.3, SwiftUI, XcodeGen, XCTest, iOS 17+, iPhone 17 simülatörü.

**Önemli doğrulama komutu (her View task'ından sonra derleme kanıtı):**
```bash
cd /Users/kiraz/Downloads/sudodu && xcodegen generate --spec project.yml && \
xcodebuild -project SudokuApp.xcodeproj -scheme SudokuApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' build 2>&1 | tail -3
```

---

## Tasarım Sistemi (Kararlar — Tüm View'lar buna uyar)

**Estetik yön:** Rafine minimalizm — "kağıt & mürekkep" sakinliği, tek sıcak aksan.

**Renkler (Asset Catalog'da, açık/koyu varyantlı):**
| İsim | Açık tema | Koyu tema | Kullanım |
|---|---|---|---|
| `BoardBackground` | `#F6F2E9` (krem) | `#15171A` (antrasit) | tahta zemini |
| `InkPrimary` | `#1F2024` | `#ECE7DB` | verilen rakamlar, metin |
| `InkUser` | `#2E6F8E` (mavi-mürekkep) | `#7FB6D4` | oyuncunun girdiği rakamlar |
| `Accent` | `#C8602E` (yanık turuncu) | `#E0884F` | seçim, vurgu, butonlar |
| `GridLine` | `#D8D0BE` | `#2A2D33` | ince ızgara çizgileri |
| `GridLineBold` | `#A89B7E` | `#454A53` | 3x3 kalın ayraçlar |
| `CellHighlight` | `#ECE3CE` | `#1E2228` | aynı satır/sütun/kutu vurgusu |
| `CellSelected` | `#F0D9BE` | `#3A2E22` | seçili hücre |
| `ErrorRed` | `#C0392B` | `#E06A5C` | hatalı rakam |

**Tipografi:**
- Marka/başlık: **Fraunces** (karakterli serif, .ttf bundle'a eklenir).
- Rakamlar & arayüz: SF Pro Rounded (iOS native) — rakamlarda okunabilirlik kritik; tabular figür için `.monospacedDigit()`.

---

## Dosya Yapısı (Faz 4)

```
project.yml                              # XcodeGen tanımı
SudokuApp/
├── App/
│   └── SudokuAppApp.swift               # @main giriş + tema
├── Design/
│   ├── Theme.swift                      # renk/font erişimi (Color uzantıları)
│   └── Fonts/Fraunces.ttf               # bundle font
├── Resources/
│   └── Assets.xcassets/                 # renkler (yukarıdaki tablo) + AppIcon
├── Model/
│   └── GameViewModel.swift              # oyun mantığı (test edilen kalp)
├── Views/
│   ├── MenuView.swift                   # ana menü
│   ├── GameView.swift                   # oyun ekranı (tahta+pad+araçlar)
│   ├── BoardView.swift                  # 9x9 ızgara
│   ├── CellView.swift                   # tek hücre
│   ├── NumberPadView.swift              # rakam tuş takımı
│   └── ToolbarView.swift                # geri al / not / ipucu / sil
└── Info.plist
SudokuAppTests/
└── GameViewModelTests.swift
```

---

## Task 1: XcodeGen projesi + SudokuEngine bağlama (derlenen boş app)

**Files:**
- Create: `project.yml`
- Create: `SudokuApp/App/SudokuAppApp.swift`
- Create: `SudokuApp/Resources/Assets.xcassets/Contents.json`
- Create: `SudokuApp/Info.plist`

- [ ] **Step 1: project.yml oluştur**

```yaml
name: SudokuApp
options:
  bundleIdPrefix: com.kirazhub.sudoku
  deploymentTarget:
    iOS: "17.0"
packages:
  SudokuEngine:
    path: SudokuEngine
targets:
  SudokuApp:
    type: application
    platform: iOS
    sources:
      - SudokuApp
    info:
      path: SudokuApp/Info.plist
      properties:
        UILaunchScreen: {}
        CFBundleDisplayName: Sudoku
        UISupportedInterfaceOrientations:
          - UIInterfaceOrientationPortrait
    dependencies:
      - package: SudokuEngine
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.kirazhub.sudoku
        GENERATE_INFOPLIST_FILE: NO
        SWIFT_VERSION: "6.0"
  SudokuAppTests:
    type: bundle.unit-test
    platform: iOS
    sources:
      - SudokuAppTests
    dependencies:
      - target: SudokuApp
      - package: SudokuEngine
```

- [ ] **Step 2: Info.plist oluştur**

`SudokuApp/Info.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>UIAppFonts</key>
    <array>
        <string>Fraunces.ttf</string>
    </array>
</dict>
</plist>
```

- [ ] **Step 3: Minimal @main app**

`SudokuApp/App/SudokuAppApp.swift`:
```swift
import SwiftUI

@main
struct SudokuAppApp: App {
    var body: some Scene {
        WindowGroup {
            Text("Sudoku")
                .font(.largeTitle)
        }
    }
}
```

- [ ] **Step 4: Boş asset catalog**

`SudokuApp/Resources/Assets.xcassets/Contents.json`:
```json
{ "info": { "author": "xcode", "version": 1 } }
```

- [ ] **Step 5: Projeyi üret ve derle**

Run:
```bash
cd /Users/kiraz/Downloads/sudodu && xcodegen generate --spec project.yml && \
xcodebuild -project SudokuApp.xcodeproj -scheme SudokuApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' build 2>&1 | tail -3
```
Expected: `** BUILD SUCCEEDED **`

- [ ] **Step 6: Commit**

```bash
cd /Users/kiraz/Downloads/sudodu && git add -A && git commit -m "feat(app): XcodeGen projesi + SudokuEngine bagli bos app derleniyor"
```

---

## Task 2: Tasarım sistemi — renkler (Asset Catalog) + Theme

**Files:**
- Create: `SudokuApp/Resources/Assets.xcassets/Colors/` altında her renk için `.colorset`
- Create: `SudokuApp/Design/Theme.swift`
- Modify: `SudokuApp/App/SudokuAppApp.swift`

- [ ] **Step 1: Renk asset'leri oluştur**

Tasarım Sistemi tablosundaki 9 renk için `Assets.xcassets/Colors/<İsim>.colorset/Contents.json` oluştur. Her biri açık + koyu (`luminosity` appearance) varyant içerir. Örnek `Accent.colorset/Contents.json`:
```json
{
  "colors": [
    { "idiom": "universal", "color": { "color-space": "srgb",
      "components": { "red": "0.784", "green": "0.376", "blue": "0.180", "alpha": "1.000" } } },
    { "idiom": "universal", "appearances": [ { "appearance": "luminosity", "value": "dark" } ],
      "color": { "color-space": "srgb",
      "components": { "red": "0.878", "green": "0.533", "blue": "0.310", "alpha": "1.000" } } }
  ],
  "info": { "author": "xcode", "version": 1 }
}
```
Diğer 8 renk için aynı yapı; RGB değerleri Tasarım Sistemi tablosundaki hex'lerden 0-1 ondalığa çevrilir (hex/255). İsimler: BoardBackground, InkPrimary, InkUser, Accent, GridLine, GridLineBold, CellHighlight, CellSelected, ErrorRed.

- [ ] **Step 2: Theme.swift — renk & font erişimi**

```swift
import SwiftUI

/// Uygulamanın tasarım sistemi: renkler + fontlar tek yerden.
enum Theme {
    enum Palette {
        static let boardBackground = Color("BoardBackground")
        static let inkPrimary = Color("InkPrimary")
        static let inkUser = Color("InkUser")
        static let accent = Color("Accent")
        static let gridLine = Color("GridLine")
        static let gridLineBold = Color("GridLineBold")
        static let cellHighlight = Color("CellHighlight")
        static let cellSelected = Color("CellSelected")
        static let errorRed = Color("ErrorRed")
    }

    /// Marka başlık fontu (Fraunces); bundle'da yoksa zarifçe serif'e düşer.
    static func brand(_ size: CGFloat) -> Font {
        Font.custom("Fraunces", size: size)
    }

    /// Rakam fontu: yuvarlatılmış, tabular.
    static func numeral(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .rounded).monospacedDigit()
    }
}
```

- [ ] **Step 3: App'i renkli doğrula**

`SudokuAppApp.swift` body:
```swift
WindowGroup {
    ZStack {
        Theme.Palette.boardBackground.ignoresSafeArea()
        Text("Sudoku")
            .font(Theme.brand(48))
            .foregroundStyle(Theme.Palette.inkPrimary)
    }
}
```

- [ ] **Step 4: Derle**

Run: derleme komutu (başlıktaki).
Expected: `** BUILD SUCCEEDED **`

- [ ] **Step 5: Commit**

```bash
cd /Users/kiraz/Downloads/sudodu && git add -A && git commit -m "feat(app): tasarim sistemi renkleri + Theme (acik/koyu tema)"
```

> Not: Fraunces.ttf Task 8'de eklenir; `Font.custom` font yoksa otomatik sistem serif'e düşer, derleme etkilenmez.

---

## Task 3: GameViewModel — oyun mantığı (TDD, test edilen kalp)

**Files:**
- Create: `SudokuApp/Model/GameViewModel.swift`
- Test: `SudokuAppTests/GameViewModelTests.swift`

- [ ] **Step 1: Failing test yaz**

`GameViewModelTests.swift`:
```swift
import XCTest
import SudokuEngine
@testable import SudokuApp

@MainActor
final class GameViewModelTests: XCTestCase {
    private func makeVM() -> GameViewModel {
        let puzzle = SudokuGame.newPuzzle(difficulty: .easy, seed: 2026)
        return GameViewModel(puzzle: puzzle)
    }

    func testGivenCellsAreLocked() {
        let vm = makeVM()
        let given = Coordinate.all.first { vm.puzzle.givens[$0] != nil }!
        XCTAssertTrue(vm.isGiven(given))
        vm.select(given)
        vm.input(5) // verilen hücre değişmemeli
        XCTAssertEqual(vm.value(at: given), vm.puzzle.givens[given])
    }

    func testInputIntoEmptyCell() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        vm.select(empty)
        vm.input(7)
        XCTAssertEqual(vm.value(at: empty), 7)
    }

    func testUndoRedo() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        vm.select(empty); vm.input(7)
        vm.undo()
        XCTAssertNil(vm.value(at: empty))
        vm.redo()
        XCTAssertEqual(vm.value(at: empty), 7)
    }

    func testNoteToggle() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        vm.select(empty)
        vm.isNoteMode = true
        vm.input(3); vm.input(5)
        XCTAssertEqual(vm.notes(at: empty), [3, 5])
        vm.input(3) // tekrar → kaldır
        XCTAssertEqual(vm.notes(at: empty), [5])
    }

    func testErase() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        vm.select(empty); vm.input(7)
        vm.erase()
        XCTAssertNil(vm.value(at: empty))
    }

    func testMistakeDetection() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        let wrong = vm.puzzle.solution[empty] == 1 ? 2 : 1
        vm.select(empty); vm.input(wrong)
        XCTAssertTrue(vm.isMistake(empty))
    }

    func testHintFillsACell() {
        let vm = makeVM()
        let before = vm.filledCount
        XCTAssertTrue(vm.applyHint())
        XCTAssertEqual(vm.filledCount, before + 1)
    }

    func testIsSolvedWhenMatchesSolution() {
        let vm = makeVM()
        for coord in Coordinate.all where vm.puzzle.givens[coord] == nil {
            vm.select(coord)
            vm.input(vm.puzzle.solution[coord]!)
        }
        XCTAssertTrue(vm.isSolved)
    }
}
```

- [ ] **Step 2: Testi çalıştır (fail görmeli)**

Run:
```bash
cd /Users/kiraz/Downloads/sudodu && xcodebuild -project SudokuApp.xcodeproj -scheme SudokuApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' test 2>&1 | tail -8
```
Expected: FAIL (GameViewModel bulunamadı / derlenmiyor)

- [ ] **Step 3: GameViewModel implementasyonu**

```swift
import SwiftUI
import SudokuEngine

@MainActor
final class GameViewModel: ObservableObject {
    let puzzle: Puzzle

    @Published private(set) var board: Board
    @Published private(set) var notesMap: [Coordinate: Set<Int>] = [:]
    @Published var selected: Coordinate?
    @Published var isNoteMode = false
    @Published var highlightMistakes = true
    @Published private(set) var elapsedSeconds = 0
    @Published private(set) var hintsUsed = 0

    private struct Move { let coord: Coordinate; let oldValue: Int?; let newNotes: Set<Int>?; let oldNotes: Set<Int> }
    private var undoStack: [Move] = []
    private var redoStack: [Move] = []
    private var timer: Timer?

    init(puzzle: Puzzle) {
        self.puzzle = puzzle
        self.board = puzzle.givens
    }

    func isGiven(_ c: Coordinate) -> Bool { puzzle.givens[c] != nil }
    func value(at c: Coordinate) -> Int? { board[c] }
    func notes(at c: Coordinate) -> Set<Int> { notesMap[c] ?? [] }
    var filledCount: Int { board.filledCount }
    var isSolved: Bool { board.stringValue == puzzle.solution.stringValue }

    func isMistake(_ c: Coordinate) -> Bool {
        guard highlightMistakes, let v = board[c], !isGiven(c) else { return false }
        return v != puzzle.solution[c]
    }

    func select(_ c: Coordinate) { selected = c }

    func input(_ value: Int) {
        guard let c = selected, !isGiven(c) else { return }
        if isNoteMode {
            guard board[c] == nil else { return }
            let old = notesMap[c] ?? []
            var new = old
            if new.contains(value) { new.remove(value) } else { new.insert(value) }
            pushMove(Move(coord: c, oldValue: board[c], newNotes: new, oldNotes: old))
            notesMap[c] = new
        } else {
            let old = notesMap[c] ?? []
            pushMove(Move(coord: c, oldValue: board[c], newNotes: nil, oldNotes: old))
            board[c] = value
            notesMap[c] = []
        }
    }

    func erase() {
        guard let c = selected, !isGiven(c) else { return }
        let old = notesMap[c] ?? []
        pushMove(Move(coord: c, oldValue: board[c], newNotes: [], oldNotes: old))
        board[c] = nil
        notesMap[c] = []
    }

    @discardableResult
    func applyHint() -> Bool {
        guard let hint = SudokuGame.hint(for: board) else { return false }
        let old = notesMap[hint.coordinate] ?? []
        pushMove(Move(coord: hint.coordinate, oldValue: board[hint.coordinate], newNotes: nil, oldNotes: old))
        board[hint.coordinate] = hint.value
        notesMap[hint.coordinate] = []
        selected = hint.coordinate
        hintsUsed += 1
        return true
    }

    /// Mevcut tahta için ipucu açıklaması (gösterim amaçlı).
    func currentHint() -> Hint? { SudokuGame.hint(for: board) }

    func undo() {
        guard let move = undoStack.popLast() else { return }
        redoStack.append(Move(coord: move.coord, oldValue: board[move.coord], newNotes: notesMap[move.coord], oldNotes: move.oldNotes))
        board[move.coord] = move.oldValue
        if let n = move.newNotes { notesMap[move.coord] = move.oldNotes; _ = n } else { notesMap[move.coord] = move.oldNotes }
    }

    func redo() {
        guard let move = redoStack.popLast() else { return }
        undoStack.append(Move(coord: move.coord, oldValue: board[move.coord], newNotes: nil, oldNotes: notesMap[move.coord] ?? []))
        board[move.coord] = move.oldValue
        if let n = move.newNotes { notesMap[move.coord] = n }
    }

    private func pushMove(_ m: Move) { undoStack.append(m); redoStack.removeAll() }

    func startTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.elapsedSeconds += 1 }
        }
    }
    func stopTimer() { timer?.invalidate(); timer = nil }
}
```

> Not: undo/redo'nun not (pencil mark) durumunu doğru geri almasını sağla; yukarıdaki `Move` hem değeri hem notları saklar. Testler `testUndoRedo` ve `testNoteToggle` ile bunu doğrular. Eğer redo not senaryosunda test kırılırsa, `redo()` içinde değer/not ayrımını teste göre düzelt (testler nihai ölçüttür).

- [ ] **Step 4: Testi çalıştır (pass görmeli)**

Run: test komutu (Step 2).
Expected: PASS (8 GameViewModel testi)

- [ ] **Step 5: Commit**

```bash
cd /Users/kiraz/Downloads/sudodu && git add -A && git commit -m "feat(app): GameViewModel (giris, not, undo/redo, hata, ipucu) + testler"
```

---

## Task 4: CellView — tek hücre

**Files:**
- Create: `SudokuApp/Views/CellView.swift`

- [ ] **Step 1: CellView implementasyonu**

```swift
import SwiftUI
import SudokuEngine

struct CellView: View {
    let value: Int?
    let notes: Set<Int>
    let isGiven: Bool
    let isSelected: Bool
    let isHighlighted: Bool
    let isSameValue: Bool
    let isMistake: Bool

    var body: some View {
        ZStack {
            background
            if let value {
                Text("\(value)")
                    .font(Theme.numeral(26, weight: isGiven ? .semibold : .regular))
                    .foregroundStyle(textColor)
            } else if !notes.isEmpty {
                notesGrid
            }
        }
        .aspectRatio(1, contentMode: .fit)
        .contentShape(Rectangle())
    }

    private var background: Color {
        if isSelected { return Theme.Palette.cellSelected }
        if isSameValue { return Theme.Palette.cellHighlight }
        if isHighlighted { return Theme.Palette.cellHighlight.opacity(0.5) }
        return .clear
    }

    private var textColor: Color {
        if isMistake { return Theme.Palette.errorRed }
        return isGiven ? Theme.Palette.inkPrimary : Theme.Palette.inkUser
    }

    private var notesGrid: some View {
        GeometryReader { geo in
            let cell = geo.size.width / 3
            ForEach(1...9, id: \.self) { n in
                if notes.contains(n) {
                    Text("\(n)")
                        .font(Theme.numeral(9))
                        .foregroundStyle(Theme.Palette.inkPrimary.opacity(0.55))
                        .frame(width: cell, height: cell)
                        .position(x: cell * (CGFloat((n - 1) % 3) + 0.5),
                                  y: cell * (CGFloat((n - 1) / 3) + 0.5))
                }
            }
        }
    }
}
```

- [ ] **Step 2: Derle**

Run: derleme komutu.
Expected: `** BUILD SUCCEEDED **`

- [ ] **Step 3: Commit**

```bash
cd /Users/kiraz/Downloads/sudodu && git add -A && git commit -m "feat(app): CellView (deger, notlar, secim/vurgu/hata renkleri)"
```

---

## Task 5: BoardView — 9x9 ızgara + kalın ayraçlar

**Files:**
- Create: `SudokuApp/Views/BoardView.swift`

- [ ] **Step 1: BoardView implementasyonu**

```swift
import SwiftUI
import SudokuEngine

struct BoardView: View {
    @ObservedObject var vm: GameViewModel

    var body: some View {
        GeometryReader { geo in
            let side = min(geo.size.width, geo.size.height)
            let cell = side / 9
            ZStack {
                // Hücreler
                ForEach(0..<9, id: \.self) { r in
                    ForEach(0..<9, id: \.self) { c in
                        let coord = Coordinate(row: r, col: c)
                        CellView(
                            value: vm.value(at: coord),
                            notes: vm.notes(at: coord),
                            isGiven: vm.isGiven(coord),
                            isSelected: vm.selected == coord,
                            isHighlighted: isPeerHighlighted(coord),
                            isSameValue: isSameValue(coord),
                            isMistake: vm.isMistake(coord)
                        )
                        .frame(width: cell, height: cell)
                        .position(x: cell * (CGFloat(c) + 0.5), y: cell * (CGFloat(r) + 0.5))
                        .onTapGesture { vm.select(coord) }
                    }
                }
                gridLines(cell: cell, side: side)
            }
            .frame(width: side, height: side)
            .background(Theme.Palette.boardBackground)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    private func isPeerHighlighted(_ c: Coordinate) -> Bool {
        guard let sel = vm.selected, sel != c else { return false }
        return sel.row == c.row || sel.col == c.col || sel.boxIndex == c.boxIndex
    }

    private func isSameValue(_ c: Coordinate) -> Bool {
        guard let sel = vm.selected, let v = vm.value(at: sel), let cv = vm.value(at: c), sel != c else { return false }
        return v == cv
    }

    private func gridLines(cell: CGFloat, side: CGFloat) -> some View {
        Path { path in
            for i in 0...9 {
                let p = cell * CGFloat(i)
                path.move(to: CGPoint(x: p, y: 0)); path.addLine(to: CGPoint(x: p, y: side))
                path.move(to: CGPoint(x: 0, y: p)); path.addLine(to: CGPoint(x: side, y: p))
            }
        }
        .stroke(Theme.Palette.gridLine, lineWidth: 1)
        .overlay(
            Path { path in
                for i in stride(from: 0, through: 9, by: 3) {
                    let p = cell * CGFloat(i)
                    path.move(to: CGPoint(x: p, y: 0)); path.addLine(to: CGPoint(x: p, y: side))
                    path.move(to: CGPoint(x: 0, y: p)); path.addLine(to: CGPoint(x: side, y: p))
                }
            }
            .stroke(Theme.Palette.gridLineBold, lineWidth: 2.5)
        )
        .allowsHitTesting(false)
    }
}
```

- [ ] **Step 2: Derle**

Run: derleme komutu.
Expected: `** BUILD SUCCEEDED **`

- [ ] **Step 3: Commit**

```bash
cd /Users/kiraz/Downloads/sudodu && git add -A && git commit -m "feat(app): BoardView (9x9 izgara, kalin ayraclar, dokunma secimi)"
```

---

## Task 6: NumberPadView + ToolbarView

**Files:**
- Create: `SudokuApp/Views/NumberPadView.swift`
- Create: `SudokuApp/Views/ToolbarView.swift`

- [ ] **Step 1: NumberPadView**

```swift
import SwiftUI

struct NumberPadView: View {
    let onTap: (Int) -> Void
    var body: some View {
        HStack(spacing: 8) {
            ForEach(1...9, id: \.self) { n in
                Button { onTap(n) } label: {
                    Text("\(n)")
                        .font(Theme.numeral(28, weight: .medium))
                        .foregroundStyle(Theme.Palette.inkPrimary)
                        .frame(maxWidth: .infinity, minHeight: 52)
                        .background(Theme.Palette.cellHighlight.opacity(0.6))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
        }
    }
}
```

- [ ] **Step 2: ToolbarView**

```swift
import SwiftUI

struct ToolbarView: View {
    @ObservedObject var vm: GameViewModel
    var onHint: () -> Void

    var body: some View {
        HStack(spacing: 28) {
            toolButton("arrow.uturn.backward", "Geri Al") { vm.undo() }
            toolButton("eraser", "Sil") { vm.erase() }
            toolButton(vm.isNoteMode ? "pencil.circle.fill" : "pencil.circle", "Not",
                       active: vm.isNoteMode) { vm.isNoteMode.toggle() }
            toolButton("lightbulb", "İpucu", action: onHint)
        }
    }

    private func toolButton(_ icon: String, _ label: String, active: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon).font(.system(size: 22))
                Text(label).font(.system(size: 11, design: .rounded))
            }
            .foregroundStyle(active ? Theme.Palette.accent : Theme.Palette.inkPrimary)
            .frame(maxWidth: .infinity)
        }
    }
}
```

- [ ] **Step 3: Derle + Commit**

Run: derleme komutu. Expected: `** BUILD SUCCEEDED **`
```bash
cd /Users/kiraz/Downloads/sudodu && git add -A && git commit -m "feat(app): NumberPad + Toolbar (geri al/sil/not/ipucu)"
```

---

## Task 7: GameView — ekranı birleştir + süre + ipucu açıklaması + kazanma

**Files:**
- Create: `SudokuApp/Views/GameView.swift`

- [ ] **Step 1: GameView implementasyonu**

```swift
import SwiftUI
import SudokuEngine

struct GameView: View {
    @StateObject var vm: GameViewModel
    @State private var hintText: String?
    @State private var showWin = false

    var body: some View {
        VStack(spacing: 16) {
            header
            BoardView(vm: vm)
                .padding(.horizontal, 8)
            if let hintText {
                Text(hintText)
                    .font(.system(size: 13, design: .rounded))
                    .foregroundStyle(Theme.Palette.accent)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .transition(.opacity)
            }
            ToolbarView(vm: vm, onHint: requestHint)
                .padding(.horizontal)
            NumberPadView { vm.input($0) }
                .padding(.horizontal)
            Spacer(minLength: 8)
        }
        .background(Theme.Palette.boardBackground.ignoresSafeArea())
        .onAppear { vm.startTimer() }
        .onDisappear { vm.stopTimer() }
        .onChange(of: vm.isSolved) { _, solved in
            if solved { vm.stopTimer(); showWin = true }
        }
        .overlay { if showWin { winOverlay } }
    }

    private var header: some View {
        HStack {
            Text(vm.puzzle.difficulty.displayName)
                .font(Theme.brand(22))
                .foregroundStyle(Theme.Palette.inkPrimary)
            Spacer()
            Text(timeString)
                .font(Theme.numeral(18, weight: .medium))
                .foregroundStyle(Theme.Palette.inkPrimary.opacity(0.7))
        }
        .padding(.horizontal)
    }

    private var timeString: String {
        String(format: "%02d:%02d", vm.elapsedSeconds / 60, vm.elapsedSeconds % 60)
    }

    private func requestHint() {
        guard let hint = vm.currentHint() else {
            withAnimation { hintText = "Şu an mantıksal bir ipucu bulunamadı." }
            return
        }
        withAnimation {
            hintText = "\(hint.technique.rawValue): \(hint.explanation)"
        }
        vm.applyHint()
    }

    private var winOverlay: some View {
        ZStack {
            Color.black.opacity(0.4).ignoresSafeArea()
            VStack(spacing: 12) {
                Text("Tebrikler!").font(Theme.brand(34)).foregroundStyle(Theme.Palette.inkPrimary)
                Text("Süre: \(timeString) · İpucu: \(vm.hintsUsed)")
                    .font(.system(size: 15, design: .rounded))
                    .foregroundStyle(Theme.Palette.inkPrimary.opacity(0.7))
            }
            .padding(32)
            .background(Theme.Palette.boardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .shadow(radius: 20)
        }
    }
}
```

- [ ] **Step 2: Derle + Commit**

Run: derleme komutu. Expected: `** BUILD SUCCEEDED **`
```bash
cd /Users/kiraz/Downloads/sudodu && git add -A && git commit -m "feat(app): GameView (sure, ipucu aciklamasi, kazanma ekrani)"
```

---

## Task 8: MenuView + uygulama akışı + Fraunces fontu

**Files:**
- Create: `SudokuApp/Views/MenuView.swift`
- Create: `SudokuApp/Design/Fonts/Fraunces.ttf` (indir)
- Modify: `SudokuApp/App/SudokuAppApp.swift`
- Modify: `project.yml` (Fonts klasörünü kaynaklara dahil et — zaten `SudokuApp` altında olduğundan otomatik)

- [ ] **Step 1: Fraunces fontunu indir**

Run:
```bash
cd /Users/kiraz/Downloads/sudodu && mkdir -p SudokuApp/Design/Fonts && \
curl -sL "https://github.com/google/fonts/raw/main/ofl/fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf" \
  -o SudokuApp/Design/Fonts/Fraunces.ttf && ls -la SudokuApp/Design/Fonts/Fraunces.ttf
```
Expected: dosya indi (>100KB). İndirmezse: alternatif olarak `Instrument Serif` veya statik bir Fraunces sürümü dene; olmazsa fontu atla (Theme.brand sistem serif'e düşer) ve bunu rapor et.

- [ ] **Step 2: MenuView**

```swift
import SwiftUI
import SudokuEngine

struct MenuView: View {
    @State private var activeGame: GameViewModel?

    var body: some View {
        ZStack {
            Theme.Palette.boardBackground.ignoresSafeArea()
            VStack(spacing: 32) {
                Spacer()
                VStack(spacing: 4) {
                    Text("SUDOKU").font(Theme.brand(52)).foregroundStyle(Theme.Palette.inkPrimary)
                    Text("zihnini bilet").font(.system(size: 14, design: .rounded))
                        .foregroundStyle(Theme.Palette.accent)
                }
                VStack(spacing: 12) {
                    ForEach(Difficulty.allCases, id: \.self) { diff in
                        Button {
                            let seed = UInt64(Date().timeIntervalSince1970)
                            activeGame = GameViewModel(puzzle: SudokuGame.newPuzzle(difficulty: diff, seed: seed))
                        } label: {
                            HStack {
                                Text(diff.displayName)
                                Spacer()
                                Image(systemName: "chevron.right").font(.system(size: 13))
                            }
                            .font(Theme.numeral(18, weight: .medium))
                            .foregroundStyle(Theme.Palette.inkPrimary)
                            .padding(.horizontal, 20).padding(.vertical, 14)
                            .background(Theme.Palette.cellHighlight.opacity(0.5))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
                .padding(.horizontal, 32)
                Spacer()
            }
        }
        .fullScreenCover(item: $activeGame) { vm in
            NavigationStack {
                GameView(vm: vm)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            Button("Menü") { activeGame = nil }
                                .foregroundStyle(Theme.Palette.accent)
                        }
                    }
            }
        }
    }
}
```

> `GameViewModel`'in `Identifiable` olması gerekir (fullScreenCover item için). Step 3'te ekle.

- [ ] **Step 3: GameViewModel'e Identifiable ekle**

`GameViewModel.swift` sınıf tanımını güncelle:
```swift
final class GameViewModel: ObservableObject, Identifiable {
    let id = UUID()
```

- [ ] **Step 4: App girişini MenuView yap**

`SudokuAppApp.swift`:
```swift
import SwiftUI

@main
struct SudokuAppApp: App {
    var body: some Scene {
        WindowGroup { MenuView() }
    }
}
```

- [ ] **Step 5: Üret, derle, testleri çalıştır**

Run:
```bash
cd /Users/kiraz/Downloads/sudodu && xcodegen generate --spec project.yml && \
xcodebuild -project SudokuApp.xcodeproj -scheme SudokuApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' test 2>&1 | tail -6
```
Expected: `** TEST SUCCEEDED **` (GameViewModel testleri geçer, app derlenir)

- [ ] **Step 6: Commit**

```bash
cd /Users/kiraz/Downloads/sudodu && git add -A && git commit -m "feat(app): MenuView + uygulama akisi + Fraunces font"
```

---

## Task 9: Simülatörde çalıştırma kanıtı (ekran görüntüsü)

**Files:** (yok — doğrulama görevi)

- [ ] **Step 1: Simülatörü başlat ve uygulamayı kur+çalıştır**

Run:
```bash
cd /Users/kiraz/Downloads/sudodu && \
xcrun simctl boot "iPhone 17" 2>/dev/null; \
xcodebuild -project SudokuApp.xcodeproj -scheme SudokuApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -derivedDataPath ./DerivedData build 2>&1 | tail -2 && \
APP=$(find ./DerivedData -name "SudokuApp.app" -type d | head -1) && \
xcrun simctl install "iPhone 17" "$APP" && \
xcrun simctl launch "iPhone 17" com.kirazhub.sudoku
```
Expected: uygulama simülatörde açılır (launch çıktısı PID döndürür).

- [ ] **Step 2: Ekran görüntüsü al (menü)**

Run:
```bash
sleep 3 && xcrun simctl io "iPhone 17" screenshot /Users/kiraz/Downloads/sudodu/docs/superpowers/menu.png && echo "menu.png alindi"
```
Expected: `menu.png alindi`

- [ ] **Step 3: Commit**

```bash
cd /Users/kiraz/Downloads/sudodu && git add -A && git commit -m "chore(app): simulatorde calisma kaniti + menu ekran goruntusu"
```

---

## Self-Review Sonucu (Faz 4 ↔ Spec)

- **Spec §3.1 (akıllı giriş + vurgulama):** Task 5 `isPeerHighlighted` + `isSameValue` ✅
- **Spec §3.2 (kalem işaretleri):** Task 3 `isNoteMode`/`notes` + Task 4 notesGrid ✅ (otomatik not Faz 5/6)
- **Spec §3.3 (hata gösterme, aç/kapa):** Task 3 `highlightMistakes` + `isMistake` ✅
- **Spec §3.4 (geri al, sil):** Task 3 undo/redo/erase + Task 6 Toolbar ✅
- **Spec §4 (ipucu, teknik açıklamalı):** Task 7 `requestHint` → `hint.explanation` gösterimi ✅
- **Spec §6 (minimalist, açık/koyu):** Tasarım Sistemi + Asset renkleri (luminosity dark) ✅
- **Spec §7 (SwiftUI, iOS 17+, MVVM):** project.yml + GameViewModel ✅

**Kapsam dışı (sonraki fazlar):** Varyasyonlar (Faz 3 engine + arayüz), kaydet/devam & istatistik (Faz 5), günlük bulmaca/başarım ekranı (Faz 6), Game Center (Faz 7). "Devam Et" butonu Faz 5'te kalıcı kayıt gelince eklenecek.

**Placeholder taraması:** Temiz — tüm View ve ViewModel kodları gerçek ve derlenebilir. Tek dış bağımlılık Fraunces.ttf indirmesi olup, başarısız olursa zarif sistem-serif fallback'i devrede (derleme etkilenmez).
