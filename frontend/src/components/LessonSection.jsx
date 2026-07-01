import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, PlayCircle, X, ArrowLeft } from "lucide-react";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";

/**
 * Qayta ishlatiladigan darslar bo'limi.
 *
 * Ikki bosqich:
 *  1) Til tanlash ekrani (O'zbek / Ingliz)
 *  2) Tanlangan tildagi YouTube video darslar (sayt ichida embed)
 *
 * Admin (is_staff) yangi havola qo'sha oladi va o'chira oladi.
 *
 * @param {"growth"|"ielts"} category
 * @param {string} accent  Tailwind gradient klasslari (masalan "from-fuchsia-500 to-pink-500")
 * @param {string} title
 * @param {string} subtitle
 * @param {React.ReactNode} icon
 */
export default function LessonSection({ category, accent, title, subtitle, icon }) {
    const { t } = useLang();

    // null => til hali tanlanmagan (til tanlash ekrani ko'rsatiladi)
    const [pickedLang, setPickedLang] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [me, setMe] = useState(null);
    const [active, setActive] = useState(null); // ochilgan video (lightbox)

    // Admin qo'shish formasi
    const [showForm, setShowForm] = useState(false);
    const [fTitle, setFTitle] = useState("");
    const [fUrl, setFUrl] = useState("");
    const [fDesc, setFDesc] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

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
            const res = await api.get(`/api/lessons/items/?category=${category}&lang=${lang}`);
            setItems(res.data || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [category]);

    function pick(lang) {
        setPickedLang(lang);
        load(lang);
    }

    async function add(e) {
        e.preventDefault();
        setErr("");
        if (!fTitle.trim() || !fUrl.trim()) return;
        setSaving(true);
        try {
            await api.post("/api/lessons/items/", {
                category,
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

    async function remove(id) {
        await api.delete(`/api/lessons/items/${id}/`);
        load(pickedLang);
    }

    // ===== 1-bosqich: til tanlash ekrani =====
    if (!pickedLang) {
        return (
            <div className="th-fade">
                <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 text-white bg-gradient-to-br ${accent}`}>
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-center gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
                            <p className="mt-1 text-white/85">{subtitle}</p>
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
                            <span className="text-5xl transition group-hover:scale-110">🇺🇿</span>
                            <span className="text-lg font-extrabold">{t.langUz}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => pick("en")}
                            className="th-card group flex flex-col items-center gap-3 py-10 transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <span className="text-5xl transition group-hover:scale-110">🇬🇧</span>
                            <span className="text-lg font-extrabold">{t.langEn}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== 2-bosqich: video darslar =====
    return (
        <div className="th-fade space-y-6">
            <div className={`relative overflow-hidden rounded-3xl p-6 text-white bg-gradient-to-br ${accent}`}>
                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold">{title}</h1>
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

            {isAdmin && (
                <div className="th-card">
                    {!showForm ? (
                        <button className="th-btn-blue" onClick={() => setShowForm(true)}>
                            <Plus size={18} /> {t.lessonAdd}
                        </button>
                    ) : (
                        <form onSubmit={add} className="grid gap-3">
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

            {loading ? (
                <div className="th-card text-center text-[color:var(--text-muted)]">{t.loading}</div>
            ) : items.length === 0 ? (
                <div className="th-card text-center text-[color:var(--text-muted)]">{t.lessonEmpty}</div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((l, i) => (
                        <div key={l.id} className="th-card group overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-lg">
                            <button type="button" onClick={() => l.video_id && setActive(l)} className="relative block w-full">
                                {l.thumbnail_url ? (
                                    <img src={l.thumbnail_url} alt={l.title} className="aspect-video w-full object-cover" />
                                ) : (
                                    <div className="aspect-video w-full bg-[color:var(--surface-3)]" />
                                )}
                                <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                                    <PlayCircle size={56} className="text-white drop-shadow" />
                                </span>
                                <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white">
                                    #{i + 1}
                                </span>
                            </button>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-extrabold leading-tight">{l.title}</h3>
                                    {isAdmin && (
                                        <button onClick={() => remove(l.id)} className="shrink-0 text-red-500 hover:text-red-600" title={t.delete}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                {l.description && (
                                    <p className="mt-2 text-sm text-[color:var(--text-muted)] whitespace-pre-wrap">{l.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Video lightbox (sayt ichida ko'rish) */}
            {active && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setActive(null)} aria-hidden="true" />
                    <div className="relative w-full max-w-4xl">
                        <button
                            type="button"
                            onClick={() => setActive(null)}
                            className="absolute -top-12 right-0 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 font-semibold text-white backdrop-blur hover:bg-white/25"
                        >
                            <X size={18} /> {t.close}
                        </button>
                        <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
                            <iframe
                                className="aspect-video w-full"
                                src={`${active.embed_url}?autoplay=1&rel=0`}
                                title={active.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="mt-3 text-lg font-extrabold text-white">{active.title}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
