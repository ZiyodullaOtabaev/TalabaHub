import { useState } from "react";

export default function AIPlanner() {

    const [exam, setExam] = useState("");
    const [days, setDays] = useState("");
    const [plan, setPlan] = useState([]);

    function generatePlan() {

        const d = Number(days);

        const newPlan = [];

        for (let i = 1; i <= d; i++) {

            newPlan.push(`Day ${i}: Study ${exam}`);

        }

        setPlan(newPlan);

    }

    return (

        <div className="border rounded-2xl p-5 bg-white">

            <h2 className="font-bold mb-3">
                AI Study Planner
            </h2>

            <input
                placeholder="Exam name"
                value={exam}
                onChange={e => setExam(e.target.value)}
                className="border rounded-xl px-3 py-2 w-full mb-2"
            />

            <input
                placeholder="Days left"
                value={days}
                onChange={e => setDays(e.target.value)}
                className="border rounded-xl px-3 py-2 w-full mb-2"
            />

            <button
                onClick={generatePlan}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
                Generate Plan
            </button>

            <div className="mt-3 space-y-1">

                {plan.map((p, i) => (
                    <div key={i} className="text-sm">
                        {p}
                    </div>
                ))}

            </div>

        </div>

    );

}