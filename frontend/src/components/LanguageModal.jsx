import { X } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider.jsx";

export default function LanguageModal({ open, onClose }) {
    const { setLang } = useLang();
    if (!open) return null;

    function pick(code) {
        setLang(code);
        localStorage.setItem("lang_onboarded", "1");
        onClose();
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-[92%] max-w-md rounded-3xl bg-white border shadow-xl p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-extrabold">Tilni tanlang</div>
                        <div className="text-sm text-gray-600 mt-1">
                            Keyin ham navbar’dan o‘zgartira olasiz.
                        </div>
                    </div>
                    <button
                        className="p-2 rounded-xl border hover:bg-gray-50"
                        onClick={onClose}
                        type="button"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-4 grid gap-2">
                    <button
                        onClick={() => pick("uz")}
                        className="w-full text-left px-4 py-3 rounded-2xl border hover:bg-yellow-50 font-semibold"
                        type="button"
                    >
                        🇺🇿 O‘zbek
                    </button>
                    <button
                        onClick={() => pick("en")}
                        className="w-full text-left px-4 py-3 rounded-2xl border hover:bg-blue-50 font-semibold"
                        type="button"
                    >
                        🇬🇧 English
                    </button>
                    <button
                        onClick={() => pick("ru")}
                        className="w-full text-left px-4 py-3 rounded-2xl border hover:bg-red-50 font-semibold"
                        type="button"
                    >
                        🇷🇺 Русский
                    </button>
                </div>
            </div>
        </div>
    );
}