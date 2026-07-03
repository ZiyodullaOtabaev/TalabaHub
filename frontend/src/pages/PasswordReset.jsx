import { Link } from "react-router-dom";
import { useLang } from "../i18n/LanguageProvider";
import { Key, ArrowLeft } from "lucide-react";

export default function PasswordReset() {
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

                    <div className="th-card p-5 text-center space-y-3">
                        <p className="text-sm">
                            {t.resetPasswordGoogleHint || "Parolingizni unutgan bo'lsangiz, login sahifasida \"Sign in with Google\" tugmasini bosing."}
                        </p>
                        <p className="text-xs opacity-60">
                            {t.resetPasswordGoogleNote || "Google hisobingiz orqali kirganingizda parol talab qilinmaydi. Hisobingiz emailingiz orqali avtomatik topiladi."}
                        </p>
                    </div>

                    <Link to="/login" className="th-btn-blue w-full flex items-center justify-center gap-2">
                        <ArrowLeft size={18} />
                        {t.backToLogin || "Loginqa qaytish"}
                    </Link>

                    <div className="text-center text-xs opacity-40">&copy; {new Date().getFullYear()} TalabaHub</div>
                </div>
            </div>
        </div>
    );
}
