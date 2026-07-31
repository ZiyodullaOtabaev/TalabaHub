import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import {
    Play, Lock, Globe, CheckCircle2, ChevronRight,
    Users, Award, Plus, ArrowLeft, Key, X, ShieldAlert
} from "lucide-react";
import toast from "react-hot-toast";

export default function CourseDetail() {
    const { id } = useParams();
    const nav = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);

    // Private modal
    const [accessCode, setAccessCode] = useState("");
    const [unlocking, setUnlocking] = useState(false);

    // New lesson form
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [lessonTitle, setLessonTitle] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [duration, setDuration] = useState("");
    const [addingLesson, setAddingLesson] = useState(false);

    async function loadCourse() {
        setLoading(true);
        try {
            const res = await api.get(`/api/courses/${id}/`);
            setCourse(res.data);

            const lessons = res.data.lessons || [];
            if (lessons.length > 0) {
                setActiveLesson(lessons[0]);
            }
        } catch {
            toast.error("Kurs ma'lumotlarini yuklab bo'lmadi");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCourse();
    }, [id]);

    async function handleUnlock(e) {
        e.preventDefault();
        if (!accessCode.trim()) return;

        setUnlocking(true);
        try {
            await api.post(`/api/courses/${id}/access-private/`, {
                access_code: accessCode.trim(),
            });
            toast.success("Maxfiy kursga kirish ruxsati berildi!");
            loadCourse();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Noto'g'ri maxfiy kod!");
        } finally {
            setUnlocking(false);
        }
    }

    async function handleEnroll() {
        try {
            await api.post(`/api/courses/${id}/enroll/`);
            toast.success("Kursga a'zo bo'ldingiz!");
            loadCourse();
        } catch (err) {
            toast.error(err.response?.data?.detail || "A'zo bo'lishda xatolik");
        }
    }

    async function handleAddLesson(e) {
        e.preventDefault();
        if (!lessonTitle.trim() || !youtubeUrl.trim()) return;

        setAddingLesson(true);
        try {
            await api.post(`/api/courses/${id}/lessons/`, {
                title: lessonTitle.trim(),
                youtube_url: youtubeUrl.trim(),
                duration: duration.trim(),
            });
            toast.success("Yangi dars qo'shildi!");
            setLessonTitle(""); setYoutubeUrl(""); setDuration("");
            setShowAddLesson(false);
            loadCourse();
        } catch {
            toast.error("Dars qo'shishda xatolik");
        } finally {
            setAddingLesson(false);
        }
    }

    if (loading) {
        return <div className="th-card p-12 text-center opacity-50">Kurs yuklanmoqda...</div>;
    }

    if (!course) {
        return <div className="th-card p-12 text-center opacity-50">Kurs topilmadi</div>;
    }

    const hasAccess = course.has_access || course.is_enrolled;

    return (
        <div className="space-y-6">

            {/* BACK & HEADER */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => nav("/courses")}
                    className="px-4 py-2 rounded-xl th-card hover:scale-105 font-bold text-xs flex items-center gap-2 transition"
                >
                    <ArrowLeft size={16} /> Barcha Kurslarga Qaytish
                </button>

                <div className="flex items-center gap-2">
                    {course.is_private ? (
                        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center gap-1">
                            <Lock size={14} /> Maxfiy Kurs
                        </span>
                    ) : (
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center gap-1">
                            <Globe size={14} /> Ochiq Kurs
                        </span>
                    )}
                </div>
            </div>

            {/* NO ACCESS BANNER FOR PRIVATE COURSE */}
            {!hasAccess && (
                <div className="th-card p-8 border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-purple-500/10 space-y-4 text-center max-w-2xl mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 grid place-items-center mx-auto">
                        <Lock size={28} />
                    </div>
                    <h2 className="text-2xl font-extrabold">{course.title}</h2>
                    <p className="text-sm opacity-70">
                        Bu kurs maxfiy hisoblanadi. Darslarni ko'rish uchun o'qituvchidan olingan 6-xonali maxfiy kodni kiriting.
                    </p>

                    <form onSubmit={handleUnlock} className="flex gap-2 max-w-md mx-auto pt-2">
                        <input
                            className="th-input flex-1 text-center font-mono font-bold uppercase tracking-widest text-lg"
                            placeholder="MAXFIY KOD"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={unlocking || !accessCode.trim()}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:scale-105 transition disabled:opacity-40"
                        >
                            {unlocking ? "..." : "Ochish"}
                        </button>
                    </form>
                </div>
            )}

            {/* VIDEO CLASSROOM CONTENT */}
            {hasAccess && (
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left: Video Player & Info */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Player */}
                        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
                            {activeLesson ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeLesson.youtube_video_id}?autoplay=1`}
                                    title={activeLesson.title}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="h-full grid place-items-center opacity-40 text-sm">
                                    Darsni tanlang
                                </div>
                            )}
                        </div>

                        {/* Lesson title & Course details */}
                        <div className="th-card p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-2xl font-extrabold">{activeLesson?.title || course.title}</h2>
                                    <p className="text-xs opacity-60 mt-1">Muallif: @{course.instructor_name} &middot; {course.category_name || "Umumiy"}</p>
                                </div>

                                {!course.is_enrolled && (
                                    <button
                                        onClick={handleEnroll}
                                        className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:scale-105 transition"
                                    >
                                        Kursga A'zo Bo'lish
                                    </button>
                                )}
                            </div>

                            <p className="text-sm opacity-80 whitespace-pre-line border-t pt-4 border-slate-200 dark:border-slate-800">
                                {course.description || "Ushbu kursda eng muhim va qiziqarli darslar jamlangan."}
                            </p>

                            {/* Shareable private code for instructor */}
                            {course.is_private && course.access_code && (
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                                    <div>
                                        <span className="font-bold opacity-70">Sizning Maxfiy Kurs Kodingiz: </span>
                                        <span className="font-mono font-black text-amber-400 text-base ml-2">{course.access_code}</span>
                                    </div>
                                    <span className="opacity-50">Shu kodni shogirdlaringizga bering</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Lessons Playlist */}
                    <div className="space-y-4">
                        <div className="th-card p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-lg flex items-center gap-2">
                                    Darslar Ro'yxati ({course.lessons?.length || 0})
                                </h3>
                                {(course.instructor === course.instructor_id || true) && (
                                    <button
                                        onClick={() => setShowAddLesson((v) => !v)}
                                        className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:scale-110 transition"
                                    >
                                        <Plus size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Add Lesson form */}
                            {showAddLesson && (
                                <form onSubmit={handleAddLesson} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-2 text-xs">
                                    <input
                                        className="th-input !py-1.5"
                                        placeholder="Dars sarlavhasi"
                                        value={lessonTitle}
                                        onChange={(e) => setLessonTitle(e.target.value)}
                                    />
                                    <input
                                        className="th-input !py-1.5"
                                        placeholder="YouTube URL (https://youtu.be/...)"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                    />
                                    <input
                                        className="th-input !py-1.5"
                                        placeholder="Davomiyligi (masalan, 12 min)"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={addingLesson}
                                        className="w-full py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
                                    >
                                        {addingLesson ? "..." : "Dars Qo'shish"}
                                    </button>
                                </form>
                            )}

                            {/* Lessons List */}
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                {(course.lessons || []).map((l, i) => {
                                    const active = activeLesson?.id === l.id;
                                    return (
                                        <div
                                            key={l.id}
                                            onClick={() => setActiveLesson(l)}
                                            className={`p-3 rounded-2xl transition cursor-pointer flex items-center justify-between gap-3 ${
                                                active ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-xl grid place-items-center font-bold text-xs shrink-0 ${
                                                    active ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 opacity-60"
                                                }`}>
                                                    {i + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-sm truncate">{l.title}</div>
                                                    {l.duration && <div className="text-[10px] opacity-50">{l.duration}</div>}
                                                </div>
                                            </div>
                                            {active && <Play size={14} className="text-emerald-400 fill-emerald-400 shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
}
