import { useEffect, useState } from "react";
import api from "../api";
import { Plus, Trash2, ExternalLink, BookOpen, Play, Video, FileText, Search } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { useTheme } from "../components/ThemeProvider";

function cn(...xs) {
    return xs.filter(Boolean).join(" ");
}

/* ===== YouTube-style Video bo'limi ===== */

// YouTube video ID'sini URLdan ajratib olish
function extractYouTubeId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

function VideoCard({ resource, onDelete, isDark }) {
    const ytId = extractYouTubeId(resource.url);
    const thumbnailUrl = ytId
        ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
        : null;

    return (
        <div className={cn(
            "group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg",
            isDark ? "border-indigo-500/15 hover:border-indigo-500/30 bg-[color:var(--surface)]" : "border-gray-200 hover:border-indigo-200 bg-white"
        )}>
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 overflow-hidden">
                {thumbnailUrl ? (
                    <a href={resource.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                        <img
                            src={thumbnailUrl}
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                <Play size={24} className="text-white ml-1" fill="white" />
                            </div>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-medium">
                            VIDEO
                        </div>
                    </a>
                ) : (
                    <a href={resource.url || "#"} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: "var(--gradient-primary)", opacity: 0.8 }}
                        >
                            {resource.url ? <Video size={28} className="text-white" /> : <FileText size={28} className="text-white" />}
                        </div>
                    </a>
                )}
            </div>

            {/* Info */}
            <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{resource.title}</h3>
                        {resource.subject && (
                            <p className={cn("mt-1 text-xs font-medium", isDark ? "text-indigo-400" : "text-indigo-600")}>
                                {resource.subject}
                            </p>
                        )}
                        {resource.description && (
                            <p className={cn("mt-1 text-xs line-clamp-2", isDark ? "text-gray-400" : "text-gray-500")}>
                                {resource.description}
                            </p>
                        )}
                    </div>
                    <button onClick={() => onDelete(resource.id)} className="text-red-400 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" title="O'chirish">
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ===== Article Card ===== */
function ArticleCard({ resource, onDelete, isDark }) {
    return (
        <div className={cn(
            "group rounded-2xl border p-4 transition-all duration-300 hover:shadow-md",
            isDark ? "border-indigo-500/15 hover:border-indigo-500/30 bg-[color:var(--surface)]" : "border-gray-200 hover:border-indigo-200 bg-white"
        )}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isDark ? "bg-indigo-500/15" : "bg-indigo-50"
                    )}>
                        <BookOpen size={18} className="text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-sm">{resource.title}</div>
                        {resource.subject && (
                            <div className={cn("mt-0.5 text-xs font-medium", isDark ? "text-indigo-400" : "text-indigo-600")}>{resource.subject}</div>
                        )}
                        {resource.description && (
                            <p className={cn("mt-1.5 text-xs line-clamp-2", isDark ? "text-gray-400" : "text-gray-600")}>{resource.description}</p>
                        )}
                        {resource.url && (
                            <a href={resource.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition">
                                <ExternalLink size={12} /> Ochish
                            </a>
                        )}
                    </div>
                </div>
                <button onClick={() => onDelete(resource.id)} className="text-red-400 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" title="O'chirish">
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

export default function Resources() {
    const { t } = useLang();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("all"); // all | videos | articles

    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [showForm, setShowForm] = useState(false);

    async function load() {
        try {
            const res = await api.get("/api/resources/items/");
            setItems(res.data?.results || res.data || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function add(e) {
        e.preventDefault();
        if (!title.trim()) return;
        await api.post("/api/resources/items/", {
            title: title.trim(),
            subject: subject.trim(),
            url: url.trim(),
            description: description.trim(),
        });
        setTitle("");
        setSubject("");
        setUrl("");
        setDescription("");
        setShowForm(false);
        load();
    }

    async function remove(id) {
        await api.delete(`/api/resources/items/${id}/`);
        load();
    }

    // Filter
    const filtered = items.filter((r) => {
        const matchSearch = !searchTerm ||
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.subject || "").toLowerCase().includes(searchTerm.toLowerCase());

        if (viewMode === "videos") return matchSearch && extractYouTubeId(r.url);
        if (viewMode === "articles") return matchSearch && !extractYouTubeId(r.url);
        return matchSearch;
    });

    const videoItems = filtered.filter((r) => extractYouTubeId(r.url));
    const articleItems = filtered.filter((r) => !extractYouTubeId(r.url));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t.resourcesTitle}</h1>
                    <p className={cn("mt-1", isDark ? "text-indigo-300" : "text-gray-600")}>{t.resourcesSub}</p>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="th-btn-blue text-sm"
                >
                    <Plus size={18} /> {t.addResource}
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <form onSubmit={add} className="th-card grid gap-3 md:grid-cols-2">
                    <input className="th-input" placeholder={t.titleField} value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input className="th-input" placeholder={t.subjectField} value={subject} onChange={(e) => setSubject(e.target.value)} />
                    <input className="th-input md:col-span-2" placeholder={t.resUrlField + " (YouTube URL yoki boshqa)"} value={url} onChange={(e) => setUrl(e.target.value)} />
                    <textarea className="th-input md:col-span-2" rows={2} placeholder={t.resDescField} value={description} onChange={(e) => setDescription(e.target.value)} />
                    <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className="th-btn-blue flex-1"><Plus size={18} /> {t.addResource}</button>
                        <button type="button" onClick={() => setShowForm(false)} className="th-btn-outline">{t.cancel}</button>
                    </div>
                </form>
            )}

            {/* Search & Filter bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className={cn(
                    "flex items-center gap-2 flex-1 min-w-[200px] rounded-xl border px-3 py-2.5 transition",
                    isDark ? "border-indigo-500/20 bg-indigo-500/5" : "border-gray-200 bg-white"
                )}>
                    <Search size={16} className="opacity-40" />
                    <input
                        className="w-full outline-none bg-transparent text-sm"
                        placeholder="Qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ color: "var(--text)" }}
                    />
                </div>

                <div className={cn(
                    "inline-flex rounded-xl border p-1",
                    isDark ? "border-indigo-500/20 bg-indigo-500/5" : "border-gray-200 bg-gray-50"
                )}>
                    {[["all", "Hammasi"], ["videos", "Videolar"], ["articles", "Maqolalar"]].map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setViewMode(key)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition",
                                viewMode === key ? "text-white" : (isDark ? "text-indigo-300" : "text-gray-600")
                            )}
                            style={viewMode === key ? { background: "var(--gradient-primary)" } : undefined}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {items.length === 0 ? (
                <div className="th-card text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: "var(--gradient-primary)", opacity: 0.2 }}
                    >
                        <BookOpen size={28} className="text-indigo-500" />
                    </div>
                    <p className="opacity-60">{loading ? t.chatLoading : t.noResources}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Videos section - YouTube style grid */}
                    {(viewMode === "all" || viewMode === "videos") && videoItems.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Video size={20} className="text-red-500" />
                                <h2 className="text-lg font-bold">Videolar</h2>
                                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                                    isDark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-600"
                                )}>{videoItems.length}</span>
                            </div>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {videoItems.map((r) => (
                                    <VideoCard key={r.id} resource={r} onDelete={remove} isDark={isDark} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Articles section */}
                    {(viewMode === "all" || viewMode === "articles") && articleItems.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <FileText size={20} className="text-indigo-500" />
                                <h2 className="text-lg font-bold">Maqolalar va materiallar</h2>
                                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                                    isDark ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                                )}>{articleItems.length}</span>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {articleItems.map((r) => (
                                    <ArticleCard key={r.id} resource={r} onDelete={remove} isDark={isDark} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty filter state */}
                    {filtered.length === 0 && (
                        <div className="th-card text-center py-8">
                            <p className="opacity-60">Natija topilmadi</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
