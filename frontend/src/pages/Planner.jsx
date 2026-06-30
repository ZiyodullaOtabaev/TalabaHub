import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api";
import { Plus, RotateCw, Calendar, Filter } from "lucide-react";
import TaskCalendar from "../components/TaskCalendar";
import TaskBoard from "../components/TaskBoard";

function pickOnlyHandlers(ref) {
    return {
        onKeyDown: (e) => e.preventDefault(),
        onPaste: (e) => e.preventDefault(),
        onClick: () => {
            const el = ref.current;
            if (!el) return;
            if (typeof el.showPicker === "function") el.showPicker();
            else el.focus();
        },
    };
}

function getRemaining(deadline) {
    const diff = new Date(deadline) - new Date();

    if (diff <= 0) return "expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) return hours + "h left";

    const days = Math.floor(hours / 24);

    return days + "d left";
}

export default function Planner() {
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);

    const [title, setTitle] = useState("");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState("medium");

    const [filter, setFilter] = useState("all");

    const dtRef = useRef(null);

    const priorityColor = {
        high: "bg-red-500",
        medium: "bg-yellow-400",
        low: "bg-green-500",
    };

    const canAdd = useMemo(() => title.trim().length > 0, [title]);

    async function load() {
        setLoading(true);
        try {
            const res = await api.get("/api/planner/tasks/");
            setTasks(res.data || []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function addTask(e) {
        e.preventDefault();

        if (!canAdd) return;

        await api.post("/api/planner/tasks/", {
            title: title.trim(),
            deadline: deadline ? new Date(deadline).toISOString() : null,
            priority,
        });

        setTitle("");
        setDeadline("");
        setPriority("medium");

        load();
    }

    async function toggleDone(t) {
        await api.patch(`/api/planner/tasks/${t.id}/`, {
            completed: !t.completed,
        });

        load();
    }

    const shown = useMemo(() => {
        if (filter === "active") return tasks.filter((t) => !t.completed);
        if (filter === "done") return tasks.filter((t) => t.completed);
        return tasks;
    }, [tasks, filter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Planner</h1>
                    <p className="mt-1 text-gray-600">
                        Task’larni yaratish, filter qilish va bajarilganini belgilash
                    </p>
                </div>

                <button
                    onClick={load}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                    <RotateCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* New task */}
                <div className="rounded-2xl border bg-white p-5 shadow-sm md:col-span-1">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-green-600" />
                        <h2 className="text-lg font-bold">New task</h2>
                    </div>

                    <form onSubmit={addTask} className="mt-4 space-y-3">
                        <input
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-green-200"
                            placeholder="Task title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        {/* Date picker */}
                        <div className="relative">
                            <input
                                ref={dtRef}
                                type="datetime-local"
                                className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-200"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                inputMode="none"
                                {...pickOnlyHandlers(dtRef)}
                            />

                            <button
                                type="button"
                                onClick={() => dtRef.current?.showPicker?.()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 hover:bg-gray-50"
                            >
                                <Calendar size={18} />
                            </button>
                        </div>

                        <select
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-green-200"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        <button
                            disabled={!canAdd}
                            className={[
                                "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold",
                                canAdd
                                    ? "bg-black text-white hover:opacity-90"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
                            ].join(" ")}
                        >
                            <Plus size={18} />
                            Add Task
                        </button>
                    </form>
                </div>

                {/* Task list */}
                <div className="rounded-2xl border bg-white p-5 shadow-sm md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-blue-600" />
                            <h2 className="text-lg font-bold">Tasks</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                className="rounded-xl border px-3 py-2 text-sm"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">Hammasi</option>
                                <option value="active">Bajarilmagan</option>
                                <option value="done">Bajarilgan</option>
                            </select>

                            <div className="text-sm text-gray-500">{shown.length} ta</div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {loading ? (
                            <div className="text-sm text-gray-500">Yuklanmoqda...</div>
                        ) : shown.length === 0 ? (
                            <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
                                Hozircha task yo‘q. Birinchi task’ni qo‘shing ✅
                            </div>
                        ) : (
                            shown.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => toggleDone(t)}
                                    className="w-full text-left rounded-xl border px-4 py-3 hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold">
                                            {t.completed ? "✅" : "⭕"} {t.title}
                                        </div>

                                        <span
                                            className={`text-xs text-white px-2 py-1 rounded-full ${priorityColor[t.priority]}`}
                                        >
                                            {t.priority}
                                        </span>
                                    </div>

                                    {t.deadline && (
                                        <div className="mt-1 text-sm text-gray-500">
                                            Deadline: {new Date(t.deadline).toLocaleString()}
                                        </div>
                                    )}

                                    {t.deadline && (
                                        <div className="text-xs text-red-500">
                                            {getRemaining(t.deadline)}
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Calendar view */}
            <TaskCalendar tasks={tasks} />

            <TaskBoard
                tasks={tasks}
                onUpdate={async (id, completed) => {
                    await api.patch(`/api/planner/tasks/${id}/`, { completed })
                    load()
                }}
            />
        </div>
    );
}