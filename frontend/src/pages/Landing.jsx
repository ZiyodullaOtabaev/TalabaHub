import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ScrollReveal } from "../hooks/useScrollReveal";
import api from "../api";
import {
    GraduationCap, BarChart3, Calendar, MessageSquare,
    Bot, Trophy, BookOpen, Clock, ArrowRight, Sparkles,
    CheckCircle2, Users, Zap
} from "lucide-react";

export default function Landing() {
    const nav = useNavigate();
    const { isLoggedIn } = useAuth();
    const [userCount, setUserCount] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/users/public-stats/");
                setUserCount(res.data.total_users || 0);
            } catch {
                // Backend javob bermasa — ko'rsatmaymiz
            }
        })();
    }, []);

    // Agar login qilgan bo'lsa — dashboard'ga
    if (isLoggedIn) {
        nav("/dashboard", { replace: true });
        return null;
    }

    const features = [
        { icon: <BarChart3 size={24} />, title: "GPA Hisoblash", desc: "5 balli tizimda baholaringizni kuzating" },
        { icon: <Calendar size={24} />, title: "Dars Jadvali", desc: "Haftalik jadvalingizni boshqaring" },
        { icon: <Clock size={24} />, title: "Planner", desc: "Vazifalar, dedlaynlar, ustuvorliklar" },
        { icon: <Bot size={24} />, title: "AI Yordamchi", desc: "Dars va imtihonlar bo'yicha savol bering" },
        { icon: <BookOpen size={24} />, title: "Video Darslar", desc: "IELTS va shaxsiy rivojlanish" },
        { icon: <MessageSquare size={24} />, title: "Chat", desc: "Talabalar bilan muloqot" },
        { icon: <Trophy size={24} />, title: "Leaderboard", desc: "Eng yaxshi talabalar reytingi" },
        { icon: <GraduationCap size={24} />, title: "Maqolalar", desc: "Erkin mavzuda yozing va o'qing" },
    ];

    const stats = [
        { value: userCount !== null ? `${userCount}+` : "...", label: "Foydalanuvchilar" },
        { value: "8+", label: "Funksiyalar" },
        { value: "3", label: "Til (UZ/EN/RU)" },
        { value: "24/7", label: "AI Yordamchi" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(10,10,26,0.8)] border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center font-extrabold text-sm">
                            TH
                        </div>
                        <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            TalabaHub
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => nav("/login")}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white transition"
                        >
                            Kirish
                        </button>
                        <button
                            onClick={() => nav("/register")}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-500/25"
                        >
                            Ro'yxatdan o'tish
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative px-4 sm:px-6 pt-20 pb-28 text-center">
                {/* Background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
                </div>

                <div className="relative max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                        <Sparkles size={16} className="text-yellow-400" />
                        <span className="text-white/70">Talabalar uchun platforma</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                        O'qishingizni{" "}
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            yangi darajaga
                        </span>{" "}
                        olib chiqing
                    </h1>

                    <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                        GPA hisoblash, dars jadvali, AI yordamchi, video darslar — talabalar uchun kerakli barcha vositalar bir joyda.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => nav("/register")}
                            className="group px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition shadow-xl shadow-indigo-500/30 flex items-center gap-2"
                        >
                            Bepul boshlash
                            <ArrowRight size={20} className="transition group-hover:translate-x-1" />
                        </button>
                        <button
                            onClick={() => nav("/login")}
                            className="px-8 py-4 rounded-2xl font-bold text-lg border border-white/10 hover:bg-white/5 transition"
                        >
                            Kirish
                        </button>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <ScrollReveal>
            <section className="px-4 sm:px-6 pb-20">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                {s.value}
                            </div>
                            <div className="text-sm text-white/50 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>
            </ScrollReveal>

            {/* FEATURES */}
            <ScrollReveal>
            <section className="px-4 sm:px-6 pb-28">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-extrabold">Barcha vositalar bir joyda</h2>
                        <p className="text-white/50 mt-3 max-w-xl mx-auto">Talaba sifatida sizga kerak bo'lgan hamma narsa — qulay va tez</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 grid place-items-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <h3 className="font-bold text-lg">{f.title}</h3>
                                <p className="text-sm text-white/50 mt-1">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            </ScrollReveal>

            {/* WHY US */}
            <ScrollReveal>
            <section className="px-4 sm:px-6 pb-28">
                <div className="max-w-4xl mx-auto">
                    <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5">
                        <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center">Nega TalabaHub?</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                "Reklama yo'q",
                                "O'zbek, Ingliz, Rus tillarida",
                                "AI yordamchi 24/7 ishlaydi",
                                "Google orqali 1 click bilan kirish",
                                "Mobil qurilmalarga moslashgan",
                                "Ma'lumotlaringiz xavfsiz",
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                                    <span className="text-white/80">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal>
            <section className="px-4 sm:px-6 pb-20">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold">Hoziroq boshlang</h2>
                    <p className="text-white/50">Ro'yxatdan o'ting yoki Google orqali kiring — 10 soniyada tayyor</p>
                    <button
                        onClick={() => nav("/register")}
                        className="group px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition shadow-xl shadow-indigo-500/30 inline-flex items-center gap-2"
                    >
                        Ro'yxatdan o'tish
                        <ArrowRight size={20} className="transition group-hover:translate-x-1" />
                    </button>
                </div>
            </section>
            </ScrollReveal>

            {/* FOOTER */}
            <footer className="border-t border-white/5 px-4 sm:px-6 py-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-xs font-bold">
                            TH
                        </div>
                        <span className="font-bold">TalabaHub</span>
                    </div>
                    <div className="text-sm text-white/40">
                        &copy; {new Date().getFullYear()} TalabaHub. Barcha huquqlar himoyalangan.
                    </div>
                </div>
            </footer>
        </div>
    );
}
