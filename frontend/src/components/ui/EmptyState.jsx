import { Inbox } from "lucide-react"

export default function EmptyState({ icon, title, description, action, className = "" }) {

    const Icon = icon || Inbox

    return (

        <div
            className={`flex flex-col items-center justify-center text-center py-10 px-4 text-slate-500 ${className}`}
        >

            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <Icon size={22} />
            </div>

            {title && (
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {title}
                </div>
            )}

            {description && (
                <div className="text-sm mt-1">
                    {description}
                </div>
            )}

            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}

        </div>

    )

}
