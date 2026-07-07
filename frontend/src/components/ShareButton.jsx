import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Universal share/copy link button.
 * @param {string} path - sahifa yo'li (masalan "/articles" yoki "/german")
 * @param {string|number} id - element ID (ixtiyoriy)
 * @param {string} label - tooltip/label
 * @param {"icon"|"text"} variant - ko'rinish
 */
export default function ShareButton({ path, id, label, variant = "icon", className = "" }) {
    const [copied, setCopied] = useState(false);

    function getLink() {
        const base = window.location.origin;
        if (id) return `${base}${path}?id=${id}`;
        return `${base}${path}`;
    }

    async function copyLink(e) {
        e.stopPropagation();
        const link = getLink();
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success("Link nusxalandi!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const ta = document.createElement("textarea");
            ta.value = link;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(true);
            toast.success("Link nusxalandi!");
            setTimeout(() => setCopied(false), 2000);
        }
    }

    async function share(e) {
        e.stopPropagation();
        const link = getLink();
        if (navigator.share) {
            try {
                await navigator.share({ title: label || "TalabaHub", url: link });
            } catch {
                // user cancelled
            }
        } else {
            copyLink(e);
        }
    }

    if (variant === "text") {
        return (
            <button
                type="button"
                onClick={share}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition ${
                    copied
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-[color:var(--surface-2)] hover:bg-[color:var(--surface-3)] text-[color:var(--text-muted)]"
                } ${className}`}
            >
                {copied ? <Check size={13} /> : <Share2 size={13} />}
                {copied ? "Copied!" : (label || "Share")}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={share}
            title={label || "Link nusxalash"}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition ${
                copied
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "hover:bg-[color:var(--surface-3)] text-[color:var(--text-muted)]"
            } ${className}`}
        >
            {copied ? <Check size={15} /> : <Link2 size={15} />}
        </button>
    );
}
