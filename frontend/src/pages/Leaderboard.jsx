import { useEffect, useState } from "react";
import api from "../api";
import { Trophy } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

const medal = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
    const { t } = useLang();

    const [data, setData] = useState({ top: [], my_rank: null, me: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/gpa/leaderboard/");
                setData(res.data);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-black grid place-items-center">
                    <Trophy size={20} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t.leaderboardTitle}</h1>
                    <p className="mt-0.5 text-gray-600">{t.leaderboardSub}</p>
                </div>
            </div>

            {data.my_rank && (
                <div className="th-card flex items-center justify-between">
                    <span className="font-semibold">{t.myRankLabel}</span>
                    <span className="text-2xl font-extrabold text-indigo-500">#{data.my_rank}</span>
                </div>
            )}

            {data.top.length === 0 ? (
                <div className="th-card text-center text-gray-500">{loading ? t.chatLoading : t.noRanking}</div>
            ) : (
                <div className="th-card overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase text-gray-500 border-b">
                                <th className="py-2 pr-2">{t.rankCol}</th>
                                <th className="py-2 pr-2">{t.studentCol}</th>
                                <th className="py-2 pr-2 text-right">{t.gpaCol}</th>
                                <th className="py-2 pl-2 text-right">{t.creditsCol}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top.map((r) => {
                                const mine = r.username === data.me;
                                return (
                                    <tr key={r.username} className={`border-b last:border-0 ${mine ? "bg-indigo-500/10 font-bold" : ""}`}>
                                        <td className="py-3 pr-2">{medal[r.rank - 1] || r.rank}</td>
                                        <td className="py-3 pr-2">@{r.username}</td>
                                        <td className="py-3 pr-2 text-right font-bold text-indigo-500">{r.gpa.toFixed(2)}</td>
                                        <td className="py-3 pl-2 text-right text-gray-500">{r.total_credits}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
