import { useEffect, useState } from "react";
import api from "../api";
import { Bell, AlertTriangle, Clock } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { computeNotifications } from "../lib/notifications";

export default function Notifications() {
    const { t } = useLang();
    const [data, setData] = useState({ overdue: [], soon: [], count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/planner/tasks/");
                setData(computeNotifications(res.data || []));
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

            {!loading && data.count === 0 && (
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
        </div>
    );
}
