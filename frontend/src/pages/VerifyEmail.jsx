import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { ShieldCheck, RefreshCw, ArrowRight } from "lucide-react";

export default function VerifyEmail() {
    const nav = useNavigate();
    const { t } = useLang();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    async function verify(e) {
        e.preventDefault();
        if (!code.trim() || !email.trim()) {
            toast.error("Email va kodni kiriting");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/api/users/verify-email/", { email, code: code.trim() });
            toast.success(res.data.detail || "Email tasdiqlandi!");
            nav("/login");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    }

    async function resend() {
        if (!email.trim()) {
            toast.error("Email kiriting");
            return;
        }
        setResending(true);
        try {
            const res = await api.post("/api/users/resend-verification/", { email });
            toast.success(res.data.detail || "Kod qayta yuborildi");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Xatolik");
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="th-shell flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
                    style={{ background: "var(--gradient-primary)" }} />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
                    style={{ background: "var(--gradient-accent)" }} />
            </div>

            <div className="w-full max-w-md relative">
                <div className="th-glass p-8 space-y-6">
                    <div className="text-center">
                        <div className="mx-auto w-14 h-14 rounded-2xl grid place-items-center font-black text-white shadow-lg"
                            style={{ background: "var(--gradient-primary)" }}
                        >
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="mt-4 text-2xl font-extrabold">
                            {t.verifyTitle || "Emailni tasdiqlang"}
                        </h1>
                        <p className="text-sm mt-1 opacity-70">
                            {t.verifySub || "Emailingizga 6 raqamli kod yuborildi"}
                        </p>
                    </div>

                    <form onSubmit={verify} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Email</label>
                            <input
                                className="w-full mt-1.5 th-input text-sm"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                style={{ color: "var(--text)" }}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold">
                                {t.verificationCode || "Tasdiqlash kodi"}
                            </label>
                            <input
                                className="w-full mt-1.5 th-input text-center text-2xl font-bold tracking-[0.5em]"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                inputMode="numeric"
                                style={{ color: "var(--text)" }}
                            />
                        </div>

                        <button disabled={loading} className="th-btn-blue w-full">
                            <ArrowRight size={18} />
                            {loading ? "Tekshirilmoqda..." : (t.verifyBtn || "Tasdiqlash")}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={resend}
                            disabled={resending}
                            className="text-sm font-semibold th-gradient-text hover:opacity-80 inline-flex items-center gap-1"
                        >
                            <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                            {resending ? "Yuborilmoqda..." : (t.resendCode || "Kodni qayta yuborish")}
                        </button>
                    </div>

                    <div className="text-center text-xs opacity-40">&copy; {new Date().getFullYear()} TalabaHub</div>
                </div>
            </div>
        </div>
    );
}
