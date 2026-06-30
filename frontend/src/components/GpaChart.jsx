import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function GpaChart({ gpa }) {
    const data = {
        labels: ["Your GPA"],
        datasets: [
            {
                label: "GPA",
                data: [gpa ?? 0],
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                min: 0,
                max: 4,
            },
        },
    };

    return <Bar data={data} options={options} />;
}