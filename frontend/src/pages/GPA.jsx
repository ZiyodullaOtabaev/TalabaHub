import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Plus, Trash2, RotateCw, GraduationCap, BarChart3 } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}

function formatGpa(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return "—";
    return n.toFixed(2);
}

const GRADE_LABELS = {
    "5": "A'lo (5)",
    "4": "Yaxshi (4)",
    "3": "Qoniqarli (3)",
    "2": "Qoniqarsiz (2)",
};

function GpaBar({ value }) {
    const n = clamp(Number(value) || 0, 0, 5);
    const pct = (n / 5) * 100;

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
                <span>0.00</span>
                <span className="font-medium">5.00</span>
            </div>

            <div className="mt-2 h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>

            <div className="mt-2 text-xs text-gray-500">
                Progress: <span className="font-medium text-gray-700">{pct.toFixed(0)}%</span>
            </div>
        </div>
    );
}

export default function GPA() {
    const { t } = useLang();

    const [loading, setLoading] = useState(true);

    const [gpa, setGpa] = useState({ gpa: 0 });
    const [subjects, setSubjects] = useState([]);

    const [name, setName] = useState("");
    const [credit, setCredit] = useState("");
    const [grade, setGrade] = useState("5");

    const canAdd = useMemo(() => {
        const c = Number(credit);
        return name.trim().length > 0 && Number.isFinite(c) && c > 0;
    }, [name, credit]);

    async function load() {
        setLoading(true);
        try {
            const [gpaRes, subsRes] = await Promise.all([
                api.get("/api/gpa/calculate/"),
                api.get("/api/gpa/subjects/"),
            ]);
            setGpa(gpaRes.data);
            setSubjects(subsRes.data || []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function addSubject(e) {
        e.preventDefault();
        if (!canAdd) return;

        await api.post("/api/gpa/subjects/", {
            name: name.trim(),
            credit: Number(credit),
            grade,
        });

        setName("");
        setCredit("");
        setGrade("5");
        load();
    }

    async function removeSubject(id) {
        await api.delete(`/api/gpa/subjects/${id}/`);
        load();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t.gpaCalculator}</h1>
                    <p className="mt-1 text-gray-600">{t.gpaCalcSub}</p>
                </div>

                <button
                    onClick={load}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                    <RotateCw size={16} />
                    {t.refresh}
                </button>
            </div>

            {/* Top grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Add Subject */}
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <GraduationCap size={18} className="text-yellow-600" />
                        <h2 className="text-lg font-bold">{t.addSubject}</h2>
                    </div>

                    <form onSubmit={addSubject} className="mt-4 space-y-3">
                        <input
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder={t.subjectNamePlaceholder}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <input
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder={t.creditPlaceholder}
                            value={credit}
                            onChange={(e) => setCredit(e.target.value)}
                            inputMode="numeric"
                        />

                        <select
                            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                        >
                            <option value="5">A'lo (5)</option>
                            <option value="4">Yaxshi (4)</option>
                            <option value="3">Qoniqarli (3)</option>
                            <option value="2">Qoniqarsiz (2)</option>
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
                            {t.addSubject}
                        </button>
                    </form>
                </div>

                {/* GPA Visual */}
                <div className="rounded-2xl border bg-white p-5 shadow-sm md:col-span-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={18} className="text-blue-600" />
                            <h2 className="text-lg font-bold">{t.yourGpa}</h2>
                        </div>
                        <div className="text-xs text-gray-500">{t.scaleLabel}: 0.00 — 5.00</div>
                    </div>

                    <div className="mt-4 flex items-end gap-4">
                        <div className="text-5xl font-extrabold">{formatGpa(gpa?.gpa)}</div>
                        <div className="pb-1 text-gray-600">{t.overallGpa}</div>
                    </div>

                    <GpaBar value={gpa?.gpa} />

                    {loading && (
                        <div className="mt-4 text-sm text-gray-500">{t.loading}</div>
                    )}
                </div>
            </div>

            {/* Subjects list */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">{t.subjectsTitle}</h2>
                    <div className="text-sm text-gray-500">{subjects.length} {t.countSuffix}</div>
                </div>

                <div className="mt-4 space-y-3">
                    {subjects.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-6 text-center text-gray-500">
                            {t.noSubjects}
                        </div>
                    ) : (
                        subjects.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between rounded-xl border px-4 py-3"
                            >
                                <div>
                                    <div className="font-semibold">{s.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {t.creditLabel}: {s.credit} | {t.gradeLabel}: {GRADE_LABELS[s.grade] || s.grade}
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeSubject(s.id)}
                                    className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-50"
                                    title="Delete"
                                >
                                    <Trash2 size={18} className="text-red-600" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}