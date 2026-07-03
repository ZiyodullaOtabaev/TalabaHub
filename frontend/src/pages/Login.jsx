import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { useAuth } from "../hooks/useAuth";
import { User, Lock, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Login() {
    const nav = useNavigate();
    const { t } = useLang();
    const { onLogin } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    // Google Sign-In
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;

        function initGoogle() {
            if (!window.google?.accounts) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById("google-signin-btn"),
                { theme: "outline", size: "large", width: 320, text: "signin_with", shape: "pill" }
            );
        }

        if (window.google?.accounts) {
            initGoogle();
        } else {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = initGoogle;
            document.head.appendChild(script);
        }
    }, []);

    async function handleGoogleResponse(response) {
        const tid = toast.loading("Google orqali kirish...");
        try {
            const res = await api.post("/api/users/google-auth/", {
                credential: response.credential,
            });
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            toast.dismiss(tid);
            toast.success("Muvaffaqiyatli kirdingiz!");
            onLogin();
            nav("/dashboard");
        } catch (err) {
            toast.dismiss(tid);
            toast.error(err?.response?.data?.detail || "Google bilan kirishda xatolik");
        }
    }

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        const tid = toast.loading("Kirish...");
        try {
            const res = await api.post("/api/auth/login/", { username, password });
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            toast.dismiss(tid);
            toast.success("Muvaffaqiyatli kirdingiz!");
            onLogin();
            nav("/dashboard");
        } catch (err) {
            toast.dismiss(tid);
            toast.error(err?.response?.data?.detail || "Login yoki parol xato.");
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
                            <Sparkles size={24} />
                        </div>
                        <h1 className="mt-4 text-2xl font-extrabold">{t.loginTitle}</h1>
                        <p className="text-sm mt-1 opacity-70">{t.loginSub}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold">{t.username}</label>
                            <div className="mt-1.5 flex items-center gap-2 th-input">
                                <User size={18} className="opacity-40 shrink-0" />
                                <input
                                    className="w-full outline-none text-sm bg-transparent"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t.username}
                                    style={{ color: "var(--text)" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold">{t.password}</label>
                            <div className="mt-1.5 flex items-center gap-2 th-input">
                                <Lock size={18} className="opacity-40 shrink-0" />
                                <input
                                    className="w-full outline-none text-sm bg-transparent"
                                    type={showPwd ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    style={{ color: "var(--text)" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((v) => !v)}
                                    className="opacity-40 hover:opacity-70 transition shrink-0"
                                    tabIndex={-1}
                                >
                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button disabled={loading} className="th-btn-blue w-full">
                            <ArrowRight size={18} />
                            {t.signIn}
                        </button>

                        <div className="text-center">
                            <Link className="text-sm font-semibold th-gradient-text hover:opacity-80" to="/password-reset">
                                {t.forgotPassword || "Parolni unutdingizmi?"}
                            </Link>
                        </div>

                        <p className="text-center text-sm opacity-70">
                            {t.noAccount}{" "}
                            <Link className="font-semibold th-gradient-text hover:opacity-80" to="/register">
                                {t.register}
                            </Link>
                        </p>
                    </form>

                    {/* Google Sign-In */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-[color:var(--surface)] opacity-60">yoki</span>
                        </div>
                    </div>

                    <div id="google-signin-btn" className="flex justify-center" />

                    <div className="text-center text-xs opacity-40">&copy; {new Date().getFullYear()} TalabaHub</div>
                </div>
            </div>
        </div>
    );
}
