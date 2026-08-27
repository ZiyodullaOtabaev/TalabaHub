import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

import { LanguageProvider } from "./i18n/LanguageProvider.jsx";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { initTelegramApp } from "./lib/telegramWebApp.js";

initTelegramApp();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <App />
              <Toaster position="top-right" />
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register PWA Service Worker
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
