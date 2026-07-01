import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    PenSquare,
    Heart,
    MessageCircle,
    Eye,
    Sparkles,
    ArrowLeft,
    Trash2,
} from "lucide-react";
import api from "../api";

function fmtDate(s) {
    try {
        return new Date(s).toLocaleDateString();
    } catch {
        return "";
    }
}

function ArticleCard({ a, onOpen }) {
    return (
        <button
            type="button"
            onClick={() => onOpen(a.id)}
            className="th-card text-left w-full hover:shadow-lg transition"
        >
            <div className="font-extrabold text-lg line-clamp-1">{a.title}</div>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2 whitespace-pre-wrap">
                {a.content}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="font-semibold text-indigo-500">@{a.author_username}</span>
                <span className="inline-flex items-center gap-1"><Heart size={13} /> {a.reactions_count}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {a.comments_count}</span>
                <span className="inline-flex items-center gap-1"><Eye size={13} /> {a.views_count}</span>
                <span className="ml-auto">{fmtDate(a.created_at)}</span>
            </div>
        </button>
    );
}

function Editor({ onCreated }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);

    async function submit(e) {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error("Sarlavha va matnni to'ldiring");
            return;
        }
        setSaving(true);
        try {
            await api.post("/api/articles/articles/", { title, content });
            setTitle("");
            setContent("");
            toast.success("Maqola chop etildi");
            onCreated();
        } catch {
            toast.error("Xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={submit} className="th-card space-y-3">
            <div className="flex items-center gap-2 font-extrabold">
                <PenSquare size={18} /> Yangi maqola
            </div>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sarlavha"
                className="w-full px-4 py-2 rounded-xl border bg-transparent"
            />
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Erkin mavzuda matn yozing..."
                rows={5}
                className="w-full px-4 py-2 rounded-xl border bg-transparent"
            />
            <button
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-60"
            >
                {saving ? "Yuborilmoqda..." : "Chop etish"}
            </button>
        </form>
    );
}

function Detail({ id, me, onBack, onChanged }) {
    const [a, setA] = useState(null);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            const res = await api.get(`/api/articles/articles/${id}/`);
            setA(res.data);
        } catch {
            toast.error("Maqola topilmadi");
            onBack();
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function react() {
        try {
            const res = await api.post(`/api/articles/articles/${id}/react/`);
            setA((prev) => ({
                ...prev,
                reacted: res.data.reacted,
                reactions_count: res.data.reactions_count,
            }));
            onChanged();
        } catch {
            toast.error("Xatolik");
        }
    }

    async function addComment(e) {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            await api.post(`/api/articles/articles/${id}/comments/`, { content: comment });
            setComment("");
            load();
        } catch {
            toast.error("Izoh yuborilmadi");
        }
    }

    async function removeArticle() {
        if (!confirm("Maqolani o'chirasizmi?")) return;
        try {
            await api.delete(`/api/articles/articles/${id}/`);
            toast.success("O'chirildi");
            onChanged();
            onBack();
        } catch {
            toast.error("O'chirib bo'lmadi");
        }
    }

    if (loading || !a) {
        return <div className="th-card text-gray-500">Yuklanmoqda...</div>;
    }

    const isOwner = me && me.username === a.author_username;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-500">
                    <ArrowLeft size={16} /> Orqaga
                </button>
                {isOwner && (
                    <button onClick={removeArticle} className="inline-flex items-center gap-1 text-sm font-semibold text-red-500">
                        <Trash2 size={16} /> O'chirish
                    </button>
                )}
            </div>

            <div className="th-card">
                <h1 className="text-2xl font-extrabold">{a.title}</h1>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-indigo-500">@{a.author_username}</span>
                    <span className="inline-flex items-center gap-1"><Eye size={13} /> {a.views_count}</span>
                    <span>{fmtDate(a.created_at)}</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap leading-relaxed">{a.content}</p>

                <div className="mt-4 flex items-center gap-3">
                    <button
                        onClick={react}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-sm ${a.reacted ? "bg-red-500 text-white border-red-500" : ""}`}
                    >
                        <Heart size={15} /> {a.reactions_count}
                    </button>
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <MessageCircle size={15} /> {a.comments?.length || 0}
                    </span>
                </div>
            </div>

            <div className="th-card space-y-3">
                <div className="font-extrabold">Izohlar</div>
                <form onSubmit={addComment} className="flex gap-2">
                    <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Fikringizni yozing..."
                        className="flex-1 px-4 py-2 rounded-xl border bg-transparent"
                    />
                    <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold">Yuborish</button>
                </form>

                <div className="space-y-2">
                    {(a.comments || []).length === 0 ? (
                        <div className="text-sm text-gray-500">Hozircha izoh yo'q.</div>
                    ) : (
                        a.comments.map((c) => (
                            <div key={c.id} className="rounded-xl border p-3">
                                <div className="text-sm">
                                    <span className="font-semibold text-indigo-500">@{c.author_username}</span>
                                    <span className="ml-2 text-xs text-gray-400">{fmtDate(c.created_at)}</span>
                                </div>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{c.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Articles() {
    const [list, setList] = useState([]);
    const [top, setTop] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [me, setMe] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const [listRes, topRes] = await Promise.all([
                api.get("/api/articles/articles/", {
                    params: search ? { search } : {},
                }),
                api.get("/api/articles/articles/recommended/"),
            ]);
            setList(listRes.data || []);
            setTop(topRes.data || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

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

    useEffect(() => {
        const id = setTimeout(load, 300);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    if (openId) {
        return (
            <Detail
                id={openId}
                me={me}
                onBack={() => setOpenId(null)}
                onChanged={load}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white grid place-items-center">
                    <PenSquare size={20} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Maqolalar</h1>
                    <p className="mt-0.5 text-gray-600">Erkin mavzuda yozing, o'qing va fikr bildiring</p>
                </div>
            </div>

            {top.length > 0 && (
                <div className="th-card">
                    <div className="flex items-center gap-2 font-extrabold text-amber-500">
                        <Sparkles size={18} /> Tavsiya etilgan
                    </div>
                    <div className="mt-3 grid gap-2">
                        {top.map((a) => (
                            <button
                                key={a.id}
                                onClick={() => setOpenId(a.id)}
                                className="text-left rounded-xl border p-3 hover:bg-indigo-500/5 transition"
                            >
                                <div className="font-semibold line-clamp-1">{a.title}</div>
                                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                    <span className="text-indigo-500">@{a.author_username}</span>
                                    <span className="inline-flex items-center gap-1"><Heart size={12} /> {a.reactions_count}</span>
                                    <span className="inline-flex items-center gap-1"><Eye size={12} /> {a.views_count}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <Editor onCreated={load} />

            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Maqola qidirish (sarlavha)..."
                className="w-full px-4 py-2 rounded-xl border bg-transparent"
            />

            {loading ? (
                <div className="th-card text-gray-500">Yuklanmoqda...</div>
            ) : list.length === 0 ? (
                <div className="th-card text-center text-gray-500">Hozircha maqola yo'q.</div>
            ) : (
                <div className="grid gap-3">
                    {list.map((a) => (
                        <ArticleCard key={a.id} a={a} onOpen={setOpenId} />
                    ))}
                </div>
            )}
        </div>
    );
}
