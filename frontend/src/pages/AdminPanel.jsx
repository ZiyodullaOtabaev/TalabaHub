import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import {
    ShieldCheck, Crown, User2, Shield, BarChart3, Megaphone,
    Users, UserCheck, TrendingUp, CheckCircle2, Plus, Trash2,
    Eye, MousePointer, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ===== STATISTIKA TAB =====
function StatsTab() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/users/admin/statistics/");
                setStats(res.data);
            } catch {
                toast.error("Statistika yuklanmadi");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div className="th-card text-center py-10 opacity-60">Yuklanmoqda...</div>;
    if (!stats) return null;

    const cards = [
        { label: "Jami foydalanuvchilar", value: stats.users.total, icon: <Users size={20} />, color: "bg-indigo-500" },
        { label: "Aktiv (24 soat)", value: stats.users.active_24h, icon: <UserCheck size={20} />, color: "bg-emerald-500" },
        { label: "Aktiv (7 kun)", value: stats.users.active_7d, icon: <UserCheck size={20} />, color: "bg-sky-500" },
        { label: "Bugun yangi", value: stats.users.new_today, icon: <TrendingUp size={20} />, color: "bg-amber-500" },
        { label: "Bu hafta yangi", value: stats.users.new_this_week, icon: <TrendingUp size={20} />, color: "bg-orange-500" },
        { label: "Bu oy yangi", value: stats.users.new_this_month, icon: <TrendingUp size={20} />, color: "bg-rose-500" },
        { label: "Premium", value: stats.users.premium, icon: <Crown size={20} />, color: "bg-purple-500" },
        { label: "Vazifalar bajarildi", value: `${stats.tasks.completion_rate}%`, icon: <CheckCircle2 size={20} />, color: "bg-teal-500" },
    ];

    return (
        <div className="space-y-6">
            {/* Raqamlar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((c, i) => (
                    <div key={i} className="th-card flex items-center gap-3 p-4">
                        <div className={`w-10 h-10 rounded-xl ${c.color} text-white grid place-items-center shrink-0`}>
                            {c.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold">{c.value}</div>
                            <div className="text-xs opacity-60">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* O'sish grafigi */}
            <div className="th-card p-6">
                <h3 className="font-bold mb-4">Kunlik yangi foydalanuvchilar (30 kun)</h3>
                {stats.daily_growth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={stats.daily_growth}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(d) => d.slice(5)}
                            />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip
                                labelFormatter={(d) => `Sana: ${d}`}
                                formatter={(v) => [`${v} ta`, "Yangi"]}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                fill="#6366f1"
                                fillOpacity={0.15}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-8 opacity-50">Ma'lumot hali yo'q</div>
                )}
            </div>

            {/* Qo'shimcha statistika */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="th-card p-4">
                    <div className="text-sm font-bold opacity-60 mb-1">Vazifalar</div>
                    <div className="text-xl font-extrabold">{stats.tasks.total} ta</div>
                    <div className="text-sm">
                        Bajarilgan: {stats.tasks.completed} ({stats.tasks.completion_rate}%)
                    </div>
                </div>
                <div className="th-card p-4">
                    <div className="text-sm font-bold opacity-60 mb-1">Fanlar (GPA)</div>
                    <div className="text-xl font-extrabold">{stats.subjects_count} ta</div>
                </div>
                <div className="th-card p-4">
                    <div className="text-sm font-bold opacity-60 mb-1">Bannerlar</div>
                    <div className="text-xl font-extrabold">{stats.banners.active} ta faol</div>
                    <div className="text-sm flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><Eye size={13} /> {stats.banners.total_impressions}</span>
                        <span className="inline-flex items-center gap-1"><MousePointer size={13} /> {stats.banners.total_clicks}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== FOYDALANUVCHILAR TAB =====
function UsersTab() {
    const { t } = useLang();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    async function load(q) {
        try {
            const res = await api.get("/api/users/admin/users/", {
                params: q ? { search: q } : {},
            });
            setUsers(res.data?.results || res.data || []);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Xatolik");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const id = setTimeout(() => load(search), 300);
        return () => clearTimeout(id);
    }, [search]);

    async function toggleAdmin(u) {
        try {
            await api.post(`/api/users/admin/users/${u.id}/set-admin/`, { is_admin: !u.is_staff });
            toast.success("OK");
            load(search);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Xatolik");
        }
    }

    async function toggleBan(u) {
        const reason = u.is_banned ? "" : (prompt("Ban sababi (ixtiyoriy):") || "");
        try {
            await api.post(`/api/users/admin/users/${u.id}/ban/`, {
                is_banned: !u.is_banned,
                reason,
            });
            toast.success(u.is_banned ? "Unban qilindi" : "Ban qilindi");
            load(search);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Xatolik");
        }
    }

    function roleBadge(u) {
        if (u.is_superuser) return { label: t.roleOwner || "Egasi", cls: "bg-amber-500", icon: <Crown size={13} /> };
        if (u.is_staff) return { label: t.roleAdmin || "Admin", cls: "bg-indigo-500", icon: <Shield size={13} /> };
        return { label: t.roleStudent || "Talaba", cls: "bg-slate-500", icon: <User2 size={13} /> };
    }

    return (
        <div className="space-y-4">
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Username yoki email bo'yicha qidirish..."
                className="w-full px-4 py-2 rounded-xl border bg-transparent"
            />
            <div className="th-card overflow-x-auto">
                {loading ? (
                    <div className="text-sm opacity-50 py-4 text-center">Yuklanmoqda...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase opacity-50 border-b">
                                <th className="py-2 pr-2">{t.colUser || "Foydalanuvchi"}</th>
                                <th className="py-2 pr-2">{t.colRole || "Roli"}</th>
                                <th className="py-2 pl-2 text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const r = roleBadge(u);
                                return (
                                    <tr key={u.id} className="border-b last:border-0">
                                        <td className="py-3 pr-2">
                                            <div className="font-semibold">@{u.username}</div>
                                            {u.email && <div className="text-xs opacity-50">{u.email}</div>}
                                        </td>
                                        <td className="py-3 pr-2">
                                            <span className={`inline-flex items-center gap-1 text-xs text-white px-2 py-1 rounded-full ${r.cls}`}>
                                                {r.icon}{r.label}
                                            </span>
                                        </td>
                                        <td className="py-3 pl-2 text-right flex items-center gap-2 justify-end">
                                            {!u.is_superuser && (
                                                <>
                                                    <button
                                                        onClick={() => toggleAdmin(u)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${u.is_staff ? "border text-red-500" : "bg-indigo-600 text-white"}`}
                                                    >
                                                        {u.is_staff ? (t.removeAdmin || "Olib tashlash") : (t.makeAdmin || "Admin qilish")}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleBan(u)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${u.is_banned ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
                                                    >
                                                        {u.is_banned ? "Unban" : "Ban"}
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ===== BANNERLAR TAB =====
function BannersTab() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [form, setForm] = useState({
        title: "",
        banner_type: "text",
        position: "dashboard_top",
        text_content: "",
        image_url: "",
        link_url: "",
        link_text: "",
        bg_color: "#4F46E5",
        text_color: "#ffffff",
        is_active: true,
        priority: 0,
        start_date: "",
        end_date: "",
    });

    async function loadBanners() {
        try {
            const res = await api.get("/api/banners/manage/");
            setBanners(res.data?.results || res.data || []);
        } catch {
            toast.error("Bannerlar yuklanmadi");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadBanners(); }, []);

    async function saveBanner(e) {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (!payload.start_date) delete payload.start_date;
            if (!payload.end_date) delete payload.end_date;
            await api.post("/api/banners/manage/", payload);
            toast.success("Banner yaratildi");
            setShowForm(false);
            setForm({ title: "", banner_type: "text", position: "dashboard_top", text_content: "", image_url: "", link_url: "", link_text: "", bg_color: "#4F46E5", text_color: "#ffffff", is_active: true, priority: 0, start_date: "", end_date: "" });
            loadBanners();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Xatolik");
        }
    }

    async function toggleBanner(id) {
        try {
            await api.post(`/api/banners/manage/${id}/toggle/`);
            loadBanners();
        } catch {
            toast.error("Xatolik");
        }
    }

    async function deleteBanner(id) {
        if (!confirm("Rostdan o'chirmoqchimisiz?")) return;
        try {
            await api.delete(`/api/banners/manage/${id}/`);
            toast.success("O'chirildi");
            loadBanners();
        } catch {
            toast.error("Xatolik");
        }
    }

    const positionLabels = {
        dashboard_top: "Dashboard tepasi",
        dashboard_bottom: "Dashboard pastki",
        sidebar: "Sidebar",
        fullwidth: "To'liq kenglik",
        popup: "Popup",
    };

    return (
        <div className="space-y-4">
            {!showForm ? (
                <button onClick={() => setShowForm(true)} className="th-btn-blue">
                    <Plus size={18} /> Yangi banner/e'lon
                </button>
            ) : (
                <div className="th-card p-5">
                    <form onSubmit={saveBanner} className="grid gap-3 md:grid-cols-2">
                        <input
                            className="th-input"
                            placeholder="Sarlavha (ichki nom)"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                        <select
                            className="th-input"
                            value={form.banner_type}
                            onChange={(e) => setForm({ ...form, banner_type: e.target.value })}
                        >
                            <option value="text">Matnli e'lon</option>
                            <option value="image">Rasm banner</option>
                            <option value="html">HTML</option>
                        </select>
                        <select
                            className="th-input"
                            value={form.position}
                            onChange={(e) => setForm({ ...form, position: e.target.value })}
                        >
                            <option value="dashboard_top">Dashboard tepasi</option>
                            <option value="dashboard_bottom">Dashboard pastki</option>
                            <option value="sidebar">Sidebar</option>
                            <option value="fullwidth">To'liq kenglik</option>
                            <option value="popup">Popup</option>
                        </select>
                        <input
                            className="th-input"
                            type="number"
                            placeholder="Prioritet (yuqori = birinchi)"
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                        />

                        {form.banner_type === "text" && (
                            <textarea
                                className="th-input md:col-span-2"
                                rows={2}
                                placeholder="E'lon matni"
                                value={form.text_content}
                                onChange={(e) => setForm({ ...form, text_content: e.target.value })}
                            />
                        )}
                        {form.banner_type === "image" && (
                            <input
                                className="th-input md:col-span-2"
                                placeholder="Rasm URL"
                                value={form.image_url}
                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                            />
                        )}

                        <input
                            className="th-input"
                            placeholder="Havola URL (ixtiyoriy)"
                            value={form.link_url}
                            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                        />
                        <input
                            className="th-input"
                            placeholder="Havola matni (masalan: Batafsil)"
                            value={form.link_text}
                            onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                        />

                        <div className="flex items-center gap-2">
                            <label className="text-sm">Fon:</label>
                            <input type="color" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="w-10 h-8 rounded cursor-pointer" />
                            <label className="text-sm ml-3">Matn:</label>
                            <input type="color" value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className="w-10 h-8 rounded cursor-pointer" />
                        </div>

                        <div className="flex items-center gap-4">
                            <div>
                                <label className="text-xs opacity-60">Boshlanish</label>
                                <input type="datetime-local" className="th-input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs opacity-60">Tugash</label>
                                <input type="datetime-local" className="th-input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex gap-2">
                            <button type="submit" className="th-btn-blue">Saqlash</button>
                            <button type="button" className="rounded-xl border px-4 py-3 font-semibold" onClick={() => setShowForm(false)}>Bekor</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bannerlar ro'yxati */}
            {loading ? (
                <div className="th-card text-center py-6 opacity-50">Yuklanmoqda...</div>
            ) : banners.length === 0 ? (
                <div className="th-card text-center py-6 opacity-50">Hali banner qo'shilmagan</div>
            ) : (
                <div className="space-y-3">
                    {banners.map((b) => (
                        <div key={b.id} className={`th-card p-4 flex items-center gap-4 ${!b.is_active ? "opacity-50" : ""}`}>
                            <div
                                className="w-12 h-12 rounded-xl shrink-0 grid place-items-center text-white text-lg font-bold"
                                style={{ background: b.bg_color || "#6366f1" }}
                            >
                                <Megaphone size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold truncate">{b.title}</div>
                                <div className="text-xs opacity-60 flex items-center gap-3">
                                    <span>{positionLabels[b.position] || b.position}</span>
                                    <span className="inline-flex items-center gap-1"><Eye size={12} /> {b.impressions}</span>
                                    <span className="inline-flex items-center gap-1"><MousePointer size={12} /> {b.clicks}</span>
                                    {b.ctr > 0 && <span>CTR: {b.ctr}%</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => toggleBanner(b.id)}
                                    className={`p-2 rounded-lg transition ${b.is_active ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                                    title={b.is_active ? "O'chirish" : "Yoqish"}
                                >
                                    {b.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                </button>
                                <button
                                    onClick={() => deleteBanner(b.id)}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                                    title="O'chirish"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ===== ADMIN PANEL (TABS) =====
export default function AdminPanel() {
    const { t } = useLang();
    const [tab, setTab] = useState("stats");

    const tabs = [
        { id: "stats", label: t.tabStats || "Statistika", icon: <BarChart3 size={16} /> },
        { id: "users", label: t.tabUsers || "Foydalanuvchilar", icon: <Users size={16} /> },
        { id: "banners", label: t.tabBanners || "E'lonlar", icon: <Megaphone size={16} /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white grid place-items-center">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t.adminTitle || "Admin Panel"}</h1>
                    <p className="mt-0.5 opacity-60">{t.adminSub || "Saytni boshqarish"}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit">
                {tabs.map((tb) => (
                    <button
                        key={tb.id}
                        onClick={() => setTab(tb.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                            tab === tb.id
                                ? "bg-white dark:bg-slate-700 shadow-sm"
                                : "opacity-60 hover:opacity-100"
                        }`}
                    >
                        {tb.icon} {tb.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === "stats" && <StatsTab />}
            {tab === "users" && <UsersTab />}
            {tab === "banners" && <BannersTab />}
        </div>
    );
}
