import Foundation

/// Tekrarlanabilir rastgelelik (günlük bulmaca için sabit tohum şart).
public struct SeededRandom: RandomNumberGenerator {
    private var state: UInt64
    public init(seed: UInt64) { self.state = seed &+ 0x9E3779B97F4A7C15 }
    public mutating func next() -> UInt64 {
        // SplitMix64 — Sébastiano Vigna
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

    public init(givens: Board, solution: Board, difficulty: Difficulty) {
        self.givens = givens
        self.solution = solution
        self.difficulty = difficulty
    }
}

/// Tek çözümlü Sudoku bulmacaları üretir.
public enum Generator {
    /// Rastgele tam (çözülmüş) geçerli tahta üretir.
    public static func fullSolution<R: RandomNumberGenerator>(using rng: inout R) -> Board {
        var board = Board.empty
        _ = fill(&board, using: &rng)
        return board
    }

    /// Backtracking ile tahtayı rastgele sıralanmış adaylarla doldurur.
    private static func fill<R: RandomNumberGenerator>(_ board: inout Board, using rng: inout R) -> Bool {
        guard let coord = Coordinate.all.first(where: { board[$0] == nil }) else { return true }
        // Set sıralaması deterministik değil; önce sort, sonra shuffle ile deterministik üretim.
        let values = Validator.candidates(at: coord, in: board).sorted().shuffled(using: &rng)
        for v in values {
            board[coord] = v
            if fill(&board, using: &rng) { return true }
            board[coord] = nil
        }
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
