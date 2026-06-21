/// İnsan çözüm teknikleri (kolaydan zora). Faz 1 yalnızca single'ları içerir.
public enum Technique: String, Sendable {
    case nakedSingle = "Tek Aday"
    case hiddenSingle = "Gizli Tek"

    /// Oyuncuya gösterilecek sade açıklama.
    public var explanation: String {
        switch self {
        case .nakedSingle:
            return "Bu hücreye yalnızca tek bir rakam girebiliyor; diğer tüm rakamlar komşularında kullanılmış."
        case .hiddenSingle:
            return "Bu rakam, satır/sütun/kutu içinde yalnızca bu hücreye girebiliyor."
        }
    }
}

/// Bir sonraki mantıklı hamle.
public struct Hint: Equatable, Sendable {
    public let technique: Technique
    public let coordinate: Coordinate
    public let value: Int
    public var explanation: String { technique.explanation }

    public init(technique: Technique, coordinate: Coordinate, value: Int) {
        self.technique = technique
        self.coordinate = coordinate
        self.value = value
    }
}
