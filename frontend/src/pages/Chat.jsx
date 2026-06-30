import { useEffect, useRef, useState } from "react";
import api from "../api";
import { Send, MessagesSquare, Plus, Hash } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

function initialsOf(name) {
    return (name || "U").slice(0, 2).toUpperCase();
}

function colorFor(name) {
    const colors = [
        "bg-indigo-500", "bg-emerald-500", "bg-rose-500",
        "bg-amber-500", "bg-sky-500", "bg-violet-500", "bg-teal-500",
    ];
    let sum = 0;
    for (let i = 0; i < (name || "").length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
}

export default function Chat() {
    const { t } = useLang();

    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null); // null = umumiy
    const [newRoom, setNewRoom] = useState("");

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [me, setMe] = useState(null);

    const bottomRef = useRef(null);

    async function loadRooms() {
        try {
            const res = await api.get("/api/chat/rooms/");
            setRooms(res.data || []);
        } catch {
            // ignore
        }
    }

    async function loadMessages() {
        try {
            const url = activeRoom
                ? `/api/chat/messages/?room=${activeRoom}`
                : "/api/chat/messages/";
            const res = await api.get(url);
            setMessages(res.data || []);
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
        loadRooms();
    }, []);

    useEffect(() => {
        setLoading(true);
        loadMessages();
        const id = setInterval(loadMessages, 4000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRoom]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function send(e) {
        e.preventDefault();
        const value = text.trim();
        if (!value || sending) return;
        setSending(true);
        setText("");
        try {
            await api.post("/api/chat/messages/", { text: value, room: activeRoom });
            await loadMessages();
        } catch {
            setText(value);
        } finally {
            setSending(false);
        }
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
        } catch {
            // ignore
        }
    }

    function RoomButton({ id, label }) {
        const active = activeRoom === id;
        return (
            <button
                onClick={() => setActiveRoom(id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${active ? "bg-indigo-600 text-white" : "hover:bg-gray-100 dark:hover:bg-slate-700"}`}
            >
                <Hash size={15} className="shrink-0" />
                <span className="truncate">{label}</span>
            </button>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white grid place-items-center">
                    <MessagesSquare size={20} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t.chatTitle}</h1>
                    <p className="mt-0.5 text-gray-600">{t.chatSub}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[240px_1fr]">
                {/* Rooms panel */}
                <div className="th-card h-max">
                    <div className="font-bold mb-2">{t.roomsTitle}</div>
                    <div className="space-y-1">
                        <RoomButton id={null} label={t.roomGeneral} />
                        {rooms.map((r) => (
                            <RoomButton key={r.id} id={r.id} label={r.name} />
                        ))}
                    </div>
                    <form onSubmit={createRoom} className="mt-3 flex gap-1">
                        <input
                            className="th-input flex-1 !py-1.5 text-sm"
                            placeholder={t.newRoom}
                            value={newRoom}
                            onChange={(e) => setNewRoom(e.target.value)}
                        />
                        <button className="px-2 rounded-xl bg-indigo-600 text-white" title={t.newRoom}>
                            <Plus size={16} />
                        </button>
                    </form>
                </div>

                {/* Messages */}
                <div className="th-card flex flex-col" style={{ height: "68vh" }}>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {loading ? (
                            <div className="text-sm text-gray-500">{t.chatLoading}</div>
                        ) : messages.length === 0 ? (
                            <div className="h-full grid place-items-center text-center text-gray-500">{t.chatEmpty}</div>
                        ) : (
                            messages.map((m) => {
                                const mine = me && m.username === me.username;
                                return (
                                    <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                                        {!mine && (
                                            <div className={`w-8 h-8 shrink-0 rounded-full grid place-items-center text-white text-xs font-bold ${colorFor(m.username)}`}>
                                                {initialsOf(m.username)}
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${mine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-100 dark:bg-slate-700 rounded-bl-sm"}`}>
                                            {!mine && <div className="text-xs font-bold text-indigo-500 mb-0.5">{m.username}</div>}
                                            <div className="whitespace-pre-wrap break-words">{m.text}</div>
                                            <div className={`text-[10px] mt-1 ${mine ? "text-indigo-100" : "text-gray-400"}`}>
                                                {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <form onSubmit={send} className="mt-4 flex items-center gap-2">
                        <input
                            className="th-input flex-1"
                            placeholder={t.chatPlaceholder}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={2000}
                        />
                        <button type="submit" disabled={sending || !text.trim()} className="th-btn-blue px-4 py-2">
                            <Send size={18} />
                            <span className="hidden sm:inline">{t.chatSend}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
