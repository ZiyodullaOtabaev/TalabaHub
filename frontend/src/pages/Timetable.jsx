import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Plus, Trash2, Clock, MapPin, User2 } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

export default function Timetable() {
    const { t } = useLang();

    const weekdayNames = [t.wdMon, t.wdTue, t.wdWed, t.wdThu, t.wdFri, t.wdSat, t.wdSun];

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [subject, setSubject] = useState("");
    const [weekday, setWeekday] = useState(0);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:30");
    const [room, setRoom] = useState("");
    const [teacher, setTeacher] = useState("");

    async function load() {
        try {
            const res = await api.get("/api/timetable/sessions/");
            setSessions(res.data || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function addSession(e) {
        e.preventDefault();
        if (!subject.trim()) return;
        await api.post("/api/timetable/sessions/", {
            subject: subject.trim(),
            weekday: Number(weekday),
            start_time: startTime,
            end_time: endTime,
            room: room.trim(),
            teacher: teacher.trim(),
        });
        setSubject("");
        setRoom("");
        setTeacher("");
        load();
    }

    async function remove(id) {
        await api.delete(`/api/timetable/sessions/${id}/`);
        load();
    }

    const byDay = useMemo(() => {
        const map = {};
        for (let i = 0; i < 7; i++) map[i] = [];
        for (const s of sessions) {
            if (map[s.weekday]) map[s.weekday].push(s);
        }
        return map;
    }, [sessions]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{t.timetableTitle}</h1>
                <p className="mt-1 text-gray-600">{t.timetableSub}</p>
            </div>

            {/* Add form */}
            <form onSubmit={addSession} className="th-card grid gap-3 md:grid-cols-6">
                <input className="th-input md:col-span-2" placeholder={t.subjectField} value={subject} onChange={(e) => setSubject(e.target.value)} />
                <select className="th-input" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                    {weekdayNames.map((w, i) => (
                        <option key={i} value={i}>{w}</option>
                    ))}
                </select>
                <input className="th-input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <input className="th-input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                <button className="th-btn-blue"><Plus size={18} />{t.add}</button>
                <input className="th-input md:col-span-3" placeholder={t.roomField} value={room} onChange={(e) => setRoom(e.target.value)} />
                <input className="th-input md:col-span-3" placeholder={t.teacherField} value={teacher} onChange={(e) => setTeacher(e.target.value)} />
            </form>

            {/* Weekly grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {weekdayNames.map((name, i) => (
                    <div key={i} className="th-card">
                        <h2 className="font-bold mb-3">{name}</h2>
                        {byDay[i].length === 0 ? (
                            <div className="text-sm text-gray-500">{t.noClasses}</div>
                        ) : (
                            <div className="space-y-2">
                                {byDay[i].map((s) => (
                                    <div key={s.id} className="rounded-xl border p-3 flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="font-semibold truncate">{s.subject}</div>
                                            <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                <span className="inline-flex items-center gap-1"><Clock size={14} />{s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}</span>
                                                {s.room && <span className="inline-flex items-center gap-1"><MapPin size={14} />{s.room}</span>}
                                                {s.teacher && <span className="inline-flex items-center gap-1"><User2 size={14} />{s.teacher}</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => remove(s.id)} className="text-red-500 hover:text-red-600 shrink-0" title={t.delete}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {loading && <div className="text-sm text-gray-500">{t.chatLoading}</div>}
        </div>
    );
}
