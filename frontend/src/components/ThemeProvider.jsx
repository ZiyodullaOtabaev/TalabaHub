import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // localStorage bo'lmasa default light
        const saved = localStorage.getItem("theme");
        return saved === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        const root = document.documentElement;

        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");

        localStorage.setItem("theme", theme);
    }, [theme]);

    // Agar user inspect/console qilib class o'zgartirsa ham sync bo'lsin (optional)
    useEffect(() => {
        const root = document.documentElement;
        const obs = new MutationObserver(() => {
            const hasDark = root.classList.contains("dark");
            const next = hasDark ? "dark" : "light";
            const stored = localStorage.getItem("theme");
            // faqat farq bo'lsa yangilaymiz
            if (stored !== next) localStorage.setItem("theme", next);
        });
        obs.observe(root, { attributes: true, attributeFilter: ["class"] });
        return () => obs.disconnect();
    }, []);

    const value = useMemo(() => {
        return {
            theme,
            setTheme,
            toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        };
    }, [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
}