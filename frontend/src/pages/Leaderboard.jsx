import { useEffect, useState } from "react";
import api from "../api";
import { Trophy, Medal, Crown } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

const RANK_STYLES = {
    1: { bg: "bg-gradient-to-r from-yellow-400 to-amber-500", text: "text-white", badge: "🥇" },
    2: { bg: "bg-gradient-to-r from-slate-300 to-gray-400", text: "text-white", badge: "🥈" },
    3: { bg: "bg-gradient-to-r from-amber-600 to-orange-700", text: "text-white", badge: "🥉" },
};

export default function Leaderboard() {
    const { t } = useLang();
    const [data, setData] = useState({ top: [], my_rank: null, me: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/gpa/leaderboard/");
                setData(res.data);
            } catch { /* ignore */ }
            finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white grid place-items-center">
                        <Trophy size={22} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">{t.leaderboardTitle || "Reyting"}</h1>
                        <p className="mt-0.5 opacity-60">{t.leaderboardSub || "Eng yaxshi talabalar GPA bo'yicha"}</p>
                    </div>
                </div>
                {data.my_rank && (
                    <div className="text-right">
                        <div className="text-xs opacity-50">{t.myRankLabel || "Sizning o'rningiz"}</div>
                        <div className="text-2xl font-extrabold text-indigo-500">#{data.my_rank}</div>
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="th-card p-10 text-center opacity-50">{t.chatLoading || "Yuklanmoqda..."}</div>
            ) : data.top.length === 0 ? (
                <div className="th-card p-10 text-center opacity-50">{t.noRanking || "Reyting hali yo'q. Fan va baholar kiriting."}</div>
            ) : (
                <div className="space-y-2">
                    {data.top.map((r) => {
                        const mine = r.username === data.me;
                        const rankStyle = RANK_STYLES[r.rank];
                        const isTop3 = r.rank <= 3;

                        return (
                            <div
                                key={r.username}
                                className={`th-card p-3 sm:p-4 flex items-center gap-3 transition hover:scale-[1.01] ${mine ? "ring-2 ring-indigo-500 shadow-md shadow-indigo-500/10" : ""}`}
                            >
                                {/* Rank */}
                                <div className={`w-10 h-10 rounded-xl grid place-items-center font-extrabold text-sm shrink-0 ${
                                    rankStyle ? `${rankStyle.bg} ${rankStyle.text}` : "bg-slate-100 dark:bg-slate-800"
                                }`}>
                                    {isTop3 ? rankStyle.badge : r.rank}
                                </div>

                                {/* User info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate flex items-center gap-1.5">
                                        @{r.username}
                                        {mine && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">SIZ</span>}
                                    </div>
                                    <div className="text-xs opacity-50">
                                        {r.subjects_count} fan &middot; {r.total_credits} kredit
                                    </div>
                                </div>

                                {/* GPA */}
                                <div className="text-right shrink-0">
                                    <div className={`text-xl font-extrabold ${isTop3 ? "bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent" : ""}`}>
                                        {r.gpa.toFixed(2)}
                                    </div>
                                    <div className="text-[10px] opacity-40">GPA</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
