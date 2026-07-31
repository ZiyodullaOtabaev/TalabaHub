import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import BannerDisplay from "../components/BannerDisplay";

import {
    PlusCircle,
    RefreshCw,
    ClipboardList,
    GraduationCap,
    Sparkles,
    Languages,
    ArrowRight,
    Megaphone,
    ChevronDown,
    ChevronUp,
    Eye,
    Play,
    Flame,
    TrendingUp,
    Award
} from "lucide-react";

import GpaProgress from "../components/GpaProgress";
import ExamCountdown from "../components/ExamCountdown";

function DashboardAdCard({ a, tr }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-left flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-3.5 bg-slate-50 dark:bg-slate-900/60 transition hover:border-indigo-400 dark:hover:border-indigo-500/40 active:scale-[0.99]"
        >
            <span className={`mt-0.5 shrink-0 text-[10px] text-white font-extrabold px-2.5 py-0.5 rounded-full ${
                a.category === "book" ? "bg-sky-500" :
                a.category === "roommate" ? "bg-emerald-500" :
                a.category === "tutor" ? "bg-purple-500" :
                a.category === "event" ? "bg-amber-500" : "bg-slate-500"
            }`}>
                {a.category === "book" ? tr.catBook :
                 a.category === "roommate" ? tr.catRoommate :
                 a.category === "tutor" ? tr.catTutor :
                 a.category === "event" ? tr.catEvent : tr.catOther}
            </span>
            <div className="min-w-0 flex-1">
                <div className="font-bold text-sm">{a.title}</div>
                <p className={`text-xs opacity-70 mt-0.5 whitespace-pre-wrap ${expanded ? "" : "line-clamp-1"}`}>{a.body}</p>
                {a.contact && expanded && (
                    <div className="mt-1.5 text-xs font-semibold text-emerald-400">{a.contact}</div>
                )}
                <div className="text-[11px] opacity-40 mt-1">@{a.username} &middot; {new Date(a.created_at).toLocaleDateString()}</div>
            </div>
            <span className="shrink-0 mt-1 opacity-40">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
        </button>
    );
}

export default function Dashboard() {
    const { t: tr } = useLang();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [gpa, setGpa] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [topVideos, setTopVideos] = useState([]);

    const [subjectName, setSubjectName] = useState("");
    const [credit, setCredit] = useState("");
    const [grade, setGrade] = useState("5");

    const [taskTitle, setTaskTitle] = useState("");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState("medium");

    const [me, setMe] = useState(null);

    async function load() {
        setLoading(true);
        try {
            const [gpaRes, tasksRes, boardRes, topRes] = await Promise.all([
                api.get("/api/gpa/calculate/"),
                api.get("/api/planner/tasks/"),
                api.get("/api/board/announcements/"),
                api.get("/api/courses/top-viewed/"),
            ]);

            setGpa(gpaRes.data);
            setTasks(tasksRes.data?.results || tasksRes.data || []);
            setAnnouncements((boardRes.data?.results || boardRes.data || []).slice(0, 5));
            setTopVideos(topRes.data || []);
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        (async () => {
            try {
                const res = await api.get("/api/users/me/");
                setMe(res.data);
            } catch { /* ignore */ }
        })();
    }, []);

    async function addSubject(e) {
        e.preventDefault();
        await api.post("/api/gpa/subjects/", {
            name: subjectName,
            credit: Number(credit),
            grade,
        });
        setSubjectName(""); setCredit(""); setGrade("5");
        load();
    }

    async function addTask(e) {
        e.preventDefault();
        await api.post("/api/planner/tasks/", {
            title: taskTitle,
            deadline: deadline || null,
            priority,
        });
        setTaskTitle(""); setDeadline(""); setPriority("medium");
        load();
    }

    const upcoming = useMemo(() => {
        return tasks
            .filter((t) => t.deadline && !t.completed)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 3);
    }, [tasks]);

    const stats = {
        total: tasks.length,
        done: tasks.filter((t) => t.completed).length,
        pending: tasks.filter((t) => !t.completed).length,
    };

    const priorityColor = {
        low: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        high: "bg-red-500/10 text-red-400 border border-red-500/20",
    };

    const priorityLabel = {
        low: tr.priorityLow,
        medium: tr.priorityMedium,
        high: tr.priorityHigh,
    };

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">
                        {me?.university || "TalabaHub Dashboard"}
                    </span>
                    <h1 className="text-3xl font-black tracking-tight mt-0.5">
                        {tr.dashboardTitle || "Asosiy Panel"}
                    </h1>
                    <p className="text-sm opacity-70">
                        {tr.dashboardSub || "O'quv ko'rsatkichlari, tasklar va top video darslar hammasi bir joyda"}
                    </p>
                </div>

                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition disabled:opacity-70"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    {tr.refresh || "Yangilash"}
                </button>
            </div>

            {/* BANNERS */}
            <BannerDisplay position="dashboard_top" />

            {/* QUICK ACCESS ACADEMY BANNER */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                    type="button"
                    onClick={() => navigate("/courses")}
                    className="card-3d group relative overflow-hidden rounded-3xl p-6 text-left text-white bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-xl border border-emerald-400/30"
                >
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                                <Award size={24} />
                            </div>
                            <div>
                                <div className="text-lg font-black">🎓 Video Kurslar Akademiya</div>
                                <div className="text-xs text-white/80">YouTube darslar va monetizatsiya</div>
                            </div>
                        </div>
                        <ArrowRight size={22} className="shrink-0 transition group-hover:translate-x-1" />
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/ielts")}
                    className="card-3d group relative overflow-hidden rounded-3xl p-6 text-left text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-xl border border-indigo-400/30"
                >
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <div className="text-lg font-black">{tr.navIelts || "IELTS Master"}</div>
                                <div className="text-xs text-white/80">{tr.ieltsSub || "7.5+ Band Tayyorgarlik"}</div>
                            </div>
                        </div>
                        <ArrowRight size={22} className="shrink-0 transition group-hover:translate-x-1" />
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/german")}
                    className="card-3d group relative overflow-hidden rounded-3xl p-6 text-left text-white bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 shadow-xl border border-fuchsia-400/30"
                >
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                                <Languages size={24} />
                            </div>
                            <div>
                                <div className="text-lg font-black">{tr.navGerman || "Nemis Tili"}</div>
                                <div className="text-xs text-white/80">{tr.germanSub || "CEFR A1 - C1 Darslar"}</div>
                            </div>
                        </div>
                        <ArrowRight size={22} className="shrink-0 transition group-hover:translate-x-1" />
                    </div>
                </button>
            </div>

            {/* TOP 5 MOST VIEWED VIDEOS / COURSES SECTION */}
            <div className="th-card p-6 rounded-3xl space-y-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-indigo-950/30 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 grid place-items-center font-bold">
                            <Flame size={22} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                Top 5 Eng Ko'p Ko'rilgan Video Darslar
                            </h2>
                            <p className="text-xs opacity-60">Platformadagi foydalanuvchilar orasida eng mashhur va ko'p ko'rilgan darslar</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/courses")}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition flex items-center gap-1.5"
                    >
                        Barcha Kurslar <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topVideos.map((item, index) => {
                        const rankColors = [
                            "from-amber-400 to-amber-600 text-slate-950 shadow-amber-500/40",
                            "from-slate-300 to-slate-400 text-slate-950 shadow-slate-400/40",
                            "from-amber-600 to-amber-800 text-white shadow-amber-700/40",
                            "from-emerald-500 to-teal-600 text-white shadow-emerald-500/30",
                            "from-indigo-500 to-purple-600 text-white shadow-indigo-500/30",
                        ];

                        const isLesson = Boolean(item.youtube_video_id);
                        const title = item.title;
                        const subtitle = isLesson ? item.course_title || "Video Dars" : item.category_name || "Online Kurs";
                        const views = item.views_count || 0;
                        const targetUrl = isLesson ? `/courses/${item.course}` : `/courses/${item.id}`;

                        return (
                            <div
                                key={item.id || index}
                                onClick={() => navigate(targetUrl)}
                                className="card-3d glassmorphism-card p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3 cursor-pointer group"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-0.5 rounded-lg bg-gradient-to-r font-black text-xs shadow-md ${rankColors[index] || rankColors[4]}`}>
                                            #{index + 1} TOP
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                            <Eye size={12} /> {views}
                                        </span>
                                    </div>

                                    <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-white/10 mt-1">
                                        <img
                                            src={
                                                isLesson && item.youtube_video_id
                                                    ? `https://img.youtube.com/vi/${item.youtube_video_id}/mqdefault.jpg`
                                                    : item.cover_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80"
                                            }
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white grid place-items-center shadow-lg">
                                                <Play size={16} className="ml-0.5 fill-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="font-extrabold text-sm leading-snug line-clamp-2 group-hover:text-emerald-400 transition">
                                        {title}
                                    </h3>
                                </div>

                                <div className="text-[11px] opacity-60 font-medium truncate pt-2 border-t border-white/5">
                                    {subtitle}
                                </div>
                            </div>
                        );
                    })}

                    {topVideos.length === 0 && (
                        <div className="col-span-full text-center py-8 opacity-50 text-sm">
                            Hozircha video darslar yuklanmagan. Birinchi darsni siz e'lon qiling!
                        </div>
                    )}
                </div>
            </div>

            {/* ANNOUNCEMENTS */}
            {announcements.length > 0 && (
                <div className="th-card p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-black text-lg">
                            <Megaphone size={20} className="text-amber-400" />
                            {tr.boardTitle || "E'lonlar"}
                        </div>
                        <button
                            onClick={() => navigate("/board")}
                            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                        >
                            {tr.dashboardViewAll || "Hammasini ko'rish"} &rarr;
                        </button>
                    </div>
                    <div className="space-y-3">
                        {announcements.map((a) => (
                            <DashboardAdCard key={a.id} a={a} tr={tr} />
                        ))}
                    </div>
                </div>
            )}

            {/* BENTO GRID: GPA & TASKS */}
            <div className="grid gap-6 md:grid-cols-6 auto-rows-fr">
                {/* GPA */}
                <div className="col-span-2 th-card p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 font-black text-lg">
                        <GraduationCap size={20} className="text-emerald-400" /> GPA Hisoblagich
                    </div>
                    <div className="text-4xl font-black text-emerald-400 tracking-tight">
                        {gpa?.gpa ?? "0.00"}
                    </div>

                    <form onSubmit={addSubject} className="space-y-3 pt-2">
                        <input
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            placeholder={tr.subjectPlaceholder || "Fan nomi"}
                            className="th-input text-xs"
                        />
                        <input
                            value={credit}
                            onChange={(e) => setCredit(e.target.value)}
                            type="number"
                            placeholder={tr.creditPlaceholder || "Kredit (masalan: 6)"}
                            className="th-input text-xs"
                        />
                        <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="th-input text-xs"
                        >
                            <option value="5">A'lo (5)</option>
                            <option value="4">Yaxshi (4)</option>
                            <option value="3">Qoniqarli (3)</option>
                            <option value="2">Qoniqarsiz (2)</option>
                        </select>
                        <button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition flex items-center justify-center gap-2">
                            <PlusCircle size={16} /> {tr.addSubject || "Fan Qo'shish"}
                        </button>
                    </form>
                </div>

                {/* TASKS */}
                <div className="col-span-4 th-card p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 font-black text-lg">
                            <ClipboardList size={20} className="text-cyan-400" /> {tr.tasks || "Vazifalar"}
                        </div>
                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                            {tasks.length} ta task
                        </span>
                    </div>

                    <form onSubmit={addTask} className="space-y-3">
                        <input
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder={tr.taskTitlePlaceholder || "Task nomini kiriting..."}
                            className="th-input text-xs"
                        />
                        <div className="grid sm:grid-cols-3 gap-2">
                            <input
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="th-input text-xs"
                            />
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="th-input text-xs"
                            >
                                <option value="low">{tr.priorityLow || "Past"}</option>
                                <option value="medium">{tr.priorityMedium || "O'rta"}</option>
                                <option value="high">{tr.priorityHigh || "Yuqori"}</option>
                            </select>
                            <button className="py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition flex items-center justify-center gap-1.5">
                                <PlusCircle size={16} /> {tr.addTask || "Qo'shish"}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
                        {tasks.length === 0 && (
                            <div className="text-center py-6 opacity-50 text-xs">
                                Hozircha tasklar yo'q. Birinchi vazifani qo'shing! ✅
                            </div>
                        )}
                        {tasks.map((t) => (
                            <div
                                key={t.id}
                                className="flex justify-between items-center p-3 rounded-2xl border border-white/5 bg-slate-900/50 text-xs"
                            >
                                <div className="space-y-0.5">
                                    <div className="font-bold">{t.completed ? "✅" : "⭕"} {t.title}</div>
                                    {t.deadline && <div className="text-[10px] opacity-50">{new Date(t.deadline).toLocaleString()}</div>}
                                </div>
                                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${priorityColor[t.priority]}`}>
                                    {priorityLabel[t.priority] || t.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* GPA PROGRESS & COUNTDOWN */}
            <div className="grid md:grid-cols-2 gap-6">
                <GpaProgress gpa={gpa?.gpa} />
                <ExamCountdown />
            </div>

        </div>
    );
}