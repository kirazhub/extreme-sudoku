import SwiftUI
import SudokuEngine

/// Oyun ekranı: başlık + tahta + ipucu açıklaması + araç çubuğu + tuş takımı + kazanma ekranı.
struct GameView: View {
    @StateObject var vm: GameViewModel
    @State private var hintText: String?
    @State private var showWin = false

    var body: some View {
        VStack(spacing: 16) {
            header
            BoardView(vm: vm)
                .padding(.horizontal, 8)
            if let hintText {
                Text(hintText)
                    .font(.system(size: 13, design: .rounded))
                    .foregroundStyle(Theme.Palette.accent)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .transition(.opacity)
            }
            ToolbarView(vm: vm, onHint: requestHint)
                .padding(.horizontal)
            NumberPadView { vm.input($0) }
                .padding(.horizontal)
            Spacer(minLength: 8)
        }
        .background(Theme.Palette.boardBackground.ignoresSafeArea())
        .onAppear { vm.startTimer() }
        .onDisappear { vm.stopTimer() }
        .onChange(of: vm.isSolved) { _, solved in
            if solved { vm.stopTimer(); showWin = true }
        }
        .overlay { if showWin { winOverlay } }
    }

    /// Zorluk adı + süre.
    private var header: some View {
        HStack {
            Text(vm.puzzle.difficulty.displayName)
                .font(Theme.brand(22))
                .foregroundStyle(Theme.Palette.inkPrimary)
            Spacer()
            Text(timeString)
                .font(Theme.numeral(18, weight: .medium))
                .foregroundStyle(Theme.Palette.inkPrimary.opacity(0.7))
        }
        .padding(.horizontal)
    }

    private var timeString: String {
        String(format: "%02d:%02d", vm.elapsedSeconds / 60, vm.elapsedSeconds % 60)
    }

    /// İpucu iste: tekniği açıkla ve ardından hücreyi doldur.
    private func requestHint() {
        guard let hint = vm.currentHint() else {
            withAnimation { hintText = "Şu an mantıksal bir ipucu bulunamadı." }
            return
        }
        withAnimation {
            hintText = "\(hint.technique.rawValue): \(hint.explanation)"
        }
        vm.applyHint()
    }

    private var winOverlay: some View {
        ZStack {
            Color.black.opacity(0.4).ignoresSafeArea()
            VStack(spacing: 12) {
                Text("Tebrikler!")
                    .font(Theme.brand(34))
                    .foregroundStyle(Theme.Palette.inkPrimary)
                Text("Süre: \(timeString) · İpucu: \(vm.hintsUsed)")
                    .font(.system(size: 15, design: .rounded))
                    .foregroundStyle(Theme.Palette.inkPrimary.opacity(0.7))
            }
            .padding(32)
            .background(Theme.Palette.boardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .shadow(radius: 20)
        }
    }
}
