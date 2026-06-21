/// Sudoku yerleştirme kurallarını kontrol eder.
public enum Validator {
    /// `value` (1-9), `coord`'a komşularıyla çakışmadan konabilir mi?
    public static func canPlace(_ value: Int, at coord: Coordinate, in board: Board) -> Bool {
        for peer in coord.peers where board[peer] == value {
            return false
        }
        return true
    }

    /// Bir hücreye konabilecek tüm geçerli adaylar (1-9 arası).
    public static func candidates(at coord: Coordinate, in board: Board) -> Set<Int> {
        guard board[coord] == nil else { return [] }
        var used = Set<Int>()
        for peer in coord.peers { if let v = board[peer] { used.insert(v) } }
        return Set(1...9).subtracting(used)
    }

    /// Tahta kurallara uygun mu (mevcut dolu hücrelerde çakışma yok)?
    public static func isValid(_ board: Board) -> Bool {
        for coord in Coordinate.all {
            guard let v = board[coord] else { continue }
            for peer in coord.peers where peer.row * 9 + peer.col > coord.row * 9 + coord.col {
                if board[peer] == v { return false }
            }
        }
        return true
    }
}
