import { useState } from "react";
import { Sparkles, CalendarDays } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

export default function Assistant() {
    const { t } = useLang();

    const [examDate, setExamDate] = useState("");
    const [topicsText, setTopicsText] = useState("");
    const [hours, setHours] = useState(2);
    const [plan, setPlan] = useState(null);

    function generate(e) {
        e.preventDefault();

        const topics = topicsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

        if (!examDate || topics.length === 0) {
            setPlan(null);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exam = new Date(examDate);
        exam.setHours(0, 0, 0, 0);

        const totalDays = Math.round((exam - today) / (1000 * 60 * 60 * 24));
        if (totalDays <= 0) {
            setPlan({ error: true });
            return;
        }

        // Oxirgi kunni takrorlashga qoldiramiz
        const studyDays = Math.max(1, totalDays - 1);
        const perDay = Math.ceil(topics.length / studyDays);

        const days = [];
        let idx = 0;
        for (let i = 0; i < totalDays; i++) {
            const date = addDays(today, i);
            const isLast = i === totalDays - 1;

            if (isLast) {
                days.push({ date, review: true, topics: [] });
            } else {
                const chunk = topics.slice(idx, idx + perDay);
                idx += perDay;
                days.push({ date, review: false, topics: chunk });
            }
        }

        setPlan({ days, hours: Number(hours) || 2 });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white grid place-items-center">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t.assistantTitle}</h1>
                    <p className="mt-0.5 text-gray-600">{t.assistantSub}</p>
                </div>
            </div>

            <form onSubmit={generate} className="th-card grid gap-3 md:grid-cols-2">
                <div>
                    <label className="text-sm font-semibold">{t.examDateField}</label>
                    <input className="th-input mt-1" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                </div>
                <div>
                    <label className="text-sm font-semibold">{t.dailyHoursField}</label>
                    <input className="th-input mt-1" type="number" min="1" max="16" value={hours} onChange={(e) => setHours(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm font-semibold">{t.topicsField}</label>
                    <textarea className="th-input mt-1" rows={6} value={topicsText} onChange={(e) => setTopicsText(e.target.value)} />
                </div>
                <button className="th-btn-blue md:col-span-2"><Sparkles size={18} />{t.generateBtn}</button>
            </form>

            {plan?.error && (
                <div className="th-card text-center text-red-500">{t.planEmptyHint}</div>
            )}

            {!plan && (
                <div className="th-card text-center text-gray-500">{t.planEmptyHint}</div>
            )}

            {plan?.days && (
                <div className="grid gap-3">
                    {plan.days.map((d, i) => (
                        <div key={i} className="th-card flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-slate-700 grid place-items-center text-indigo-600 font-bold shrink-0">
                                <CalendarDays size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold">
                                    {t.dayLabel} {i + 1} · {d.date.toLocaleDateString()} · {plan.hours}⏱
                                </div>
                                {d.review ? (
                                    <div className="mt-1 text-sm text-emerald-500 font-semibold">🔁 Review / Takrorlash</div>
                                ) : (
                                    <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                                        {d.topics.map((tp, j) => <li key={j}>{tp}</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
