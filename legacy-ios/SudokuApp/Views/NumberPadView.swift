import SwiftUI

/// 1-9 rakam tuş takımı. Her tuşa basıldığında `onTap` çağrılır.
struct NumberPadView: View {
    let onTap: (Int) -> Void
    var body: some View {
        HStack(spacing: 8) {
            ForEach(1...9, id: \.self) { n in
                Button { onTap(n) } label: {
                    Text("\(n)")
                        .font(Theme.numeral(28, weight: .medium))
                        .foregroundStyle(Theme.Palette.inkPrimary)
                        .frame(maxWidth: .infinity, minHeight: 52)
                        .background(Theme.Palette.cellHighlight.opacity(0.6))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
        }
    }
}
