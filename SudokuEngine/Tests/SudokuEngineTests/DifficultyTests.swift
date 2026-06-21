import XCTest
@testable import SudokuEngine

final class DifficultyTests: XCTestCase {
    func testAllCasesOrdered() {
        XCTAssertEqual(Difficulty.allCases.count, 6)
        XCTAssertEqual(Difficulty.allCases.first, .easy)
        XCTAssertEqual(Difficulty.allCases.last, .master)
    }

    func testClueTargetDecreasesWithDifficulty() {
        XCTAssertGreaterThan(Difficulty.easy.targetClues, Difficulty.master.targetClues)
    }

    func testTurkishName() {
        XCTAssertEqual(Difficulty.ifrit.displayName, "İfrit")
    }
}
