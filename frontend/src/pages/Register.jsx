import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { User, Mail, Lock, GraduationCap } from "lucide-react"

export default function Register() {

    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")
    const [university, setUniversity] = useState("")

    async function register(e) {

        e.preventDefault()

        if (password !== password2) {

            alert("Passwords do not match")
            return

        }

        await api.post("/api/users/register/", {

            username,
            email,
            password,
            university

        })

        navigate("/login")

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

                    <button className="w-full h-[44px] bg-indigo-600 text-white rounded-xl hover:scale-105 transition">
                        Hisob yaratish
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