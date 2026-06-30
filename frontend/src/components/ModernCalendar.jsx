import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import enUS from "date-fns/locale/en-US"
import "react-big-calendar/lib/css/react-big-calendar.css"

const locales = { "en-US": enUS }

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
})

export default function ModernCalendar({ tasks = [] }) {

    const events = tasks
        .filter(t => t.deadline)
        .map(t => ({
            title: t.title,
            start: new Date(t.deadline),
            end: new Date(t.deadline)
        }))

    return (

        <div className="border rounded-2xl bg-white dark:bg-slate-800 p-5">

            <h2 className="font-bold mb-3">
                Planner Calendar
            </h2>

            <div style={{ height: 500 }}>

                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                />

            </div>

        </div>

    )

}