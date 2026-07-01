import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    Sun,
    Moon,
    Menu,
    X,
    ChevronDown,
    Languages,
    LogOut,
    User2,
    Bell,
    LayoutGrid,
    BookOpen,
} from "lucide-react";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { useTheme } from "./ThemeProvider";
import { computeNotifications } from "../lib/notifications";

function cn(...xs) {
    return xs.filter(Boolean).join(" ");
}

function useOutsideClick(ref, handler) {
    useEffect(() => {
        function onDown(e) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) handler();
        }
        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("touchstart", onDown);
        };
    }, [ref, handler]);
}

function NavItem({ to, children, onClick, icon: Icon }) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                cn(
                    "px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                    "hover:translate-y-[-1px] active:translate-y-0",
                    isActive
                        ? "text-white shadow-md"
                        : "text-[color:var(--text)] hover:bg-[color:var(--accent-glow)]"
                )
            }
            style={({ isActive }) => isActive ? { background: "var(--gradient-primary)" } : undefined}
        >
            <span className="flex items-center gap-1.5">
                {Icon && <Icon size={15} />}
                {children}
            </span>
        </NavLink>
    );
}

function ChipButton({ children, onClick, title, className }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
                "bg-[color:var(--surface)] hover:bg-[color:var(--surface-3)] hover:border-[color:var(--border-accent)]",
                className
            )}
        >
            {children}
        </button>
    );
}

function LanguageModal({ open, onClose, onPick, t, isDark }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className={cn(
                "relative w-[92%] max-w-md rounded-3xl shadow-2xl border p-6",
                isDark ? "bg-[#1e1b4b]/95 border-indigo-500/20" : "bg-white border-gray-200"
            )}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-extrabold">{t.chooseLanguage}</div>
                        <div className={cn("text-sm mt-1", isDark ? "text-indigo-300" : "text-gray-600")}>{t.chooseLanguageDesc}</div>
                    </div>
                    <button
                        type="button"
                        className={cn(
                            "px-3 py-1.5 rounded-xl border text-sm font-semibold transition",
                            isDark ? "border-indigo-500/30 hover:bg-indigo-500/10" : "border-gray-200 hover:bg-gray-50"
                        )}
                        onClick={onClose}
                    >
                        {t.close}
                    </button>
                </div>

                <div className="mt-5 grid gap-2.5">
                    <button
                        type="button"
                        onClick={() => onPick("uz")}
                        className={cn(
                            "w-full text-left px-4 py-3.5 rounded-2xl border transition font-semibold",
                            isDark ? "border-indigo-500/20 hover:bg-indigo-500/10 hover:border-yellow-400/30" : "border-gray-200 hover:bg-yellow-50 hover:border-yellow-300"
                        )}
                    >
                        🇺🇿 {t.langUz}
                    </button>
                    <button
                        type="button"
                        onClick={() => onPick("en")}
                        className={cn(
                            "w-full text-left px-4 py-3.5 rounded-2xl border transition font-semibold",
                            isDark ? "border-indigo-500/20 hover:bg-indigo-500/10 hover:border-blue-400/30" : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        )}
                    >
                        🇬🇧 {t.langEn}
                    </button>
                    <button
                        type="button"
                        onClick={() => onPick("ru")}
                        className={cn(
                            "w-full text-left px-4 py-3.5 rounded-2xl border transition font-semibold",
                            isDark ? "border-indigo-500/20 hover:bg-indigo-500/10 hover:border-red-400/30" : "border-gray-200 hover:bg-red-50 hover:border-red-300"
                        )}
                    >
                        🇷🇺 {t.langRu}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Theme (markaziy ThemeProvider orqali)
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    const { t, lang, setLang, hasChosenLang, markChosen } = useLang();

    // Language modal
    const [langModalOpen, setLangModalOpen] = useState(false);

    // Menus
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);

    const userRef = useRef(null);
    const langRef = useRef(null);
    const moreRef = useRef(null);
    useOutsideClick(userRef, () => setUserMenuOpen(false));
    useOutsideClick(langRef, () => setLangMenuOpen(false));
    useOutsideClick(moreRef, () => setMoreMenuOpen(false));

    // User
    const [me, setMe] = useState(null);

    // Bildirishnomalar soni (vazifalardan)
    const [notifCount, setNotifCount] = useState(0);

    // "More" menyudagi linklar — Assistant olib tashlandi
    const secondaryLinks = [
        ["/timetable", t.navTimetable],
        ["/goals", t.navGoals],
        ["/focus", t.navFocus],
        ["/board", t.navBoard],
        ["/leaderboard", t.navLeaderboard],
        ...(me?.is_superuser ? [["/admin-panel", t.navAdmin]] : []),
    ];

    useEffect(() => {
        // first dashboard open => ask language
        if (location.pathname === "/dashboard" && !hasChosenLang) {
            setLangModalOpen(true);
        }
    }, [location.pathname, hasChosenLang]);

    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
        setLangMenuOpen(false);
        setMoreMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/users/me/");
                setMe(res.data);
            } catch {
                // ignore
            }
        })();
    }, []);

    useEffect(() => {
        async function loadNotif() {
            try {
                const res = await api.get("/api/planner/tasks/");
                setNotifCount(computeNotifications(res.data || []).count);
            } catch {
                // ignore
            }
        }
        loadNotif();
        const id = setInterval(loadNotif, 60000);
        return () => clearInterval(id);
    }, [location.pathname]);

    function logout() {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
    }

    function pickLang(code) {
        setLang(code);
        markChosen();
        setLangModalOpen(false);
    }

    const initials =
        (me?.username || me?.email || "U").slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen transition-colors duration-300">
            <LanguageModal
                open={langModalOpen}
                onClose={() => setLangModalOpen(false)}
                onPick={pickLang}
                t={t}
                isDark={isDark}
            />

            {/* NAVBAR */}
            <header className={cn(
                "sticky top-0 z-50 border-b backdrop-blur-xl",
                isDark
                    ? "bg-[rgba(15,13,35,0.85)] border-indigo-500/10"
                    : "bg-white/80 border-gray-200/80"
            )}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Brand */}
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-3 group"
                        title="TalabaHub"
                    >
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-white shadow-md transition-transform group-hover:scale-105"
                            style={{ background: "var(--gradient-primary)" }}
                        >
                            TH
                        </div>
                        <div className="text-left leading-tight">
                            <div className="text-lg font-extrabold th-gradient-text">TalabaHub</div>
                            <div className={cn("text-xs", isDark ? "text-indigo-300" : "text-gray-500")}>{t.brandSub}</div>
                        </div>
                    </button>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1.5">
                        <NavItem to="/dashboard">{t.navDashboard}</NavItem>
                        <NavItem to="/gpa">{t.navGpa}</NavItem>
                        <NavItem to="/planner">{t.navPlanner}</NavItem>
                        <NavItem to="/chat">{t.navChat}</NavItem>
                        {/* Resources/Maqolalar - navbar'da ko'rinadi */}
                        <NavItem to="/resources" icon={BookOpen}>{t.navResources}</NavItem>

                        {/* More dropdown */}
                        <div className="relative" ref={moreRef}>
                            <ChipButton
                                onClick={() => setMoreMenuOpen((v) => !v)}
                                title={t.moreMenu}
                                className={cn(isDark ? "border-indigo-500/20 text-indigo-200" : "border-gray-200")}
                            >
                                <LayoutGrid size={16} />
                                <span>{t.moreMenu}</span>
                                <ChevronDown size={16} className={cn("transition", moreMenuOpen && "rotate-180")} />
                            </ChipButton>

                            {moreMenuOpen && (
                                <div className={cn(
                                    "absolute left-0 mt-2 w-52 rounded-2xl border shadow-xl overflow-hidden z-50 backdrop-blur-xl",
                                    isDark ? "bg-[#1e1b4b]/95 border-indigo-500/20" : "bg-white border-gray-200"
                                )}>
                                    {secondaryLinks.map(([to, label]) => (
                                        <NavLink
                                            key={to}
                                            to={to}
                                            className={({ isActive }) => cn(
                                                "block px-4 py-2.5 text-sm font-semibold transition",
                                                isActive
                                                    ? "text-white"
                                                    : (isDark ? "text-indigo-200 hover:bg-indigo-500/10" : "text-gray-700 hover:bg-gray-50")
                                            )}
                                            style={({ isActive }) => isActive ? { background: "var(--gradient-primary)" } : undefined}
                                        >
                                            {label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notifications bell */}
                        <button
                            type="button"
                            onClick={() => navigate("/notifications")}
                            title={t.navNotifications}
                            className={cn(
                                "relative ml-1 p-2 rounded-xl border transition-all duration-200",
                                "hover:border-[color:var(--border-accent)]",
                                isDark ? "border-indigo-500/20 text-indigo-200 hover:bg-indigo-500/10" : "border-gray-200 hover:bg-indigo-50"
                            )}
                        >
                            <Bell size={18} />
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center animate-pulse">
                                    {notifCount > 9 ? "9+" : notifCount}
                                </span>
                            )}
                        </button>

                        {/* Language menu */}
                        <div className="relative ml-1" ref={langRef}>
                            <ChipButton
                                onClick={() => setLangMenuOpen((v) => !v)}
                                title="Language"
                                className={cn(isDark ? "border-indigo-500/20 text-indigo-200" : "border-gray-200")}
                            >
                                <Languages size={16} />
                                <span className="uppercase">{(lang || "uz")}</span>
                                <ChevronDown size={16} className={cn("transition", langMenuOpen && "rotate-180")} />
                            </ChipButton>

                            {langMenuOpen && (
                                <div className={cn(
                                    "absolute right-0 mt-2 w-48 rounded-2xl border shadow-xl overflow-hidden backdrop-blur-xl",
                                    isDark ? "bg-[#1e1b4b]/95 border-indigo-500/20" : "bg-white border-gray-200"
                                )}>
                                    <button className={cn("w-full text-left px-4 py-2.5 text-sm font-semibold transition",
                                        isDark ? "text-indigo-200 hover:bg-indigo-500/10" : "hover:bg-yellow-50"
                                    )} onClick={() => pickLang("uz")}>
                                        🇺🇿 {t.langUz}
                                    </button>
                                    <button className={cn("w-full text-left px-4 py-2.5 text-sm font-semibold transition",
                                        isDark ? "text-indigo-200 hover:bg-indigo-500/10" : "hover:bg-blue-50"
                                    )} onClick={() => pickLang("en")}>
                                        🇬🇧 {t.langEn}
                                    </button>
                                    <button className={cn("w-full text-left px-4 py-2.5 text-sm font-semibold transition",
                                        isDark ? "text-indigo-200 hover:bg-indigo-500/10" : "hover:bg-red-50"
                                    )} onClick={() => pickLang("ru")}>
                                        🇷🇺 {t.langRu}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Theme toggle */}
                        <ChipButton
                            onClick={toggleTheme}
                            title="Theme"
                            className={cn(
                                "ml-1",
                                isDark ? "border-indigo-500/20 text-yellow-300 hover:bg-yellow-500/10" : "border-gray-200 text-indigo-600 hover:bg-indigo-50"
                            )}
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </ChipButton>

                        {/* User menu */}
                        <div className="relative ml-2" ref={userRef}>
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen((v) => !v)}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded-2xl transition-all duration-200",
                                    isDark ? "hover:bg-indigo-500/10" : "hover:bg-gray-50"
                                )}
                            >
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white text-sm"
                                    style={{ background: "var(--gradient-primary)" }}
                                >
                                    {initials}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <div className="text-sm font-bold leading-4">
                                        {me?.username || "User"}
                                    </div>
                                    <div className={cn("text-xs", isDark ? "text-indigo-300" : "text-gray-500")}>
                                        {me?.email || ""}
                                    </div>
                                </div>
                                <ChevronDown size={16} className={cn("transition", userMenuOpen && "rotate-180")} />
                            </button>

                            {userMenuOpen && (
                                <div className={cn(
                                    "absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl overflow-hidden backdrop-blur-xl",
                                    isDark ? "bg-[#1e1b4b]/95 border-indigo-500/20" : "bg-white border-gray-200"
                                )}>
                                    <button
                                        className={cn("w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition",
                                            isDark ? "text-indigo-200 hover:bg-indigo-500/10" : "hover:bg-gray-50"
                                        )}
                                        onClick={() => navigate("/profile")}
                                    >
                                        <User2 size={16} />
                                        {t.navProfile}
                                    </button>
                                    <button
                                        className={cn("w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition",
                                            "text-red-400",
                                            isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                                        )}
                                        onClick={logout}
                                    >
                                        <LogOut size={16} />
                                        {t.logout}
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Mobile buttons */}
                    <div className="md:hidden flex items-center gap-2">
                        <ChipButton
                            onClick={toggleTheme}
                            title="Theme"
                            className={cn(isDark ? "border-indigo-500/20 text-yellow-300" : "border-gray-200")}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </ChipButton>

                        <ChipButton
                            onClick={() => setMobileOpen((v) => !v)}
                            title="Menu"
                            className={cn(isDark ? "border-indigo-500/20 text-indigo-200" : "border-gray-200")}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </ChipButton>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className={cn(
                        "md:hidden border-t backdrop-blur-xl",
                        isDark ? "border-indigo-500/10 bg-[rgba(15,13,35,0.95)]" : "border-gray-200 bg-white/95"
                    )}>
                        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1.5">
                            <NavItem to="/dashboard" onClick={() => setMobileOpen(false)}>{t.navDashboard}</NavItem>
                            <NavItem to="/gpa" onClick={() => setMobileOpen(false)}>{t.navGpa}</NavItem>
                            <NavItem to="/planner" onClick={() => setMobileOpen(false)}>{t.navPlanner}</NavItem>
                            <NavItem to="/chat" onClick={() => setMobileOpen(false)}>{t.navChat}</NavItem>
                            <NavItem to="/resources" onClick={() => setMobileOpen(false)}>{t.navResources}</NavItem>
                            <NavItem to="/timetable" onClick={() => setMobileOpen(false)}>{t.navTimetable}</NavItem>
                            <NavItem to="/goals" onClick={() => setMobileOpen(false)}>{t.navGoals}</NavItem>
                            <NavItem to="/focus" onClick={() => setMobileOpen(false)}>{t.navFocus}</NavItem>
                            <NavItem to="/board" onClick={() => setMobileOpen(false)}>{t.navBoard}</NavItem>
                            <NavItem to="/leaderboard" onClick={() => setMobileOpen(false)}>{t.navLeaderboard}</NavItem>
                            <NavItem to="/notifications" onClick={() => setMobileOpen(false)}>
                                {t.navNotifications}{notifCount > 0 ? ` (${notifCount})` : ""}
                            </NavItem>
                            {me?.is_superuser && (
                                <NavItem to="/admin-panel" onClick={() => setMobileOpen(false)}>{t.navAdmin}</NavItem>
                            )}

                            <div className={cn("mt-3 rounded-2xl border p-4",
                                isDark ? "border-indigo-500/20 bg-indigo-500/5" : "border-gray-200 bg-gray-50"
                            )}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-extrabold">{me?.username || "User"}</div>
                                        <div className={cn("text-xs", isDark ? "text-indigo-300" : "text-gray-500")}>{me?.email || ""}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-sm"
                                        style={{ background: "var(--gradient-primary)" }}
                                    >
                                        {initials}
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <button
                                        className={cn("px-3 py-2 rounded-xl border font-semibold text-sm transition",
                                            isDark ? "border-indigo-500/20 hover:bg-indigo-500/10" : "border-gray-200 hover:bg-gray-100"
                                        )}
                                        onClick={() => navigate("/profile")}
                                    >
                                        {t.navProfile}
                                    </button>
                                    <button
                                        className="px-3 py-2 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition"
                                        onClick={logout}
                                    >
                                        {t.logout}
                                    </button>
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    <button className="px-3 py-2 rounded-xl bg-yellow-400 text-black font-extrabold text-sm" onClick={() => pickLang("uz")}>UZ</button>
                                    <button className="px-3 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-sm" onClick={() => pickLang("en")}>EN</button>
                                    <button className="px-3 py-2 rounded-xl bg-red-600 text-white font-extrabold text-sm" onClick={() => pickLang("ru")}>RU</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* PAGE */}
            <main className="max-w-7xl mx-auto p-6">{children}</main>

            <footer className={cn(
                "border-t backdrop-blur-xl",
                isDark ? "border-indigo-500/10 bg-[rgba(15,13,35,0.5)]" : "border-gray-200/80 bg-white/60"
            )}>
                <div className="max-w-7xl mx-auto px-4 py-4 text-sm flex justify-center">
                    <span className={isDark ? "text-indigo-400" : "text-gray-500"}>
                        © {new Date().getFullYear()} TalabaHub
                    </span>
                </div>
            </footer>
        </div>
    );
}
