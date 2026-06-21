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
        let puzzle = "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79"
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
