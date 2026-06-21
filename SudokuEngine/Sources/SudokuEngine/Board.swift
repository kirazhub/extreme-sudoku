/// 9x9 Sudoku tahtası. Hücre değeri 1-9 veya boş (nil).
public struct Board: Equatable, Sendable {
    /// 81 elemanlı düz dizi (row-major). 0 = boş, 1-9 = değer.
    private var cells: [Int]

    private init(cells: [Int]) { self.cells = cells }

    public static let empty = Board(cells: Array(repeating: 0, count: 81))

    /// "53..7...." gibi 81 karakterlik dizeden oluştur. '.' veya '0' boş demektir.
    public init?(string: String) {
        let chars = Array(string)
        guard chars.count == 81 else { return nil }
        var cells = [Int]()
        cells.reserveCapacity(81)
        for ch in chars {
            if ch == "." || ch == "0" {
                cells.append(0)
            } else if let d = ch.wholeNumberValue, (1...9).contains(d) {
                cells.append(d)
            } else {
                return nil
            }
        }
        self.cells = cells
    }

    private func index(_ c: Coordinate) -> Int { c.row * 9 + c.col }

    /// Hücre değeri: nil = boş, 1-9 = dolu.
    public subscript(_ c: Coordinate) -> Int? {
        get { let v = cells[index(c)]; return v == 0 ? nil : v }
        set { cells[index(c)] = newValue ?? 0 }
    }

    public var filledCount: Int { cells.lazy.filter { $0 != 0 }.count }
    public var isFull: Bool { !cells.contains(0) }

    /// 81 karakterlik dize gösterimi (boş = '.').
    public var stringValue: String {
        String(cells.map { $0 == 0 ? "." : Character("\($0)") })
    }
}
