import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ScrollReveal } from "../hooks/useScrollReveal";
import api from "../api";
import {
    BookOpen, Sparkles, ArrowRight, Play, Lock, Globe,
    DollarSign, ShieldCheck, Video, Award, Code, CheckCircle2,
    Users, Star, Zap, Layers, Flame
} from "lucide-react";

export default function Landing() {
    const nav = useNavigate();
    const { isLoggedIn } = useAuth();
    const [userCount, setUserCount] = useState(null);
    const [publicCourses, setPublicCourses] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/users/public-stats/");
                setUserCount(res.data.total_users || 0);
            } catch { /* ignore */ }

            try {
                const cRes = await api.get("/api/courses/");
                setPublicCourses((cRes.data?.results || cRes.data || []).slice(0, 4));
            } catch { /* ignore */ }
        })();
    }, []);

    if (isLoggedIn) {
        nav("/dashboard", { replace: true });
        return null;
    }

    const academyFeatures = [
        {
            icon: <Award className="text-emerald-400" size={28} />,
            title: "IELTS & CEFR Akademiya",
            desc: "Professional ustozlardan 7.5+ IELTS hamda C1 Nemis tili (Goethe / Telc) tayyorgarlik darslari."
        },
        {
            icon: <Video className="text-cyan-400" size={28} />,
            title: "Online Video Darslar",
            desc: "YouTube integratsiyasi orqali istalgan joyda sifatli HD video darslarni o'rganing."
        },
        {
            icon: <Lock className="text-amber-400" size={28} />,
            title: "Maxfiy & Pullik Kurslar",
            desc: "Kurslaringizni parol/kod bilan maxfiy qiling yoki pullik formatda sotib daromad oling."
        },
        {
            icon: <DollarSign className="text-purple-400" size={28} />,
            title: "Mualliflar Daromadi",
            desc: "O'z bilimingiz va onlayn kurslaringizni e'lon qiling va barqaror daromadga ega bo'ling."
        },
    ];

    const stats = [
        { value: userCount !== null ? `${userCount}+` : "1,200+", label: "Aktiv O'quvchilar" },
        { value: "50+", label: "Professional Kurslar" },
        { value: "98%", label: "Muvaffaqiyat Ko'rsatkichi" },
        { value: "24/7", label: "AI & Jamiyat Yordami" },
    ];

    return (
        <div className="min-h-screen bg-[#0b0c1b] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">

            {/* BACKGROUND NEON GLOWS */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-emerald-500/10 blur-[130px]" />
                <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[140px]" />
            </div>

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0c1b]/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-indigo-500 to-purple-600 grid place-items-center text-white font-extrabold text-xl shadow-lg shadow-emerald-500/20">
                            TH
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                            TalabaHub Pro
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => nav("/login")}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white/80 hover:text-white hover:bg-white/5 transition"
                        >
                            Kirish
                        </button>
                        <button
                            onClick={() => nav("/register")}
                            className="px-6 py-2.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:scale-105 transition shadow-lg shadow-emerald-500/25 text-white"
                        >
                            Ro'yxatdan o'tish
                        </button>
                    </div>
                </div>
            </nav>

            {/* 3D HERO SECTION */}
            <section className="relative z-10 px-4 sm:px-6 pt-16 pb-28">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Copy */}
                    <div className="space-y-8 text-left">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={16} className="animate-spin" />
                            Professional Til & Ta'lim Platformasi
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight">
                            Chet tillari va bilimlarni{" "}
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                                professional tarzda
                            </span>{" "}
                            o'rganing
                        </h1>

                        <p className="text-lg text-slate-300/80 max-w-xl leading-relaxed">
                            IELTS, Nemis tili (CEFR), va zamonaviy kasblarni video darslar orqali o'rganing. O'zingiz ham onlayn kurs tayyorlab, **maxfiy yoki pullik** formatda sotib daromad oling!
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <button
                                onClick={() => nav("/register")}
                                className="px-8 py-4 rounded-2xl text-base font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white shadow-xl shadow-emerald-500/30 hover:scale-105 transition flex items-center gap-3"
                            >
                                Bepul Boshlash <ArrowRight size={20} />
                            </button>
                            <button
                                onClick={() => nav("/login")}
                                className="px-7 py-4 rounded-2xl text-base font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-2"
                            >
                                <Play size={18} className="text-emerald-400 fill-emerald-400" /> Demo Darsni Ko'rish
                            </button>
                        </div>

                        <div className="flex items-center gap-6 pt-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> Bepul & Premium kurslar</span>
                            <span className="flex items-center gap-1.5"><Globe size={16} className="text-cyan-400" /> HD Video Darslar</span>
                        </div>
                    </div>

                    {/* Right 3D Visual Cards */}
                    <div className="perspective-1000 relative">
                        <div className="relative z-10 preserve-3d animate-float-3d">

                            {/* Main Floating Card */}
                            <div className="card-3d glassmorphism-card p-6 rounded-3xl space-y-5 border border-white/15 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 grid place-items-center text-emerald-400 font-extrabold">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <div className="font-extrabold text-lg text-white">IELTS Master 8.0+</div>
                                            <div className="text-xs text-emerald-400 font-semibold">CEFR C1 Level Course</div>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                                        ONLINE
                                    </span>
                                </div>

                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group cursor-pointer">
                                    <img
                                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
                                        alt="Course preview"
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                                        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white grid place-items-center shadow-lg shadow-emerald-500/50 group-hover:scale-110 transition">
                                            <Play size={24} className="ml-1 fill-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                                    <span className="flex items-center gap-1 font-semibold"><Users size={14} className="text-indigo-400" /> 1,420 ta talaba</span>
                                    <span className="flex items-center gap-1 font-semibold text-emerald-400"><Star size={14} className="fill-emerald-400" /> 4.9 (280 sharh)</span>
                                </div>
                            </div>

                            {/* Secondary Floating Badge 1 */}
                            <div className="absolute -bottom-6 -left-6 z-20 glassmorphism-card px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 grid place-items-center font-bold">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Mualliflar daromadi</div>
                                    <div className="font-black text-emerald-400">$1,500+ / oy</div>
                                </div>
                            </div>

                            {/* Secondary Floating Badge 2 */}
                            <div className="absolute -top-6 -right-6 z-20 glassmorphism-card px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2 shadow-xl">
                                <Lock size={16} className="text-amber-400" />
                                <span className="text-xs font-bold text-slate-200">Maxfiy Kurslar Kodu</span>
                            </div>

                        </div>
                    </div>

                </div>
            </section>

            {/* STATS SECTION */}
            <section className="relative z-10 border-y border-white/10 bg-white/[0.02] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((s, i) => (
                            <div key={i} className="space-y-1">
                                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                                    {s.value}
                                </div>
                                <div className="text-xs sm:text-sm font-semibold text-slate-400">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ACADEMY FEATURES SECTION */}
            <section className="relative z-10 px-4 sm:px-6 py-24">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                            Nima uchun <span className="text-emerald-400">TalabaHub Pro</span> ni tanlashadi?
                        </h2>
                        <p className="text-slate-400 text-base">
                            Biz nafaqat bilim beramiz, balki o'qituvchilar va mualliflarga o'z bilimlarini monetizatsiya qilish imkoniyatini taqdim etamiz.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {academyFeatures.map((f, idx) => (
                            <ScrollReveal key={idx}>
                                <div className="card-3d glassmorphism-card p-6 rounded-3xl space-y-4 hover:border-emerald-500/40 transition">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{f.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* INSTRUCTOR MONETIZATION BANNER */}
            <section className="relative z-10 px-4 sm:px-6 py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-emerald-900/60 via-indigo-900/60 to-purple-900/60 border border-emerald-500/30">
                        <div className="relative z-10 max-w-2xl space-y-6">
                            <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                                Mualliflar & Ustozlar uchun
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                                O'z kursingizni yuklang va video darslaringizdan pul ishlang!
                            </h2>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                YouTube video havolalaringizni ulab kurs yarating. Hohlasangiz barcha uchun bepul, hohlasangiz maxfiy yoki sotiladigan premium kurs sifatida nashr qiling.
                            </p>
                            <button
                                onClick={() => nav("/register")}
                                className="px-7 py-3.5 rounded-2xl font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                            >
                                <DollarSign size={20} /> Muallif Bo'lib Boshlash
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-white/10 py-12 bg-[#080914] text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-bold grid place-items-center text-sm">
                            TH
                        </div>
                        <span className="font-extrabold text-slate-300 text-sm">TalabaHub Pro</span>
                    </div>
                    <p>&copy; {new Date().getFullYear()} TalabaHub Pro. Barcha huquqlar himoyalangan.</p>
                </div>
            </footer>

        </div>
    );
}
