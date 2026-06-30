import { useEffect, useState } from "react";
import api from "../api";
import { Plus, Trash2, Target, Flame, Check } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

export default function Goals() {
    const { t } = useLang();

    const [tab, setTab] = useState("goals");

    const [goals, setGoals] = useState([]);
    const [habits, setHabits] = useState([]);

    // goal form
    const [gTitle, setGTitle] = useState("");
    const [gTarget, setGTarget] = useState(100);
    const [gDeadline, setGDeadline] = useState("");

    // habit form
    const [hTitle, setHTitle] = useState("");

    async function load() {
        try {
            const [g, h] = await Promise.all([
                api.get("/api/goals/goals/"),
                api.get("/api/goals/habits/"),
            ]);
            setGoals(g.data || []);
            setHabits(h.data || []);
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function addGoal(e) {
        e.preventDefault();
        if (!gTitle.trim()) return;
        await api.post("/api/goals/goals/", {
            title: gTitle.trim(),
            target_value: Number(gTarget) || 100,
            current_value: 0,
            deadline: gDeadline || null,
        });
        setGTitle("");
        setGTarget(100);
        setGDeadline("");
        load();
    }

    async function updateGoal(goal, delta) {
        const next = Math.max(0, Math.min(goal.target_value, goal.current_value + delta));
        await api.patch(`/api/goals/goals/${goal.id}/`, {
            current_value: next,
            done: next >= goal.target_value,
        });
        load();
    }

    async function removeGoal(id) {
        await api.delete(`/api/goals/goals/${id}/`);
        load();
    }

    async function addHabit(e) {
        e.preventDefault();
        if (!hTitle.trim()) return;
        await api.post("/api/goals/habits/", { title: hTitle.trim() });
        setHTitle("");
        load();
    }

    async function toggleHabit(id) {
        await api.post(`/api/goals/habits/${id}/toggle/`);
        load();
    }

    async function removeHabit(id) {
        await api.delete(`/api/goals/habits/${id}/`);
        load();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{t.goalsTitle}</h1>
                <p className="mt-1 text-gray-600">{t.goalsSub}</p>
            </div>

            {/* Tabs */}
            <div className="inline-flex rounded-xl border p-1 bg-[color:var(--surface-2)]">
                {[["goals", t.tabGoals], ["habits", t.tabHabits]].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === key ? "bg-indigo-600 text-white" : "text-gray-600"}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "goals" ? (
                <>
                    <form onSubmit={addGoal} className="th-card grid gap-3 md:grid-cols-4">
                        <input className="th-input md:col-span-2" placeholder={t.goalTitleField} value={gTitle} onChange={(e) => setGTitle(e.target.value)} />
                        <input className="th-input" type="number" min="1" placeholder={t.targetField} value={gTarget} onChange={(e) => setGTarget(e.target.value)} />
                        <input className="th-input" type="date" value={gDeadline} onChange={(e) => setGDeadline(e.target.value)} />
                        <button className="th-btn-blue md:col-span-4"><Plus size={18} />{t.addGoal}</button>
                    </form>

                    {goals.length === 0 ? (
                        <div className="th-card text-center text-gray-500">{t.noGoals}</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {goals.map((g) => (
                                <div key={g.id} className="th-card">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Target size={18} className="text-indigo-500" />
                                            <span className="font-semibold">{g.title}</span>
                                        </div>
                                        <button onClick={() => removeGoal(g.id)} className="text-red-500 hover:text-red-600" title={t.delete}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${g.progress}%` }} />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                                        <span>{g.current_value} / {g.target_value} ({g.progress}%)</span>
                                        {g.deadline && <span>{g.deadline}</span>}
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <button onClick={() => updateGoal(g, -10)} className="px-3 py-1.5 rounded-lg border font-semibold hover:bg-gray-50">-10</button>
                                        <button onClick={() => updateGoal(g, 10)} className="px-3 py-1.5 rounded-lg border font-semibold hover:bg-gray-50">+10</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <form onSubmit={addHabit} className="th-card flex gap-3">
                        <input className="th-input flex-1" placeholder={t.habitTitleField} value={hTitle} onChange={(e) => setHTitle(e.target.value)} />
                        <button className="th-btn-blue"><Plus size={18} />{t.addHabit}</button>
                    </form>

                    {habits.length === 0 ? (
                        <div className="th-card text-center text-gray-500">{t.noHabits}</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {habits.map((h) => (
                                <div key={h.id} className="th-card flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold truncate">{h.title}</div>
                                        <div className="mt-1 inline-flex items-center gap-1 text-sm text-orange-500 font-semibold">
                                            <Flame size={16} /> {h.streak} {t.streakLabel}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => toggleHabit(h.id)}
                                            className={`px-3 py-2 rounded-xl font-semibold inline-flex items-center gap-1 ${h.done_today ? "bg-emerald-500 text-white" : "border"}`}
                                            title={t.markTodayBtn}
                                        >
                                            <Check size={16} />{h.done_today ? t.doneTodayLabel : t.markTodayBtn}
                                        </button>
                                        <button onClick={() => removeHabit(h.id)} className="text-red-500 hover:text-red-600" title={t.delete}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
