import { useEffect, useRef, useState } from "react";
import api from "../api";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

const WORK_MIN = 25;

function fmt(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

export default function Focus() {
    const { t } = useLang();

    const [secondsLeft, setSecondsLeft] = useState(WORK_MIN * 60);
    const [running, setRunning] = useState(false);
    const [label, setLabel] = useState("");
    const [summary, setSummary] = useState({ today: 0, week: 0, all_time: 0, daily: [] });

    const intervalRef = useRef(null);

    async function loadSummary() {
        try {
            const res = await api.get("/api/focus/summary/");
            setSummary(res.data);
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        loadSummary();
    }, []);

    async function logSession(minutes) {
        try {
            await api.post("/api/focus/sessions/", { minutes, label: label.trim() });
            loadSummary();
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        if (!running) return;
        intervalRef.current = setInterval(() => {
            setSecondsLeft((s) => {
                if (s <= 1) {
                    clearInterval(intervalRef.current);
                    setRunning(false);
                    logSession(WORK_MIN); // sessiya tugadi -> saqlash
                    return WORK_MIN * 60;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running]);

    function reset() {
        setRunning(false);
        setSecondsLeft(WORK_MIN * 60);
    }

    const maxDaily = Math.max(1, ...(summary.daily || []).map((d) => d.minutes));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{t.focusTitle}</h1>
                <p className="mt-1 text-gray-600">{t.focusSub}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Timer */}
                <div className="th-card flex flex-col items-center justify-center py-10">
                    <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
                        <Timer size={18} /> Pomodoro
                    </div>
                    <div className="text-6xl font-extrabold tabular-nums">{fmt(secondsLeft)}</div>

                    <input
                        className="th-input mt-6 max-w-xs text-center"
                        placeholder={t.subjectField}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />

                    <div className="mt-5 flex gap-3">
                        <button onClick={() => setRunning((r) => !r)} className="th-btn-blue px-5">
                            {running ? <Pause size={18} /> : <Play size={18} />}
                            {running ? "Pause" : "Start"}
                        </button>
                        <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold hover:bg-gray-50">
                            <RotateCcw size={18} />
                        </button>
                    </div>
                    <p className="mt-4 text-xs text-gray-500 text-center max-w-xs">{t.focusHint}</p>
                </div>

                {/* Stats */}
                <div className="th-card">
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <div className="text-2xl font-extrabold">{summary.today}</div>
                            <div className="text-xs text-gray-500">{t.statToday} ({t.minutesUnit})</div>
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold">{summary.week}</div>
                            <div className="text-xs text-gray-500">{t.statWeek} ({t.minutesUnit})</div>
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold">{summary.all_time}</div>
                            <div className="text-xs text-gray-500">{t.statAllTime} ({t.minutesUnit})</div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-2 h-40">
                        {(summary.daily || []).map((d) => (
                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full bg-indigo-500/80 rounded-t-md transition-all" style={{ height: `${(d.minutes / maxDaily) * 100}%`, minHeight: d.minutes ? 4 : 0 }} />
                                <div className="text-[10px] text-gray-500">{d.date.slice(5)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
