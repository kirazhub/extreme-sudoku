import XCTest
@testable import SudokuEngine

final class SmokeTests: XCTestCase {
    func testVersionExists() {
        XCTAssertEqual(SudokuEngineInfo.version, "0.1.0")
    }
}
