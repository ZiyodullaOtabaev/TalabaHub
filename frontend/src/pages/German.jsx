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
    BookOpen,
} from "lucide-react";
import VideoPlayerWithCaptions from "../components/VideoPlayerWithCaptions";
import ShareButton from "../components/ShareButton";
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

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null); // selected lesson (room)
    const [activeVideo, setActiveVideo] = useState(null); // video player open

    // Admin form
    const [showForm, setShowForm] = useState(false);
    const [fTitle, setFTitle] = useState("");
    const [fUrl, setFUrl] = useState("");
    const [fDesc, setFDesc] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    // Material upload
    const [showMaterialForm, setShowMaterialForm] = useState(false);
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

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/lessons/items/?category=${CATEGORY}`);
            setItems(res.data?.results || res.data || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function openVideo(lesson) {
        if (!lesson.video_id) return;
        setActiveVideo(lesson);
        try {
            const res = await api.post(`/api/lessons/items/${lesson.id}/watch/`);
            const vc = res?.data?.views_count;
            if (typeof vc === "number") {
                setItems((prev) =>
                    prev.map((it) => (it.id === lesson.id ? { ...it, views_count: vc } : it))
                );
                if (activeLesson?.id === lesson.id) {
                    setActiveLesson((prev) => ({ ...prev, views_count: vc }));
                }
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
                content_lang: "uz",
                title: fTitle.trim(),
                youtube_url: fUrl.trim(),
                description: fDesc.trim(),
            });
            setFTitle("");
            setFUrl("");
            setFDesc("");
            setShowForm(false);
            load();
        } catch (e2) {
            setErr(e2?.response?.data?.youtube_url?.[0] || t.lessonSaveError);
        } finally {
            setSaving(false);
        }
    }

    async function removeLesson(id) {
        await api.delete(`/api/lessons/items/${id}/`);
        if (activeLesson?.id === id) setActiveLesson(null);
        load();
    }

    async function uploadMaterial(e) {
        e.preventDefault();
        if (!mFile || !mTitle.trim() || !activeLesson) return;
        setMSaving(true);
        try {
            const formData = new FormData();
            formData.append("lesson", activeLesson.id);
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
            setShowMaterialForm(false);
            // Reload and update activeLesson
            const res = await api.get(`/api/lessons/items/?category=${CATEGORY}`);
            const newItems = res.data?.results || res.data || [];
            setItems(newItems);
            const updated = newItems.find((i) => i.id === activeLesson.id);
            if (updated) setActiveLesson(updated);
        } catch (err2) {
            toast.error(err2?.response?.data?.detail || t.germanMaterialError || "Xatolik");
        } finally {
            setMSaving(false);
        }
    }

    async function removeMaterial(materialId) {
        try {
            await api.delete(`/api/lessons/materials/${materialId}/`);
            const res = await api.get(`/api/lessons/items/?category=${CATEGORY}`);
            const newItems = res.data?.results || res.data || [];
            setItems(newItems);
            const updated = newItems.find((i) => i.id === activeLesson?.id);
            if (updated) setActiveLesson(updated);
        } catch {
            toast.error("O'chirishda xatolik");
        }
    }

    function getFileIcon(ext) {
        if (ext === "pdf") return "text-red-500";
        if (["doc", "docx"].includes(ext)) return "text-blue-500";
        return "text-gray-500";
    }

    // ===== Dars ichiga kirilgan holat =====
    if (activeLesson) {
        return (
            <div className="th-fade space-y-6">
                {/* Header */}
                <div className={`relative overflow-hidden rounded-3xl p-6 text-white bg-gradient-to-br ${ACCENT}`}>
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur">
                                <BookOpen size={22} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold">{activeLesson.title}</h1>
                                <p className="text-sm text-white/85">
                                    {t.navGerman || "Nemis tili"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveLesson(null)}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/30"
                        >
                            <ArrowLeft size={16} /> {t.germanBackToLessons || "Darslarga qaytish"}
                        </button>
                    </div>
                </div>

                {/* Video */}
                {activeLesson.video_id && (
                    <div className="th-card">
                        <button
                            type="button"
                            onClick={() => openVideo(activeLesson)}
                            className="relative w-full overflow-hidden rounded-xl group"
                        >
                            {activeLesson.thumbnail_url ? (
                                <img src={activeLesson.thumbnail_url} alt={activeLesson.title} className="aspect-video w-full object-cover transition group-hover:brightness-90" />
                            ) : (
                                <div className="aspect-video w-full bg-[color:var(--surface-3)]" />
                            )}
                            <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                                <PlayCircle size={56} className="text-white drop-shadow" />
                            </span>
                            {activeLesson.has_captions && (
                                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur">
                                    <Subtitles size={12} /> CC
                                </span>
                            )}
                        </button>
                        <div className="mt-3 flex items-center gap-3 text-sm text-[color:var(--text-muted)]">
                            <Eye size={14} />
                            <span>{fmtViews(activeLesson.views_count)} {t.germanViews || "ko'rilgan"}</span>
                            <ShareButton path="/german" id={activeLesson.id} label={activeLesson.title} variant="text" />
                        </div>
                        {activeLesson.description && (
                            <p className="mt-2 text-sm text-[color:var(--text-muted)]">{activeLesson.description}</p>
                        )}
                    </div>
                )}

                {/* Admin: Material yuklash */}
                {isAdmin && (
                    <div className="th-card">
                        {!showMaterialForm ? (
                            <button
                                type="button"
                                onClick={() => setShowMaterialForm(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-500/20 transition"
                            >
                                <Upload size={16} />
                                {t.germanUploadFile || "Fayl yuklash"}
                            </button>
                        ) : (
                            <form onSubmit={uploadMaterial} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold">
                                        {t.germanUploadFile || "Fayl yuklash"}
                                    </span>
                                    <button type="button" onClick={() => setShowMaterialForm(false)} className="text-gray-400 hover:text-gray-600">
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
                                    <button type="button" className="rounded-xl border px-4 py-2 font-semibold text-sm" onClick={() => setShowMaterialForm(false)}>
                                        {t.cancel}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Materiallar */}
                {activeLesson.materials && activeLesson.materials.length > 0 && (
                    <div className="th-card space-y-3">
                        <div className="text-sm font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                            {t.germanMaterials || "Materiallar"}
                        </div>
                        {activeLesson.materials.map((m) => (
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

                {/* Video player modal */}
                {activeVideo && (
                    <VideoPlayerWithCaptions
                        lesson={activeVideo}
                        onClose={() => setActiveVideo(null)}
                        isAdmin={isAdmin}
                    />
                )}
            </div>
        );
    }

    // ===== Asosiy ko'rinish: darslar ro'yxati (xonalar) =====
    return (
        <div className="th-fade space-y-6">
            {/* Header */}
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

            {/* Admin: Yangi dars (xona) qo'shish */}
            {isAdmin && (
                <div className="th-card">
                    {!showForm ? (
                        <button className="th-btn-blue" onClick={() => setShowForm(true)}>
                            <Plus size={18} /> {t.germanAddLesson || "Yangi dars qo'shish"}
                        </button>
                    ) : (
                        <form onSubmit={addLesson} className="grid gap-3">
                            <input className="th-input" placeholder={t.germanLessonTitle || "Dars nomi (masalan: 1-dars: Salomlashish)"} value={fTitle} onChange={(e) => setFTitle(e.target.value)} />
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

            {/* Darslar (xonalar) */}
            {loading ? (
                <div className="th-card text-center text-[color:var(--text-muted)]">{t.loading}</div>
            ) : items.length === 0 ? (
                <div className="th-card text-center text-[color:var(--text-muted)]">{t.lessonEmpty}</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((lesson, idx) => (
                        <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setActiveLesson(lesson)}
                            className="th-card group text-left transition hover:-translate-y-1 hover:shadow-lg relative"
                        >
                            {/* Thumbnail */}
                            {lesson.thumbnail_url && (
                                <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl">
                                    <img src={lesson.thumbnail_url} alt={lesson.title} className="aspect-video w-full object-cover transition group-hover:scale-105" />
                                    <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 px-2 py-0.5 text-xs font-bold text-white">
                                        {idx + 1}-dars
                                    </span>
                                </div>
                            )}

                            {!lesson.thumbnail_url && (
                                <div className="inline-flex items-center gap-2 mb-3">
                                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 font-extrabold text-sm">
                                        {idx + 1}
                                    </span>
                                </div>
                            )}

                            <h3 className="text-base font-bold leading-snug line-clamp-2">{lesson.title}</h3>

                            {lesson.description && (
                                <p className="mt-1 text-xs text-[color:var(--text-muted)] line-clamp-2">{lesson.description}</p>
                            )}

                            <div className="mt-3 flex items-center gap-3 text-xs text-[color:var(--text-muted)]">
                                {lesson.video_id && (
                                    <span className="inline-flex items-center gap-1">
                                        <PlayCircle size={12} /> Video
                                    </span>
                                )}
                                {lesson.materials?.length > 0 && (
                                    <span className="inline-flex items-center gap-1">
                                        <FileText size={12} /> {lesson.materials.length} {t.germanMaterials || "material"}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1">
                                    <Eye size={12} /> {fmtViews(lesson.views_count)}
                                </span>
                            </div>

                            {/* Admin delete */}
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeLesson(lesson.id); }}
                                    className="absolute top-3 right-3 rounded-lg bg-red-500/10 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition hover:bg-red-500/20"
                                    title={t.delete}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
