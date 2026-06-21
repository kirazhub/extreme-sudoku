/// Zorluk kademeleri (kolaydan zora). Faz 1: ipucu sayısı hedefiyle ayrılır;
/// Faz 2'de teknik-tabanlı derecelendirme eklenecek.
public enum Difficulty: Int, CaseIterable, Sendable {
    case easy, medium, hard, expert, ifrit, master

    public var displayName: String {
        switch self {
        case .easy: return "Kolay"
        case .medium: return "Orta"
        case .hard: return "Zor"
        case .expert: return "Uzman"
        case .ifrit: return "İfrit"
        case .master: return "Usta"
        }
    }

    /// Üreticinin tahtada bırakmaya çalışacağı yaklaşık ipucu (dolu hücre) sayısı.
    public var targetClues: Int {
        switch self {
        case .easy: return 40
        case .medium: return 34
        case .hard: return 30
        case .expert: return 27
        case .ifrit: return 24
        case .master: return 22
        }
    }
}
