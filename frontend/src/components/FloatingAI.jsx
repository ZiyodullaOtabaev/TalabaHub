import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, Minimize2 } from "lucide-react";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { useTheme } from "./ThemeProvider";

function cn(...xs) {
    return xs.filter(Boolean).join(" ");
}

export default function FloatingAI() {
    const { t } = useLang();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize with welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: "assistant", content: t.aiWelcome }]);
        }
    }, [t.aiWelcome]);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [messages, loading, open]);

    async function send(e) {
        e.preventDefault();
        const value = text.trim();
        if (!value || loading) return;

        const history = [...messages, { role: "user", content: value }];
        setMessages(history);
        setText("");
        setLoading(true);

        try {
            const res = await api.post("/api/assistant/chat/", {
                messages: history.filter((m) => m.role !== "system"),
            });
            setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
        } catch (err) {
            const detail = err?.response?.data?.detail || "AI bilan bog'lanishda xatolik.";
            setMessages((m) => [...m, { role: "assistant", content: detail }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Floating button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className={cn(
                        "fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center",
                        "shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110",
                        "group"
                    )}
                    style={{
                        background: "var(--gradient-primary)",
                    }}
                    title={t.navAssistant || "AI Yordamchi"}
                >
                    <Sparkles size={24} className="text-white" />
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-full animate-ping opacity-20"
                        style={{ background: "var(--gradient-primary)" }}
                    />
                    {/* Label tooltip */}
                    <span className={cn(
                        "absolute right-full mr-3 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap",
                        "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                        isDark ? "bg-slate-800 text-white" : "bg-white text-gray-900 shadow-md"
                    )}>
                        AI Yordamchi
                    </span>
                </button>
            )}

            {/* Chat panel */}
            {open && (
                <div className={cn(
                    "fixed bottom-6 right-6 z-[100] w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden",
                    "shadow-2xl border backdrop-blur-xl flex flex-col",
                    "animate-in slide-in-from-bottom-4"
                )}
                    style={{
                        height: "520px",
                        maxHeight: "calc(100vh - 6rem)",
                        backgroundColor: isDark ? "rgba(15, 13, 35, 0.95)" : "rgba(255, 255, 255, 0.97)",
                        borderColor: isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.15)",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b"
                        style={{
                            background: "var(--gradient-primary)",
                            borderColor: "transparent",
                        }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">AI Yordamchi</div>
                                <div className="text-[11px] text-white/70">TalabaHub</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                                title="Yopish"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((m, i) => {
                            const mine = m.role === "user";
                            return (
                                <div key={i} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                                    {!mine && (
                                        <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center"
                                            style={{ background: "var(--gradient-primary)" }}
                                        >
                                            <Bot size={14} className="text-white" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words",
                                        mine
                                            ? "rounded-br-sm text-white"
                                            : cn("rounded-bl-sm", isDark ? "bg-slate-800/80 text-gray-200" : "bg-gray-100 text-gray-800")
                                    )}
                                        style={mine ? { background: "var(--gradient-primary)" } : undefined}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="flex items-end gap-2">
                                <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center"
                                    style={{ background: "var(--gradient-primary)" }}
                                >
                                    <Bot size={14} className="text-white" />
                                </div>
                                <div className={cn(
                                    "rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm",
                                    isDark ? "bg-slate-800/80 text-gray-400" : "bg-gray-100 text-gray-500"
                                )}>
                                    <span className="inline-flex gap-1">
                                        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
                        <form onSubmit={send} className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                className={cn(
                                    "flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all",
                                    isDark ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                                )}
                                placeholder={t.aiChatPlaceholder || "Savolingizni yozing..."}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !text.trim()}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all",
                                    "disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                                )}
                                style={{ background: "var(--gradient-primary)" }}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
