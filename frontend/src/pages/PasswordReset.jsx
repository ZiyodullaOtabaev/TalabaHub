import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { Mail, Lock, Key, ArrowLeft, Sparkles } from "lucide-react";

export default function PasswordReset() {
    const nav = useNavigate();
    const { t } = useLang();
    const [searchParams] = useSearchParams();

    // Step 1: email kiritish -> emailga kod yuboriladi
    // Step 2: token + yangi parol kiritish
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [uid, setUid] = useState("");
    const [token, setToken] = useState("");

    // URL params'dan uid/token olish (email'dagi havoladan)
    useEffect(() => {
        const uidParam = searchParams.get("uid");
        const tokenParam = searchParams.get("token");
        if (uidParam && tokenParam) {
            setUid(uidParam);
            setToken(tokenParam);
            setStep(2);
        }
    }, [searchParams]);
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [loading, setLoading] = useState(false);

    async function requestReset(e) {
        e.preventDefault();
        if (!email) {
            toast.error("Email kiriting");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/api/users/password-reset/", { email });
            toast.success(res.data.detail || "Tiklash kodi emailga yuborildi");
            setStep(2);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    }

    async function confirmReset(e) {
        e.preventDefault();
        if (newPassword !== newPassword2) {
            toast.error("Parollar mos kelmadi");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
            return;
        }
        if (!uid || !token) {
            toast.error("UID va token kiritilmagan");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/api/users/password-reset/confirm/", {
                uid,
                token,
                new_password: newPassword,
            });
            toast.success(res.data.detail || "Parol tiklandi!");
            nav("/login");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Havola eskirgan yoki noto'g'ri");
        } finally {
            setLoading(false);
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
                            <Key size={24} />
                        </div>
                        <h1 className="mt-4 text-2xl font-extrabold">
                            {t.resetPasswordTitle || "Parolni tiklash"}
                        </h1>
                        <p className="text-sm mt-1 opacity-70">
                            {step === 1
                                ? (t.resetPasswordSub || "Email manzilingizni kiriting")
                                : (t.resetPasswordStep2 || "Yangi parol o'rnating")}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={requestReset} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold">Email</label>
                                <div className="mt-1.5 flex items-center gap-2 th-input">
                                    <Mail size={18} className="opacity-40 shrink-0" />
                                    <input
                                        className="w-full outline-none text-sm bg-transparent"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        style={{ color: "var(--text)" }}
                                    />
                                </div>
                            </div>

                            <button disabled={loading} className="th-btn-blue w-full">
                                {loading ? "Yuborilmoqda..." : (t.sendResetLink || "Tiklash havolasini yuborish")}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={confirmReset} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold">
                                    {t.resetToken || "Tiklash kodi (token)"}
                                </label>
                                <div className="mt-1.5 flex items-center gap-2 th-input">
                                    <Key size={18} className="opacity-40 shrink-0" />
                                    <input
                                        className="w-full outline-none text-sm bg-transparent"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="Token"
                                        style={{ color: "var(--text)" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold">
                                    {t.newPassword || "Yangi parol"}
                                </label>
                                <div className="mt-1.5 flex items-center gap-2 th-input">
                                    <Lock size={18} className="opacity-40 shrink-0" />
                                    <input
                                        className="w-full outline-none text-sm bg-transparent"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="********"
                                        style={{ color: "var(--text)" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold">
                                    {t.confirmPassword || "Parolni tasdiqlang"}
                                </label>
                                <div className="mt-1.5 flex items-center gap-2 th-input">
                                    <Lock size={18} className="opacity-40 shrink-0" />
                                    <input
                                        className="w-full outline-none text-sm bg-transparent"
                                        type="password"
                                        value={newPassword2}
                                        onChange={(e) => setNewPassword2(e.target.value)}
                                        placeholder="********"
                                        style={{ color: "var(--text)" }}
                                    />
                                </div>
                            </div>

                            <button disabled={loading} className="th-btn-blue w-full">
                                {loading ? "Tiklanmoqda..." : (t.resetPassword || "Parolni tiklash")}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm opacity-70">
                        <Link className="font-semibold th-gradient-text hover:opacity-80 inline-flex items-center gap-1" to="/login">
                            <ArrowLeft size={14} />
                            {t.backToLogin || "Loginga qaytish"}
                        </Link>
                    </p>

                    <div className="text-center text-xs opacity-40">&copy; {new Date().getFullYear()} TalabaHub</div>
                </div>
            </div>
        </div>
    );
}
