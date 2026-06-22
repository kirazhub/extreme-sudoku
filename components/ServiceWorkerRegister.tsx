"use client";

// Service worker kayit yardimcisi. Sadece production'da ve tarayici
// destekliyorsa kaydeder. Hata olursa sessizce gecer (PWA opsiyoneldir).

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // load eventinden sonra kaydet ki kritik render bloklanmasin.
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Kayit basarisizsa uygulama yine de calisir; ses cikarmiyoruz.
      });
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return null;
}
