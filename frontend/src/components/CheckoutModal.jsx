import { useState } from "react";
import { X, CreditCard, CheckCircle2, Sparkles, ShieldCheck, Tag, ArrowRight } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

const PROVIDERS = [
    { id: "click", name: "Click", desc: "Click Up / QR to'lov", color: "from-blue-600 to-sky-500", badge: "Ommabop" },
    { id: "payme", name: "Payme", desc: "Karta orqali bir zumda", color: "from-teal-500 to-emerald-600", badge: "Tezkor" },
    { id: "uzum", name: "Uzum Bank", desc: "Uzum ilovasi / Muddatli to'lov", color: "from-purple-600 to-indigo-600", badge: "0% foiz" },
    { id: "card", name: "Uzcard / Humo", desc: "To'g'ridan-to'g'ri karta", color: "from-slate-700 to-slate-900", badge: "Xavfsiz" },
];

export default function CheckoutModal({ open, onClose, course, onSuccess }) {
    const [selectedProvider, setSelectedProvider] = useState("click");
    const [promoCode, setPromoCode] = useState("");
    const [discountPercent, setDiscountPercent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const [txnId, setTxnId] = useState("");

    if (!open || !course) return null;

    const basePrice = Number(course.price) || 0;
    const discountAmount = (basePrice * discountPercent) / 100;
    const finalPrice = Math.max(basePrice - discountAmount, 0);

    function applyPromo() {
        const code = promoCode.trim().toUpperCase();
        if (code === "TALABA10") {
            setDiscountPercent(10);
            toast.success("10% chegirma qo'llandi! 🎉");
        } else if (code === "TALABAHUB" || code === "STARTUP") {
            setDiscountPercent(20);
            toast.success("20% maxsus chegirma qo'llandi! 🚀");
        } else {
            toast.error("Bunday promo-kod mavjud emas");
        }
    }

    async function handlePayment() {
        setLoading(true);
        const tid = toast.loading("To'lov shakllantirilmoqda...");
        try {
            const res = await api.post("/api/payments/create-checkout/", {
                course_id: course.id,
                provider: selectedProvider,
                promo_code: promoCode,
            });

            const transactionId = res.data.transaction_id;
            setTxnId(transactionId);
            toast.dismiss(tid);

            // To'lovni tasdiqlash
            const verifyRes = await api.post("/api/payments/verify/", {
                transaction_id: transactionId,
            });

            if (verifyRes.data?.success) {
                setPaymentDone(true);
                toast.success("To'lov muvaffaqiyatli qabul qilindi!");
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            toast.dismiss(tid);
            toast.error(err?.response?.data?.detail || "To'lovda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg th-card p-6 md:p-8 border border-white/20 rounded-3xl space-y-6 shadow-2xl bg-slate-900/95 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                        <ShieldCheck size={20} /> 100% Xavfsiz To'lov
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-xl hover:bg-white/10 opacity-60 hover:opacity-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {!paymentDone ? (
                    <>
                        {/* Course Info Card */}
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                            {course.cover_image ? (
                                <img src={course.cover_image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-white font-extrabold text-xl">
                                    TH
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <h3 className="font-extrabold text-base truncate">{course.title}</h3>
                                <p className="text-xs opacity-60 mt-0.5">{course.category_name || "Kurs"} &middot; {course.instructor_name || "O'qituvchi"}</p>
                                <div className="mt-1 font-black text-emerald-400 text-lg">
                                    {finalPrice.toLocaleString()} so'm
                                    {discountPercent > 0 && (
                                        <span className="text-xs opacity-50 line-through ml-2 text-slate-400">
                                            {basePrice.toLocaleString()} so'm
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Providers */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider opacity-60">To'lov Usulini Tanlang:</label>
                            <div className="grid grid-cols-2 gap-3">
                                {PROVIDERS.map((p) => {
                                    const active = selectedProvider === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setSelectedProvider(p.id)}
                                            className={`p-3.5 rounded-2xl border text-left transition relative overflow-hidden ${active
                                                ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                                                : "border-white/10 hover:border-white/20 bg-white/5"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="font-extrabold text-sm">{p.name}</div>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 opacity-70 font-semibold">{p.badge}</span>
                                            </div>
                                            <p className="text-[11px] opacity-60 mt-1">{p.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Promo Code Box */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-1">
                                <Tag size={12} /> Promo-kod (Chegirma):
                            </label>
                            <div className="flex gap-2">
                                <input
                                    className="th-input flex-1 !py-2 text-sm uppercase placeholder:normal-case font-mono"
                                    placeholder="Masalan: TALABA10"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={applyPromo}
                                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs transition"
                                >
                                    Qo'llash
                                </button>
                            </div>
                        </div>

                        {/* Total Summary & Pay Button */}
                        <div className="pt-2 border-t border-white/10 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-70">Jami to'lov:</span>
                                <span className="font-extrabold text-xl text-emerald-400">{finalPrice.toLocaleString()} so'm</span>
                            </div>

                            <button
                                disabled={loading}
                                onClick={handlePayment}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-extrabold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                            >
                                <CreditCard size={18} />
                                {loading ? "To'lov o'tkazilmoqda..." : `${selectedProvider.toUpperCase()} orqali to'lash`}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </>
                ) : (
                    /* Payment Success View */
                    <div className="text-center py-6 space-y-4 animate-scale-in">
                        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/30">
                            <CheckCircle2 size={42} />
                        </div>
                        <h2 className="text-2xl font-black text-white">To'lov Muvaffaqiyatli! 🎉</h2>
                        <p className="text-sm opacity-70 max-w-sm mx-auto">
                            Kursga to'liq a'zo bo'ldingiz! Barcha yopiq video darslar va materiallar profilingizga ochildi.
                        </p>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono opacity-60">
                            Tranzaksiya ID: {txnId}
                        </div>
                        <button
                            onClick={() => {
                                onClose();
                                window.location.reload();
                            }}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 hover:scale-105 transition"
                        >
                            Darslarni Boshlash 🚀
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
