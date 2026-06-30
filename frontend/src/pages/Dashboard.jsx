import { useEffect, useMemo, useState } from "react"
import api from "../api"

import {
    PlusCircle,
    RefreshCw,
    ClipboardList,
    GraduationCap
} from "lucide-react"

import GpaProgress from "../components/GpaProgress"
import StudyAnalytics from "../components/StudyAnalytics"
import ModernCalendar from "../components/ModernCalendar"
import ExamCountdown from "../components/ExamCountdown"

export default function Dashboard() {

    const [loading, setLoading] = useState(true)

    const [gpa, setGpa] = useState(null)
    const [tasks, setTasks] = useState([])

    const [subjectName, setSubjectName] = useState("")
    const [credit, setCredit] = useState("")
    const [grade, setGrade] = useState("A")

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
        setGrade("A")

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

    return (

        <div className="space-y-6">

            {/* HEADER */}
            <div className="text-sm text-slate-500">

                {me?.university}

            </div>

            <div className="flex justify-between items-start">

                <div>

                    <h1 className="text-3xl font-bold">
                        Dashboard
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400">
                        GPA va tasklaringizni boshqaring
                    </p>

                </div>

                <button
                    onClick={load}
                    className="flex items-center gap-2 px-4 h-[44px] rounded-xl bg-indigo-600 text-white font-semibold hover:scale-105 transition"
                >

                    <RefreshCw size={18} />
                    Refresh

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
                            placeholder="Subject"
                            className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />

                        <input
                            value={credit}
                            onChange={e => setCredit(e.target.value)}
                            type="number"
                            placeholder="Credit"
                            className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />

                        <select
                            value={grade}
                            onChange={e => setGrade(e.target.value)}
                            className="w-full h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >

                            <option>A</option>
                            <option>B</option>
                            <option>C</option>
                            <option>D</option>
                            <option>F</option>

                        </select>

                        <button
                            className="w-full h-[44px] bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition"
                        >

                            <PlusCircle size={18} />
                            Add Subject

                        </button>

                    </form>

                </div>

                {/* TASKS */}

                <div className="col-span-3 rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-card backdrop-blur-md">

                    <div className="flex justify-between">

                        <div className="flex gap-2 font-bold">

                            <ClipboardList size={18} />
                            Tasks

                        </div>

                        <span className="text-sm text-slate-400">
                            {tasks.length}
                        </span>

                    </div>

                    <form onSubmit={addTask} className="space-y-3 mt-4">

                        <input
                            value={taskTitle}
                            onChange={e => setTaskTitle(e.target.value)}
                            placeholder="Task title"
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

                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>

                            </select>

                            <button
                                className="h-[44px] bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition"
                            >

                                <PlusCircle size={18} />
                                Add

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
                                    Sizda bugun bo'sh vaqt bor!
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
                                    {t.priority}
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

                {/* STATS */}

                <div className="col-span-1 rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-card">

                    <div className="font-bold">
                        Statistics
                    </div>

                    <div className="space-y-2 mt-3 text-sm">

                        <div className="flex justify-between">
                            <span>Total</span>
                            <span>{stats.total}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Completed</span>
                            <span>{stats.done}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Pending</span>
                            <span>{stats.pending}</span>
                        </div>

                    </div>

                    <div className="mt-5">

                        <div className="font-bold mb-2">
                            Upcoming
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
                <ExamCountdown date="2026-07-01" />

            </div>

            <StudyAnalytics tasks={tasks} />
            <ModernCalendar tasks={tasks} />

        </div>

    )

}