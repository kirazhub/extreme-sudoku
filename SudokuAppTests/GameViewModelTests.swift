import XCTest
import SudokuEngine
@testable import SudokuApp

@MainActor
final class GameViewModelTests: XCTestCase {
    private func makeVM() -> GameViewModel {
        let puzzle = SudokuGame.newPuzzle(difficulty: .easy, seed: 2026)
        return GameViewModel(puzzle: puzzle)
    }

    func testGivenCellsAreLocked() {
        let vm = makeVM()
        let given = Coordinate.all.first { vm.puzzle.givens[$0] != nil }!
        XCTAssertTrue(vm.isGiven(given))
        vm.select(given)
        vm.input(5) // verilen hücre değişmemeli
        XCTAssertEqual(vm.value(at: given), vm.puzzle.givens[given])
    }

    func testInputIntoEmptyCell() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        vm.select(empty)
        vm.input(7)
        XCTAssertEqual(vm.value(at: empty), 7)
    }

    func testUndoRedo() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        vm.select(empty); vm.input(7)
        vm.undo()
        XCTAssertNil(vm.value(at: empty))
        vm.redo()
        XCTAssertEqual(vm.value(at: empty), 7)
    }

    func testNoteToggle() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        vm.select(empty)
        vm.isNoteMode = true
        vm.input(3); vm.input(5)
        XCTAssertEqual(vm.notes(at: empty), [3, 5])
        vm.input(3) // tekrar → kaldır
        XCTAssertEqual(vm.notes(at: empty), [5])
    }

    func testErase() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        vm.select(empty); vm.input(7)
        vm.erase()
        XCTAssertNil(vm.value(at: empty))
    }

    func testMistakeDetection() {
        let vm = makeVM()
        let empty = Coordinate.all.first { vm.puzzle.givens[$0] == nil }!
        let wrong = vm.puzzle.solution[empty] == 1 ? 2 : 1
        vm.select(empty); vm.input(wrong)
        XCTAssertTrue(vm.isMistake(empty))
    }

    func testHintFillsACell() {
        let vm = makeVM()
        let before = vm.filledCount
        XCTAssertTrue(vm.applyHint())
        XCTAssertEqual(vm.filledCount, before + 1)
    }

    func testIsSolvedWhenMatchesSolution() {
        let vm = makeVM()
        for coord in Coordinate.all where vm.puzzle.givens[coord] == nil {
            vm.select(coord)
            vm.input(vm.puzzle.solution[coord]!)
        }
        XCTAssertTrue(vm.isSolved)
    }
}
