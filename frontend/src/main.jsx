import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { LanguageProvider } from "./i18n/LanguageProvider.jsx";
// Agar ThemeProvider bo'lsa va ishlatsangiz:
// import { ThemeProvider } from "./components/ThemeProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ThemeProvider bo'lsa shu yerga qo'yasiz */}
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </React.StrictMode>
);