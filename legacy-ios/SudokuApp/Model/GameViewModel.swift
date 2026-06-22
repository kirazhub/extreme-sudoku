import SwiftUI
import SudokuEngine

/// Oyunun ana durum yönetimi (View'lar bunu izler).
/// MVVM'in "VM" katmanı: tüm test edilen oyun mantığı burada.
@MainActor
final class GameViewModel: ObservableObject, Identifiable {
    let id = UUID()
    let puzzle: Puzzle

    @Published private(set) var board: Board
    @Published private(set) var notesMap: [Coordinate: Set<Int>] = [:]
    @Published var selected: Coordinate?
    @Published var isNoteMode = false
    @Published var highlightMistakes = true
    @Published private(set) var elapsedSeconds = 0
    @Published private(set) var hintsUsed = 0

    /// Bir hamlenin ÖNCEKİ durumunu saklayan kayıt — undo/redo için.
    /// oldValue: hamleden önceki hücre değeri (nil = boştu).
    /// oldNotes: hamleden önceki not seti.
    /// İleride redoStack'e ters bilgi koyarken aynı struct kullanılır:
    /// orada oldValue = hamlenin "yeni" değeri, oldNotes = hamlenin "yeni" notları olur.
    private struct Move {
        let coord: Coordinate
        let oldValue: Int?
        let oldNotes: Set<Int>
    }
    private var undoStack: [Move] = []
    private var redoStack: [Move] = []
    private var timer: Timer?

    init(puzzle: Puzzle) {
        self.puzzle = puzzle
        self.board = puzzle.givens
    }

    // MARK: - Sorgular
    func isGiven(_ c: Coordinate) -> Bool { puzzle.givens[c] != nil }
    func value(at c: Coordinate) -> Int? { board[c] }
    func notes(at c: Coordinate) -> Set<Int> { notesMap[c] ?? [] }
    var filledCount: Int { board.filledCount }
    var isSolved: Bool { board.stringValue == puzzle.solution.stringValue }

    func isMistake(_ c: Coordinate) -> Bool {
        guard highlightMistakes, let v = board[c], !isGiven(c) else { return false }
        return v != puzzle.solution[c]
    }

    // MARK: - Seçim
    func select(_ c: Coordinate) { selected = c }

    // MARK: - Giriş
    func input(_ value: Int) {
        guard let c = selected, !isGiven(c) else { return }
        if isNoteMode {
            // Not modunda dolu hücreye not eklenmez.
            guard board[c] == nil else { return }
            let old = notesMap[c] ?? []
            var new = old
            if new.contains(value) { new.remove(value) } else { new.insert(value) }
            // ÖNCEKİ durumu undo stack'e koy.
            pushMove(Move(coord: c, oldValue: board[c], oldNotes: old))
            notesMap[c] = new
        } else {
            let old = notesMap[c] ?? []
            // ÖNCEKİ durumu undo stack'e koy.
            pushMove(Move(coord: c, oldValue: board[c], oldNotes: old))
            board[c] = value
            notesMap[c] = [] // değer girilince notlar temizlenir (klasik davranış).
        }
    }

    func erase() {
        guard let c = selected, !isGiven(c) else { return }
        let old = notesMap[c] ?? []
        pushMove(Move(coord: c, oldValue: board[c], oldNotes: old))
        board[c] = nil
        notesMap[c] = []
    }

    // MARK: - İpucu
    @discardableResult
    func applyHint() -> Bool {
        guard let hint = SudokuGame.hint(for: board) else { return false }
        let old = notesMap[hint.coordinate] ?? []
        pushMove(Move(coord: hint.coordinate, oldValue: board[hint.coordinate], oldNotes: old))
        board[hint.coordinate] = hint.value
        notesMap[hint.coordinate] = []
        selected = hint.coordinate
        hintsUsed += 1
        return true
    }

    /// Geçerli tahta için bir sonraki mantıklı ipucu (görüntü amaçlı).
    func currentHint() -> Hint? { SudokuGame.hint(for: board) }

    // MARK: - Undo / Redo
    func undo() {
        guard let move = undoStack.popLast() else { return }
        // ŞU ANKİ durumu redoStack'e koy (sonra "geri" almak için).
        let currentValue = board[move.coord]
        let currentNotes = notesMap[move.coord] ?? []
        redoStack.append(Move(coord: move.coord, oldValue: currentValue, oldNotes: currentNotes))
        // Eski duruma geri dön.
        board[move.coord] = move.oldValue
        notesMap[move.coord] = move.oldNotes
    }

    func redo() {
        guard let move = redoStack.popLast() else { return }
        // ŞU ANKİ durumu undoStack'e koy.
        let currentValue = board[move.coord]
        let currentNotes = notesMap[move.coord] ?? []
        undoStack.append(Move(coord: move.coord, oldValue: currentValue, oldNotes: currentNotes))
        // İleri (redo) duruma geç.
        board[move.coord] = move.oldValue
        notesMap[move.coord] = move.oldNotes
    }

    private func pushMove(_ m: Move) {
        undoStack.append(m)
        redoStack.removeAll() // yeni hamle redo'yu sıfırlar (standart davranış).
    }

    // MARK: - Zamanlayıcı
    func startTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.elapsedSeconds += 1 }
        }
    }

    func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
}
