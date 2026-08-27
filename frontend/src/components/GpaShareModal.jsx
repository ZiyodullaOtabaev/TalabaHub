import { useRef, useState, useEffect } from "react";
import { X, Download, Share2, Sparkles, Award, CheckCircle2, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function GpaShareModal({ open, onClose, gpa, user, scaleType = "5" }) {
    const canvasRef = useRef(null);
    const [generating, setGenerating] = useState(false);

    const score = Number(gpa) || 0;
    const maxScore = scaleType === "100" ? "100" : scaleType === "4" ? "4.0" : scaleType === "ects" ? "A" : "5.0";

    const studentName = user?.username || "Talaba";
    const universityName = user?.university || "Universitet Talabasi";

    let badgeTitle = "MUVAFFAQIYATLI";
    let badgeColor = "#10b981";
    if (score >= 4.5 || score >= 86) {
        badgeTitle = "A'LOCHI TALABA 🏆";
        badgeColor = "#f59e0b";
    } else if (score >= 3.5 || score >= 71) {
        badgeTitle = "YAXSHI NATIJA ⭐";
        badgeColor = "#06b6d4";
    }

    // Draw high-resolution canvas certificate for Stories (1080x1920 scaled)
    useEffect(() => {
        if (!open) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const w = 1080;
        const h = 1920;
        canvas.width = w;
        canvas.height = h;

        // 1. Dark Gradient Background
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, "#0b0c1b");
        bgGrad.addColorStop(0.5, "#0f1338");
        bgGrad.addColorStop(1, "#080914");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Ambient Neon Orbs
        ctx.save();
        ctx.filter = "blur(80px)";
        ctx.fillStyle = "rgba(99, 102, 241, 0.35)";
        ctx.beginPath();
        ctx.arc(w / 2, 400, 300, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
        ctx.beginPath();
        ctx.arc(850, 1200, 260, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3. Main Glassmorphism Card (Centered)
        const cardX = 90;
        const cardY = 220;
        const cardW = 900;
        const cardH = 1480;
        const radius = 60;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, radius);
        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.stroke();
        ctx.restore();

        // 4. Brand Header
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("TALABAHUB PRO", w / 2, 340);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 28px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Rasmiy GPA & O'quv Sertifikati", w / 2, 395);

        // 5. Badge
        ctx.save();
        ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
        ctx.beginPath();
        ctx.roundRect(w / 2 - 200, 460, 400, 64, 32);
        ctx.fill();
        ctx.strokeStyle = badgeColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = badgeColor;
        ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(badgeTitle, w / 2, 502);
        ctx.restore();

        // 6. Student Info
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 64px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(studentName, w / 2, 650);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "600 32px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(universityName, w / 2, 710);

        // 7. GPA Circle Glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(w / 2, 1000, 220, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#10b981";
        ctx.stroke();

        ctx.fillStyle = "#10b981";
        ctx.font = "900 130px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(String(score), w / 2, 1030);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 36px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(`/ ${maxScore} GPA`, w / 2, 1100);
        ctx.restore();

        // 8. Quote / Motivation
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "italic 500 32px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText('"Ilm — kelajak muvaffaqiyatining kalitidir"', w / 2, 1340);

        // 9. Footer & QR / Link
        ctx.fillStyle = "#64748b";
        ctx.font = "600 28px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Siz ham GPA va darslaringizni hisoblang:", w / 2, 1540);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 36px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("t.me/talabahubuzbot", w / 2, 1600);

    }, [open, score, maxScore, studentName, universityName]);

    function handleDownload() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `GPA_Certificate_${studentName}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("Stories kartochkasi yuklab olindi!");
    }

    async function handleShare() {
        const shareUrl = "https://t.me/talabahubuzbot";
        const shareText = `Mening GPA ko'rsatkichim: ${score} / ${maxScore} 🏆\nSiz ham hisoblab ko'ring: ${shareUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Mening GPA Natijam",
                    text: shareText,
                    url: shareUrl,
                });
            } catch {
                /* ignore */
            }
        } else {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg th-card p-6 border border-emerald-500/30 rounded-3xl space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                        <Sparkles size={18} /> GPA Stories Kartochkasi
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-xl hover:bg-white/10 opacity-60 hover:opacity-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Preview Canvas */}
                <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-950 flex justify-center">
                    <canvas
                        ref={canvasRef}
                        className="w-full max-w-[280px] h-auto object-contain rounded-2xl"
                    />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={handleDownload}
                        className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-105 transition"
                    >
                        <Download size={16} /> Yuklab Olish
                    </button>
                    <button
                        onClick={handleShare}
                        className="py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 hover:scale-105 transition"
                    >
                        <Share2 size={16} /> Stories'ga Ulashish
                    </button>
                </div>
            </div>
        </div>
    );
}
