import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { User, Mail, Lock, GraduationCap, Sparkles } from "lucide-react";

// Backend xato javobidan (DRF) birinchi tushunarli xabarni ajratib olish
function extractApiError(err) {
    const data = err?.response?.data;
    if (!data) return "Tarmoq xatosi. Internetni tekshiring.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
        const val = data[firstKey];
        const msg = Array.isArray(val) ? val[0] : val;
        return `${firstKey}: ${msg}`;
    }
    return "Ro'yxatdan o'tishda xatolik yuz berdi.";
}

export default function Register() {
    const navigate = useNavigate();
    const { t } = useLang();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [university, setUniversity] = useState("");
    const [loading, setLoading] = useState(false);

    async function register(e) {
        e.preventDefault();

        if (password !== password2) {
            toast.error("Parollar mos kelmadi");
            return;
        }

        if (password.length < 8) {
            toast.error("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
            return;
        }

        setLoading(true);
        const tid = toast.loading("Hisob yaratilmoqda...");

        try {
            await api.post("/api/users/register/", {
                username,
                email,
                password,
                university,
            });

            toast.dismiss(tid);
            toast.success("Hisob yaratildi! Endi kiring");
            navigate("/login");
        } catch (err) {
            toast.dismiss(tid);
            toast.error(extractApiError(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="th-shell flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
                    style={{ background: "var(--gradient-accent)" }} />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
                    style={{ background: "var(--gradient-primary)" }} />
            </div>

            <div className="w-full max-w-md relative">
                <div className="th-glass p-8 space-y-6">
                    <div className="text-center">
                        <div className="mx-auto w-14 h-14 rounded-2xl grid place-items-center font-black text-white shadow-lg"
                            style={{ background: "var(--gradient-primary)" }}
                        >
                            <Sparkles size={24} />
                        </div>
                        <h1 className="mt-4 text-2xl font-extrabold">{t.registerTitle}</h1>
                        <p className="text-sm mt-1 opacity-70">{t.registerSub}</p>
                    </div>

                    <form onSubmit={register} className="space-y-3.5">
                        <div>
                            <label className="text-sm font-semibold">{t.username}</label>
                            <div className="mt-1.5 flex items-center gap-2 th-input">
                                <User size={18} className="opacity-40 shrink-0" />
                                <input value={username} onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t.username}
                                    className="w-full outline-none bg-transparent text-sm"
                                    style={{ color: "var(--text)" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold">{t.email}</label>
                            <div className="mt-1.5 flex items-center gap-2 th-input">
                                <Mail size={18} className="opacity-40 shrink-0" />
                                <input value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full outline-none bg-transparent text-sm"
                                    style={{ color: "var(--text)" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold">{t.universityLabel || "Universitet"}</label>
                            <div className="mt-1.5 flex items-center gap-2 th-input">
                                <GraduationCap size={18} className="opacity-40 shrink-0" />
                                <input value={university} onChange={(e) => setUniversity(e.target.value)}
                                    placeholder="TATU / INHA / WIUT"
                                    className="w-full outline-none bg-transparent text-sm"
                                    style={{ color: "var(--text)" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold">{t.password}</label>
                            <div className="mt-1.5 flex items-center gap-2 th-input">
                                <Lock size={18} className="opacity-40 shrink-0" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    className="w-full outline-none bg-transparent text-sm"
                                    style={{ color: "var(--text)" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold">{t.passwordRepeat}</label>
                            <div className="mt-1.5 flex items-center gap-2 th-input">
                                <Lock size={18} className="opacity-40 shrink-0" />
                                <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)}
                                    placeholder="********"
                                    className="w-full outline-none bg-transparent text-sm"
                                    style={{ color: "var(--text)" }}
                                />
                            </div>
                        </div>

                        <button disabled={loading} className="th-btn-blue w-full">
                            {loading ? "Yaratilmoqda..." : t.createAccount}
                        </button>

                        <p className="text-center text-sm opacity-70">
                            {t.haveAccount}{" "}
                            <span className="font-semibold th-gradient-text cursor-pointer hover:opacity-80"
                                onClick={() => navigate("/login")}
                            >
                                {t.login}
                            </span>
                        </p>
                    </form>

                    <div className="text-center text-xs opacity-40">© {new Date().getFullYear()} TalabaHub</div>
                </div>
            </div>
        </div>
    );
}
