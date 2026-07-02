import { useEffect, useState } from "react";
import api from "../api";
import { Plus, Trash2, Megaphone } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

export default function Board() {
    const { t } = useLang();

    const categories = [
        ["book", t.catBook],
        ["roommate", t.catRoommate],
        ["tutor", t.catTutor],
        ["event", t.catEvent],
        ["other", t.catOther],
    ];
    const catLabel = Object.fromEntries(categories);

    const catColor = {
        book: "bg-sky-500",
        roommate: "bg-emerald-500",
        tutor: "bg-violet-500",
        event: "bg-amber-500",
        other: "bg-slate-500",
    };

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [category, setCategory] = useState("book");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [contact, setContact] = useState("");

    async function load() {
        try {
            const res = await api.get("/api/board/announcements/");
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
        if (!title.trim() || !body.trim()) return;
        await api.post("/api/board/announcements/", {
            category,
            title: title.trim(),
            body: body.trim(),
            contact: contact.trim(),
        });
        setTitle("");
        setBody("");
        setContact("");
        load();
    }

    async function remove(id) {
        await api.delete(`/api/board/announcements/${id}/`);
        load();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{t.boardTitle}</h1>
                <p className="mt-1 text-gray-600">{t.boardSub}</p>
            </div>

            <form onSubmit={add} className="th-card grid gap-3 md:grid-cols-2">
                <select className="th-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <input className="th-input" placeholder={t.adTitleField} value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea className="th-input md:col-span-2" rows={2} placeholder={t.adBodyField} value={body} onChange={(e) => setBody(e.target.value)} />
                <input className="th-input md:col-span-2" placeholder={t.adContactField} value={contact} onChange={(e) => setContact(e.target.value)} />
                <button className="th-btn-blue md:col-span-2"><Plus size={18} />{t.postAdBtn}</button>
            </form>

            {items.length === 0 ? (
                <div className="th-card text-center text-gray-500">{loading ? t.chatLoading : t.noAds}</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {items.map((a) => (
                        <div key={a.id} className="th-card">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs text-white px-2 py-1 rounded-full ${catColor[a.category] || "bg-slate-500"}`}>
                                        {catLabel[a.category] || a.category}
                                    </span>
                                    <Megaphone size={16} className="text-gray-400" />
                                </div>
                                {a.is_owner && (
                                    <button onClick={() => remove(a.id)} className="text-red-500 hover:text-red-600" title={t.delete}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 font-bold">{a.title}</div>
                            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{a.body}</p>
                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                <span>@{a.username}</span>
                                {a.contact && <span className="font-semibold text-indigo-500">{a.contact}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
