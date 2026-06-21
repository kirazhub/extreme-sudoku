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
