/// Backtracking ile tahta çözer ve çözüm sayar.
public enum Solver {
    /// İlk bulunan çözümü döndürür; çözülemezse nil.
    public static func solve(_ board: Board) -> Board? {
        guard Validator.isValid(board) else { return nil }
        var working = board
        return backtrack(&working) ? working : nil
    }

    /// Çözüm sayısını `limit`'e kadar sayar (benzersizlik testi için limit:2 yeterli).
    public static func countSolutions(_ board: Board, limit: Int) -> Int {
        guard Validator.isValid(board) else { return 0 }
        var working = board
        var count = 0
        countBacktrack(&working, count: &count, limit: limit)
        return count
    }

    /// En az adaylı boş hücreyi bulur (MRV sezgiseli — hızlı çözüm).
    private static func findBestEmpty(_ board: Board) -> (Coordinate, [Int])? {
        var best: (Coordinate, [Int])?
        for coord in Coordinate.all where board[coord] == nil {
            let cands = Array(Validator.candidates(at: coord, in: board))
            if cands.isEmpty { return (coord, []) } // çıkmaz sokak
            if best == nil || cands.count < best!.1.count {
                best = (coord, cands)
                if cands.count == 1 { break }
            }
        }
        return best
    }

    private static func backtrack(_ board: inout Board) -> Bool {
        guard let (coord, cands) = findBestEmpty(board) else { return true } // dolu = çözüldü
        if cands.isEmpty { return false }
        for v in cands {
            board[coord] = v
            if backtrack(&board) { return true }
            board[coord] = nil
        }
        return false
    }

    private static func countBacktrack(_ board: inout Board, count: inout Int, limit: Int) {
        if count >= limit { return }
        guard let (coord, cands) = findBestEmpty(board) else { count += 1; return }
        if cands.isEmpty { return }
        for v in cands {
            board[coord] = v
            countBacktrack(&board, count: &count, limit: limit)
            board[coord] = nil
            if count >= limit { return }
        }
    }
}
