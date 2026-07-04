import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Plus, Trash2, Clock, MapPin, User2, Calendar as CalendarIcon } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { ScrollReveal } from "../hooks/useScrollReveal";

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
        await api.post("/api/timetable/sessions/", {
            subject: subject.trim(),
            weekday: Number(weekday),
            start_time: startTime,
            end_time: endTime,
            room: room.trim(),
            teacher: teacher.trim(),
        });
        setSubject(""); setRoom(""); setTeacher("");
        setShowForm(false);
        load();
    }

    async function remove(id) {
        await api.delete(`/api/timetable/sessions/${id}/`);
        load();
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
                <button onClick={() => setShowForm((v) => !v)}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 flex items-center gap-2 hover:scale-105 transition">
                    <Plus size={18} /> {t.add || "Qo'shish"}
                </button>
            </div>

            {/* Today highlight */}
            <div className="th-card p-5 border-l-4 border-l-sky-500">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold opacity-50">Bugun — {weekdayNames[todayIndex]}</div>
                        <div className="text-2xl font-extrabold mt-1">
                            {todaySessions.length > 0 ? `${todaySessions.length} ta dars` : "Bugun dars yo'q"}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-50">Jami haftalik</div>
                        <div className="text-xl font-bold">{totalSessions} ta</div>
                    </div>
                </div>
            </div>

            {/* Add form */}
            {showForm && (
                <ScrollReveal>
                <div className="th-card p-5">
                    <form onSubmit={addSession} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <input className="th-input" placeholder={t.subjectField || "Fan nomi"} value={subject} onChange={(e) => setSubject(e.target.value)} />
                        <select className="th-input" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                            {weekdayNames.map((w, i) => <option key={i} value={i}>{w}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input className="th-input flex-1" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                            <input className="th-input flex-1" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </div>
                        <input className="th-input" placeholder={t.roomField || "Xona"} value={room} onChange={(e) => setRoom(e.target.value)} />
                        <input className="th-input" placeholder={t.teacherField || "O'qituvchi"} value={teacher} onChange={(e) => setTeacher(e.target.value)} />
                        <button className="th-btn-blue flex items-center justify-center gap-2">
                            <Plus size={18} /> {t.add || "Qo'shish"}
                        </button>
                    </form>
                </div>
                </ScrollReveal>
            )}

            {/* Day tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {weekdayNames.map((name, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveDay(i)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                            activeDay === i
                                ? `bg-gradient-to-r ${DAY_COLORS[i]} text-white shadow-lg`
                                : `th-card ${i === todayIndex ? "ring-2 ring-sky-500/50" : ""}`
                        }`}
                    >
                        {name.slice(0, 3)}
                        {byDay[i]?.length > 0 && (
                            <span className={`ml-1.5 text-[10px] ${activeDay === i ? "opacity-80" : "opacity-50"}`}>
                                ({byDay[i].length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Schedule for selected day */}
            <div className="space-y-3">
                {loading && <div className="th-card p-8 text-center opacity-50">{t.loading || "Yuklanmoqda..."}</div>}

                {!loading && (byDay[activeDay] || []).length === 0 && (
                    <div className="th-card p-10 text-center opacity-50">
                        {weekdayNames[activeDay]} kuni dars yo'q
                    </div>
                )}

                {(byDay[activeDay] || []).map((s, idx) => {
                    const isCurrent = isCurrentLesson(s);
                    return (
                        <div
                            key={s.id}
                            className={`th-card p-4 flex items-center gap-4 transition hover:scale-[1.01] ${
                                isCurrent ? "ring-2 ring-sky-500 shadow-lg shadow-sky-500/10" : ""
                            }`}
                        >
                            {/* Time */}
                            <div className={`shrink-0 w-20 text-center p-2 rounded-xl ${isCurrent ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                                <div className="text-sm font-bold">{s.start_time?.slice(0, 5)}</div>
                                <div className="text-[10px] opacity-60">{s.end_time?.slice(0, 5)}</div>
                            </div>

                            {/* Colored bar */}
                            <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${DAY_COLORS[activeDay]}`} />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="font-bold flex items-center gap-2">
                                    {s.subject}
                                    {isCurrent && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500 text-white font-bold animate-pulse">
                                            HOZIR
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs opacity-60 flex-wrap">
                                    {s.room && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {s.room}</span>}
                                    {s.teacher && <span className="inline-flex items-center gap-1"><User2 size={12} /> {s.teacher}</span>}
                                </div>
                            </div>

                            {/* Delete */}
                            <button onClick={() => remove(s.id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition shrink-0">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
