import { useEffect, useMemo, useState } from "react";
import api from "../api";
import {
    Plus, CheckCircle2, Circle, Clock, AlertTriangle,
    Trash2, ListTodo, LayoutGrid, Calendar as CalendarIcon,
    TrendingUp,
} from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { ScrollReveal } from "../hooks/useScrollReveal";

const PRIORITY_CONFIG = {
    high: { color: "bg-red-500", light: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", text: "text-red-600" },
    medium: { color: "bg-amber-500", light: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", text: "text-amber-600" },
    low: { color: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", text: "text-emerald-600" },
};

function getTimeLeft(deadline) {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return { text: "Muddati o'tgan", urgent: true };
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return { text: `${hours} soat qoldi`, urgent: hours < 6 };
    const days = Math.floor(hours / 24);
    return { text: `${days} kun qoldi`, urgent: days <= 1 };
}

export default function Planner() {
    const { t } = useLang();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list"); // list | board
    const [filter, setFilter] = useState("all");

    // Form
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState("medium");

    async function load() {
        setLoading(true);
        try {
            const res = await api.get("/api/planner/tasks/");
            setTasks(res.data?.results || res.data || []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function addTask(e) {
        e.preventDefault();
        if (!title.trim()) return;
        await api.post("/api/planner/tasks/", {
            title: title.trim(),
            deadline: deadline ? new Date(deadline).toISOString() : null,
            priority,
        });
        setTitle(""); setDeadline(""); setPriority("medium");
        setShowForm(false);
        load();
    }

    async function toggleDone(task) {
        await api.patch(`/api/planner/tasks/${task.id}/`, { completed: !task.completed });
        load();
    }

    async function deleteTask(id) {
        await api.delete(`/api/planner/tasks/${id}/`);
        load();
    }

    // Stats
    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter((t) => t.completed).length;
        const overdue = tasks.filter((t) => t.deadline && !t.completed && new Date(t.deadline) < new Date()).length;
        return { total, done, active: total - done, overdue, rate: total ? Math.round((done / total) * 100) : 0 };
    }, [tasks]);

    // Filter
    const shown = useMemo(() => {
        if (filter === "active") return tasks.filter((t) => !t.completed);
        if (filter === "done") return tasks.filter((t) => t.completed);
        if (filter === "overdue") return tasks.filter((t) => t.deadline && !t.completed && new Date(t.deadline) < new Date());
        return tasks;
    }, [tasks, filter]);

    // Board columns
    const columns = useMemo(() => ({
        high: shown.filter((t) => t.priority === "high" && !t.completed),
        medium: shown.filter((t) => t.priority === "medium" && !t.completed),
        low: shown.filter((t) => t.priority === "low" && !t.completed),
        done: shown.filter((t) => t.completed),
    }), [shown]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center">
                            <ListTodo size={22} />
                        </div>
                        {t.plannerTitle || "Planner"}
                    </h1>
                    <p className="mt-1 opacity-60">{t.plannerSub || "Vazifalaringizni tartibga soling"}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex rounded-xl overflow-hidden border">
                        <button onClick={() => setView("list")}
                            className={`px-3 py-2 text-sm font-semibold transition ${view === "list" ? "bg-indigo-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                            <ListTodo size={16} />
                        </button>
                        <button onClick={() => setView("board")}
                            className={`px-3 py-2 text-sm font-semibold transition ${view === "board" ? "bg-indigo-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                    <button onClick={() => setShowForm((v) => !v)}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-105 transition">
                        <Plus size={18} /> {t.newTask || "Yangi vazifa"}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="th-card p-4 text-center cursor-pointer hover:scale-105 transition" onClick={() => setFilter("all")}>
                    <div className="text-2xl font-extrabold">{stats.total}</div>
                    <div className="text-xs opacity-50">{t.total || "Jami"}</div>
                </div>
                <div className="th-card p-4 text-center cursor-pointer hover:scale-105 transition" onClick={() => setFilter("active")}>
                    <div className="text-2xl font-extrabold text-blue-500">{stats.active}</div>
                    <div className="text-xs opacity-50">{t.filterActive || "Faol"}</div>
                </div>
                <div className="th-card p-4 text-center cursor-pointer hover:scale-105 transition" onClick={() => setFilter("done")}>
                    <div className="text-2xl font-extrabold text-emerald-500">{stats.done}</div>
                    <div className="text-xs opacity-50">{t.filterDone || "Bajarilgan"}</div>
                </div>
                <div className="th-card p-4 text-center cursor-pointer hover:scale-105 transition" onClick={() => setFilter("overdue")}>
                    <div className="text-2xl font-extrabold text-red-500">{stats.overdue}</div>
                    <div className="text-xs opacity-50">{t.overdue || "Muddati o'tgan"}</div>
                </div>
            </div>

            {/* Progress bar */}
            {stats.total > 0 && (
                <div className="th-card p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold flex items-center gap-1"><TrendingUp size={14} /> Progress</span>
                        <span className="font-bold text-emerald-600">{stats.rate}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                            style={{ width: `${stats.rate}%` }} />
                    </div>
                </div>
            )}

            {/* Add form */}
            {showForm && (
                <ScrollReveal>
                <div className="th-card p-5">
                    <form onSubmit={addTask} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <input className="th-input lg:col-span-1" placeholder={t.taskTitlePlaceholder || "Vazifa nomi"} value={title} onChange={(e) => setTitle(e.target.value)} />
                        <input className="th-input" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                        <select className="th-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="high">{t.priorityHigh || "Yuqori"}</option>
                            <option value="medium">{t.priorityMedium || "O'rta"}</option>
                            <option value="low">{t.priorityLow || "Past"}</option>
                        </select>
                        <button className="th-btn-blue flex items-center justify-center gap-2">
                            <Plus size={18} /> {t.addTask || "Qo'shish"}
                        </button>
                    </form>
                </div>
                </ScrollReveal>
            )}

            {/* LIST VIEW */}
            {view === "list" && (
                <div className="space-y-2">
                    {loading && <div className="th-card p-8 text-center opacity-50">{t.loading || "Yuklanmoqda..."}</div>}
                    {!loading && shown.length === 0 && (
                        <div className="th-card p-10 text-center opacity-50">
                            {t.noTasks || "Vazifa yo'q. Yangi qo'shing!"}
                        </div>
                    )}
                    {shown.map((task) => {
                        const timeLeft = task.deadline ? getTimeLeft(task.deadline) : null;
                        const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                        return (
                            <div key={task.id} className={`th-card p-4 flex items-center gap-3 border ${task.completed ? "opacity-60" : ""} hover:scale-[1.01] transition`}>
                                <button onClick={() => toggleDone(task)} className="shrink-0">
                                    {task.completed
                                        ? <CheckCircle2 size={24} className="text-emerald-500" />
                                        : <Circle size={24} className="opacity-30 hover:opacity-60 transition" />
                                    }
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-semibold ${task.completed ? "line-through opacity-60" : ""}`}>{task.title}</div>
                                    <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                                        {task.deadline && (
                                            <span className={`inline-flex items-center gap-1 ${timeLeft?.urgent ? "text-red-500 font-semibold" : "opacity-50"}`}>
                                                <Clock size={12} /> {new Date(task.deadline).toLocaleDateString()} &middot; {timeLeft?.text}
                                            </span>
                                        )}
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${pc.color}`}>
                                            {task.priority === "high" ? "Yuqori" : task.priority === "medium" ? "O'rta" : "Past"}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => deleteTask(task.id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition shrink-0">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* BOARD VIEW (Kanban) */}
            {view === "board" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { key: "high", title: "Yuqori", icon: <AlertTriangle size={16} />, color: "text-red-500" },
                        { key: "medium", title: "O'rta", icon: <Clock size={16} />, color: "text-amber-500" },
                        { key: "low", title: "Past", icon: <Circle size={16} />, color: "text-emerald-500" },
                        { key: "done", title: "Bajarilgan", icon: <CheckCircle2 size={16} />, color: "text-slate-400" },
                    ].map((col) => (
                        <div key={col.key} className="th-card p-4 min-h-[200px]">
                            <div className={`font-bold text-sm mb-3 flex items-center gap-2 ${col.color}`}>
                                {col.icon} {col.title}
                                <span className="ml-auto text-xs opacity-50">{columns[col.key]?.length || 0}</span>
                            </div>
                            <div className="space-y-2">
                                {(columns[col.key] || []).map((task) => {
                                    const timeLeft = task.deadline ? getTimeLeft(task.deadline) : null;
                                    return (
                                        <div key={task.id} className={`p-3 rounded-xl border ${PRIORITY_CONFIG[task.priority]?.light || ""} transition hover:shadow-md`}>
                                            <div className="flex items-start gap-2">
                                                <button onClick={() => toggleDone(task)} className="shrink-0 mt-0.5">
                                                    {task.completed
                                                        ? <CheckCircle2 size={18} className="text-emerald-500" />
                                                        : <Circle size={18} className="opacity-40" />
                                                    }
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <div className={`text-sm font-semibold ${task.completed ? "line-through opacity-50" : ""}`}>{task.title}</div>
                                                    {timeLeft && (
                                                        <div className={`text-[10px] mt-1 ${timeLeft.urgent ? "text-red-500" : "opacity-50"}`}>
                                                            {timeLeft.text}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(columns[col.key] || []).length === 0 && (
                                    <div className="text-xs opacity-30 text-center py-4">Bo'sh</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
