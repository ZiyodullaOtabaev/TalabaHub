import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import api from "../api"
import { useLang } from "../i18n/LanguageProvider"
import { useAuth } from "../hooks/useAuth"

import {
    Mail,
    GraduationCap,
    Crown,
    Calendar,
    Pencil,
    Save,
    X,
    User,
    Send,
    CheckCircle2,
    Copy,
} from "lucide-react"

export default function Profile() {
    const { t } = useLang()
    const { fetchUser } = useAuth()

    const [me, setMe] = useState(null)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ username: "", email: "", university: "" })
    const [saving, setSaving] = useState(false)

    // Telegram bot state
    const [telegramInfo, setTelegramInfo] = useState(null)
    const [loadingTg, setLoadingTg] = useState(true)

    async function load() {
        try {
            const res = await api.get("/api/users/me/")
            setMe(res.data)
            setForm({
                username: res.data.username || "",
                email: res.data.email || "",
                university: res.data.university || "",
            })
        } catch {
            toast.error("Profilni yuklab bo'lmadi")
        }
    }

    async function loadTelegram() {
        setLoadingTg(true)
        try {
            const res = await api.get("/api/users/telegram-link/")
            setTelegramInfo(res.data)
        } catch { /* ignore */ }
        finally { setLoadingTg(false) }
    }

    useEffect(() => {
        load()
        loadTelegram()
    }, [])

    async function saveProfile(e) {
        e.preventDefault()
        if (!form.username.trim()) {
            toast.error("Username bo'sh bo'lmasin")
            return
        }
        setSaving(true)
        try {
            const res = await api.patch("/api/users/me/", {
                username: form.username.trim(),
                email: form.email.trim(),
                university: form.university.trim(),
            })
            setMe(res.data)
            setEditing(false)
            toast.success("Profil yangilandi")
            fetchUser() // AuthContext'ni yangilash
        } catch (err) {
            const data = err?.response?.data
            if (data) {
                const firstKey = Object.keys(data)[0]
                let msg = data.detail || ""
                if (!msg && firstKey) {
                    const val = data[firstKey]
                    msg = Array.isArray(val) ? val[0] : val
                }
                toast.error(msg || "Xatolik yuz berdi")
            } else {
                toast.error("Tarmoq xatosi")
            }
        } finally {
            setSaving(false)
        }
    }

    async function unlinkTelegram() {
        try {
            await api.post("/api/users/telegram-unlink/")
            toast.success("Telegram bot uzildi")
            loadTelegram()
        } catch {
            toast.error("Xatolik yuz berdi")
        }
    }

    function copyCode() {
        if (telegramInfo?.code) {
            navigator.clipboard.writeText(`/start ${telegramInfo.code}`)
            toast.success("Nusxalandi! Telegram botga yuboring")
        }
    }

    if (!me) {
        return (
            <div className="flex justify-center py-20">
                {t.loading}
            </div>
        )
    }

    const initial = me.username ? me.username[0].toUpperCase() : "?"
    const joinedDate = me.date_joined
        ? new Date(me.date_joined).toLocaleDateString()
        : "—"

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <h1 className="text-3xl font-bold">
                {t.profileTitle}
            </h1>

            {/* PROFILE CARD */}
            <div className="rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-card">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                            {initial}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{me.username}</h2>
                            <p className="text-slate-500">{me.email || "—"}</p>
                            <p className="text-sm text-slate-400">{me.university || "—"}</p>
                        </div>
                    </div>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition text-sm"
                        >
                            <Pencil size={16} />
                            {t.editProfile || "Tahrirlash"}
                        </button>
                    )}
                </div>

                {/* Edit form */}
                {editing && (
                    <form onSubmit={saveProfile} className="mt-6 space-y-3 border-t pt-5 border-slate-200 dark:border-slate-700">
                        <div>
                            <label className="text-sm font-semibold flex items-center gap-1">
                                <User size={14} /> Username
                            </label>
                            <input
                                className="w-full mt-1 th-input"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold flex items-center gap-1">
                                <Mail size={14} /> Email
                            </label>
                            <input
                                className="w-full mt-1 th-input"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold flex items-center gap-1">
                                <GraduationCap size={14} /> {t.universityLabel || "Universitet"}
                            </label>
                            <input
                                className="w-full mt-1 th-input"
                                value={form.university}
                                onChange={(e) => setForm({ ...form, university: e.target.value })}
                                placeholder="TATU / INHA / WIUT"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition text-sm"
                            >
                                <Save size={16} />
                                {saving ? "Saqlanmoqda..." : (t.save || "Saqlash")}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setEditing(false); setForm({ username: me.username, email: me.email || "", university: me.university || "" }) }}
                                className="px-4 py-2 rounded-xl border font-semibold flex items-center gap-2 text-sm"
                            >
                                <X size={16} />
                                {t.cancel || "Bekor"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* TELEGRAM BOT CARD */}
            <div className="rounded-2xl p-6 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent border border-sky-200 dark:border-sky-800/40">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white grid place-items-center shrink-0">
                            <Send size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                Telegram Bot Integratsiyasi
                                {telegramInfo?.is_linked && (
                                    <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Ulangan
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm opacity-70">
                                Dars jadvalingiz, vazifa eslatmalaringizni Telegram orqali qabul qiling.
                            </p>
                        </div>
                    </div>

                    {telegramInfo?.is_linked ? (
                        <button
                            onClick={unlinkTelegram}
                            className="px-4 py-2 rounded-xl border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold text-sm transition"
                        >
                            Botni uzish
                        </button>
                    ) : (
                        <a
                            href={`https://t.me/${telegramInfo?.bot_username || "TalabaHubBot"}?start=${telegramInfo?.code || ""}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 hover:scale-105 transition"
                        >
                            <Send size={16} />
                            Botga o'tish va ulash
                        </a>
                    )}
                </div>

                {!telegramInfo?.is_linked && telegramInfo?.code && (
                    <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xs font-semibold opacity-60 uppercase">Sizning ulash kodingiz:</div>
                            <div className="text-xl font-mono font-extrabold text-sky-500 tracking-wider">
                                /start {telegramInfo.code}
                            </div>
                        </div>
                        <button
                            onClick={copyCode}
                            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                            <Copy size={14} /> Nusxalash
                        </button>
                    </div>
                )}
            </div>

            {/* DETAILS GRID */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 font-semibold mb-2">
                        <Crown size={18} />
                        {t.premiumStatus}
                    </div>
                    <div className="text-slate-500">
                        {me.is_premium ? t.premiumUser : t.freePlan}
                    </div>
                </div>

                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 font-semibold mb-2">
                        <Calendar size={18} />
                        {t.joined}
                    </div>
                    <div className="text-slate-500">
                        {joinedDate}
                    </div>
                </div>
            </div>
        </div>
    )
}
