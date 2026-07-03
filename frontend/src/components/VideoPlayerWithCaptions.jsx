import { useEffect, useRef, useState, useCallback } from "react";
import { X, Eye, Subtitles, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";

/**
 * Video player with synced captions panel.
 *
 * Layout: chapda YouTube video (iframe + YouTube IFrame API orqali vaqtni kuzatish),
 * o'ngda caption panel — hozirgi so'z highlight qilinadi.
 *
 * YouTube IFrame API orqali playerdan hozirgi vaqtni olamiz va captionlarni sinxronlaymiz.
 */

// YouTube IFrame API yuklash (global, bir marta)
let ytApiReady = false;
let ytApiCallbacks = [];

function loadYouTubeAPI() {
    if (ytApiReady) return Promise.resolve();
    if (window.YT && window.YT.Player) {
        ytApiReady = true;
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        ytApiCallbacks.push(resolve);

        if (!document.getElementById("yt-iframe-api")) {
            const tag = document.createElement("script");
            tag.id = "yt-iframe-api";
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);

            window.onYouTubeIframeAPIReady = () => {
                ytApiReady = true;
                ytApiCallbacks.forEach((cb) => cb());
                ytApiCallbacks = [];
            };
        }
    });
}

export default function VideoPlayerWithCaptions({ lesson, onClose, isAdmin }) {
    const { t } = useLang();
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const intervalRef = useRef(null);
    const captionPanelRef = useRef(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCaptions, setShowCaptions] = useState(true);

    // Admin: caption upload
    const [showUpload, setShowUpload] = useState(false);
    const [srtText, setSrtText] = useState("");
    const [uploading, setUploading] = useState(false);

    const captions = lesson?.captions || [];
    const hasCaptions = captions.length > 0;

    // YouTube Player yaratish
    useEffect(() => {
        if (!lesson?.video_id) return;

        let player = null;

        loadYouTubeAPI().then(() => {
            if (!containerRef.current) return;

            player = new window.YT.Player(containerRef.current, {
                videoId: lesson.video_id,
                playerVars: {
                    autoplay: 1,
                    rel: 0,
                    modestbranding: 1,
                    cc_load_policy: 0, // Biz o'zimiz caption ko'rsatamiz
                },
                events: {
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setIsPlaying(true);
                        } else {
                            setIsPlaying(false);
                        }
                    },
                    onReady: () => {
                        playerRef.current = player;
                    },
                },
            });
        });

        return () => {
            if (player && player.destroy) {
                player.destroy();
            }
            playerRef.current = null;
        };
    }, [lesson?.video_id]);

    // Vaqtni kuzatish (100ms interval bilan)
    useEffect(() => {
        if (isPlaying && playerRef.current) {
            intervalRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                    setCurrentTime(playerRef.current.getCurrentTime());
                }
            }, 100);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isPlaying]);

    // Hozirgi vaqtga mos caption indeksini topish
    const activeIndex = captions.findIndex(
        (c) => currentTime >= c.start && currentTime <= c.end
    );

    // Aktiv caption ga avtomatik scroll
    useEffect(() => {
        if (activeIndex >= 0 && captionPanelRef.current) {
            const el = captionPanelRef.current.querySelector(`[data-idx="${activeIndex}"]`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [activeIndex]);

    // Captionni bosganda video shu vaqtga o'tsin
    const seekTo = useCallback((time) => {
        if (playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(time, true);
            setCurrentTime(time);
        }
    }, []);

    // Admin: SRT yuklash
    async function handleUploadSrt(e) {
        e.preventDefault();
        if (!srtText.trim()) return;
        setUploading(true);
        try {
            const res = await api.post(`/api/lessons/items/${lesson.id}/upload_captions/`, {
                srt: srtText,
            });
            toast.success(`${res.data.count} ta caption saqlandi`);
            // Sahifani yangilash kerak — parent ga signal
            setShowUpload(false);
            setSrtText("");
            // Captionlarni qayta olish uchun parent'ga aytish kerak
            // Hozircha oddiy reload
            window.location.reload();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Xatolik yuz berdi");
        } finally {
            setUploading(false);
        }
    }

    // Admin: fayl yuklash
    function handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setSrtText(ev.target.result);
        };
        reader.readAsText(file);
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden="true" />

            <div className="relative w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 text-white">
                        <span className="text-lg font-extrabold truncate">{lesson.title}</span>
                        <span className="inline-flex items-center gap-1 text-sm text-white/70">
                            <Eye size={15} /> {lesson.views_count || 0}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasCaptions && (
                            <button
                                type="button"
                                onClick={() => setShowCaptions((v) => !v)}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold backdrop-blur transition ${
                                    showCaptions
                                        ? "bg-indigo-500/80 text-white"
                                        : "bg-white/15 text-white hover:bg-white/25"
                                }`}
                            >
                                <Subtitles size={16} />
                                {showCaptions ? "CC" : "CC"}
                            </button>
                        )}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowUpload((v) => !v)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/25"
                            >
                                <Upload size={16} />
                                {t.uploadCaptions || "Caption yuklash"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 font-semibold text-white backdrop-blur hover:bg-white/25"
                        >
                            <X size={18} /> {t.close}
                        </button>
                    </div>
                </div>

                {/* Admin: SRT upload form */}
                {showUpload && isAdmin && (
                    <div className="mb-3 rounded-2xl bg-slate-900/90 p-4 backdrop-blur">
                        <form onSubmit={handleUploadSrt} className="space-y-3">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-semibold text-white">
                                    SRT/VTT fayl:
                                </label>
                                <input
                                    type="file"
                                    accept=".srt,.vtt,.txt"
                                    onChange={handleFileUpload}
                                    className="text-sm text-white/70"
                                />
                            </div>
                            <textarea
                                className="w-full h-32 rounded-xl bg-slate-800 border border-slate-700 p-3 text-sm text-white font-mono resize-y"
                                placeholder={"1\n00:00:00,000 --> 00:00:02,500\nHello everyone\n\n2\n00:00:02,500 --> 00:00:05,000\nWelcome to the lesson"}
                                value={srtText}
                                onChange={(e) => setSrtText(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                                >
                                    {uploading ? "Yuklanmoqda..." : "Saqlash"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                    className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Bekor
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Main content: Video + Captions */}
                <div className={`flex gap-4 flex-1 min-h-0 ${hasCaptions && showCaptions ? "" : ""}`}>
                    {/* Video */}
                    <div className={`${hasCaptions && showCaptions ? "flex-[3]" : "flex-1"} min-w-0`}>
                        <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
                            <div className="aspect-video w-full" ref={containerRef} />
                        </div>
                    </div>

                    {/* Captions Panel */}
                    {hasCaptions && showCaptions && (
                        <div className="flex-[1.2] min-w-[280px] max-w-[400px] hidden md:flex flex-col">
                            <div className="rounded-2xl bg-slate-900/95 backdrop-blur shadow-2xl flex-1 flex flex-col overflow-hidden border border-slate-700/50">
                                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                                    <Subtitles size={16} className="text-indigo-400" />
                                    <span className="text-sm font-bold text-white">
                                        {t.captionsTitle || "Subtitles"}
                                    </span>
                                    <span className="ml-auto text-xs text-slate-400">
                                        {captions.length} {t.lines || "qator"}
                                    </span>
                                </div>
                                <div
                                    ref={captionPanelRef}
                                    className="flex-1 overflow-y-auto px-3 py-2 scroll-smooth"
                                    style={{ scrollbarWidth: "thin" }}
                                >
                                    {captions.map((c, i) => {
                                        const isActive = i === activeIndex;
                                        const isPast = currentTime > c.end;
                                        return (
                                            <button
                                                key={i}
                                                data-idx={i}
                                                type="button"
                                                onClick={() => seekTo(c.start)}
                                                className={`w-full text-left px-3 py-2 rounded-xl mb-1 transition-all duration-200 ${
                                                    isActive
                                                        ? "bg-indigo-500/20 border border-indigo-500/40 scale-[1.02]"
                                                        : isPast
                                                        ? "opacity-50 hover:opacity-80 hover:bg-slate-800/50"
                                                        : "hover:bg-slate-800/50"
                                                }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <span className={`text-[10px] font-mono mt-0.5 shrink-0 ${
                                                        isActive ? "text-indigo-400" : "text-slate-500"
                                                    }`}>
                                                        {formatTime(c.start)}
                                                    </span>
                                                    <span className={`text-sm leading-relaxed ${
                                                        isActive
                                                            ? "text-white font-semibold"
                                                            : "text-slate-300"
                                                    }`}>
                                                        {c.text}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
