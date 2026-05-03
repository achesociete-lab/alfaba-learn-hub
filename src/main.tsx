import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ─── Google Analytics 4 ───────────────────────────────────────────────────────
const GA_ID = import.meta.env.VITE_GA_ID;
if (GA_ID && import.meta.env.MODE === "production") {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  gtag("js", new Date());
  gtag("config", GA_ID, {
    page_path: window.location.pathname,
    anonymize_ip: true,
    cookie_flags: "SameSite=None;Secure",
  });
  (window as any).gtag = gtag;
}

// ─── Sentry Error Monitoring (disabled — package not installed) ───────────────

// ─── Mount App ────────────────────────────────────────────────────────────────
createRoot(document.getElementById("root")!).render(<App />);
