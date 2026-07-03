import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import api from "../api";

/**
 * Faol bannerlarni ko'rsatish komponenti.
 *
 * Props:
 *  - position: "dashboard_top" | "dashboard_bottom" | "sidebar" | "fullwidth" | "popup"
 *  - className: qo'shimcha CSS classlari
 */
export default function BannerDisplay({ position = "dashboard_top", className = "" }) {
    const [banners, setBanners] = useState([]);
    const [dismissed, setDismissed] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/api/banners/active/?position=${position}`);
                setBanners(res.data || []);
            } catch {
                // ignore
            }
        })();
    }, [position]);

    async function handleClick(banner) {
        try {
            await api.post(`/api/banners/${banner.id}/click/`);
        } catch {
            // ignore
        }
        if (banner.link_url) {
            window.open(banner.link_url, "_blank", "noopener");
        }
    }

    function dismiss(id) {
        setDismissed((prev) => [...prev, id]);
    }

    const visible = banners.filter((b) => !dismissed.includes(b.id));
    if (visible.length === 0) return null;

    // Popup alohida ko'rinish
    if (position === "popup") {
        const banner = visible[0];
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50" onClick={() => dismiss(banner.id)} />
                <div className="relative max-w-md w-full rounded-2xl shadow-2xl overflow-hidden" style={{ background: banner.bg_color || "#4F46E5" }}>
                    <button
                        onClick={() => dismiss(banner.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 grid place-items-center text-white hover:bg-white/30"
                    >
                        <X size={16} />
                    </button>
                    {banner.banner_type === "image" && banner.image_url && (
                        <img src={banner.image_url} alt="" className="w-full" />
                    )}
                    <div className="p-6" style={{ color: banner.text_color || "#fff" }}>
                        {banner.text_content && (
                            <p className="text-lg font-semibold">{banner.text_content}</p>
                        )}
                        {banner.link_url && (
                            <button
                                onClick={() => handleClick(banner)}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 font-semibold hover:bg-white/30 transition"
                            >
                                {banner.link_text || "Batafsil"} <ExternalLink size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {visible.map((banner) => (
                <div
                    key={banner.id}
                    className="relative rounded-2xl overflow-hidden transition hover:shadow-lg cursor-pointer"
                    style={{ background: banner.bg_color || "#4F46E5" }}
                    onClick={() => handleClick(banner)}
                >
                    {/* Yopish tugmasi */}
                    <button
                        onClick={(e) => { e.stopPropagation(); dismiss(banner.id); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20 grid place-items-center text-white/70 hover:text-white hover:bg-black/30 transition z-10"
                    >
                        <X size={12} />
                    </button>

                    {banner.banner_type === "image" && banner.image_url ? (
                        <img src={banner.image_url} alt="" className="w-full object-cover" />
                    ) : banner.banner_type === "html" && banner.html_content ? (
                        <div
                            className="p-4"
                            style={{ color: banner.text_color || "#fff" }}
                            dangerouslySetInnerHTML={{ __html: banner.html_content }}
                        />
                    ) : (
                        <div className="p-4 flex items-center justify-between gap-3" style={{ color: banner.text_color || "#fff" }}>
                            <p className="font-semibold text-sm flex-1">{banner.text_content}</p>
                            {banner.link_text && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg shrink-0">
                                    {banner.link_text} <ExternalLink size={12} />
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
