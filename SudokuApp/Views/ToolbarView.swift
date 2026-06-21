import SwiftUI

/// Oyun ekranındaki yardımcı araçlar: geri al, sil, not modu, ipucu.
struct ToolbarView: View {
    @ObservedObject var vm: GameViewModel
    var onHint: () -> Void

    var body: some View {
        HStack(spacing: 28) {
            toolButton("arrow.uturn.backward", "Geri Al") { vm.undo() }
            toolButton("eraser", "Sil") { vm.erase() }
            toolButton(vm.isNoteMode ? "pencil.circle.fill" : "pencil.circle",
                       "Not",
                       active: vm.isNoteMode) { vm.isNoteMode.toggle() }
            toolButton("lightbulb", "İpucu", action: onHint)
        }
    }

    /// Ortak araç-butonu yapımı (ikon + altında küçük yazı).
    private func toolButton(_ icon: String,
                            _ label: String,
                            active: Bool = false,
                            action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon).font(.system(size: 22))
                Text(label).font(.system(size: 11, design: .rounded))
            }
            .foregroundStyle(active ? Theme.Palette.accent : Theme.Palette.inkPrimary)
            .frame(maxWidth: .infinity)
        }
    }
}
