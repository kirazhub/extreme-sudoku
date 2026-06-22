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
