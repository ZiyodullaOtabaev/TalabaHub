import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useLang } from "../i18n/LanguageProvider";
import { useAuth } from "../hooks/useAuth";
import { Sparkles } from "lucide-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Login() {
    const nav = useNavigate();
    const { t } = useLang();
    const { onLogin } = useAuth();

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
                { theme: "outline", size: "large", width: 320, text: "continue_with", shape: "pill" }
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
        const tid = toast.loading("Kirish...");
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
                        <h1 className="mt-4 text-2xl font-extrabold">{t.loginTitle || "Xush kelibsiz"}</h1>
                        <p className="text-sm mt-1 opacity-70">{t.loginSub || "TalabaHub hisobingizga kiring"}</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-center text-sm opacity-70">
                            {t.googleSignInDesc || "Google hisobingiz orqali kiring yoki ro'yxatdan o'ting"}
                        </p>

                        <div id="google-signin-btn" className="flex justify-center" />

                        {!GOOGLE_CLIENT_ID && (
                            <div className="text-center text-sm text-red-500">
                                Google Sign-In sozlanmagan (VITE_GOOGLE_CLIENT_ID yo'q)
                            </div>
                        )}
                    </div>

                    <div className="text-center text-xs opacity-40">&copy; {new Date().getFullYear()} TalabaHub</div>
                </div>
            </div>
        </div>
    );
}
