/**
 * Telegram WebApp (TMA) Helper Utilities
 */

export function isTelegramWebApp() {
    return typeof window !== "undefined" && Boolean(window.Telegram?.WebApp?.initData);
}

export function getTelegramUser() {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return null;
    return window.Telegram.WebApp.initDataUnsafe?.user || null;
}

export function initTelegramApp() {
    if (typeof window === "undefined" || !window.Telegram?.WebApp) return;

    const tg = window.Telegram.WebApp;
    try {
        tg.ready();
        tg.expand();

        // Ranglar mavzusini moslashtirish
        if (tg.colorScheme === "dark") {
            document.documentElement.classList.add("dark");
        }

        // Header rangi
        tg.setHeaderColor?.("#0b0c1b");
        tg.setBackgroundColor?.("#0b0c1b");
    } catch {
        /* ignore */
    }
}

export function triggerHaptic(type = "light") {
    if (typeof window === "undefined" || !window.Telegram?.WebApp?.HapticFeedback) return;
    try {
        if (type === "success" || type === "error" || type === "warning") {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
        } else {
            window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
        }
    } catch {
        /* ignore */
    }
}
