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
    PenSquare,
} from "lucide-react";
import api, { logout as serverLogout } from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "../hooks/useAuth";
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
    const { onLogout } = useAuth();

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
    const [chatUnread, setChatUnread] = useState(0);

    // "More" menyudagi linklar — Assistant olib tashlandi
    const secondaryLinks = [
        ...(me?.is_superuser ? [["/admin-panel", t.navAdmin]] : []),
    ];

    // Bo'limlar (grouped navigation)
    const navSections = [
        {
            label: t.navStudy || "O'qish",
            links: [
                ["/gpa", t.navGpa || "GPA"],
                ["/timetable", t.navTimetable || "Dars jadvali"],
                ["/leaderboard", t.navLeaderboard || "Reyting"],
            ],
        },
        {
            label: t.navPlan || "Reja",
            links: [
                ["/planner", t.navPlanner || "Planner"],
                ["/goals", t.navGoals || "Maqsadlar"],
                ["/focus", t.navFocus || "Fokus"],
            ],
        },
        {
            label: t.navGrow || "Rivojlanish",
            links: [
                ["/growth", t.navGrowth || "Shaxsiy rivojlanish"],
                ["/ielts", t.navIelts || "IELTS"],
                ["/german", t.navGerman || "Nemis tili"],
                ["/resources", t.navResources || "Materiallar"],
                ["/articles", t.navArticles || "Maqolalar"],
            ],
        },
        {
            label: t.navCommunity || "Jamoa",
            links: [
                ["/chat", t.navChat || "Chat"],
                ["/board", t.navBoard || "E'lonlar"],
            ],
        },
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
                const [tasksRes, boardRes, chatRes] = await Promise.all([
                    api.get("/api/planner/tasks/"),
                    api.get("/api/board/announcements/"),
                    api.get("/api/chat/messages/"),
                ]);
                const taskCount = computeNotifications(tasksRes.data?.results || tasksRes.data || []).count;
                // Faqat o'qilmaganlarni hisoblash (notif_read_at dan keyin yaratilganlar)
                const readAt = localStorage.getItem("notif_read_at")
                    ? new Date(localStorage.getItem("notif_read_at"))
                    : new Date(0);
                const allAds = boardRes.data?.results || boardRes.data || [];
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                const unreadAds = allAds.filter(a => {
                    const created = new Date(a.created_at);
                    return created >= threeDaysAgo && created > readAt;
                }).length;
                // Chat: o'qilmagan xabarlar
                const chatReadAt = localStorage.getItem("chat_read_at")
                    ? new Date(localStorage.getItem("chat_read_at"))
                    : new Date(0);
                const chatMsgs = chatRes.data?.results || chatRes.data || [];
                const unreadChat = chatMsgs.filter(m => new Date(m.created_at) > chatReadAt).length;
                setChatUnread(unreadChat);
                setNotifCount(taskCount + unreadAds);
            } catch {
                // ignore
            }
        }
        loadNotif();
        const id = setInterval(loadNotif, 60000);
        // "notif-read" eventi kelganda qayta hisoblash
        function onRead() { loadNotif(); }
        window.addEventListener("notif-read", onRead);
        return () => { clearInterval(id); window.removeEventListener("notif-read", onRead); };
    }, [location.pathname]);

    function logout() {
        serverLogout({ redirect: false });
        onLogout();
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
                "will-change-transform transform-gpu",
                isDark
                    ? "bg-[rgba(15,13,35,0.85)] border-indigo-500/10"
                    : "bg-white/80 border-gray-200/80"
            )}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Brand */}
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-3 group shrink-0"
                        title="TalabaHub"
                    >
                        <img src="/logo.png" alt="TalabaHub" className="w-10 h-10 rounded-2xl shadow-md transition-transform group-hover:scale-105" />
                        <div className="text-left leading-tight">
                            <div className="text-lg font-extrabold th-gradient-text">TalabaHub</div>
                            <div className={cn("text-xs", isDark ? "text-indigo-300" : "text-gray-500")}>{t.brandSub}</div>
                        </div>
                    </button>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1 ml-6">
                        <NavItem to="/dashboard">{t.navDashboard}</NavItem>

                        {navSections.map((section) => (
                            <div key={section.label} className="relative group">
                                <button className={cn(
                                    "px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                                    "hover:translate-y-[-1px] active:translate-y-0",
                                    isDark ? "text-indigo-200 hover:bg-indigo-500/10" : "text-gray-700 hover:bg-gray-100"
                                )}>
                                    {section.label}
                                    <ChevronDown size={14} className="inline ml-1 opacity-50" />
                                </button>
                                <div className={cn(
                                    "absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                                )}>
                                    <div className={cn(
                                        "w-48 rounded-2xl border shadow-xl overflow-hidden backdrop-blur-xl",
                                        isDark ? "bg-[#1e1b4b]/95 border-indigo-500/20" : "bg-white border-gray-200"
                                    )}>
                                        {section.links.map(([to, label]) => (
                                            <NavLink
                                                key={to}
                                                to={to}
                                                className={({ isActive }) => cn(
                                                    "block px-4 py-2.5 text-sm font-semibold transition relative",
                                                    isActive
                                                        ? "text-white"
                                                        : (isDark ? "text-indigo-200 hover:bg-indigo-500/10" : "text-gray-700 hover:bg-gray-50")
                                                )}
                                                style={({ isActive }) => isActive ? { background: "var(--gradient-primary)" } : undefined}
                                            >
                                                {label}
                                                {to === "/chat" && chatUnread > 0 && (
                                                    <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                                        {chatUnread > 9 ? "9+" : chatUnread}
                                                    </span>
                                                )}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {me?.is_superuser && (
                            <NavItem to="/admin-panel">{t.navAdmin || "Admin"}</NavItem>
                        )}

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
                        <button
                            type="button"
                            onClick={() => navigate("/notifications")}
                            title={t.navNotifications}
                            className={cn(
                                "relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
                                "bg-[color:var(--surface)] hover:bg-[color:var(--surface-3)] hover:border-[color:var(--border-accent)]",
                                isDark ? "border-indigo-500/20 text-indigo-200" : "border-gray-200"
                            )}
                        >
                            <Bell size={18} />
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center animate-pulse">
                                    {notifCount > 9 ? "9+" : notifCount}
                                </span>
                            )}
                        </button>

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
                        "md:hidden border-t animate-fade-in overflow-y-auto overscroll-contain max-h-[80vh]",
                        isDark ? "border-indigo-500/10 bg-[rgba(15,13,35,0.98)]" : "border-gray-200 bg-white/98"
                    )}>
                        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1.5 animate-stagger">
                            <NavItem to="/dashboard" onClick={() => setMobileOpen(false)}>{t.navDashboard}</NavItem>

                            {navSections.map((section) => (
                                <div key={section.label} className="mt-2">
                                    <div className={cn("text-xs font-bold uppercase tracking-wider px-3 py-1", isDark ? "text-indigo-400/60" : "text-gray-400")}>
                                        {section.label}
                                    </div>
                                    {section.links.map(([to, label]) => (
                                        <NavItem key={to} to={to} onClick={() => setMobileOpen(false)}>
                                            {label}
                                            {to === "/chat" && chatUnread > 0 && (
                                                <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                                    {chatUnread > 9 ? "9+" : chatUnread}
                                                </span>
                                            )}
                                        </NavItem>
                                    ))}
                                </div>
                            ))}

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
            <main className="max-w-7xl mx-auto p-4 sm:p-6 page-enter" key={location.pathname}>{children}</main>

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
