import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import { ShieldCheck, Crown, User2, Shield } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";

export default function AdminPanel() {
    const { t } = useLang();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            const res = await api.get("/api/users/admin/users/");
            setUsers(res.data || []);
        } catch (err) {
            const detail = err?.response?.data?.detail || "Ruxsat yo'q";
            toast.error(detail);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function toggleAdmin(u) {
        try {
            await api.post(`/api/users/admin/users/${u.id}/set-admin/`, {
                is_admin: !u.is_staff,
            });
            toast.success("OK");
            load();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Xatolik");
        }
    }

    function roleBadge(u) {
        if (u.is_superuser) return { label: t.roleOwner, cls: "bg-amber-500", icon: <Crown size={13} /> };
        if (u.is_staff) return { label: t.roleAdmin, cls: "bg-indigo-500", icon: <Shield size={13} /> };
        return { label: t.roleStudent, cls: "bg-slate-500", icon: <User2 size={13} /> };
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white grid place-items-center">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t.adminTitle}</h1>
                    <p className="mt-0.5 text-gray-600">{t.adminSub}</p>
                </div>
            </div>

            <div className="th-card overflow-x-auto">
                {loading ? (
                    <div className="text-sm text-gray-500">{t.chatLoading}</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase text-gray-500 border-b">
                                <th className="py-2 pr-2">{t.colUser}</th>
                                <th className="py-2 pr-2">{t.colRole}</th>
                                <th className="py-2 pl-2 text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const r = roleBadge(u);
                                return (
                                    <tr key={u.id} className="border-b last:border-0">
                                        <td className="py-3 pr-2">
                                            <div className="font-semibold">@{u.username}</div>
                                            {u.email && <div className="text-xs text-gray-500">{u.email}</div>}
                                        </td>
                                        <td className="py-3 pr-2">
                                            <span className={`inline-flex items-center gap-1 text-xs text-white px-2 py-1 rounded-full ${r.cls}`}>
                                                {r.icon}{r.label}
                                            </span>
                                        </td>
                                        <td className="py-3 pl-2 text-right">
                                            {!u.is_superuser && (
                                                <button
                                                    onClick={() => toggleAdmin(u)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${u.is_staff ? "border text-red-500" : "bg-indigo-600 text-white"}`}
                                                >
                                                    {u.is_staff ? t.removeAdmin : t.makeAdmin}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
