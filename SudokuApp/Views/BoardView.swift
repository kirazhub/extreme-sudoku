import SwiftUI
import SudokuEngine

/// 9x9 Sudoku tahtası: hücreler + ince/kalın ızgara çizgileri + dokunma seçimi.
struct BoardView: View {
    @ObservedObject var vm: GameViewModel

    var body: some View {
        GeometryReader { geo in
            // Tahta her zaman kare; mevcut alanın küçük kenarına göre boyutlanır.
            let side = min(geo.size.width, geo.size.height)
            let cell = side / 9
            ZStack {
                // 81 hücreyi tek tek konumlandır.
                ForEach(0..<9, id: \.self) { r in
                    ForEach(0..<9, id: \.self) { c in
                        let coord = Coordinate(row: r, col: c)
                        CellView(
                            value: vm.value(at: coord),
                            notes: vm.notes(at: coord),
                            isGiven: vm.isGiven(coord),
                            isSelected: vm.selected == coord,
                            isHighlighted: isPeerHighlighted(coord),
                            isSameValue: isSameValue(coord),
                            isMistake: vm.isMistake(coord)
                        )
                        .frame(width: cell, height: cell)
                        .position(x: cell * (CGFloat(c) + 0.5),
                                  y: cell * (CGFloat(r) + 0.5))
                        .onTapGesture { vm.select(coord) }
                    }
                }
                gridLines(cell: cell, side: side)
            }
            .frame(width: side, height: side)
            .background(Theme.Palette.boardBackground)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    /// Seçili hücrenin satır/sütun/kutu peer'larını vurgular.
    private func isPeerHighlighted(_ c: Coordinate) -> Bool {
        guard let sel = vm.selected, sel != c else { return false }
        return sel.row == c.row || sel.col == c.col || sel.boxIndex == c.boxIndex
    }

    /// Seçili hücreyle aynı değere sahip diğer hücreleri öne çıkarır.
    private func isSameValue(_ c: Coordinate) -> Bool {
        guard let sel = vm.selected,
              let v = vm.value(at: sel),
              let cv = vm.value(at: c),
              sel != c else { return false }
        return v == cv
    }

    /// 10 yatay + 10 dikey ince çizgi; 4 yatay + 4 dikey kalın ayraç (3x3 kutular için).
    private func gridLines(cell: CGFloat, side: CGFloat) -> some View {
        Path { path in
            for i in 0...9 {
                let p = cell * CGFloat(i)
                path.move(to: CGPoint(x: p, y: 0)); path.addLine(to: CGPoint(x: p, y: side))
                path.move(to: CGPoint(x: 0, y: p)); path.addLine(to: CGPoint(x: side, y: p))
            }
        }
        .stroke(Theme.Palette.gridLine, lineWidth: 1)
        .overlay(
            Path { path in
                for i in stride(from: 0, through: 9, by: 3) {
                    let p = cell * CGFloat(i)
                    path.move(to: CGPoint(x: p, y: 0)); path.addLine(to: CGPoint(x: p, y: side))
                    path.move(to: CGPoint(x: 0, y: p)); path.addLine(to: CGPoint(x: side, y: p))
                }
            }
            .stroke(Theme.Palette.gridLineBold, lineWidth: 2.5)
        )
        .allowsHitTesting(false)
    }
}
