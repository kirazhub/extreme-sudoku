import SwiftUI

/// Uygulamanın tasarım sistemi: renkler + fontlar tek yerden.
enum Theme {
    enum Palette {
        static let boardBackground = Color("BoardBackground")
        static let inkPrimary = Color("InkPrimary")
        static let inkUser = Color("InkUser")
        static let accent = Color("Accent")
        static let gridLine = Color("GridLine")
        static let gridLineBold = Color("GridLineBold")
        static let cellHighlight = Color("CellHighlight")
        static let cellSelected = Color("CellSelected")
        static let errorRed = Color("ErrorRed")
    }

    /// Marka başlık fontu (Instrument Serif — zarif editöryel serif).
    /// Bundle'da yoksa zarifçe sistem serif'e düşer.
    static func brand(_ size: CGFloat) -> Font {
        Font.custom("Instrument Serif", size: size)
    }

    /// Rakam fontu: yuvarlatılmış, tabular (rakamlar aynı genişlikte).
    static func numeral(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .rounded).monospacedDigit()
    }
}
