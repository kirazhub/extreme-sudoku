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
