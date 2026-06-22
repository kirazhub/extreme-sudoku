/// İnsan tekniklerini sırayla deneyerek bir sonraki hamleyi bulur (ipucu motoru).
public enum LogicalSolver {
    /// Uygulanabilir en kolay tekniği döndürür; yoksa nil.
    public static func nextHint(for board: Board) -> Hint? {
        if let h = nakedSingle(board) { return h }
        if let h = hiddenSingle(board) { return h }
        return nil
    }

    /// Tek adayı kalan ilk boş hücre.
    static func nakedSingle(_ board: Board) -> Hint? {
        for coord in Coordinate.all where board[coord] == nil {
            let cands = Validator.candidates(at: coord, in: board)
            if cands.count == 1 {
                return Hint(technique: .nakedSingle, coordinate: coord, value: cands.first!)
            }
        }
        return nil
    }

    /// Bir birimde (satır/sütun/kutu) yalnızca tek hücreye girebilen rakam.
    static func hiddenSingle(_ board: Board) -> Hint? {
        for unit in Self.units {
            for value in 1...9 {
                let spots = unit.filter { board[$0] == nil && Validator.candidates(at: $0, in: board).contains(value) }
                if spots.count == 1 {
                    return Hint(technique: .hiddenSingle, coordinate: spots[0], value: value)
                }
            }
        }
        return nil
    }

    /// 27 birim: 9 satır + 9 sütun + 9 kutu.
    static let units: [[Coordinate]] = {
        var result: [[Coordinate]] = []
        for r in 0..<9 { result.append((0..<9).map { Coordinate(row: r, col: $0) }) }
        for c in 0..<9 { result.append((0..<9).map { Coordinate(row: $0, col: c) }) }
        for boxRow in stride(from: 0, to: 9, by: 3) {
            for boxCol in stride(from: 0, to: 9, by: 3) {
                var box: [Coordinate] = []
                for r in boxRow..<boxRow+3 { for c in boxCol..<boxCol+3 { box.append(Coordinate(row: r, col: c)) } }
                result.append(box)
            }
        }
        return result
    }()
}
