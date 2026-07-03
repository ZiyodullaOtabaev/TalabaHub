import { Component } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Productionda bu yerga error logging (Sentry va h.k.) qo'shish mumkin
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6">
                    <div className="text-center max-w-md space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 grid place-items-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold">Xatolik yuz berdi</h1>
                        <p className="text-sm opacity-70">
                            Kutilmagan xatolik ro'y berdi. Sahifani yangilab ko'ring yoki bosh sahifaga qayting.
                        </p>
                        {this.state.error?.message && (
                            <pre className="text-xs text-left bg-slate-100 dark:bg-slate-800 rounded-xl p-3 overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition"
                            >
                                <RefreshCw size={16} />
                                Qayta urinish
                            </button>
                            <button
                                onClick={() => window.location.assign("/dashboard")}
                                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold hover:scale-105 transition"
                            >
                                Bosh sahifa
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
