import { useNavigate, Link } from "react-router-dom";
import { useLang } from "../i18n/LanguageProvider";
import { Key, ArrowLeft, Mail } from "lucide-react";

export default function PasswordReset() {
    const nav = useNavigate();
    const { t } = useLang();

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
                    </div>

                    <div className="space-y-4 text-center">
                        <p className="text-sm opacity-70">
                            {t.resetPasswordInfo || "Parolingizni unutgan bo'lsangiz, quyidagi usullardan birini tanlang:"}
                        </p>

                        <div className="space-y-3">
                            <div className="th-card p-4 text-left">
                                <h3 className="font-bold text-sm mb-1">1. Google orqali kiring</h3>
                                <p className="text-xs opacity-60">
                                    Agar emailingiz Gmail bo'lsa — login sahifasida "Sign in with Google" tugmasini bosing. Hisobingiz avtomatik ulanadi.
                                </p>
                            </div>

                            <div className="th-card p-4 text-left">
                                <h3 className="font-bold text-sm mb-1">2. Admin bilan bog'laning</h3>
                                <p className="text-xs opacity-60">
                                    Telegram: <a href="https://t.me/ziyodulla_otabaev" target="_blank" rel="noopener" className="th-gradient-text font-semibold">@ziyodulla_otabaev</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-center">
                        <Link className="text-sm font-semibold th-gradient-text hover:opacity-80 inline-flex items-center gap-1" to="/login">
                            <ArrowLeft size={14} />
                            {t.backToLogin || "Loginqa qaytish"}
                        </Link>
                    </p>

                    <div className="text-center text-xs opacity-40">&copy; {new Date().getFullYear()} TalabaHub</div>
                </div>
            </div>
        </div>
    );
}
