import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// BLOC 10 — Enregistrement du service worker (PWA + cache hors-ligne)
// Désactivé en dev pour ne pas interférer avec Vite HMR.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;
    navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL })
      .catch((err) => console.warn("[SW] registration failed:", err));
  });
}
