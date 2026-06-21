/// Tahtadaki bir hücrenin konumu (0-8 satır, 0-8 sütun).
public struct Coordinate: Hashable, Sendable {
    public let row: Int
    public let col: Int

    public init(row: Int, col: Int) {
        self.row = row
        self.col = col
    }

    /// 0-8 arası 3x3 kutu numarası (soldan sağa, yukarıdan aşağı).
    public var boxIndex: Int { (row / 3) * 3 + (col / 3) }

    /// Tahtadaki 81 koordinatın tamamı.
    public static let all: [Coordinate] = {
        var result: [Coordinate] = []
        for r in 0..<9 { for c in 0..<9 { result.append(Coordinate(row: r, col: c)) } }
        return result
    }()

    /// Aynı satır, sütun veya kutuyu paylaşan diğer hücreler (kendisi hariç, eşsiz).
    public var peers: Set<Coordinate> {
        var set = Set<Coordinate>()
        for c in 0..<9 where c != col { set.insert(Coordinate(row: row, col: c)) }
        for r in 0..<9 where r != row { set.insert(Coordinate(row: r, col: col)) }
        let boxRow = (row / 3) * 3
        let boxCol = (col / 3) * 3
        for r in boxRow..<boxRow+3 {
            for c in boxCol..<boxCol+3 where !(r == row && c == col) {
                set.insert(Coordinate(row: r, col: c))
            }
        }
        return set
    }
}
