import { useEffect, useState } from "react"
import { useLang } from "../i18n/LanguageProvider"

function defaultExamDate() {
    // Sana berilmasa, placeholder sifatida 30 kun keyin
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d
}

export default function ExamCountdown({ date }) {

    const { t } = useLang()
    const [time, setTime] = useState("")

    useEffect(() => {

        const target = date ? new Date(date) : defaultExamDate()

        function tick() {
            const diff = target - new Date()

            if (diff <= 0) {
                setTime(t.examStarted)
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            setTime(`${days} ${t.daysLeft}`)
        }

        tick()
        const interval = setInterval(tick, 1000)

        return () => clearInterval(interval)

    }, [date, t])

    return (

        <div className="border rounded-2xl bg-white dark:bg-slate-800 p-5">

            <h2 className="font-bold mb-2">
                {t.examCountdown}
            </h2>

            <div className="text-3xl font-extrabold">
                {time}
            </div>

        </div>

    )

}
