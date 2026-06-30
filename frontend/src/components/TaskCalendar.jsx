import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function TaskCalendar({ tasks = [] }) {

    const [date, setDate] = useState(new Date());
    const [view, setView] = useState("month");

    const events = tasks
        .filter((t) => t.deadline)
        .map((t) => ({
            title: t.title,
            start: new Date(t.deadline),
            end: new Date(t.deadline),
        }));

    return (
        <div className="border rounded-2xl bg-white p-5">

            <h2 className="font-bold mb-3">
                Task Calendar
            </h2>

            <div style={{ height: 500 }}>

                <Calendar
                    localizer={localizer}
                    events={events}
                    date={date}
                    view={view}
                    onNavigate={(newDate) => setDate(newDate)}
                    onView={(newView) => setView(newView)}
                    startAccessor="start"
                    endAccessor="end"
                />

            </div>

        </div>
    );
}