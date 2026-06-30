import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { User, Lock, ArrowRight } from "lucide-react";

export default function Login() {
    const nav = useNavigate();
    const { t } = useLang();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
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
            toast.success("Muvaffaqiyatli kirdingiz ✅");
            nav("/dashboard");
        } catch (err) {
            toast.dismiss(tid);
            toast.error("Login yoki parol xato.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="th-shell flex items-center justify-center p-4">
            <div className="w-full max-w-md th-surface p-6">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl grid place-items-center bg-slate-100 font-black">TH</div>
                    <h1 className="mt-3 text-2xl font-extrabold">{t.loginTitle}</h1>
                    <p className="text-sm text-slate-600">{t.loginSub}</p>
                </div>

                <form onSubmit={submit} className="mt-6 space-y-3">
                    <div>
                        <label className="text-sm font-semibold">{t.username}</label>
                        <div className="mt-1 flex items-center gap-2 border border-slate-300 rounded-xl px-3 py-2">
                            <User size={18} className="text-slate-400" />
                            <input className="w-full outline-none text-sm" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.username} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold">{t.password}</label>
                        <div className="mt-1 flex items-center gap-2 border border-slate-300 rounded-xl px-3 py-2">
                            <Lock size={18} className="text-slate-400" />
                            <input className="w-full outline-none text-sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
                        </div>
                    </div>

                    <button disabled={loading} className="th-btn-blue w-full">
                        <ArrowRight size={18} />
                        {t.signIn}
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        {t.noAccount} <Link className="font-semibold text-blue-600" to="/register">{t.register}</Link>
                    </p>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} TalabaHub</div>
            </div>
        </div>
    );
}