import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Plus, Trash2, Clock, MapPin, User2, Calendar as CalendarIcon, FileSpreadsheet, Upload, X } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { ScrollReveal } from "../hooks/useScrollReveal";
import toast from "react-hot-toast";

const DAY_COLORS = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-purple-500 to-violet-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-sky-600",
    "from-slate-500 to-gray-600",
];

function getCurrentDayIndex() {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0=Mon ... 6=Sun
}

function isCurrentLesson(session) {
    const now = new Date();
    const today = getCurrentDayIndex();
    if (Number(session.weekday) !== today) return false;

    const [sh, sm] = (session.start_time || "").split(":").map(Number);
    const [eh, em] = (session.end_time || "").split(":").map(Number);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const startMin = (sh || 0) * 60 + (sm || 0);
    const endMin = (eh || 0) * 60 + (em || 0);

    return nowMin >= startMin && nowMin <= endMin;
}

export default function Timetable() {
    const { t } = useLang();
    const weekdayNames = [
        t.wdMon || "Dushanba",
        t.wdTue || "Seshanba",
        t.wdWed || "Chorshanba",
        t.wdThu || "Payshanba",
        t.wdFri || "Juma",
        t.wdSat || "Shanba",
        t.wdSun || "Yakshanba",
    ];

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [activeDay, setActiveDay] = useState(getCurrentDayIndex());

    const [subject, setSubject] = useState("");
    const [weekday, setWeekday] = useState(String(getCurrentDayIndex()));
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:30");
    const [room, setRoom] = useState("");
    const [teacher, setTeacher] = useState("");

    // Modal states
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    async function load() {
        try {
            const res = await api.get("/api/timetable/sessions/");
            setSessions(res.data?.results || res.data || []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function addSession(e) {
        e.preventDefault();
        if (!subject.trim()) return;
        try {
            await api.post("/api/timetable/sessions/", {
                subject: subject.trim(),
                weekday: Number(weekday),
                start_time: startTime,
                end_time: endTime,
                room: room.trim(),
                teacher: teacher.trim(),
            });
            toast.success("Dars qo'shildi!");
            setSubject(""); setRoom(""); setTeacher("");
            setShowForm(false);
            load();
        } catch {
            toast.error("Dars qo'shishda xatolik");
        }
    }

    async function remove(id) {
        try {
            await api.delete(`/api/timetable/sessions/${id}/`);
            toast.success("Dars o'chirildi");
            load();
        } catch {
            toast.error("O'chirishda xatolik");
        }
    }

    async function handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const res = await api.post("/api/timetable/import-excel/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(res.data?.detail || "Dars jadvali yuklandi!");
            setShowExcelModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Excel yuklashda xatolik yuz berdi!");
        } finally {
            setUploading(false);
        }
    }

    const byDay = useMemo(() => {
        const map = {};
        for (let i = 0; i < 7; i++) map[i] = [];
        for (const s of sessions) {
            if (map[s.weekday]) map[s.weekday].push(s);
        }
        // Sort by start_time
        Object.values(map).forEach((arr) => arr.sort((a, b) => (a.start_time || "").localeCompare(b.start_time || "")));
        return map;
    }, [sessions]);

    const todayIndex = getCurrentDayIndex();
    const todaySessions = byDay[todayIndex] || [];
    const totalSessions = sessions.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white grid place-items-center">
                            <CalendarIcon size={22} />
                        </div>
                        {t.timetableTitle || "Dars jadvali"}
                    </h1>
                    <p className="mt-1 opacity-60">{t.timetableSub || "Haftalik darslaringiz"}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowExcelModal(true)}
                        className="px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-105 transition"
                    >
                        <FileSpreadsheet size={18} />
                        Excel Import
                    </button>
                    <button onClick={() => setShowForm((v) => !v)}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 flex items-center gap-2 hover:scale-105 transition">
                        <Plus size={18} />
                        {t.addLesson || "Dars qo'shish"}
                    </button>
                </div>
            </div>

            {/* Excel Upload Modal */}
            {showExcelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div className="th-card p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setShowExcelModal(false)}
                            className="absolute top-4 right-4 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <FileSpreadsheet className="text-emerald-500" size={22} />
                            Excel-dan dars jadvalini yuklash
                        </h3>
                        <p className="text-sm opacity-70 mb-4">
                            Excel (.xlsx) faylingizni yuklang. Ustunlar: Fan, Kun (Dushanba-Shanba), Boshlanish vaqti (09:00), Tugash vaqti (10:20), Xona, O'qituvchi.
                        </p>
                        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 grid place-items-center cursor-pointer transition">
                            <Upload size={32} className="text-emerald-500 mb-2" />
                            <span className="text-sm font-semibold">
                                {uploading ? "Yuklanmoqda..." : "Excel faylni tanlang (.xlsx)"}
                            </span>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="th-card p-4 text-center">
                    <div className="text-3xl font-extrabold">{totalSessions}</div>
                    <div className="text-xs opacity-60 mt-1">{t.totalLessons || "Jami darslar"}</div>
                </div>
                <div className="th-card p-4 text-center">
                    <div className="text-3xl font-extrabold text-sky-500">{todaySessions.length}</div>
                    <div className="text-xs opacity-60 mt-1">{t.todayLessonsCount || "Bugungi darslar"}</div>
                </div>
                <div className="th-card p-4 text-center col-span-2 lg:col-span-1">
                    <div className="text-3xl font-extrabold text-emerald-500">
                        {weekdayNames[todayIndex]}
                    </div>
                    <div className="text-xs opacity-60 mt-1">{t.today || "Bugun"}</div>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <ScrollReveal>
                    <div className="th-card p-5">
                        <form onSubmit={addSession} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <input
                                className="th-input"
                                placeholder={t.lessonSubjectPlaceholder || "Fan nomi (masalan, Fizika)"}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                            <select className="th-input" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                                {weekdayNames.map((name, i) => (
                                    <option key={i} value={i}>{name}</option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    className="th-input flex-1"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                                <input
                                    type="time"
                                    className="th-input flex-1"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                            <input
                                className="th-input"
                                placeholder={t.roomPlaceholder || "Xona / Auditoriya (masalan, 302)"}
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                            />
                            <input
                                className="th-input"
                                placeholder={t.teacherPlaceholder || "O'qituvchi ismi"}
                                value={teacher}
                                onChange={(e) => setTeacher(e.target.value)}
                            />
                            <button className="th-btn-blue flex items-center justify-center gap-2">
                                <Plus size={18} /> {t.add || "Qo'shish"}
                            </button>
                        </form>
                    </div>
                </ScrollReveal>
            )}

            {/* Day tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {weekdayNames.map((name, i) => {
                    const count = (byDay[i] || []).length;
                    const isToday = i === todayIndex;
                    return (
                        <button
                            key={i}
                            onClick={() => setActiveDay(i)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                                activeDay === i
                                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                                    : "th-card hover:scale-105"
                            }`}
                        >
                            <span>{name}</span>
                            {count > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                    activeDay === i ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 opacity-70"
                                }`}>
                                    {count}
                                </span>
                            )}
                            {isToday && activeDay !== i && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active day sessions */}
            <div className="space-y-3">
                {loading && <div className="th-card p-6 text-center opacity-50">{t.loading || "Yuklanmoqda..."}</div>}

                {!loading && (byDay[activeDay] || []).length === 0 && (
                    <div className="th-card p-8 text-center opacity-50">
                        {weekdayNames[activeDay]} kuni darslar yo'q. Dam oling! 🎉
                    </div>
                )}

                {(byDay[activeDay] || []).map((s) => {
                    const current = isCurrentLesson(s);
                    return (
                        <div
                            key={s.id}
                            className={`th-card p-5 flex items-center justify-between gap-4 transition ${
                                current ? "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10" : ""
                            }`}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${DAY_COLORS[s.weekday]} text-white grid place-items-center font-extrabold text-sm shrink-0 shadow-md`}>
                                    {s.start_time?.slice(0, 5)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg truncate">{s.subject}</h3>
                                        {current && (
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                                                HOZIR
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs opacity-60 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} /> {s.start_time?.slice(0, 5)} &ndash; {s.end_time?.slice(0, 5)}
                                        </span>
                                        {s.room && (
                                            <span className="flex items-center gap-1 font-semibold text-sky-500">
                                                <MapPin size={14} /> {s.room}-xona
                                            </span>
                                        )}
                                        {s.teacher && (
                                            <span className="flex items-center gap-1">
                                                <User2 size={14} /> {s.teacher}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => remove(s.id)}
                                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition shrink-0"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
