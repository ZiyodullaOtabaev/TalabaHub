import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import api from "../api"
import { useLang } from "../i18n/LanguageProvider"

import {
    Mail,
    GraduationCap,
    Crown,
    Calendar
} from "lucide-react"

export default function Profile() {
    const { t } = useLang()

    const [me, setMe] = useState(null)

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get("/api/users/me/")
                setMe(res.data)
            } catch {
                toast.error("Profilni yuklab bo'lmadi")
            }
        }

        load()
    }, [])

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

                <div className="flex items-center gap-6">

                    <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">

                        {initial}

                    </div>

                    <div>

                        <h2 className="text-xl font-bold">
                            {me.username}
                        </h2>

                        <p className="text-slate-500">
                            {me.university || "—"}
                        </p>

                    </div>

                </div>

            </div>

            {/* DETAILS GRID */}

            <div className="grid md:grid-cols-2 gap-6">

                {/* EMAIL */}

                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">

                    <div className="flex items-center gap-3 font-semibold mb-2">

                        <Mail size={18} />
                        {t.email}

                    </div>

                    <div className="text-slate-500">
                        {me.email || t.noEmail}
                    </div>

                </div>

                {/* UNIVERSITY */}

                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">

                    <div className="flex items-center gap-3 font-semibold mb-2">

                        <GraduationCap size={18} />
                        {t.universityLabel}

                    </div>

                    <div className="text-slate-500">
                        {me.university || "—"}
                    </div>

                </div>

                {/* PREMIUM */}

                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">

                    <div className="flex items-center gap-3 font-semibold mb-2">

                        <Crown size={18} />
                        {t.premiumStatus}

                    </div>

                    <div className="text-slate-500">

                        {me.is_premium ? t.premiumUser : t.freePlan}

                    </div>

                </div>

                {/* JOIN DATE */}

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
