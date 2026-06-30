export default function Skeleton({ className = "" }) {
    return (
        <div
            className={
                "relative overflow-hidden rounded-xl bg-gray-200/70 dark:bg-gray-800/60 " +
                className
            }
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/35 to-transparent dark:via-white/10" />
        </div>
    );
}