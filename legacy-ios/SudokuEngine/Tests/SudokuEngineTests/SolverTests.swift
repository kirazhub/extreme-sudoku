import XCTest
@testable import SudokuEngine

final class SolverTests: XCTestCase {
    // Tek çözümü olan bilinen bir bulmaca (81 karakter)
    let knownPuzzle = "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79"
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
