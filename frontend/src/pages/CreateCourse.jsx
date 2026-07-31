import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
    BookOpen, Plus, Trash2, Lock, Globe, DollarSign,
    Upload, Video, Sparkles, CheckCircle2, ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";

export default function CreateCourse() {
    const nav = useNavigate();
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);

    // Form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [price, setPrice] = useState("0");
    const [isPrivate, setIsPrivate] = useState(false);
    const [level, setLevel] = useState("all");

    // Dynamic Lessons list
    const [lessons, setLessons] = useState([
        { title: "1-Kirish darsi", youtube_url: "", duration: "10 min" }
    ]);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/courses/categories/");
                const list = res.data?.results || res.data || [];
                setCategories(list);
                if (list.length > 0) setCategory(list[0].id);
            } catch { /* ignore */ }
        })();
    }, []);

    function addLessonRow() {
        setLessons([
            ...lessons,
            { title: `${lessons.length + 1}-Dars`, youtube_url: "", duration: "15 min" }
        ]);
    }

    function removeLessonRow(idx) {
        if (lessons.length === 1) return;
        setLessons(lessons.filter((_, i) => i !== idx));
    }

    function updateLessonRow(idx, field, value) {
        const updated = [...lessons];
        updated[idx][field] = value;
        setLessons(updated);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Kurs nomini kiriting");
            return;
        }

        const validLessons = lessons.filter((l) => l.title.trim() && l.youtube_url.trim());
        if (validLessons.length === 0) {
            toast.error("Kamida 1 ta YouTube video darsini kiriting!");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                category: category || null,
                cover_image: coverImage.trim(),
                price: Number(price) || 0,
                is_private: isPrivate,
                level,
                lessons: validLessons,
            };

            const res = await api.post("/api/courses/", payload);
            toast.success("Yangi kurs yaratildi!");
            nav(`/courses/${res.data.id}`);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Kurs yaratishda xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => nav("/courses")}
                    className="px-4 py-2 rounded-xl th-card hover:scale-105 font-bold text-xs flex items-center gap-2 transition"
                >
                    <ArrowLeft size={16} /> Kurslarga Qaytish
                </button>
                <div className="text-sm font-extrabold text-emerald-500 flex items-center gap-1.5">
                    <Sparkles size={16} /> Mualliflar Studiyasi
                </div>
            </div>

            <div className="th-card p-6 sm:p-8 space-y-6">
                <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
                    <h1 className="text-2xl font-extrabold flex items-center gap-2">
                        <BookOpen className="text-emerald-500" size={24} /> Yangi Online Kurs Yaratish
                    </h1>
                    <p className="text-xs opacity-60 mt-1">
                        Darslaringizni e'lon qiling. Maxfiy kod yoki pullik rejim orqali bilimingizni monetizatsiya qiling.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Course Basic Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Kurs Nomi</label>
                            <input
                                className="th-input"
                                placeholder="Masalan: IELTS 8.0 Masterclass / Nemis tili C1"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Kategoriya</label>
                            <select className="th-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Daraja</label>
                            <select className="th-input" value={level} onChange={(e) => setLevel(e.target.value)}>
                                <option value="all">Barcha darajalar</option>
                                <option value="beginner">Boshlang'ich (A1/A2)</option>
                                <option value="intermediate">O'rta (B1/B2)</option>
                                <option value="advanced">Yuqori (C1/C2)</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Kurs Haqida Qisqacha</label>
                            <textarea
                                className="th-input min-h-[100px]"
                                placeholder="Kurs kimlar uchun mo'ljallangan va nimalar o'rgatiladi..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Muqova Rasmi Havolasi (URL)</label>
                            <input
                                className="th-input"
                                placeholder="https://images.unsplash.com/..."
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Narxi (So'mda, 0 = Bepul)</label>
                            <input
                                type="number"
                                className="th-input"
                                placeholder="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Private / Public Switch */}
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <div className="font-bold text-sm flex items-center gap-2">
                                <Lock size={16} className="text-amber-500" /> Maxfiy Kurs Rejimi
                            </div>
                            <div className="text-xs opacity-60">
                                Yoqilsa, kursga faqat maxsus 6-xonali kod orqali kirish mumkin bo'ladi.
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-emerald-500 cursor-pointer"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                        />
                    </div>

                    {/* Darslar ro'yxati (Lessons) */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-lg flex items-center gap-2">
                                <Video className="text-emerald-500" size={20} /> YouTube Video Darslar
                            </h3>
                            <button
                                type="button"
                                onClick={addLessonRow}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1 hover:scale-105 transition"
                            >
                                <Plus size={14} /> Dars Qo'shish
                            </button>
                        </div>

                        <div className="space-y-3">
                            {lessons.map((l, idx) => (
                                <div key={idx} className="p-4 rounded-2xl th-card grid gap-3 sm:grid-cols-12 items-center">
                                    <div className="sm:col-span-4">
                                        <input
                                            className="th-input text-xs"
                                            placeholder="Dars sarlavhasi"
                                            value={l.title}
                                            onChange={(e) => updateLessonRow(idx, "title", e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-5">
                                        <input
                                            className="th-input text-xs"
                                            placeholder="YouTube Video URL (https://youtu.be/...)"
                                            value={l.youtube_url}
                                            onChange={(e) => updateLessonRow(idx, "youtube_url", e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <input
                                            className="th-input text-xs"
                                            placeholder="15 min"
                                            value={l.duration}
                                            onChange={(e) => updateLessonRow(idx, "duration", e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                        <button
                                            type="button"
                                            onClick={() => removeLessonRow(idx)}
                                            className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-black text-base shadow-xl shadow-emerald-500/25 hover:scale-[1.01] transition disabled:opacity-50"
                    >
                        {saving ? "Kurs Nashr Qilinmoqda..." : "Kursni Nashr Qilish 🚀"}
                    </button>

                </form>
            </div>

        </div>
    );
}
