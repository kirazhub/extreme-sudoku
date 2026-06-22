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
