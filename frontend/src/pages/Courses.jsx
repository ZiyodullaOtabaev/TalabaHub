import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
    BookOpen, Search, Filter, Plus, Lock, Globe,
    Play, Star, Users, Award, ShieldCheck, Sparkles, X, Key, CreditCard
} from "lucide-react";
import toast from "react-hot-toast";
import CheckoutModal from "../components/CheckoutModal";

export default function Courses() {
    const nav = useNavigate();
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [filterPrivate, setFilterPrivate] = useState("all"); // 'all', 'public', 'private'

    // Modal state for private code
    const [privateModalCourse, setPrivateModalCourse] = useState(null);
    const [checkoutCourse, setCheckoutCourse] = useState(null);
    const [accessCodeInput, setAccessCodeInput] = useState("");
    const [unlocking, setUnlocking] = useState(false);

    async function loadData() {
        setLoading(true);
        try {
            const catRes = await api.get("/api/courses/categories/");
            setCategories(catRes.data?.results || catRes.data || []);
        } catch { /* ignore */ }

        try {
            let url = `/api/courses/?`;
            if (search) url += `search=${encodeURIComponent(search)}&`;
            if (selectedCategory !== "all") url += `category=${selectedCategory}&`;
            if (selectedLevel !== "all") url += `level=${selectedLevel}&`;
            if (filterPrivate === "private") url += `is_private=true&`;
            if (filterPrivate === "public") url += `is_private=false&`;

            const res = await api.get(url);
            setCourses(res.data?.results || res.data || []);
        } catch {
            toast.error("Kurslarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [selectedCategory, selectedLevel, filterPrivate]);

    function handleSearchSubmit(e) {
        e.preventDefault();
        loadData();
    }

    async function handleUnlockPrivate(e) {
        e.preventDefault();
        if (!accessCodeInput.trim() || !privateModalCourse) return;

        setUnlocking(true);
        try {
            const res = await api.post(`/api/courses/${privateModalCourse.id}/access-private/`, {
                access_code: accessCodeInput.trim(),
            });
            toast.success(res.data?.detail || "Maxfiy kursga kirdingiz!");
            setPrivateModalCourse(null);
            setAccessCodeInput("");
            nav(`/courses/${privateModalCourse.id}`);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Noto'g'ri maxfiy kod!");
        } finally {
            setUnlocking(false);
        }
    }

    return (
        <div className="space-y-6">

            {/* HEADER BANNER */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-600/20 via-indigo-600/20 to-purple-600/20 border border-emerald-500/30 overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase">
                            <Sparkles size={14} /> Professional Akademiya
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Onlayn Kurslar & Video Akademiya</h1>
                        <p className="text-sm opacity-70">
                            IELTS, Nemis tili, CEFR va AKT sohasidagi sifatli video darslar. O'zingiz ham video kurs yuklang va daromad oling!
                        </p>
                    </div>

                    <button
                        onClick={() => nav("/create-course")}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-105 transition shrink-0"
                    >
                        <Plus size={18} /> Yangi Kurs Yaratish
                    </button>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="th-card p-4 space-y-4">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                            className="th-input !pl-10"
                            placeholder="Kurs nomi yoki mavzusi bo'yicha qidiring..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="th-btn-blue px-5 font-bold text-sm">
                        Qidirish
                    </button>
                </form>

                {/* Category tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                            selectedCategory === "all" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "th-card hover:scale-105"
                        }`}
                    >
                        Barcha Kategoriyalar
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                selectedCategory === cat.id ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "th-card hover:scale-105"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Extra filters */}
                <div className="flex items-center justify-between gap-4 text-xs font-semibold opacity-80 flex-wrap pt-1 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <span>Daraja:</span>
                        <select className="th-input !py-1 text-xs" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                            <option value="all">Barchasi</option>
                            <option value="beginner">Boshlang'ich</option>
                            <option value="intermediate">O'rta</option>
                            <option value="advanced">Yuqori</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setFilterPrivate("all")}
                            className={`px-3 py-1 rounded-lg ${filterPrivate === "all" ? "bg-indigo-600 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                        >
                            Hammasi
                        </button>
                        <button
                            onClick={() => setFilterPrivate("public")}
                            className={`px-3 py-1 rounded-lg ${filterPrivate === "public" ? "bg-indigo-600 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                        >
                            Ochiq Kurslar
                        </button>
                        <button
                            onClick={() => setFilterPrivate("private")}
                            className={`px-3 py-1 rounded-lg ${filterPrivate === "private" ? "bg-indigo-600 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                        >
                            Maxfiy Kurslar 🔒
                        </button>
                    </div>
                </div>
            </div>

            {/* PRIVATE COURSE ACCESS MODAL */}
            {privateModalCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="th-card p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setPrivateModalCourse(null)}
                            className="absolute top-4 right-4 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                        >
                            <X size={18} />
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 grid place-items-center mb-3">
                            <Lock size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Maxfiy Kursga Kirish</h3>
                        <p className="text-xs opacity-70 mb-4">
                            <b>"{privateModalCourse.title}"</b> kursi maxfiy hisoblanadi. O'qituvchidan olingan 6-xonali maxfiy kodni kiriting.
                        </p>

                        <form onSubmit={handleUnlockPrivate} className="space-y-3">
                            <div className="relative">
                                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                                <input
                                    className="th-input !pl-10 text-center font-mono font-bold tracking-widest uppercase text-lg"
                                    placeholder="MAXFIY KOD"
                                    maxLength={12}
                                    value={accessCodeInput}
                                    onChange={(e) => setAccessCodeInput(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={unlocking || !accessCodeInput.trim()}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm hover:scale-[1.02] transition disabled:opacity-50"
                            >
                                {unlocking ? "Tekshirilmoqda..." : "Kursni Ochish"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* COURSES GRID */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && <div className="col-span-full th-card p-12 text-center opacity-50">Kurslar yuklanmoqda...</div>}

                {!loading && courses.length === 0 && (
                    <div className="col-span-full th-card p-12 text-center space-y-3">
                        <BookOpen size={40} className="mx-auto opacity-30 text-emerald-500" />
                        <div className="text-lg font-bold">Hozircha kurslar topilmadi</div>
                        <p className="text-sm opacity-60 max-w-sm mx-auto">Birinchi bo'lib o'z video kursingizni yarating va boshqalar bilan ulashing!</p>
                        <button
                            onClick={() => nav("/create-course")}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
                        >
                            Kurs Yaratish
                        </button>
                    </div>
                )}

                {courses.map((c) => (
                    <div
                        key={c.id}
                        className="th-card card-3d overflow-hidden flex flex-col group cursor-pointer"
                        onClick={() => {
                            if (c.is_private && !c.is_enrolled) {
                                setPrivateModalCourse(c);
                            } else {
                                nav(`/courses/${c.id}`);
                            }
                        }}
                    >
                        {/* Cover image */}
                        <div className="relative aspect-video bg-slate-900 overflow-hidden">
                            <img
                                src={c.cover_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"}
                                alt={c.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Status badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                {c.is_private ? (
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950 font-extrabold text-[10px] flex items-center gap-1">
                                        <Lock size={12} /> Maxfiy
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white font-extrabold text-[10px] flex items-center gap-1">
                                        <Globe size={12} /> Ochiq
                                    </span>
                                )}
                            </div>

                            {/* Price tag */}
                            <div className="absolute top-3 right-3">
                                <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-white/20 text-emerald-400 font-black text-xs">
                                    {Number(c.price) > 0 ? `${Number(c.price).toLocaleString()} so'm` : "BEPUL"}
                                </span>
                            </div>

                            {/* Hover Play icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30">
                                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white grid place-items-center shadow-lg group-hover:scale-110 transition">
                                    <Play size={20} className="ml-1 fill-white" />
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                                {c.category_name && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                        {c.category_name}
                                    </span>
                                )}
                                <h3 className="font-extrabold text-lg leading-snug line-clamp-2 group-hover:text-emerald-400 transition">
                                    {c.title}
                                </h3>
                                <p className="text-xs opacity-60 line-clamp-2">{c.description || "Video darslar to'plami."}</p>
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                                <div className="opacity-70">
                                    <span className="font-semibold">@{c.instructor_name}</span> &middot; <span>{c.lessons_count || 0} dars</span>
                                </div>
                                {Number(c.price) > 0 && !c.is_enrolled && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCheckoutCourse(c);
                                        }}
                                        className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white font-extrabold text-xs transition flex items-center gap-1"
                                    >
                                        <CreditCard size={12} /> Sotib Olish
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Course Checkout Modal */}
            <CheckoutModal
                open={Boolean(checkoutCourse)}
                onClose={() => setCheckoutCourse(null)}
                course={checkoutCourse}
                onSuccess={() => {
                    setCheckoutCourse(null);
                    loadData();
                }}
            />

        </div>
    );
}
