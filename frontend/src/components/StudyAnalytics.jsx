import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function StudyAnalytics({ tasks }) {

    const data = [
        { day: "Mon", tasks: 2 },
        { day: "Tue", tasks: 4 },
        { day: "Wed", tasks: 1 },
        { day: "Thu", tasks: 3 },
        { day: "Fri", tasks: 5 },
    ]

    return (

        <div className="border rounded-2xl bg-white dark:bg-slate-800 p-5">

            <h2 className="font-bold mb-4">
                Study Analytics
            </h2>

            <ResponsiveContainer width="100%" height={200}>

                <LineChart data={data}>

                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="tasks"
                        stroke="#2563eb"
                        strokeWidth={3}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    )

}