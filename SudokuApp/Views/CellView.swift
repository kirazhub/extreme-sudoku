import SwiftUI
import SudokuEngine

/// Tahta üzerindeki tek bir hücre. Değer, notlar, seçim durumu ve hata rengini gösterir.
struct CellView: View {
    let value: Int?
    let notes: Set<Int>
    let isGiven: Bool
    let isSelected: Bool
    let isHighlighted: Bool
    let isSameValue: Bool
    let isMistake: Bool

    var body: some View {
        ZStack {
            background
            if let value {
                Text("\(value)")
                    .font(Theme.numeral(26, weight: isGiven ? .semibold : .regular))
                    .foregroundStyle(textColor)
            } else if !notes.isEmpty {
                notesGrid
            }
        }
        .aspectRatio(1, contentMode: .fit)
        .contentShape(Rectangle())
    }

    private var background: Color {
        if isSelected { return Theme.Palette.cellSelected }
        if isSameValue { return Theme.Palette.cellHighlight }
        if isHighlighted { return Theme.Palette.cellHighlight.opacity(0.5) }
        return .clear
    }

    private var textColor: Color {
        if isMistake { return Theme.Palette.errorRed }
        // Verilen (sabit) rakamlar koyu, oyuncunun girdikleri mavi-mürekkep.
        return isGiven ? Theme.Palette.inkPrimary : Theme.Palette.inkUser
    }

    /// 3x3 kalem işaretleri (notes) ızgarası — küçük puntoyla.
    private var notesGrid: some View {
        GeometryReader { geo in
            let cell = geo.size.width / 3
            ForEach(1...9, id: \.self) { n in
                if notes.contains(n) {
                    Text("\(n)")
                        .font(Theme.numeral(9))
                        .foregroundStyle(Theme.Palette.inkPrimary.opacity(0.55))
                        .frame(width: cell, height: cell)
                        .position(x: cell * (CGFloat((n - 1) % 3) + 0.5),
                                  y: cell * (CGFloat((n - 1) / 3) + 0.5))
                }
            }
        }
    }
}
