import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Plus, Trash2, GraduationCap, TrendingUp, BookOpen, FileSpreadsheet, Upload, X } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ScrollReveal } from "../hooks/useScrollReveal";
import toast from "react-hot-toast";

const GRADE_MAP = {
    "5": 5.0, "4": 4.0, "3": 3.0, "2": 2.0,
    "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0,
    "ECTS_A": 5.0, "ECTS_B": 4.5, "ECTS_C": 4.0, "ECTS_D": 3.5, "ECTS_E": 3.0, "ECTS_FX": 2.0, "ECTS_F": 0.0,
};

const GRADE_COLORS = {
    "5": "bg-emerald-500", "4": "bg-blue-500", "3": "bg-amber-500", "2": "bg-red-500",
    "A+": "bg-emerald-500", "A": "bg-emerald-500", "A-": "bg-emerald-400",
    "B+": "bg-blue-500", "B": "bg-blue-500", "B-": "bg-blue-400",
    "C+": "bg-amber-500", "C": "bg-amber-500", "C-": "bg-amber-400",
    "D+": "bg-orange-500", "D": "bg-orange-500", "F": "bg-red-500",
    "ECTS_A": "bg-emerald-500", "ECTS_B": "bg-blue-500", "ECTS_C": "bg-cyan-500",
    "ECTS_D": "bg-amber-500", "ECTS_E": "bg-orange-500", "ECTS_FX": "bg-red-400", "ECTS_F": "bg-red-600",
};

function resolveGradePoint(grade) {
    if (GRADE_MAP[grade] !== undefined) return GRADE_MAP[grade];
    const num = parseFloat(grade);
    if (!isNaN(num)) {
        if (num > 5.0) {
            if (num >= 86) return 5.0;
            if (num >= 71) return 4.0;
            if (num >= 55) return 3.0;
            return 2.0;
        }
        return num;
    }
    return 0;
}

function calcGpa(subjects) {
    if (!subjects.length) return 0;
    let total = 0, credits = 0;
    subjects.forEach((s) => {
        total += resolveGradePoint(s.grade) * s.credit;
        credits += s.credit;
    });
    return credits > 0 ? +(total / credits).toFixed(2) : 0;
}

export default function GPA() {
    const { t } = useLang();
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [activeSemester, setActiveSemester] = useState("all");

    // Form states
    const [name, setName] = useState("");
    const [credit, setCredit] = useState("");
    const [scaleType, setScaleType] = useState("5"); // 5, 4, 100, ects
    const [grade, setGrade] = useState("5");
    const [semester, setSemester] = useState("1");
    const [showForm, setShowForm] = useState(false);

    // Modal states
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const res = await api.get("/api/gpa/subjects/");
            setSubjects(res.data?.results || res.data || []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function addSubject(e) {
        e.preventDefault();
        if (!name.trim() || !credit) return;
        try {
            await api.post("/api/gpa/subjects/", {
                name: name.trim(),
                credit: Number(credit),
                grade,
                scale_type: scaleType,
                semester,
            });
            toast.success("Fan qo'shildi!");
            setName(""); setCredit(""); setGrade("5");
            setShowForm(false);
            load();
        } catch {
            toast.error("Xatolik yuz berdi");
        }
    }

    async function removeSubject(id) {
        try {
            await api.delete(`/api/gpa/subjects/${id}/`);
            toast.success("Fan o'chirildi");
            load();
        } catch {
            toast.error("O'chirishda xatolik");
        }
    }

    async function handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const res = await api.post("/api/gpa/import-excel/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(res.data?.detail || "Excel fanlari yuklandi!");
            setShowExcelModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Excel yuklashda xatolik yuz berdi!");
        } finally {
            setUploading(false);
        }
    }

    // Semestrlar ro'yxati
    const semesters = useMemo(() => {
        const set = new Set(subjects.map((s) => s.semester));
        return [...set].sort((a, b) => Number(a) - Number(b));
    }, [subjects]);

    // Filtr
    const filtered = useMemo(() => {
        if (activeSemester === "all") return subjects;
        return subjects.filter((s) => s.semester === activeSemester);
    }, [subjects, activeSemester]);

    // Umumiy GPA
    const overallGpa = useMemo(() => calcGpa(subjects), [subjects]);

    // Semester GPA grafigi
    const chartData = useMemo(() => {
        return semesters.map((sem) => {
            const semSubjects = subjects.filter((s) => s.semester === sem);
            return { semester: `${sem}-sem`, gpa: calcGpa(semSubjects) };
        });
    }, [subjects, semesters]);

    // Baho taqsimoti
    const gradeDistribution = useMemo(() => {
        const dist = { "5": 0, "4": 0, "3": 0, "2": 0 };
        filtered.forEach((s) => {
            const pts = resolveGradePoint(s.grade);
            if (pts >= 4.5) dist["5"]++;
            else if (pts >= 3.5) dist["4"]++;
            else if (pts >= 2.5) dist["3"]++;
            else dist["2"]++;
        });
        return dist;
    }, [filtered]);

    const totalCredits = useMemo(() => filtered.reduce((sum, s) => sum + s.credit, 0), [filtered]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center">
                            <GraduationCap size={22} />
                        </div>
                        {t.gpaCalculator || "GPA Hisoblash"}
                    </h1>
                    <p className="mt-1 opacity-60">{t.gpaCalcSub || "Baholaringizni kuzating va tahlil qiling"}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowExcelModal(true)}
                        className="px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-105 transition"
                    >
                        <FileSpreadsheet size={18} />
                        HEMIS / Excel Import
                    </button>
                    <button
                        onClick={() => setShowForm((v) => !v)}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 hover:scale-105 transition"
                    >
                        <Plus size={18} />
                        {t.addSubject || "Fan qo'shish"}
                    </button>
                </div>
            </div>

            {/* Excel Upload Modal */}
            {showExcelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div className="th-card p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setShowExcelModal(false)}
                            className="absolute top-4 right-4 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <FileSpreadsheet className="text-emerald-500" size={22} />
                            Excel / HEMIS-dan yuklash
                        </h3>
                        <p className="text-sm opacity-70 mb-4">
                            HEMIS yoki shablon Excel (.xlsx) faylingizni yuklang. Tizim fan nomi, kredit, baho va semestrni avtomatik ajratib oladi.
                        </p>
                        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 grid place-items-center cursor-pointer transition">
                            <Upload size={32} className="text-emerald-500 mb-2" />
                            <span className="text-sm font-semibold">
                                {uploading ? "Yuklanmoqda..." : "Excel faylni tanlang (.xlsx)"}
                            </span>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Add form */}
            {showForm && (
                <ScrollReveal>
                    <div className="th-card p-5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-60 flex-wrap">
                            Baholash Shkalasi:
                            <button
                                type="button"
                                onClick={() => { setScaleType("5"); setGrade("5"); }}
                                className={`px-2.5 py-1 rounded-lg transition ${scaleType === "5" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
                            >
                                5 ballik (OTM)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setScaleType("4"); setGrade("A"); }}
                                className={`px-2.5 py-1 rounded-lg transition ${scaleType === "4" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
                            >
                                4.0 Letter Grade
                            </button>
                            <button
                                type="button"
                                onClick={() => { setScaleType("100"); setGrade("90"); }}
                                className={`px-2.5 py-1 rounded-lg transition ${scaleType === "100" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
                            >
                                100 ballik
                            </button>
                            <button
                                type="button"
                                onClick={() => { setScaleType("ects"); setGrade("ECTS_A"); }}
                                className={`px-2.5 py-1 rounded-lg transition ${scaleType === "ects" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
                            >
                                ECTS
                            </button>
                        </div>

                        <form onSubmit={addSubject} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <input
                                className="th-input"
                                placeholder={t.subjectNamePlaceholder || "Fan nomi"}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <input
                                className="th-input"
                                placeholder={t.creditPlaceholder || "Kredit (masalan, 4)"}
                                value={credit}
                                onChange={(e) => setCredit(e.target.value)}
                                inputMode="numeric"
                            />
                            <select className="th-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                                {scaleType === "5" && (
                                    <>
                                        <option value="5">A'lo (5)</option>
                                        <option value="4">Yaxshi (4)</option>
                                        <option value="3">Qoniqarli (3)</option>
                                        <option value="2">Qoniqarsiz (2)</option>
                                    </>
                                )}
                                {scaleType === "4" && (
                                    <>
                                        <option value="A+">A+ (4.0)</option>
                                        <option value="A">A (4.0)</option>
                                        <option value="A-">A- (3.7)</option>
                                        <option value="B+">B+ (3.3)</option>
                                        <option value="B">B (3.0)</option>
                                        <option value="B-">B- (2.7)</option>
                                        <option value="C+">C+ (2.3)</option>
                                        <option value="C">C (2.0)</option>
                                        <option value="D">D (1.0)</option>
                                        <option value="F">F (0.0)</option>
                                    </>
                                )}
                                {scaleType === "100" && (
                                    <>
                                        <option value="95">90 - 100 (A'lo / 5.0)</option>
                                        <option value="80">71 - 89 (Yaxshi / 4.0)</option>
                                        <option value="60">55 - 70 (Qoniqarli / 3.0)</option>
                                        <option value="40">0 - 54 (Qoniqarsiz / 2.0)</option>
                                    </>
                                )}
                                {scaleType === "ects" && (
                                    <>
                                        <option value="ECTS_A">A (Excellent)</option>
                                        <option value="ECTS_B">B (Very Good)</option>
                                        <option value="ECTS_C">C (Good)</option>
                                        <option value="ECTS_D">D (Satisfactory)</option>
                                        <option value="ECTS_E">E (Sufficient)</option>
                                        <option value="ECTS_FX">FX (Fail - Retry)</option>
                                        <option value="ECTS_F">F (Fail)</option>
                                    </>
                                )}
                            </select>
                            <select className="th-input" value={semester} onChange={(e) => setSemester(e.target.value)}>
                                {Array.from({ length: 8 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1)}>{i + 1}-semestr</option>
                                ))}
                            </select>
                            <button className="th-btn-blue flex items-center justify-center gap-2">
                                <Plus size={18} /> {t.add || "Qo'shish"}
                            </button>
                        </form>
                    </div>
                </ScrollReveal>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="th-card p-5 text-center">
                    <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        {overallGpa}
                    </div>
                    <div className="text-sm opacity-60 mt-1">{t.overallGpa || "Umumiy GPA"}</div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                            style={{ width: `${(overallGpa / 5) * 100}%` }} />
                    </div>
                </div>
                <div className="th-card p-5 text-center">
                    <div className="text-4xl font-extrabold">{filtered.length}</div>
                    <div className="text-sm opacity-60 mt-1">{t.subjectsCount || "Fanlar soni"}</div>
                </div>
                <div className="th-card p-5 text-center">
                    <div className="text-4xl font-extrabold">{totalCredits}</div>
                    <div className="text-sm opacity-60 mt-1">{t.totalCredits || "Jami kreditlar"}</div>
                </div>
                <div className="th-card p-5 text-center">
                    <div className="text-4xl font-extrabold">{semesters.length}</div>
                    <div className="text-sm opacity-60 mt-1">{t.semesterCount || "Semestrlar"}</div>
                </div>
            </div>

            {/* GPA Trend Chart */}
            {chartData.length > 1 && (
                <ScrollReveal>
                    <div className="th-card p-5">
                        <div className="flex items-center gap-2 font-bold mb-4">
                            <TrendingUp size={18} className="text-indigo-500" />
                            {t.gpaTrend || "GPA o'zgarishi (semestrlar bo'yicha)"}
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v) => [v, "GPA"]} />
                                <Area type="monotone" dataKey="gpa" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ScrollReveal>
            )}

            {/* Grade distribution */}
            <div className="th-card p-5">
                <div className="flex items-center gap-2 font-bold mb-4">
                    <BookOpen size={18} className="text-purple-500" />
                    {t.gradeDistribution || "Baho taqsimoti"}
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {Object.entries(gradeDistribution).map(([g, count]) => (
                        <div key={g} className="text-center">
                            <div className={`mx-auto w-12 h-12 rounded-xl ${GRADE_COLORS[g] || "bg-slate-500"} text-white grid place-items-center font-extrabold text-lg`}>
                                {g}
                            </div>
                            <div className="mt-1 text-lg font-bold">{count}</div>
                            <div className="text-xs opacity-50">{g === "5" ? "A'lo" : g === "4" ? "Yaxshi" : g === "3" ? "Qoniq." : "Qoniqarsiz"}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Semester filter tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveSemester("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                        activeSemester === "all" ? "bg-indigo-600 text-white" : "th-card hover:scale-105"
                    }`}
                >
                    {t.all || "Hammasi"}
                </button>
                {semesters.map((sem) => (
                    <button
                        key={sem}
                        onClick={() => setActiveSemester(sem)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                            activeSemester === sem ? "bg-indigo-600 text-white" : "th-card hover:scale-105"
                        }`}
                    >
                        {sem}-semestr
                    </button>
                ))}
            </div>

            {/* Subjects list */}
            <div className="space-y-2">
                {loading && <div className="th-card p-6 text-center opacity-50">{t.loading || "Yuklanmoqda..."}</div>}

                {!loading && filtered.length === 0 && (
                    <div className="th-card p-8 text-center opacity-50">
                        {t.noSubjects || "Fan qo'shilmagan. Yuqoridagi tugma orqali qo'shing."}
                    </div>
                )}

                {filtered.map((s) => (
                    <div key={s.id} className="th-card p-4 flex items-center justify-between gap-3 hover:scale-[1.01] transition">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-12 h-10 rounded-xl ${GRADE_COLORS[s.grade] || "bg-indigo-500"} text-white grid place-items-center font-bold text-xs shrink-0`}>
                                {s.grade.replace("ECTS_", "")}
                            </div>
                            <div className="min-w-0">
                                <div className="font-semibold truncate">{s.name}</div>
                                <div className="text-xs opacity-50">
                                    {s.credit} kredit &middot; {s.semester}-semestr
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => removeSubject(s.id)}
                            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition shrink-0"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
