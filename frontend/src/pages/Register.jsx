import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "../api"
import { User, Mail, Lock, GraduationCap } from "lucide-react"

// Backend xato javobidan (DRF) birinchi tushunarli xabarni ajratib olish
function extractApiError(err) {
    const data = err?.response?.data
    if (!data) return "Tarmoq xatosi. Internetni tekshiring."
    if (typeof data === "string") return data
    if (data.detail) return data.detail
    // Maydon xatolari: { username: ["..."], password: ["..."] }
    const firstKey = Object.keys(data)[0]
    if (firstKey) {
        const val = data[firstKey]
        const msg = Array.isArray(val) ? val[0] : val
        return `${firstKey}: ${msg}`
    }
    return "Ro'yxatdan o'tishda xatolik yuz berdi."
}

export default function Register() {

    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")
    const [university, setUniversity] = useState("")
    const [loading, setLoading] = useState(false)

    async function register(e) {

        e.preventDefault()

        if (password !== password2) {
            toast.error("Parollar mos kelmadi")
            return
        }

        if (password.length < 8) {
            toast.error("Parol kamida 8 ta belgidan iborat bo'lishi kerak")
            return
        }

        setLoading(true)
        const tid = toast.loading("Hisob yaratilmoqda...")

        try {
            await api.post("/api/users/register/", {
                username,
                email,
                password,
                university,
            })

            toast.dismiss(tid)
            toast.success("Hisob yaratildi ✅ Endi kiring")
            navigate("/login")
        } catch (err) {
            toast.dismiss(tid)
            toast.error(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">

            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-card border border-slate-200 dark:border-slate-700">

                <div className="text-center mb-6">

                    <div className="w-14 h-14 mx-auto rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                        TH
                    </div>

                    <h1 className="text-2xl font-bold mt-4">
                        Hisob yaratish
                    </h1>

                    <p className="text-slate-500 text-sm">
                        TalabaHub'da ro'yxatdan o'ting
                    </p>

                </div>

                <form onSubmit={register} className="space-y-4">

                    {/* USERNAME */}

                    <div>

                        <label className="text-sm font-medium">
                            Username
                        </label>

                        <div className="flex items-center border rounded-xl px-3 h-[44px] mt-1">

                            <User size={18} className="text-slate-400 mr-2" />

                            <input
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full outline-none bg-transparent"
                            />

                        </div>

                    </div>

                    {/* EMAIL */}

                    <div>

                        <label className="text-sm font-medium">
                            Email
                        </label>

                        <div className="flex items-center border rounded-xl px-3 h-[44px] mt-1">

                            <Mail size={18} className="text-slate-400 mr-2" />

                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full outline-none bg-transparent"
                            />

                        </div>

                    </div>

                    {/* UNIVERSITY */}

                    <div>

                        <label className="text-sm font-medium">
                            Universitet
                        </label>

                        <div className="flex items-center border rounded-xl px-3 h-[44px] mt-1">

                            <GraduationCap size={18} className="text-slate-400 mr-2" />

                            <input
                                value={university}
                                onChange={e => setUniversity(e.target.value)}
                                placeholder="TATU / INHA / WIUT"
                                className="w-full outline-none bg-transparent"
                            />

                        </div>

                    </div>

                    {/* PASSWORD */}

                    <div>

                        <label className="text-sm font-medium">
                            Parol
                        </label>

                        <div className="flex items-center border rounded-xl px-3 h-[44px] mt-1">

                            <Lock size={18} className="text-slate-400 mr-2" />

                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="********"
                                className="w-full outline-none bg-transparent"
                            />

                        </div>

                    </div>

                    {/* CONFIRM */}

                    <div>

                        <label className="text-sm font-medium">
                            Parolni qayta kiriting
                        </label>

                        <div className="flex items-center border rounded-xl px-3 h-[44px] mt-1">

                            <Lock size={18} className="text-slate-400 mr-2" />

                            <input
                                type="password"
                                value={password2}
                                onChange={e => setPassword2(e.target.value)}
                                placeholder="********"
                                className="w-full outline-none bg-transparent"
                            />

                        </div>

                    </div>

                    <button
                        disabled={loading}
                        className="w-full h-[44px] bg-indigo-600 text-white rounded-xl hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
                    >
                        {loading ? "Yaratilmoqda..." : "Hisob yaratish"}
                    </button>

                </form>

                <p className="text-center text-sm mt-4 text-slate-500">

                    Akkauntingiz bormi?{" "}
                    <span
                        className="text-indigo-600 cursor-pointer"
                        onClick={() => navigate("/login")}
                    >
                        Kirish
                    </span>

                </p>

            </div>

        </div>

    )

}