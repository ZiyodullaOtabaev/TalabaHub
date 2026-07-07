import { useEffect, useRef, useState } from "react";
import api from "../api";
import { Send, MessagesSquare, Plus, Hash, Smile, Reply, X, Users } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

const EMOJIS = ["👍", "❤️", "😂", "🔥", "👏", "💯", "🎉", "😊", "🤔", "👀", "✅", "⭐"];

function initialsOf(name) {
    return (name || "U").slice(0, 2).toUpperCase();
}

function colorFor(name) {
    const colors = [
        "bg-indigo-500", "bg-emerald-500", "bg-rose-500",
        "bg-amber-500", "bg-sky-500", "bg-violet-500", "bg-teal-500",
        "bg-pink-500", "bg-cyan-500", "bg-orange-500",
    ];
    let sum = 0;
    for (let i = 0; i < (name || "").length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Bugun";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Kecha";
    return d.toLocaleDateString();
}

export default function Chat() {
    const { t } = useLang();

    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [newRoom, setNewRoom] = useState("");

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [me, setMe] = useState(null);

    const [showEmoji, setShowEmoji] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [onlineCount, setOnlineCount] = useState(0);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    async function loadRooms() {
        try {
            const res = await api.get("/api/chat/rooms/");
            setRooms(res.data?.results || res.data || []);
        } catch { /* ignore */ }
    }

    async function loadMessages() {
        try {
            const url = activeRoom
                ? `/api/chat/messages/?room=${activeRoom}`
                : "/api/chat/messages/";
            const res = await api.get(url);
            const msgs = res.data?.results || res.data || [];
            setMessages(msgs);

            // Unique users in last 5 min = "online"
            const fiveMinAgo = Date.now() - 5 * 60 * 1000;
            const recent = new Set(msgs.filter((m) => new Date(m.created_at).getTime() > fiveMinAgo).map((m) => m.username));
            setOnlineCount(Math.max(recent.size, 1));
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/users/me/");
                setMe(res.data);
            } catch { /* ignore */ }
        })();
        loadRooms();
        // Chatga kirdi = xabarlarni o'qidi
        localStorage.setItem("chat_read_at", new Date().toISOString());
        window.dispatchEvent(new Event("notif-read"));
    }, []);

    useEffect(() => {
        setLoading(true);
        loadMessages();
        const id = setInterval(loadMessages, 4000);
        return () => clearInterval(id);
    }, [activeRoom]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function send(e) {
        e.preventDefault();
        let value = text.trim();
        if (!value || sending) return;

        // Reply prefix
        if (replyTo) {
            value = `↩️ @${replyTo.username}: "${replyTo.text.slice(0, 50)}${replyTo.text.length > 50 ? "..." : ""}"\n\n${value}`;
        }

        setSending(true);
        setText("");
        setReplyTo(null);
        setShowEmoji(false);
        try {
            await api.post("/api/chat/messages/", { text: value, room: activeRoom });
            await loadMessages();
        } catch {
            setText(value);
        } finally {
            setSending(false);
        }
    }

    function addEmoji(emoji) {
        setText((prev) => prev + emoji);
        setShowEmoji(false);
        inputRef.current?.focus();
    }

    async function createRoom(e) {
        e.preventDefault();
        const name = newRoom.trim();
        if (!name) return;
        try {
            const res = await api.post("/api/chat/rooms/", { name });
            setNewRoom("");
            await loadRooms();
            setActiveRoom(res.data.id);
        } catch { /* ignore */ }
    }

    // Group messages by date
    const groupedMessages = messages.reduce((acc, m) => {
        const date = formatDate(m.created_at);
        if (!acc.length || acc[acc.length - 1].date !== date) {
            acc.push({ date, messages: [m] });
        } else {
            acc[acc.length - 1].messages.push(m);
        }
        return acc;
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white grid place-items-center">
                        <MessagesSquare size={22} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{t.chatTitle || "Chat"}</h1>
                        <p className="text-sm opacity-60">{t.chatSub || "Talabalar bilan muloqot"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm opacity-60">
                    <Users size={14} />
                    <span>{onlineCount} online</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                {/* Rooms */}
                <div className="th-card p-4 h-max">
                    <div className="font-bold text-sm mb-3">{t.roomsTitle || "Xonalar"}</div>
                    <div className="space-y-1">
                        <button
                            onClick={() => setActiveRoom(null)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${!activeRoom ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                        >
                            <Hash size={14} /> {t.roomGeneral || "Umumiy"}
                        </button>
                        {rooms.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setActiveRoom(r.id)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${activeRoom === r.id ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                            >
                                <Hash size={14} /> <span className="truncate">{r.name}</span>
                            </button>
                        ))}
                    </div>
                    {(me?.is_staff || me?.is_superuser) && (
                        <form onSubmit={createRoom} className="mt-3 flex gap-1">
                            <input className="th-input flex-1 !py-1.5 text-xs" placeholder={t.newRoom || "Yangi xona"} value={newRoom} onChange={(e) => setNewRoom(e.target.value)} />
                            <button className="px-2 py-1.5 rounded-xl bg-violet-600 text-white"><Plus size={14} /></button>
                        </form>
                    )}
                </div>

                {/* Messages area */}
                <div className="th-card flex flex-col" style={{ height: "70vh" }}>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                        {loading ? (
                            <div className="h-full grid place-items-center opacity-50">{t.chatLoading || "Yuklanmoqda..."}</div>
                        ) : messages.length === 0 ? (
                            <div className="h-full grid place-items-center text-center opacity-40">
                                <div>
                                    <MessagesSquare size={40} className="mx-auto mb-2 opacity-30" />
                                    <div>{t.chatEmpty || "Xabarlar yo'q. Birinchi bo'ling!"}</div>
                                </div>
                            </div>
                        ) : (
                            groupedMessages.map((group) => (
                                <div key={group.date}>
                                    <div className="text-center my-4">
                                        <span className="text-[10px] px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 opacity-60">
                                            {group.date}
                                        </span>
                                    </div>
                                    {group.messages.map((m) => {
                                        const mine = me && m.username === me.username;
                                        return (
                                            <div key={m.id} className={`flex items-end gap-2 mb-2 group ${mine ? "justify-end" : "justify-start"}`}>
                                                {!mine && (
                                                    <div className={`w-8 h-8 shrink-0 rounded-full grid place-items-center text-white text-[10px] font-bold ${colorFor(m.username)}`}>
                                                        {initialsOf(m.username)}
                                                    </div>
                                                )}
                                                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 relative ${mine ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md" : "bg-slate-100 dark:bg-slate-800 rounded-bl-md"}`}>
                                                    {!mine && <div className="text-[11px] font-bold text-violet-500 mb-0.5">@{m.username}</div>}
                                                    <div className="whitespace-pre-wrap break-words text-sm">{m.text}</div>
                                                    <div className={`text-[10px] mt-1 ${mine ? "text-white/60" : "opacity-40"}`}>
                                                        {formatTime(m.created_at)}
                                                    </div>

                                                    {/* Reply button */}
                                                    <button
                                                        onClick={() => { setReplyTo(m); inputRef.current?.focus(); }}
                                                        className={`absolute -top-2 ${mine ? "-left-8" : "-right-8"} opacity-0 group-hover:opacity-100 transition p-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:scale-110`}
                                                    >
                                                        <Reply size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Reply indicator */}
                    {replyTo && (
                        <div className="px-4 py-2 border-t flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50">
                            <Reply size={14} className="text-violet-500" />
                            <span className="opacity-60 truncate">@{replyTo.username}: {replyTo.text.slice(0, 60)}</span>
                            <button onClick={() => setReplyTo(null)} className="ml-auto p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="border-t px-4 py-3">
                        {/* Emoji picker */}
                        {showEmoji && (
                            <div className="mb-2 flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 animate-fade-in">
                                {EMOJIS.map((e) => (
                                    <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:scale-125 transition p-1">
                                        {e}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={send} className="flex items-center gap-2">
                            <button type="button" onClick={() => setShowEmoji((v) => !v)}
                                className={`p-2 rounded-xl transition ${showEmoji ? "bg-violet-100 dark:bg-violet-500/20 text-violet-500" : "hover:bg-slate-100 dark:hover:bg-slate-800 opacity-50"}`}>
                                <Smile size={20} />
                            </button>
                            <input
                                ref={inputRef}
                                className="th-input flex-1"
                                placeholder={t.chatPlaceholder || "Xabar yozing..."}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                maxLength={2000}
                            />
                            <button type="submit" disabled={sending || !text.trim()}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold flex items-center gap-1.5 disabled:opacity-40 hover:scale-105 transition">
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
