# Sudoku iOS — Faz 1: SudokuEngine Çekirdeği Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Klasik 9x9 Sudoku için arayüzden tamamen bağımsız, birim testleriyle doğrulanmış bir "oyun beyni" (model + geçerlilik + çözücü + üretici + temel ipucu) inşa etmek.

**Architecture:** Saf Swift bir Swift Package (`SudokuEngine`). Hiç UIKit/SwiftUI bağımlılığı yok → `swift test` ile Xcode'suz çalışır. MVVM'in "M" (Model) katmanı budur; arayüz fazları bu paketi tüketecek.

**Tech Stack:** Swift 6.3, Swift Package Manager (SPM), XCTest.

---

## Genel Yol Haritası (Tüm Fazlar — Bağlam İçin)

| Faz | İçerik | Test edilebilir mi (bu makinede)? |
|---|---|---|
| **1 (BU PLAN)** | SudokuEngine çekirdeği: model, validator, backtracking çözücü, üretici, temel ipucu (Naked/Hidden Single) | ✅ `swift test` |
| 2 | İleri çözücü teknikleri (Pairs/Triples, Pointing, X-Wing, Swordfish) + zorluk derecelendirme | ✅ `swift test` |
| 3 | Varyasyonlar: X-Sudoku (köşegen) + Killer Sudoku (kafes) engine kuralları | ✅ `swift test` |
| 4 | iOS uygulama iskeleti + klasik oyun arayüzü (Xcode projesi, SwiftUI) | ✅ `xcodebuild` |
| 5 | Veri katmanı (SwiftData): kaydet/devam, istatistik, ayarlar | ✅ `xcodebuild` |
| 6 | Bağlılık: günlük bulmaca, istatistik ekranı, başarımlar | ✅ `xcodebuild` |
| 7 | Game Center (sıralama + başarım senkron) | ✅ `xcodebuild` (cihazda doğrulama kullanıcıyla) |
| 8 | Cila: animasyon, erişilebilirlik, açık/koyu tema ince ayar | ✅ `xcodebuild` |
| 9 | App Store hazırlığı (metinler, gizlilik, ekran görüntüleri, yükleme) | 🧑 kullanıcı katılımı |

Her faz kendi `docs/superpowers/plans/...` planına sahip olacak. Bu belge yalnızca **Faz 1**'i detaylandırır.

---

## Dosya Yapısı (Faz 1)

```
SudokuEngine/
├── Package.swift
├── Sources/SudokuEngine/
│   ├── Cell.swift            # Tek bir hücre (değer + adaylar/notlar)
│   ├── Coordinate.swift      # (satır, sütun) + kutu hesapları
│   ├── Board.swift           # 9x9 tahta modeli + erişim/kopya
│   ├── Validator.swift       # Çakışma kontrolü (satır/sütun/kutu)
│   ├── Solver.swift          # Backtracking: çöz + çözüm say (tek mi?)
│   ├── LogicalSolver.swift   # İnsan teknikleri: Naked/Hidden Single
│   ├── Hint.swift            # İpucu modeli (teknik adı + hedef + açıklama)
│   ├── Generator.swift       # Tam tahta üret + boşalt + tek çözüm garanti
│   └── Difficulty.swift      # Zorluk enum (Faz 1: temel kademe)
└── Tests/SudokuEngineTests/
    ├── BoardTests.swift
    ├── ValidatorTests.swift
    ├── SolverTests.swift
    ├── LogicalSolverTests.swift
    └── GeneratorTests.swift
```

**Sorumluluklar:** Her dosya tek bir işe odaklı. `Board` veri tutar, `Validator` kural kontrol eder, `Solver` kaba kuvvetle çözer/sayar, `LogicalSolver` insan gibi adım adım çözer, `Generator` bulmaca üretir. Çözücü ve mantıksal çözücü ayrı tutulur çünkü biri "çözülebilir mi / tek mi" (üretici için), diğeri "bir sonraki insan hamlesi ne" (ipucu için) sorusunu yanıtlar.

---

## Task 1: Swift Package iskeleti

**Files:**
- Create: `SudokuEngine/Package.swift`
- Create: `SudokuEngine/Sources/SudokuEngine/SudokuEngine.swift`
- Create: `SudokuEngine/Tests/SudokuEngineTests/SmokeTests.swift`

- [ ] **Step 1: Package.swift oluştur**

```swift
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "SudokuEngine",
    products: [
        .library(name: "SudokuEngine", targets: ["SudokuEngine"]),
    ],
    targets: [
        .target(name: "SudokuEngine"),
        .testTarget(name: "SudokuEngineTests", dependencies: ["SudokuEngine"]),
    ]
)
```

- [ ] **Step 2: Geçici kaynak dosyası oluştur**

`SudokuEngine/Sources/SudokuEngine/SudokuEngine.swift`:
```swift
/// SudokuEngine: arayüzden bağımsız Sudoku oyun motoru.
public enum SudokuEngineInfo {
    public static let version = "0.1.0"
}
```

- [ ] **Step 3: Smoke testi yaz**

`SudokuEngine/Tests/SudokuEngineTests/SmokeTests.swift`:
```swift
import XCTest
@testable import SudokuEngine

final class SmokeTests: XCTestCase {
    func testVersionExists() {
        XCTAssertEqual(SudokuEngineInfo.version, "0.1.0")
    }
}
```

- [ ] **Step 4: Testi çalıştır**

Run: `cd SudokuEngine && swift test`
Expected: PASS (1 test passed)

- [ ] **Step 5: Commit**

```bash
git add SudokuEngine
git commit -m "feat(engine): Swift Package iskeleti + smoke testi"
```

---

## Task 2: Coordinate (koordinat & kutu hesabı)

**Files:**
- Create: `SudokuEngine/Sources/SudokuEngine/Coordinate.swift`
- Test: `SudokuEngine/Tests/SudokuEngineTests/CoordinateTests.swift`

- [ ] **Step 1: Failing test yaz**

`CoordinateTests.swift`:
```swift
import XCTest
@testable import SudokuEngine

final class CoordinateTests: XCTestCase {
    func testBoxIndex() {
        XCTAssertEqual(Coordinate(row: 0, col: 0).boxIndex, 0)
        XCTAssertEqual(Coordinate(row: 4, col: 4).boxIndex, 4)
        XCTAssertEqual(Coordinate(row: 8, col: 8).boxIndex, 8)
        XCTAssertEqual(Coordinate(row: 0, col: 8).boxIndex, 2)
        XCTAssertEqual(Coordinate(row: 8, col: 0).boxIndex, 6)
    }

    func testAllCoordinatesCount() {
        XCTAssertEqual(Coordinate.all.count, 81)
    }

    func testPeersExcludeSelfAndAreUnique() {
        let peers = Coordinate(row: 4, col: 4).peers
        XCTAssertFalse(peers.contains(Coordinate(row: 4, col: 4)))
        // 8 (satır) + 8 (sütun) + 4 (kutu kalanı) = 20 eşsiz komşu
        XCTAssertEqual(peers.count, 20)
    }
}
```

- [ ] **Step 2: Testi çalıştır (fail görmeli)**

Run: `cd SudokuEngine && swift test --filter CoordinateTests`
Expected: FAIL ("cannot find 'Coordinate' in scope")

- [ ] **Step 3: Coordinate implementasyonu**

`Coordinate.swift`:
```swift
/// Tahtadaki bir hücrenin konumu (0-8 satır, 0-8 sütun).
public struct Coordinate: Hashable, Sendable {
    public let row: Int
    public let col: Int

    public init(row: Int, col: Int) {
        self.row = row
        self.col = col
    }

    /// 0-8 arası 3x3 kutu numarası (soldan sağa, yukarıdan aşağı).
    public var boxIndex: Int { (row / 3) * 3 + (col / 3) }

    /// Tahtadaki 81 koordinatın tamamı.
    public static let all: [Coordinate] = {
        var result: [Coordinate] = []
        for r in 0..<9 { for c in 0..<9 { result.append(Coordinate(row: r, col: c)) } }
        return result
    }()

    /// Aynı satır, sütun veya kutuyu paylaşan diğer hücreler (kendisi hariç, eşsiz).
    public var peers: Set<Coordinate> {
        var set = Set<Coordinate>()
        for c in 0..<9 where c != col { set.insert(Coordinate(row: row, col: c)) }
        for r in 0..<9 where r != row { set.insert(Coordinate(row: r, col: col)) }
        let boxRow = (row / 3) * 3
        let boxCol = (col / 3) * 3
        for r in boxRow..<boxRow+3 {
            for c in boxCol..<boxCol+3 where !(r == row && c == col) {
                set.insert(Coordinate(row: r, col: c))
            }
        }
        return set
    }
}
```

- [ ] **Step 4: Testi çalıştır (pass görmeli)**

Run: `cd SudokuEngine && swift test --filter CoordinateTests`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add SudokuEngine
git commit -m "feat(engine): Coordinate + komsu (peers) hesabi"
```

---

## Task 3: Board (tahta modeli)

**Files:**
- Create: `SudokuEngine/Sources/SudokuEngine/Board.swift`
- Test: `SudokuEngine/Tests/SudokuEngineTests/BoardTests.swift`

- [ ] **Step 1: Failing test yaz**

`BoardTests.swift`:
```swift
import XCTest
@testable import SudokuEngine

final class BoardTests: XCTestCase {
    func testEmptyBoardIsAllNil() {
        let board = Board.empty
        for coord in Coordinate.all {
            XCTAssertNil(board[coord])
        }
    }

    func testSetAndGetValue() {
        var board = Board.empty
        board[Coordinate(row: 2, col: 3)] = 5
        XCTAssertEqual(board[Coordinate(row: 2, col: 3)], 5)
    }

    func testInitFromStringDots() {
        // 81 karakter: '.' veya '0' boş, 1-9 dolu
        let line = "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79"
        // 80 char yukarıda; tam 81'e tamamla
        let puzzle = line + "."
        let board = Board(string: puzzle)
        XCTAssertNotNil(board)
        XCTAssertEqual(board?[Coordinate(row: 0, col: 0)], 5)
        XCTAssertEqual(board?[Coordinate(row: 0, col: 1)], 3)
        XCTAssertNil(board?[Coordinate(row: 0, col: 2)])
    }

    func testInitFromStringRejectsWrongLength() {
        XCTAssertNil(Board(string: "123"))
    }

    func testFilledCountAndIsSolved() {
        let board = Board.empty
        XCTAssertEqual(board.filledCount, 0)
        XCTAssertFalse(board.isFull)
    }
}
```

- [ ] **Step 2: Testi çalıştır (fail görmeli)**

Run: `cd SudokuEngine && swift test --filter BoardTests`
Expected: FAIL ("cannot find 'Board' in scope")

- [ ] **Step 3: Board implementasyonu**

`Board.swift`:
```swift
/// 9x9 Sudoku tahtası. Hücre değeri 1-9 veya boş (nil).
public struct Board: Equatable, Sendable {
    /// 81 elemanlı düz dizi (row-major). 0 = boş, 1-9 = değer.
    private var cells: [Int]

    private init(cells: [Int]) { self.cells = cells }

    public static let empty = Board(cells: Array(repeating: 0, count: 81))

    /// "53..7...." gibi 81 karakterlik dizeden oluştur. '.' veya '0' boş demektir.
    public init?(string: String) {
        let chars = Array(string)
        guard chars.count == 81 else { return nil }
        var cells = [Int]()
        cells.reserveCapacity(81)
        for ch in chars {
            if ch == "." || ch == "0" {
                cells.append(0)
            } else if let d = ch.wholeNumberValue, (1...9).contains(d) {
                cells.append(d)
            } else {
                return nil
            }
        }
        self.cells = cells
    }

    private func index(_ c: Coordinate) -> Int { c.row * 9 + c.col }

    /// Hücre değeri: nil = boş, 1-9 = dolu.
    public subscript(_ c: Coordinate) -> Int? {
        get { let v = cells[index(c)]; return v == 0 ? nil : v }
        set { cells[index(c)] = newValue ?? 0 }
    }

    public var filledCount: Int { cells.lazy.filter { $0 != 0 }.count }
    public var isFull: Bool { !cells.contains(0) }

    /// 81 karakterlik dize gösterimi (boş = '.').
    public var stringValue: String {
        String(cells.map { $0 == 0 ? "." : Character("\($0)") })
    }
}
```

- [ ] **Step 4: Testi çalıştır (pass görmeli)**

Run: `cd SudokuEngine && swift test --filter BoardTests`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add SudokuEngine
git commit -m "feat(engine): Board modeli (string init, subscript, stringValue)"
```

---

## Task 4: Validator (çakışma kontrolü)

**Files:**
- Create: `SudokuEngine/Sources/SudokuEngine/Validator.swift`
- Test: `SudokuEngine/Tests/SudokuEngineTests/ValidatorTests.swift`

- [ ] **Step 1: Failing test yaz**

`ValidatorTests.swift`:
```swift
import XCTest
@testable import SudokuEngine

final class ValidatorTests: XCTestCase {
    func testCanPlaceInEmptyBoard() {
        let board = Board.empty
        XCTAssertTrue(Validator.canPlace(5, at: Coordinate(row: 0, col: 0), in: board))
    }

    func testRowConflict() {
        var board = Board.empty
        board[Coordinate(row: 0, col: 0)] = 5
        XCTAssertFalse(Validator.canPlace(5, at: Coordinate(row: 0, col: 8), in: board))
    }

    func testColConflict() {
        var board = Board.empty
        board[Coordinate(row: 0, col: 3)] = 7
        XCTAssertFalse(Validator.canPlace(7, at: Coordinate(row: 8, col: 3), in: board))
    }

    func testBoxConflict() {
        var board = Board.empty
        board[Coordinate(row: 0, col: 0)] = 9
        XCTAssertFalse(Validator.canPlace(9, at: Coordinate(row: 2, col: 2), in: board))
    }

    func testCandidatesExcludeConflicts() {
        var board = Board.empty
        board[Coordinate(row: 0, col: 1)] = 1
        board[Coordinate(row: 1, col: 0)] = 2
        let cands = Validator.candidates(at: Coordinate(row: 0, col: 0), in: board)
        XCTAssertFalse(cands.contains(1))
        XCTAssertFalse(cands.contains(2))
        XCTAssertTrue(cands.contains(3))
    }
}
```

- [ ] **Step 2: Testi çalıştır (fail görmeli)**

Run: `cd SudokuEngine && swift test --filter ValidatorTests`
Expected: FAIL ("cannot find 'Validator' in scope")

- [ ] **Step 3: Validator implementasyonu**

`Validator.swift`:
```swift
/// Sudoku yerleştirme kurallarını kontrol eder.
public enum Validator {
    /// `value` (1-9), `coord`'a komşularıyla çakışmadan konabilir mi?
    public static func canPlace(_ value: Int, at coord: Coordinate, in board: Board) -> Bool {
        for peer in coord.peers where board[peer] == value {
            return false
        }
        return true
    }

    /// Bir hücreye konabilecek tüm geçerli adaylar (1-9 arası).
    public static func candidates(at coord: Coordinate, in board: Board) -> Set<Int> {
        guard board[coord] == nil else { return [] }
        var used = Set<Int>()
        for peer in coord.peers { if let v = board[peer] { used.insert(v) } }
        return Set(1...9).subtracting(used)
    }

    /// Tahta kurallara uygun mu (mevcut dolu hücrelerde çakışma yok)?
    public static func isValid(_ board: Board) -> Bool {
        for coord in Coordinate.all {
            guard let v = board[coord] else { continue }
            for peer in coord.peers where peer.row * 9 + peer.col > coord.row * 9 + coord.col {
                if board[peer] == v { return false }
            }
        }
        return true
    }
}
```

- [ ] **Step 4: Testi çalıştır (pass görmeli)**

Run: `cd SudokuEngine && swift test --filter ValidatorTests`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add SudokuEngine
git commit -m "feat(engine): Validator (canPlace, candidates, isValid)"
```

---

## Task 5: Solver (backtracking — çöz & çözüm say)

**Files:**
- Create: `SudokuEngine/Sources/SudokuEngine/Solver.swift`
- Test: `SudokuEngine/Tests/SudokuEngineTests/SolverTests.swift`

- [ ] **Step 1: Failing test yaz**

`SolverTests.swift`:
```swift
import XCTest
@testable import SudokuEngine

final class SolverTests: XCTestCase {
    // Tek çözümü olan bilinen bir bulmaca
    let knownPuzzle = "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79."
    let knownSolution = "534678912672195348198342567859761423426853791713924856961537284287419635345286179"

    func testSolveReturnsValidSolution() {
        let board = Board(string: knownPuzzle)!
        let solved = Solver.solve(board)
        XCTAssertNotNil(solved)
        XCTAssertEqual(solved?.stringValue, knownSolution)
    }

    func testSolutionCountIsOneForProperPuzzle() {
        let board = Board(string: knownPuzzle)!
        XCTAssertEqual(Solver.countSolutions(board, limit: 2), 1)
    }

    func testEmptyBoardHasManySolutions() {
        // Boş tahta birden çok çözüme sahip; limit=2 ile erken dururuz
        XCTAssertEqual(Solver.countSolutions(Board.empty, limit: 2), 2)
    }

    func testUnsolvableReturnsNil() {
        var board = Board.empty
        board[Coordinate(row: 0, col: 0)] = 1
        board[Coordinate(row: 0, col: 1)] = 1 // aynı satırda iki 1 → çözülemez
        XCTAssertNil(Solver.solve(board))
    }
}
```

- [ ] **Step 2: Testi çalıştır (fail görmeli)**

Run: `cd SudokuEngine && swift test --filter SolverTests`
Expected: FAIL ("cannot find 'Solver' in scope")

- [ ] **Step 3: Solver implementasyonu**

`Solver.swift`:
```swift
/// Backtracking ile tahta çözer ve çözüm sayar.
public enum Solver {
    /// İlk bulunan çözümü döndürür; çözülemezse nil.
    public static func solve(_ board: Board) -> Board? {
        guard Validator.isValid(board) else { return nil }
        var working = board
        return backtrack(&working) ? working : nil
    }

    /// Çözüm sayısını `limit`'e kadar sayar (benzersizlik testi için limit:2 yeterli).
    public static func countSolutions(_ board: Board, limit: Int) -> Int {
        guard Validator.isValid(board) else { return 0 }
        var working = board
        var count = 0
        countBacktrack(&working, count: &count, limit: limit)
        return count
    }

    /// En az adaylı boş hücreyi bulur (MRV sezgiseli — hızlı çözüm).
    private static func findBestEmpty(_ board: Board) -> (Coordinate, [Int])? {
        var best: (Coordinate, [Int])?
        for coord in Coordinate.all where board[coord] == nil {
            let cands = Array(Validator.candidates(at: coord, in: board))
            if cands.isEmpty { return (coord, []) } // çıkmaz sokak
            if best == nil || cands.count < best!.1.count {
                best = (coord, cands)
                if cands.count == 1 { break }
            }
        }
        return best
    }

    private static func backtrack(_ board: inout Board) -> Bool {
        guard let (coord, cands) = findBestEmpty(board) else { return true } // dolu = çözüldü
        if cands.isEmpty { return false }
        for v in cands {
            board[coord] = v
            if backtrack(&board) { return true }
            board[coord] = nil
        }
        return false
    }

    private static func countBacktrack(_ board: inout Board, count: inout Int, limit: Int) {
        if count >= limit { return }
        guard let (coord, cands) = findBestEmpty(board) else { count += 1; return }
        if cands.isEmpty { return }
        for v in cands {
            board[coord] = v
            countBacktrack(&board, count: &count, limit: limit)
            board[coord] = nil
            if count >= limit { return }
        }
    }
}
```

- [ ] **Step 4: Testi çalıştır (pass görmeli)**

Run: `cd SudokuEngine && swift test --filter SolverTests`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add SudokuEngine
git commit -m "feat(engine): Solver (backtracking solve + countSolutions)"
```

---

## Task 6: Hint modeli & LogicalSolver (Naked/Hidden Single)

**Files:**
- Create: `SudokuEngine/Sources/SudokuEngine/Hint.swift`
- Create: `SudokuEngine/Sources/SudokuEngine/LogicalSolver.swift`
- Test: `SudokuEngine/Tests/SudokuEngineTests/LogicalSolverTests.swift`

- [ ] **Step 1: Failing test yaz**

`LogicalSolverTests.swift`:
```swift
import XCTest
@testable import SudokuEngine

final class LogicalSolverTests: XCTestCase {
    func testNakedSingle() {
        // (0,0) hücresinin tek adayı kalacak şekilde komşuları doldur (1-8 kullanılır → tek aday 9)
        var board = Board.empty
        board[Coordinate(row: 0, col: 1)] = 1
        board[Coordinate(row: 0, col: 2)] = 2
        board[Coordinate(row: 0, col: 3)] = 3
        board[Coordinate(row: 0, col: 4)] = 4
        board[Coordinate(row: 0, col: 5)] = 5
        board[Coordinate(row: 0, col: 6)] = 6
        board[Coordinate(row: 0, col: 7)] = 7
        board[Coordinate(row: 0, col: 8)] = 8
        let hint = LogicalSolver.nextHint(for: board)
        XCTAssertNotNil(hint)
        XCTAssertEqual(hint?.technique, .nakedSingle)
        XCTAssertEqual(hint?.coordinate, Coordinate(row: 0, col: 0))
        XCTAssertEqual(hint?.value, 9)
    }

    func testHiddenSingle() {
        // Bir satırda 5 yalnızca tek hücreye girebiliyorsa → hidden single
        var board = Board.empty
        // 5'i (1,0) ve (2,0) sütun/kutu yoluyla bloke et, böylece satır 0'da 5 yalnız bir hücreye düşsün
        board[Coordinate(row: 1, col: 1)] = 5
        board[Coordinate(row: 2, col: 2)] = 5
        // satır 0'da (0,0) dışındaki hücrelere 5 girmesini engellemek için bazı sütunlara 5 koy
        board[Coordinate(row: 4, col: 3)] = 5
        board[Coordinate(row: 5, col: 4)] = 5
        board[Coordinate(row: 6, col: 5)] = 5
        board[Coordinate(row: 7, col: 6)] = 5
        board[Coordinate(row: 8, col: 7)] = 5
        board[Coordinate(row: 3, col: 8)] = 5
        let hint = LogicalSolver.nextHint(for: board)
        XCTAssertNotNil(hint)
        // İlk uygulanabilir teknik naked ya da hidden single olabilir; değer 5 ve satır 0 beklenir
        XCTAssertEqual(hint?.value, 5)
        XCTAssertEqual(hint?.coordinate.row, 0)
    }

    func testNoHintOnEmptyAmbiguousBoardReturnsNil() {
        // Tamamen boş tahtada hiçbir tekil (single) yoktur
        XCTAssertNil(LogicalSolver.nextHint(for: Board.empty))
    }

    func testFullBoardReturnsNil() {
        let solved = Board(string: "534678912672195348198342567859761423426853791713924856961537284287419635345286179")!
        XCTAssertNil(LogicalSolver.nextHint(for: solved))
    }
}
```

- [ ] **Step 2: Testi çalıştır (fail görmeli)**

Run: `cd SudokuEngine && swift test --filter LogicalSolverTests`
Expected: FAIL ("cannot find 'LogicalSolver' in scope")

- [ ] **Step 3: Hint + LogicalSolver implementasyonu**

`Hint.swift`:
```swift
/// İnsan çözüm teknikleri (kolaydan zora). Faz 1 yalnızca single'ları içerir.
public enum Technique: String, Sendable {
    case nakedSingle = "Tek Aday"
    case hiddenSingle = "Gizli Tek"

    /// Oyuncuya gösterilecek sade açıklama.
    public var explanation: String {
        switch self {
        case .nakedSingle:
            return "Bu hücreye yalnızca tek bir rakam girebiliyor; diğer tüm rakamlar komşularında kullanılmış."
        case .hiddenSingle:
            return "Bu rakam, satır/sütun/kutu içinde yalnızca bu hücreye girebiliyor."
        }
    }
}

/// Bir sonraki mantıklı hamle.
public struct Hint: Equatable, Sendable {
    public let technique: Technique
    public let coordinate: Coordinate
    public let value: Int
    public var explanation: String { technique.explanation }
}
```

`LogicalSolver.swift`:
```swift
/// İnsan tekniklerini sırayla deneyerek bir sonraki hamleyi bulur (ipucu motoru).
public enum LogicalSolver {
    /// Uygulanabilir en kolay tekniği döndürür; yoksa nil.
    public static func nextHint(for board: Board) -> Hint? {
        if let h = nakedSingle(board) { return h }
        if let h = hiddenSingle(board) { return h }
        return nil
    }

    /// Tek adayı kalan ilk boş hücre.
    static func nakedSingle(_ board: Board) -> Hint? {
        for coord in Coordinate.all where board[coord] == nil {
            let cands = Validator.candidates(at: coord, in: board)
            if cands.count == 1 {
                return Hint(technique: .nakedSingle, coordinate: coord, value: cands.first!)
            }
        }
        return nil
    }

    /// Bir birimde (satır/sütun/kutu) yalnızca tek hücreye girebilen rakam.
    static func hiddenSingle(_ board: Board) -> Hint? {
        for unit in Self.units {
            for value in 1...9 {
                let spots = unit.filter { board[$0] == nil && Validator.candidates(at: $0, in: board).contains(value) }
                if spots.count == 1 {
                    return Hint(technique: .hiddenSingle, coordinate: spots[0], value: value)
                }
            }
        }
        return nil
    }

    /// 27 birim: 9 satır + 9 sütun + 9 kutu.
    static let units: [[Coordinate]] = {
        var result: [[Coordinate]] = []
        for r in 0..<9 { result.append((0..<9).map { Coordinate(row: r, col: $0) }) }
        for c in 0..<9 { result.append((0..<9).map { Coordinate(row: $0, col: c) }) }
        for boxRow in stride(from: 0, to: 9, by: 3) {
            for boxCol in stride(from: 0, to: 9, by: 3) {
                var box: [Coordinate] = []
                for r in boxRow..<boxRow+3 { for c in boxCol..<boxCol+3 { box.append(Coordinate(row: r, col: c)) } }
                result.append(box)
            }
        }
        return result
    }()
}
```

- [ ] **Step 4: Testi çalıştır (pass görmeli)**

Run: `cd SudokuEngine && swift test --filter LogicalSolverTests`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add SudokuEngine
git commit -m "feat(engine): Hint modeli + LogicalSolver (naked/hidden single)"
```

---

## Task 7: Difficulty enum

**Files:**
- Create: `SudokuEngine/Sources/SudokuEngine/Difficulty.swift`
- Test: `SudokuEngine/Tests/SudokuEngineTests/DifficultyTests.swift`

- [ ] **Step 1: Failing test yaz**

`DifficultyTests.swift`:
```swift
import XCTest
@testable import SudokuEngine

final class DifficultyTests: XCTestCase {
    func testAllCasesOrdered() {
        XCTAssertEqual(Difficulty.allCases.count, 6)
        XCTAssertEqual(Difficulty.allCases.first, .easy)
        XCTAssertEqual(Difficulty.allCases.last, .master)
    }

    func testClueTargetDecreasesWithDifficulty() {
        XCTAssertGreaterThan(Difficulty.easy.targetClues, Difficulty.master.targetClues)
    }

    func testTurkishName() {
        XCTAssertEqual(Difficulty.ifrit.displayName, "İfrit")
    }
}
```

- [ ] **Step 2: Testi çalıştır (fail görmeli)**

Run: `cd SudokuEngine && swift test --filter DifficultyTests`
Expected: FAIL ("cannot find 'Difficulty' in scope")

- [ ] **Step 3: Difficulty implementasyonu**

`Difficulty.swift`:
```swift
/// Zorluk kademeleri (kolaydan zora). Faz 1: ipucu sayısı hedefiyle ayrılır;
/// Faz 2'de teknik-tabanlı derecelendirme eklenecek.
public enum Difficulty: Int, CaseIterable, Sendable {
    case easy, medium, hard, expert, ifrit, master

    public var displayName: String {
        switch self {
        case .easy: return "Kolay"
        case .medium: return "Orta"
        case .hard: return "Zor"
        case .expert: return "Uzman"
        case .ifrit: return "İfrit"
        case .master: return "Usta"
        }
    }

    /// Üreticinin tahtada bırakmaya çalışacağı yaklaşık ipucu (dolu hücre) sayısı.
    public var targetClues: Int {
        switch self {
        case .easy: return 40
        case .medium: return 34
        case .hard: return 30
        case .expert: return 27
        case .ifrit: return 24
        case .master: return 22
        }
    }
}
```

- [ ] **Step 4: Testi çalıştır (pass görmeli)**

Run: `cd SudokuEngine && swift test --filter DifficultyTests`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add SudokuEngine
git commit -m "feat(engine): Difficulty enum (6 kademe, TR isimler)"
```

---

## Task 8: Generator (bulmaca üretici — tek çözüm garantili)

**Files:**
- Create: `SudokuEngine/Sources/SudokuEngine/Generator.swift`
- Test: `SudokuEngine/Tests/SudokuEngineTests/GeneratorTests.swift`

- [ ] **Step 1: Failing test yaz**

`GeneratorTests.swift`:
```swift
import XCTest
@testable import SudokuEngine

final class GeneratorTests: XCTestCase {
    func testFullSolutionIsValidAndFull() {
        var rng = SeededRandom(seed: 42)
        let full = Generator.fullSolution(using: &rng)
        XCTAssertTrue(full.isFull)
        XCTAssertTrue(Validator.isValid(full))
    }

    func testSameSeedSameSolution() {
        var rngA = SeededRandom(seed: 7)
        var rngB = SeededRandom(seed: 7)
        XCTAssertEqual(Generator.fullSolution(using: &rngA).stringValue,
                       Generator.fullSolution(using: &rngB).stringValue)
    }

    func testGeneratedPuzzleHasUniqueSolution() {
        var rng = SeededRandom(seed: 123)
        let puzzle = Generator.makePuzzle(difficulty: .easy, using: &rng)
        XCTAssertEqual(Solver.countSolutions(puzzle.givens, limit: 2), 1)
    }

    func testPuzzleSolvesToItsSolution() {
        var rng = SeededRandom(seed: 999)
        let puzzle = Generator.makePuzzle(difficulty: .medium, using: &rng)
        XCTAssertEqual(Solver.solve(puzzle.givens)?.stringValue, puzzle.solution.stringValue)
    }

    func testGivensAreSubsetOfSolution() {
        var rng = SeededRandom(seed: 5)
        let puzzle = Generator.makePuzzle(difficulty: .hard, using: &rng)
        for coord in Coordinate.all {
            if let g = puzzle.givens[coord] {
                XCTAssertEqual(g, puzzle.solution[coord])
            }
        }
    }
}
```

- [ ] **Step 2: Testi çalıştır (fail görmeli)**

Run: `cd SudokuEngine && swift test --filter GeneratorTests`
Expected: FAIL ("cannot find 'Generator' / 'SeededRandom' in scope")

- [ ] **Step 3: Generator + SeededRandom + Puzzle implementasyonu**

`Generator.swift`:
```swift
import Foundation

/// Tekrarlanabilir rastgelelik (günlük bulmaca için sabit tohum şart).
public struct SeededRandom: RandomNumberGenerator {
    private var state: UInt64
    public init(seed: UInt64) { self.state = seed &+ 0x9E3779B97F4A7C15 }
    public mutating func next() -> UInt64 {
        // SplitMix64
        state = state &+ 0x9E3779B97F4A7C15
        var z = state
        z = (z ^ (z >> 30)) &* 0xBF58476D1CE4E5B9
        z = (z ^ (z >> 27)) &* 0x94D049BB133111EB
        return z ^ (z >> 31)
    }
}

/// Üretilmiş bir bulmaca: verilenler (givens) + tam çözüm.
public struct Puzzle: Equatable, Sendable {
    public let givens: Board
    public let solution: Board
    public let difficulty: Difficulty
}

/// Tek çözümlü Sudoku bulmacaları üretir.
public enum Generator {
    /// Rastgele tam (çözülmüş) geçerli tahta üretir.
    public static func fullSolution<R: RandomNumberGenerator>(using rng: inout R) -> Board {
        var board = Board.empty
        _ = fill(&board, using: &rng)
        return board
    }

    private static func fill<R: RandomNumberGenerator>(_ board: inout Board, using rng: inout R) -> Bool {
        guard let coord = Coordinate.all.first(where: { board[$0] == nil }) else { return true }
        var values = Array(Validator.candidates(at: coord, in: board)).shuffled(using: &rng)
        for v in values {
            board[coord] = v
            if fill(&board, using: &rng) { return true }
            board[coord] = nil
        }
        _ = values // sus uyarısı
        return false
    }

    /// Hedef zorlukta, tek çözümlü bir bulmaca üretir.
    public static func makePuzzle<R: RandomNumberGenerator>(difficulty: Difficulty, using rng: inout R) -> Puzzle {
        let solution = fullSolution(using: &rng)
        var givens = solution
        // Koordinatları karıştırıp tek tek boşaltmayı dene (tek çözüm korunduğu sürece).
        let order = Coordinate.all.shuffled(using: &rng)
        for coord in order {
            if givens.filledCount <= difficulty.targetClues { break }
            let backup = givens[coord]
            givens[coord] = nil
            if Solver.countSolutions(givens, limit: 2) != 1 {
                givens[coord] = backup // benzersizlik bozuldu → geri koy
            }
        }
        return Puzzle(givens: givens, solution: solution, difficulty: difficulty)
    }
}
```

- [ ] **Step 4: Testi çalıştır (pass görmeli)**

Run: `cd SudokuEngine && swift test --filter GeneratorTests`
Expected: PASS (5 tests)

- [ ] **Step 5: Tüm test paketini çalıştır**

Run: `cd SudokuEngine && swift test`
Expected: PASS (tüm testler, ~30 test)

- [ ] **Step 6: Commit**

```bash
git add SudokuEngine
git commit -m "feat(engine): Generator (tam cozum + tek cozum garantili bulmaca uretimi)"
```

---

## Task 9: Public API yüzeyi & dökümantasyon

**Files:**
- Modify: `SudokuEngine/Sources/SudokuEngine/SudokuEngine.swift`
- Test: `SudokuEngine/Tests/SudokuEngineTests/PublicAPITests.swift`

- [ ] **Step 1: Failing test yaz**

`PublicAPITests.swift`:
```swift
import XCTest
@testable import SudokuEngine

final class PublicAPITests: XCTestCase {
    /// Uygulamanın tek bir çağrıyla bulmaca alabilmesi (arayüzün kullanacağı yüzey).
    func testGameAPIProducesPlayablePuzzle() {
        let puzzle = SudokuGame.newPuzzle(difficulty: .easy, seed: 2026)
        XCTAssertEqual(Solver.countSolutions(puzzle.givens, limit: 2), 1)
        XCTAssertFalse(puzzle.givens.isFull)
    }

    func testGameAPIDeterministicBySeed() {
        let a = SudokuGame.newPuzzle(difficulty: .hard, seed: 555)
        let b = SudokuGame.newPuzzle(difficulty: .hard, seed: 555)
        XCTAssertEqual(a.givens.stringValue, b.givens.stringValue)
    }

    func testGameAPIHint() {
        let puzzle = SudokuGame.newPuzzle(difficulty: .easy, seed: 1)
        // Kolay bulmacada en az bir mantıksal ipucu bulunmalı
        XCTAssertNotNil(SudokuGame.hint(for: puzzle.givens))
    }
}
```

- [ ] **Step 2: Testi çalıştır (fail görmeli)**

Run: `cd SudokuEngine && swift test --filter PublicAPITests`
Expected: FAIL ("cannot find 'SudokuGame' in scope")

- [ ] **Step 3: SudokuGame public facade**

`SudokuEngine.swift` (içeriği tamamen değiştir):
```swift
/// SudokuEngine: arayüzden bağımsız Sudoku oyun motoru.
public enum SudokuEngineInfo {
    public static let version = "0.1.0"
}

/// Uygulamanın (arayüzün) kullanacağı sade giriş noktası.
public enum SudokuGame {
    /// Belirli zorluk ve tohumla tek çözümlü bulmaca üretir.
    /// Aynı (difficulty, seed) her zaman aynı bulmacayı verir → günlük bulmaca için ideal.
    public static func newPuzzle(difficulty: Difficulty, seed: UInt64) -> Puzzle {
        var rng = SeededRandom(seed: seed)
        return Generator.makePuzzle(difficulty: difficulty, using: &rng)
    }

    /// Mevcut tahta için bir sonraki mantıklı hamleyi (ipucu) döndürür.
    public static func hint(for board: Board) -> Hint? {
        LogicalSolver.nextHint(for: board)
    }

    /// Bir hamlenin kurala uygun olup olmadığını kontrol eder.
    public static func canPlace(_ value: Int, at coord: Coordinate, in board: Board) -> Bool {
        Validator.canPlace(value, at: coord, in: board)
    }

    /// Tahtanın tek çözümü var mı?
    public static func hasUniqueSolution(_ board: Board) -> Bool {
        Solver.countSolutions(board, limit: 2) == 1
    }
}
```

- [ ] **Step 4: Testi çalıştır (pass görmeli)**

Run: `cd SudokuEngine && swift test --filter PublicAPITests`
Expected: PASS (3 tests)

- [ ] **Step 5: Tüm paketi son kez doğrula**

Run: `cd SudokuEngine && swift test`
Expected: PASS (tüm testler)

- [ ] **Step 6: Commit**

```bash
git add SudokuEngine
git commit -m "feat(engine): SudokuGame public facade + tum testler yesil"
```

---

## Self-Review Sonucu (Faz 1 ↔ Spec)

- **Spec §2.3 (üretim, tek çözüm garanti):** Task 8 `makePuzzle` + `countSolutions(limit:2)==1` ✅
- **Spec §4 (ipucu, teknik açıklamalı):** Task 6 `Hint.explanation` + `nextHint` ✅ (ileri teknikler Faz 2)
- **Spec §5.1 (günlük bulmaca, sunucusuz aynı bulmaca):** Task 9 `seed` tabanlı deterministik üretim ✅
- **Spec §2.2 (6 zorluk):** Task 7 `Difficulty` 6 kademe ✅ (teknik-tabanlı derecelendirme Faz 2)
- **Spec §7.1 (saf Swift, test edilebilir çekirdek):** Tüm paket UIKit/SwiftUI'siz, `swift test` ✅

**Faz 1 kapsamı dışı (bilinçli, sonraki fazlar):** İleri teknikler (X-Wing vb.), varyasyonlar (Killer/X), arayüz, veri saklama, Game Center. Bunlar yol haritasında planlandı.

**Placeholder taraması:** Temiz — her adımda gerçek, derlenebilir Swift kodu var.
