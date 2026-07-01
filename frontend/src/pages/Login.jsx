import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { User, Lock, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

export default function Login() {
    const nav = useNavigate();
    const { t } = useLang();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

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
            nav("/dashboard");
        } catch (err) {
            toast.dismiss(tid);
            toast.error("Login yoki parol xato.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="th-shell flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
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
                                    title={showPwd ? "Hide" : "Show"}
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

                        <p className="text-center text-sm opacity-70">
                            {t.noAccount}{" "}
                            <Link className="font-semibold th-gradient-text hover:opacity-80" to="/register">
                                {t.register}
                            </Link>
                        </p>
                    </form>

                    <div className="text-center text-xs opacity-40">© {new Date().getFullYear()} TalabaHub</div>
                </div>
            </div>
        </div>
    );
}
