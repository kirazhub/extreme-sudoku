import SwiftUI

@main
struct SudokuAppApp: App {
    var body: some Scene {
        WindowGroup {
            // Task 2: tema doğrulama; Task 8'de MenuView ile değiştirilecek.
            ZStack {
                Theme.Palette.boardBackground.ignoresSafeArea()
                Text("Sudoku")
                    .font(Theme.brand(48))
                    .foregroundStyle(Theme.Palette.inkPrimary)
            }
        }
    }
}
