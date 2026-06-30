import { useEffect, useState } from "react"
import api from "../api"

import {
    User,
    Mail,
    GraduationCap,
    Crown,
    Calendar
} from "lucide-react"

export default function Profile() {

    const [me, setMe] = useState(null)

    useEffect(() => {

        async function load() {

            const res = await api.get("/api/users/me/")
            setMe(res.data)

        }

        load()

    }, [])

    if (!me) {

        return (

            <div className="flex justify-center py-20">
                Loading...
            </div>

        )

    }

    return (

        <div className="max-w-4xl mx-auto space-y-6">

            <h1 className="text-3xl font-bold">
                Profile
            </h1>

            {/* PROFILE CARD */}

            <div className="rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-card">

                <div className="flex items-center gap-6">

                    <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">

                        {me.username[0].toUpperCase()}

                    </div>

                    <div>

                        <h2 className="text-xl font-bold">
                            {me.username}
                        </h2>

                        <p className="text-slate-500">
                            {me.university}
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
                        Email

                    </div>

                    <div className="text-slate-500">
                        {me.email || "No email"}
                    </div>

                </div>

                {/* UNIVERSITY */}

                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">

                    <div className="flex items-center gap-3 font-semibold mb-2">

                        <GraduationCap size={18} />
                        University

                    </div>

                    <div className="text-slate-500">
                        {me.university}
                    </div>

                </div>

                {/* PREMIUM */}

                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">

                    <div className="flex items-center gap-3 font-semibold mb-2">

                        <Crown size={18} />
                        Premium Status

                    </div>

                    <div className="text-slate-500">

                        {me.is_premium ? "Premium User" : "Free Plan"}

                    </div>

                </div>

                {/* JOIN DATE */}

                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">

                    <div className="flex items-center gap-3 font-semibold mb-2">

                        <Calendar size={18} />
                        Joined

                    </div>

                    <div className="text-slate-500">

                        {new Date(me.date_joined).toLocaleDateString()}

                    </div>

                </div>

            </div>

        </div>

    )

}