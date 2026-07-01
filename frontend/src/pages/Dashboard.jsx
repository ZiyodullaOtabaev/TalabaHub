import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { useLang } from "../i18n/LanguageProvider"

import {
    PlusCircle,
    RefreshCw,
    ClipboardList,
    GraduationCap,
    Sparkles,
    ArrowRight
} from "lucide-react"

import GpaProgress from "../components/GpaProgress"
import StudyAnalytics from "../components/StudyAnalytics"
import ModernCalendar from "../components/ModernCalendar"
import ExamCountdown from "../components/ExamCountdown"

export default function Dashboard() {

    const { t: tr } = useLang()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)

    const [gpa, setGpa] = useState(null)
    const [tasks, setTasks] = useState([])

    const [subjectName, setSubjectName] = useState("")
    const [credit, setCredit] = useState("")
    const [grade, setGrade] = useState("5")

    const [taskTitle, setTaskTitle] = useState("")
    const [deadline, setDeadline] = useState("")
    const [priority, setPriority] = useState("medium")

    async function load() {

        setLoading(true)

        try {

            const [gpaRes, tasksRes] = await Promise.all([
                api.get("/api/gpa/calculate/"),
                api.get("/api/planner/tasks/")
            ])

            setGpa(gpaRes.data)
            setTasks(tasksRes.data || [])

        }

        finally {

            setLoading(false)

        }

    }

    useEffect(() => {

        load()

    }, [])

    const [me, setMe] = useState(null)

    useEffect(() => {

        async function getMe() {

            const res = await api.get("/api/users/me/")
            setMe(res.data)

        }

        getMe()

    }, [])

    async function addSubject(e) {

        e.preventDefault()

        await api.post("/api/gpa/subjects/", {

            name: subjectName,
            credit: Number(credit),
            grade

        })

        setSubjectName("")
        setCredit("")
        setGrade("5")

        load()

    }

    async function addTask(e) {

        e.preventDefault()

        await api.post("/api/planner/tasks/", {

            title: taskTitle,
            deadline: deadline || null,
            priority

        })

        setTaskTitle("")
        setDeadline("")
        setPriority("medium")

        load()

    }

    const upcoming = useMemo(() => {

        return tasks
            .filter(t => t.deadline && !t.completed)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 3)

    }, [tasks])

    const stats = {

        total: tasks.length,
        done: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length

    }

    const priorityColor = {

        low: "bg-green-500/10 text-green-500",
        medium: "bg-yellow-500/10 text-yellow-500",
        high: "bg-red-500/10 text-red-500"

    }

    const priorityLabel = {
        low: tr.priorityLow,
        medium: tr.priorityMedium,
        high: tr.priorityHigh
    }

    return (

        <div className="space-y-6">

            {/* HEADER */}
            <div className="text-sm text-slate-500">

                {me?.university}

            </div>

            <div className="flex justify-between items-start">

                <div>

                    <h1 className="text-3xl font-bold">
                        {tr.dashboardTitle}
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400">
                        {tr.dashboardSub}
                    </p>

                </div>

                <button
                    onClick={load}
                    className="flex items-center gap-2 px-4 h-[44px] rounded-xl bg-indigo-600 text-white font-semibold hover:scale-105 transition"
                >

                    <RefreshCw size={18} />
                    {tr.refresh}

                </button>

            </div>

            {/* QUICK ACCESS: Growth & IELTS */}

            <div className="grid gap-4 sm:grid-cols-2">

                <button
                    type="button"
                    onClick={() => navigate("/growth")}
                    className="group relative overflow-hidden rounded-2xl p-6 text-left text-white bg-gradient-to-br from-fuchsia-500 via-purple-500 to-pink-500 transition hover:-translate-y-1 hover:shadow-lg"
                >

                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 backdrop-blur">
                                <Sparkles size={24} />
                            </div>

                            <div>
                                <div className="text-lg font-extrabold">{tr.navGrowth}</div>
                                <div className="text-sm text-white/85">{tr.growthSub}</div>
                            </div>

                        </div>

                        <ArrowRight size={22} className="shrink-0 transition group-hover:translate-x-1" />

                    </div>

                </button>

                <button
                    type="button"
                    onClick={() => navigate("/ielts")}
                    className="group relative overflow-hidden rounded-2xl p-6 text-left text-white bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 transition hover:-translate-y-1 hover:shadow-lg"
                >

                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 backdrop-blur">
                                <GraduationCap size={24} />
                            </div>

                            <div>
                                <div className="text-lg font-extrabold">{tr.navIelts}</div>
                                <div className="text-sm text-white/85">{tr.ieltsSub}</div>
                            </div>

                        </div>

                        <ArrowRight size={22} className="shrink-0 transition group-hover:translate-x-1" />

                    </div>

                </button>

            </div>

            {/* BENTO GRID */}

            <div className="grid gap-6 md:grid-cols-6 auto-rows-fr">

                {/* GPA */}

                <div className="col-span-2 rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-card backdrop-blur-md">

                    <div className="flex items-center gap-2 font-bold">

                        <GraduationCap size={18} />
                        GPA

                    </div>

                    <div className="text-4xl font-extrabold mt-3">
                        {gpa?.gpa ?? "0"}
                    </div>

                    <form onSubmit={addSubject} className="space-y-3 mt-4">

                        <input
                            value={subjectName}
                            onChange={e => setSubjectName(e.target.value)}
                            placeholder={tr.subjectPlaceholder}
                            className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />

                        <input
                            value={credit}
                            onChange={e => setCredit(e.target.value)}
                            type="number"
                            placeholder={tr.creditPlaceholder}
                            className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />

                        <select
                            value={grade}
                            onChange={e => setGrade(e.target.value)}
                            className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >

                            <option value="5">A'lo (5)</option>
                            <option value="4">Yaxshi (4)</option>
                            <option value="3">Qoniqarli (3)</option>
                            <option value="2">Qoniqarsiz (2)</option>

                        </select>

                        <button
                            className="w-full h-[44px] bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition"
                        >

                            <PlusCircle size={18} />
                            {tr.addSubject}

                        </button>

                    </form>

                </div>

                {/* TASKS */}

                <div className="col-span-3 rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-card backdrop-blur-md">

                    <div className="flex justify-between">

                        <div className="flex gap-2 font-bold">

                            <ClipboardList size={18} />
                            {tr.tasks}

                        </div>

                        <span className="text-sm text-slate-400">
                            {tasks.length}
                        </span>

                    </div>

                    <form onSubmit={addTask} className="space-y-3 mt-4">

                        <input
                            value={taskTitle}
                            onChange={e => setTaskTitle(e.target.value)}
                            placeholder={tr.taskTitlePlaceholder}
                            className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />

                        <div className="grid grid-cols-3 gap-3">

                            <input
                                type="datetime-local"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                                className="h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />

                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                className="h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            >

                                <option value="low">{tr.priorityLow}</option>
                                <option value="medium">{tr.priorityMedium}</option>
                                <option value="high">{tr.priorityHigh}</option>

                            </select>

                            <button
                                className="h-[44px] bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition"
                            >

                                <PlusCircle size={18} />
                                {tr.addTask}

                            </button>

                        </div>

                    </form>

                    <div className="space-y-2 mt-4">

                        {tasks.length === 0 && (

                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">

                                <div className="text-4xl mb-2">
                                    🎉
                                </div>

                                <div className="font-semibold">
                                    {tr.freeTimeToday}
                                </div>

                            </div>

                        )}

                        {tasks.map(t => (

                            <div
                                key={t.id}
                                className="flex justify-between items-center border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-900"
                            >

                                <div>

                                    <div className="font-semibold">
                                        {t.completed ? "✅" : "⭕"} {t.title}
                                    </div>

                                    {t.deadline && (

                                        <div className="text-xs text-slate-400">
                                            {new Date(t.deadline).toLocaleString()}
                                        </div>

                                    )}

                                </div>

                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColor[t.priority]}`}>
                                    {priorityLabel[t.priority] || t.priority}
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

                {/* STATS */}

                <div className="col-span-1 rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-card">

                    <div className="font-bold">
                        {tr.statistics}
                    </div>

                    <div className="space-y-2 mt-3 text-sm">

                        <div className="flex justify-between">
                            <span>{tr.total}</span>
                            <span>{stats.total}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>{tr.completed}</span>
                            <span>{stats.done}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>{tr.pending}</span>
                            <span>{stats.pending}</span>
                        </div>

                    </div>

                    <div className="mt-5">

                        <div className="font-bold mb-2">
                            {tr.upcoming}
                        </div>

                        {upcoming.map(t => (

                            <div key={t.id} className="text-sm mb-2">

                                <div className="font-semibold">
                                    {t.title}
                                </div>

                                <div className="text-xs text-slate-400">
                                    {new Date(t.deadline).toLocaleString()}
                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

            {/* EXTRA WIDGETS */}

            <div className="grid md:grid-cols-2 gap-6">

                <GpaProgress gpa={gpa?.gpa} />
                <ExamCountdown />

            </div>

            <StudyAnalytics tasks={tasks} />
            <ModernCalendar tasks={tasks} />

        </div>

    )

}