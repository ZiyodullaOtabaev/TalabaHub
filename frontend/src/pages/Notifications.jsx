import { useEffect, useState } from "react";
import api from "../api";
import { Bell, AlertTriangle, Clock, Megaphone, ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { computeNotifications } from "../lib/notifications";

function AdCard({ a, t }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-left rounded-xl border p-3 flex items-start gap-3 transition hover:bg-[color:var(--surface-2)] active:scale-[0.99]"
        >
            <span className={`mt-0.5 shrink-0 text-[10px] text-white px-2 py-0.5 rounded-full ${
                a.category === "book" ? "bg-sky-500" :
                a.category === "roommate" ? "bg-emerald-500" :
                a.category === "tutor" ? "bg-violet-500" :
                a.category === "event" ? "bg-amber-500" : "bg-slate-500"
            }`}>
                {a.category === "book" ? t.catBook :
                 a.category === "roommate" ? t.catRoommate :
                 a.category === "tutor" ? t.catTutor :
                 a.category === "event" ? t.catEvent : (t.catOther || a.category)}
            </span>
            <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm">{a.title}</div>
                <p className={`text-sm text-[color:var(--text-muted)] mt-1 whitespace-pre-wrap ${expanded ? "" : "line-clamp-2"}`}>
                    {a.body}
                </p>
                {a.contact && expanded && (
                    <div className="mt-2 text-sm font-semibold text-indigo-500">
                        {a.contact}
                    </div>
                )}
                <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-2">
                    <span>@{a.username}</span>
                    <span>&middot;</span>
                    <span>{new Date(a.created_at).toLocaleString()}</span>
                </div>
            </div>
            <span className="shrink-0 mt-1 text-[color:var(--text-muted)]">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
        </button>
    );
}

export default function Notifications() {
    const { t } = useLang();
    const [data, setData] = useState({ overdue: [], soon: [], count: 0 });
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [tasksRes, boardRes] = await Promise.all([
                    api.get("/api/planner/tasks/"),
                    api.get("/api/board/announcements/"),
                ]);
                setData(computeNotifications(tasksRes.data?.results || tasksRes.data || []));
                const allAds = boardRes.data?.results || boardRes.data || [];
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                setAnnouncements(
                    allAds.filter(a => new Date(a.created_at) >= threeDaysAgo).slice(0, 10)
                );
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    function Row({ task, overdue }) {
        return (
            <div className="rounded-xl border p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="font-semibold truncate">{task.title}</div>
                    <div className="text-sm text-gray-500">{new Date(task.deadline).toLocaleString()}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full text-white ${overdue ? "bg-red-500" : "bg-amber-500"}`}>
                    {overdue ? t.overdueLabel : t.dueSoonLabel}
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white grid place-items-center">
                    <Bell size={20} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t.notifTitle}</h1>
                    <p className="mt-0.5 text-gray-600">{t.notifSub}</p>
                </div>
            </div>

            {!loading && data.count === 0 && announcements.length === 0 && (
                <div className="th-card text-center text-gray-500">{t.notifEmpty}</div>
            )}

            {data.overdue.length > 0 && (
                <div className="th-card">
                    <div className="flex items-center gap-2 font-bold text-red-500 mb-3">
                        <AlertTriangle size={18} /> {t.overdueLabel}
                    </div>
                    <div className="space-y-2">
                        {data.overdue.map((task) => <Row key={task.id} task={task} overdue />)}
                    </div>
                </div>
            )}

            {data.soon.length > 0 && (
                <div className="th-card">
                    <div className="flex items-center gap-2 font-bold text-amber-500 mb-3">
                        <Clock size={18} /> {t.dueSoonLabel}
                    </div>
                    <div className="space-y-2">
                        {data.soon.map((task) => <Row key={task.id} task={task} />)}
                    </div>
                </div>
            )}

            {announcements.length > 0 && (
                <div className="th-card">
                    <div className="flex items-center gap-2 font-bold text-emerald-500 mb-3">
                        <Megaphone size={18} /> {t.notifNewAds || "Yangi e'lonlar"}
                    </div>
                    <div className="space-y-2">
                        {announcements.map((a) => (
                            <AdCard key={a.id} a={a} t={t} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
