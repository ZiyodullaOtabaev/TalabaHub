import { useEffect, useRef, useState } from "react";
import { Sparkles, CalendarDays, Send, Bot } from "lucide-react";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

/* ---------------- AI Chat tab ---------------- */
function AiChat() {
    const { t } = useLang();
    const [messages, setMessages] = useState([{ role: "assistant", content: t.aiWelcome }]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function send(e) {
        e.preventDefault();
        const value = text.trim();
        if (!value || loading) return;

        const history = [...messages, { role: "user", content: value }];
        setMessages(history);
        setText("");
        setLoading(true);

        try {
            const res = await api.post("/api/assistant/chat/", {
                messages: history.filter((m) => m.role !== "system"),
            });
            setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
        } catch (err) {
            const detail = err?.response?.data?.detail || "AI bilan bog'lanishda xatolik.";
            setMessages((m) => [...m, { role: "assistant", content: "⚠️ " + detail }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="th-card flex flex-col" style={{ height: "62vh" }}>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((m, i) => {
                    const mine = m.role === "user";
                    return (
                        <div key={i} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                            {!mine && (
                                <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-600 text-white grid place-items-center">
                                    <Bot size={16} />
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-wrap break-words ${mine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-100 dark:bg-slate-700 rounded-bl-sm"}`}>
                                {m.content}
                            </div>
                        </div>
                    );
                })}
                {loading && <div className="text-sm text-gray-500">{t.aiThinking}</div>}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={send} className="mt-4 flex items-center gap-2">
                <input
                    className="th-input flex-1"
                    placeholder={t.aiChatPlaceholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" disabled={loading || !text.trim()} className="th-btn-blue px-4 py-2">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}

/* ---------------- Study plan tab ---------------- */
function Planner() {
    const { t } = useLang();
    const [examDate, setExamDate] = useState("");
    const [topicsText, setTopicsText] = useState("");
    const [hours, setHours] = useState(2);
    const [plan, setPlan] = useState(null);

    function generate(e) {
        e.preventDefault();
        const topics = topicsText.split("\n").map((s) => s.trim()).filter(Boolean);
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
        const studyDays = Math.max(1, totalDays - 1);
        const perDay = Math.ceil(topics.length / studyDays);
        const days = [];
        let idx = 0;
        for (let i = 0; i < totalDays; i++) {
            const date = addDays(today, i);
            if (i === totalDays - 1) {
                days.push({ date, review: true, topics: [] });
            } else {
                days.push({ date, review: false, topics: topics.slice(idx, idx + perDay) });
                idx += perDay;
            }
        }
        setPlan({ days, hours: Number(hours) || 2 });
    }

    return (
        <>
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

            {(plan?.error || !plan) && (
                <div className="th-card text-center text-gray-500 mt-4">{t.planEmptyHint}</div>
            )}

            {plan?.days && (
                <div className="grid gap-3 mt-4">
                    {plan.days.map((d, i) => (
                        <div key={i} className="th-card flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-slate-700 grid place-items-center text-indigo-600 shrink-0">
                                <CalendarDays size={18} />
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold">{t.dayLabel} {i + 1} · {d.date.toLocaleDateString()} · {plan.hours}⏱</div>
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
        </>
    );
}

export default function Assistant() {
    const { t } = useLang();
    const [tab, setTab] = useState("chat");

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

            <div className="inline-flex rounded-xl border p-1 bg-[color:var(--surface-2)]">
                {[["chat", t.aiChatTab], ["plan", t.aiPlanTab]].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === key ? "bg-indigo-600 text-white" : "text-gray-600"}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "chat" ? <AiChat /> : <Planner />}
        </div>
    );
}
