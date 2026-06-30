import { useState, useEffect } from "react";

export default function PomodoroTimer() {

    const [time, setTime] = useState(25 * 60);
    const [running, setRunning] = useState(false);

    useEffect(() => {

        if (!running) return;

        const timer = setInterval(() => {
            setTime(t => t > 0 ? t - 1 : 0);
        }, 1000);

        return () => clearInterval(timer);

    }, [running]);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (

        <div className="border rounded-2xl p-5 bg-white">

            <h2 className="font-bold mb-3">
                Pomodoro Timer
            </h2>

            <div className="text-4xl font-extrabold mb-3">
                {minutes}:{seconds.toString().padStart(2, "0")}
            </div>

            <div className="flex gap-2">

                <button
                    onClick={() => setRunning(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl"
                >
                    Start
                </button>

                <button
                    onClick={() => setRunning(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl"
                >
                    Stop
                </button>

                <button
                    onClick={() => setTime(25 * 60)}
                    className="px-4 py-2 bg-gray-200 rounded-xl"
                >
                    Reset
                </button>

            </div>

        </div>

    );

}