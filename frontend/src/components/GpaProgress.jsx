export default function GpaProgress({ gpa }) {

    const percent = (gpa / 5) * 100

    return (

        <div className="rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">

            <div className="text-lg font-bold mb-3">
                GPA Progress
            </div>

            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">

                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    style={{ width: `${percent}%` }}
                />

            </div>

            <div className="mt-2 text-sm text-slate-500">
                {gpa} / 5.0
            </div>

        </div>

    )

}