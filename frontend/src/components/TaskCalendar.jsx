import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, uz, ru } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useLang } from "../i18n/LanguageProvider";

const locales = {
    "en-US": enUS,
    uz,
    ru,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function TaskCalendar({ tasks = [] }) {

    const { t, lang } = useLang();

    const [date, setDate] = useState(new Date());
    const [view, setView] = useState("month");

    const culture = lang === "en" ? "en-US" : lang;

    const messages = {
        today: t.calToday,
        previous: t.calBack,
        next: t.calNext,
        month: t.calMonth,
        week: t.calWeek,
        day: t.calDay,
        agenda: t.calAgenda,
    };

    const events = tasks
        .filter((x) => x.deadline)
        .map((x) => ({
            title: x.title,
            start: new Date(x.deadline),
            end: new Date(x.deadline),
        }));

    return (
        <div className="th-card">

            <h2 className="font-bold mb-3">
                {t.taskCalendar}
            </h2>

            <div style={{ height: 500 }}>

                <Calendar
                    localizer={localizer}
                    culture={culture}
                    messages={messages}
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
