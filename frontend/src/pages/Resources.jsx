import { useEffect, useState } from "react";
import api from "../api";
import { Plus, Trash2, ExternalLink, BookOpen } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

export default function Resources() {
    const { t } = useLang();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");

    async function load() {
        try {
            const res = await api.get("/api/resources/items/");
            setItems(res.data || []);
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
        load();
    }

    async function remove(id) {
        await api.delete(`/api/resources/items/${id}/`);
        load();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{t.resourcesTitle}</h1>
                <p className="mt-1 text-gray-600">{t.resourcesSub}</p>
            </div>

            <form onSubmit={add} className="th-card grid gap-3 md:grid-cols-2">
                <input className="th-input" placeholder={t.titleField} value={title} onChange={(e) => setTitle(e.target.value)} />
                <input className="th-input" placeholder={t.subjectField} value={subject} onChange={(e) => setSubject(e.target.value)} />
                <input className="th-input md:col-span-2" placeholder={t.resUrlField} value={url} onChange={(e) => setUrl(e.target.value)} />
                <textarea className="th-input md:col-span-2" rows={2} placeholder={t.resDescField} value={description} onChange={(e) => setDescription(e.target.value)} />
                <button className="th-btn-blue md:col-span-2"><Plus size={18} />{t.addResource}</button>
            </form>

            {items.length === 0 ? (
                <div className="th-card text-center text-gray-500">{loading ? t.chatLoading : t.noResources}</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((r) => (
                        <div key={r.id} className="th-card">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <BookOpen size={18} className="text-indigo-500 shrink-0" />
                                    <div className="font-semibold truncate">{r.title}</div>
                                </div>
                                <button onClick={() => remove(r.id)} className="text-red-500 hover:text-red-600 shrink-0" title={t.delete}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {r.subject && <div className="mt-1 text-xs font-semibold text-indigo-500">{r.subject}</div>}
                            {r.description && <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{r.description}</p>}
                            {r.url && (
                                <a href={r.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
                                    <ExternalLink size={14} />{t.openLink}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
