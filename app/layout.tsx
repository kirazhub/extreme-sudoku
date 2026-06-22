import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

// Marka/baslik fontu: Fraunces — karakterli serif display
// latin-ext subset Turkce karakterleri (İ, Ğ, Ş vb.) icerir.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["500", "600", "700"],
});

// Arayuz + rakamlar: Outfit — geometrik sans, tnum acik
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// metadataBase: OG/twitter ve manifest URL'leri icin mutlak temel adres.
// Production'da NEXT_PUBLIC_SITE_URL ile override edilebilir; yoksa makul
// bir Vercel placeholder kullaniriz (uyariyi gidermek icin).
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://extreme-sudoku.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Extreme Sudoku",
  description: "Telefonda oyna: kolaydan imkânsıza Sudoku.",
  applicationName: "Extreme Sudoku",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sudoku",
  },
  formatDetection: {
    telephone: false,
  },
};

// Mobil oncelikli viewport: 100dvh duzgun calissin, zoom kapali.
// themeColor light/dark icin ayri tanimliyoruz ki iOS Safari status bar
// hangi temadaysak ona uysun.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF8F1" },
    { media: "(prefers-color-scheme: dark)", color: "#14161A" },
  ],
};

// FOUC onleyici: localStorage > sistem tercihi sirasiyla erkenden .dark
// sinifini html elemanina ekler. Sayfa boyanmadan once calistigi icin
// sicrama olmaz. Single quotes ile yazilmis, JSX'e string olarak gomulu.
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var k = 'extreme-sudoku-theme';
    var s = localStorage.getItem(k);
    var d = s === 'dark' || (!s && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Tema initilizasyonu - kritik, sayfa boyanmadan calismali */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full bg-bg text-ink">
        {children}
        {/* PWA SW kaydi — sadece production'da gercek is yapar */}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
