import { useEffect, useState } from "react"

export default function ExamCountdown({ date }) {

    const [time, setTime] = useState("")

    useEffect(() => {

        const interval = setInterval(() => {

            const diff = new Date(date) - new Date()

            if (diff <= 0) {
                setTime("Exam started")
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))

            setTime(days + " days left")

        }, 1000)

        return () => clearInterval(interval)

    }, [date])

    return (

        <div className="border rounded-2xl bg-white dark:bg-slate-800 p-5">

            <h2 className="font-bold mb-2">
                Exam Countdown
            </h2>

            <div className="text-3xl font-extrabold">
                {time}
            </div>

        </div>

    )

}