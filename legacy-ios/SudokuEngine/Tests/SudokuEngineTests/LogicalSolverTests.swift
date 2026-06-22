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
        // Satır 0'da 5'in yalnızca (0,8) hücresine girebileceği bir kurgu.
        // (1,1)=5 ve (2,2)=5 -> kutu 0'a 5 düşmez (yani (0,0),(0,1),(0,2) bloklu)
        // (4,3),(5,4),(6,5) -> kutu 1'deki sütunları 3,4,5 bloklar -> (0,3),(0,4),(0,5)
        // (7,6),(8,7) -> sütun 6,7 bloklu -> (0,6),(0,7). Sütun 8 açık -> (0,8) tek spot.
        var board = Board.empty
        board[Coordinate(row: 1, col: 1)] = 5
        board[Coordinate(row: 2, col: 2)] = 5
        board[Coordinate(row: 4, col: 3)] = 5
        board[Coordinate(row: 5, col: 4)] = 5
        board[Coordinate(row: 6, col: 5)] = 5
        board[Coordinate(row: 7, col: 6)] = 5
        board[Coordinate(row: 8, col: 7)] = 5
        let hint = LogicalSolver.nextHint(for: board)
        XCTAssertNotNil(hint)
        XCTAssertEqual(hint?.technique, .hiddenSingle)
        XCTAssertEqual(hint?.value, 5)
        XCTAssertEqual(hint?.coordinate, Coordinate(row: 0, col: 8))
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
