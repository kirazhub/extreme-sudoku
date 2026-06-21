import SwiftUI
import SudokuEngine

/// Ana menü: marka başlığı + zorluk seçimi → GameView başlatır.
struct MenuView: View {
    @State private var activeGame: GameViewModel?

    var body: some View {
        ZStack {
            Theme.Palette.boardBackground.ignoresSafeArea()
            VStack(spacing: 32) {
                Spacer()
                // Marka bloğu.
                VStack(spacing: 4) {
                    Text("SUDOKU")
                        .font(Theme.brand(52))
                        .foregroundStyle(Theme.Palette.inkPrimary)
                    Text("zihnini bilet")
                        .font(.system(size: 14, design: .rounded))
                        .foregroundStyle(Theme.Palette.accent)
                }
                // Zorluk butonları.
                VStack(spacing: 12) {
                    ForEach(Difficulty.allCases, id: \.self) { diff in
                        Button {
                            // Zamana bağlı tohum: her oyun farklı bulmaca.
                            let seed = UInt64(Date().timeIntervalSince1970)
                            activeGame = GameViewModel(
                                puzzle: SudokuGame.newPuzzle(difficulty: diff, seed: seed)
                            )
                        } label: {
                            HStack {
                                Text(diff.displayName)
                                Spacer()
                                Image(systemName: "chevron.right").font(.system(size: 13))
                            }
                            .font(Theme.numeral(18, weight: .medium))
                            .foregroundStyle(Theme.Palette.inkPrimary)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 14)
                            .background(Theme.Palette.cellHighlight.opacity(0.5))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
                .padding(.horizontal, 32)
                Spacer()
            }
        }
        .fullScreenCover(item: $activeGame) { vm in
            NavigationStack {
                GameView(vm: vm)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            Button("Menü") { activeGame = nil }
                                .foregroundStyle(Theme.Palette.accent)
                        }
                    }
            }
        }
    }
}
