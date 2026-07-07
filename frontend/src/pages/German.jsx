import { useCallback, useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    PlayCircle,
    ArrowLeft,
    Eye,
    Subtitles,
    FileText,
    Upload,
    Download,
    X,
    Languages as LangIcon,
} from "lucide-react";
import VideoPlayerWithCaptions from "../components/VideoPlayerWithCaptions";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import toast from "react-hot-toast";

function fmtViews(n) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n || 0}`;
}

const CATEGORY = "german";
const ACCENT = "from-emerald-500 via-teal-600 to-cyan-600";

export default function German() {
    const { t } = useLang();

    const [pickedLang, setPickedLang] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [me, setMe] = useState(null);
    const [active, setActive] = useState(null);

    // Admin form
    const [showForm, setShowForm] = useState(false);
    const [fTitle, setFTitle] = useState("");
    const [fUrl, setFUrl] = useState("");
    const [fDesc, setFDesc] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    // Material upload
    const [showMaterialForm, setShowMaterialForm] = useState(null); // lesson id or null
    const [mTitle, setMTitle] = useState("");
    const [mDesc, setMDesc] = useState("");
    const [mFile, setMFile] = useState(null);
    const [mSaving, setMSaving] = useState(false);

    const isAdmin = !!(me?.is_staff || me?.is_superuser);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/users/me/");
                setMe(res.data);
            } catch {
                // ignore
            }
        })();
    }, []);

    const load = useCallback(async (lang) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/lessons/items/?category=${CATEGORY}&lang=${lang}`);
            setItems(res.data?.results || res.data || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    function pick(lang) {
        setPickedLang(lang);
        load(lang);
    }

    async function openVideo(l) {
        if (!l.video_id) return;
        setActive(l);
        try {
            const res = await api.post(`/api/lessons/items/${l.id}/watch/`);
            const vc = res?.data?.views_count;
            if (typeof vc === "number") {
                setItems((prev) =>
                    prev.map((it) => (it.id === l.id ? { ...it, views_count: vc } : it))
                );
            }
        } catch {
            // ignore
        }
    }

    async function addLesson(e) {
        e.preventDefault();
        setErr("");
        if (!fTitle.trim() || !fUrl.trim()) return;
        setSaving(true);
        try {
            await api.post("/api/lessons/items/", {
                category: CATEGORY,
                content_lang: pickedLang,
                title: fTitle.trim(),
                youtube_url: fUrl.trim(),
                description: fDesc.trim(),
            });
            setFTitle("");
            setFUrl("");
            setFDesc("");
            setShowForm(false);
            load(pickedLang);
        } catch (e2) {
            setErr(e2?.response?.data?.youtube_url?.[0] || t.lessonSaveError);
        } finally {
            setSaving(false);
        }
    }

    async function removeLesson(id) {
        await api.delete(`/api/lessons/items/${id}/`);
        load(pickedLang);
    }

    async function uploadMaterial(e) {
        e.preventDefault();
        if (!mFile || !mTitle.trim()) return;
        setMSaving(true);
        try {
            const formData = new FormData();
            formData.append("lesson", showMaterialForm);
            formData.append("title", mTitle.trim());
            formData.append("description", mDesc.trim());
            formData.append("file", mFile);
            await api.post("/api/lessons/materials/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(t.germanMaterialUploaded || "Fayl yuklandi");
            setMTitle("");
            setMDesc("");
            setMFile(null);
            setShowMaterialForm(null);
            load(pickedLang);
        } catch (err2) {
            toast.error(err2?.response?.data?.detail || t.germanMaterialError || "Xatolik");
        } finally {
            setMSaving(false);
        }
    }

    async function removeMaterial(materialId) {
        try {
            await api.delete(`/api/lessons/materials/${materialId}/`);
            load(pickedLang);
        } catch {
            toast.error("O'chirishda xatolik");
        }
    }

    function getFileIcon(ext) {
        if (ext === "pdf") return "text-red-500";
        if (["doc", "docx"].includes(ext)) return "text-blue-500";
        return "text-gray-500";
    }

    // ===== Til tanlash ekrani =====
    if (!pickedLang) {
        return (
            <div className="th-fade">
                <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 text-white bg-gradient-to-br ${ACCENT}`}>
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-center gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                            <LangIcon size={26} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {t.navGerman || "Nemis tili"}
                            </h1>
                            <p className="mt-1 text-white/85">
                                {t.germanSub || "Nemis tili darslari: video va materiallar"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-10 max-w-2xl text-center">
                    <h2 className="text-2xl font-extrabold">{t.lessonChooseLang}</h2>
                    <p className="mt-2 text-[color:var(--text-muted)]">{t.lessonChooseLangDesc}</p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => pick("uz")}
                            className="th-card group flex flex-col items-center gap-3 py-10 transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <span className="text-5xl transition group-hover:scale-110">&#x1F1FA;&#x1F1FF;</span>
                            <span className="text-lg font-extrabold">{t.langUz}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => pick("en")}
                            className="th-card group flex flex-col items-center gap-3 py-10 transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <span className="text-5xl transition group-hover:scale-110">&#x1F1EC;&#x1F1E7;</span>
                            <span className="text-lg font-extrabold">{t.langEn}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== Darslar sahifasi =====
    return (
        <div className="th-fade space-y-6">
            {/* Header */}
            <div className={`relative overflow-hidden rounded-3xl p-6 text-white bg-gradient-to-br ${ACCENT}`}>
                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur">
                            <LangIcon size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold">
                                {t.navGerman || "Nemis tili"}
                            </h1>
                            <p className="text-sm text-white/85">
                                {pickedLang === "uz" ? t.langUz : t.langEn}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => { setPickedLang(null); setItems([]); setShowForm(false); }}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/30"
                    >
                        <ArrowLeft size={16} /> {t.lessonChangeLang}
                    </button>
                </div>
            </div>

            {/* Admin: Yangi dars qo'shish */}
            {isAdmin && (
                <div className="th-card">
                    {!showForm ? (
                        <button className="th-btn-blue" onClick={() => setShowForm(true)}>
                            <Plus size={18} /> {t.lessonAdd}
                        </button>
                    ) : (
                        <form onSubmit={addLesson} className="grid gap-3">
                            <input className="th-input" placeholder={t.titleField} value={fTitle} onChange={(e) => setFTitle(e.target.value)} />
                            <input className="th-input" placeholder={t.lessonUrlField} value={fUrl} onChange={(e) => setFUrl(e.target.value)} />
                            <textarea className="th-input" rows={2} placeholder={t.resDescField} value={fDesc} onChange={(e) => setFDesc(e.target.value)} />
                            {err && <div className="text-sm font-semibold text-red-500">{err}</div>}
                            <div className="flex gap-2">
                                <button className="th-btn-blue" disabled={saving}>{saving ? t.loading : t.save}</button>
                                <button type="button" className="rounded-xl border px-4 py-3 font-semibold" onClick={() => { setShowForm(false); setErr(""); }}>{t.cancel}</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Darslar ro'yxati */}
            {loading ? (
                <div className="th-card text-center text-[color:var(--text-muted)]">{t.loading}</div>
            ) : items.length === 0 ? (
                <div className="th-card text-center text-[color:var(--text-muted)]">{t.lessonEmpty}</div>
            ) : (
                <div className="space-y-6">
                    {items.map((l) => (
                        <div key={l.id} className="th-card space-y-4">
                            {/* Video qismi */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Thumbnail */}
                                <button
                                    type="button"
                                    onClick={() => openVideo(l)}
                                    className="relative shrink-0 w-full sm:w-64 overflow-hidden rounded-xl group"
                                >
                                    {l.thumbnail_url ? (
                                        <img src={l.thumbnail_url} alt={l.title} className="aspect-video w-full object-cover transition group-hover:brightness-90" />
                                    ) : (
                                        <div className="aspect-video w-full bg-[color:var(--surface-3)]" />
                                    )}
                                    <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition group-hover:opacity-100">
                                        <PlayCircle size={40} className="text-white drop-shadow" />
                                    </span>
                                    {l.has_captions && (
                                        <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-lg bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                                            <Subtitles size={11} /> CC
                                        </span>
                                    )}
                                </button>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-lg font-bold leading-snug">{l.title}</h3>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
                                                <Eye size={13} />
                                                <span>{fmtViews(l.views_count)}</span>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <button onClick={() => removeLesson(l.id)} className="shrink-0 text-red-500 hover:text-red-600" title={t.delete}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {l.description && (
                                        <p className="mt-2 text-sm text-[color:var(--text-muted)]">{l.description}</p>
                                    )}

                                    {/* Admin: Material yuklash tugmasi */}
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => setShowMaterialForm(showMaterialForm === l.id ? null : l.id)}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-500/20 transition"
                                        >
                                            <Upload size={14} />
                                            {t.germanUploadFile || "Fayl yuklash"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Admin: Material yuklash formasi */}
                            {isAdmin && showMaterialForm === l.id && (
                                <form onSubmit={uploadMaterial} className="rounded-xl border border-dashed border-emerald-300 p-4 space-y-3 bg-emerald-50/50 dark:bg-emerald-900/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                            {t.germanUploadFile || "Fayl yuklash"}
                                        </span>
                                        <button type="button" onClick={() => setShowMaterialForm(null)} className="text-gray-400 hover:text-gray-600">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <input
                                        className="th-input"
                                        placeholder={t.germanFileTitle || "Fayl nomi"}
                                        value={mTitle}
                                        onChange={(e) => setMTitle(e.target.value)}
                                    />
                                    <textarea
                                        className="th-input"
                                        rows={2}
                                        placeholder={t.germanFileDesc || "Tavsif (ixtiyoriy)"}
                                        value={mDesc}
                                        onChange={(e) => setMDesc(e.target.value)}
                                    />
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                        onChange={(e) => setMFile(e.target.files?.[0] || null)}
                                        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-emerald-700"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={mSaving || !mFile || !mTitle.trim()}
                                            className="th-btn-blue disabled:opacity-50"
                                        >
                                            {mSaving ? t.loading : (t.germanUploadBtn || "Yuklash")}
                                        </button>
                                        <button type="button" className="rounded-xl border px-4 py-2 font-semibold text-sm" onClick={() => setShowMaterialForm(null)}>
                                            {t.cancel}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Materiallar ro'yxati */}
                            {l.materials && l.materials.length > 0 && (
                                <div className="border-t pt-3 space-y-2">
                                    <div className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                                        {t.germanMaterials || "Materiallar"}
                                    </div>
                                    {l.materials.map((m) => (
                                        <div key={m.id} className="flex items-center gap-3 rounded-xl bg-[color:var(--surface-2)] p-3 transition hover:bg-[color:var(--surface-3)]">
                                            <FileText size={20} className={getFileIcon(m.file_extension)} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold truncate">{m.title}</div>
                                                {m.description && (
                                                    <p className="text-xs text-[color:var(--text-muted)] line-clamp-2 mt-0.5">{m.description}</p>
                                                )}
                                                <div className="text-xs text-[color:var(--text-muted)] mt-0.5">
                                                    {m.file_extension?.toUpperCase()} {m.file_size && `\u2022 ${m.file_size}`}
                                                </div>
                                            </div>
                                            <a
                                                href={m.file_url || m.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition shrink-0"
                                            >
                                                <Download size={13} />
                                                {t.germanDownload || "Yuklab olish"}
                                            </a>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => removeMaterial(m.id)}
                                                    className="shrink-0 text-red-400 hover:text-red-600"
                                                    title={t.delete}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Video player */}
            {active && (
                <VideoPlayerWithCaptions
                    lesson={active}
                    onClose={() => setActive(null)}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
}
