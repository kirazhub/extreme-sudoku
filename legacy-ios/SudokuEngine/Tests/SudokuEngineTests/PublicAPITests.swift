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
