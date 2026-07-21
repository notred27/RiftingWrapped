import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, Tooltip, CategoryScale, LinearScale } from 'chart.js';
ChartJS.register(BarElement, Tooltip, CategoryScale, LinearScale);

const MUTED = '#3a3a37';
const ACCENT = '#c52184';

export default function FFGraph({ youFFd, enemiesFFd }) {
    const data = {
        labels: ["You FF'd", "Enemies FF'd"],
        datasets: [
            {
                data: [youFFd, enemiesFFd],
                backgroundColor: [MUTED, ACCENT],
                borderRadius: 6,
                barThickness: 14,
            },
        ],
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: '#2c2c2a' },
                ticks: { color: '#898781', font: { size: 11 } },
            },
            y: {
                grid: { display: false },
                ticks: { color: '#FFFFFF', font: { size: 12 } },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#141a21',
                titleColor: '#FFFFFF',
                bodyColor: '#FFFFFF',
                padding: 8,
                callbacks: {
                    label: (context) => `${context.raw.toLocaleString()} games`,
                },
            },
        },
    };

    return (
        <div>


            {enemiesFFd > 0 && youFFd > 0 && enemiesFFd >= youFFd &&

                (<h2 style={{ textAlign: 'center', margin: '0 0 12px' }}>
                    enemies gave up on you <span className="emphasize">{(enemiesFFd / youFFd).toFixed(1)}x</span> more than you gave up on them
                </h2>)
            }

            {enemiesFFd > 0 && youFFd > 0 && enemiesFFd < youFFd &&

                (<h2 style={{ textAlign: 'center', margin: '0 0 12px' }}>
                    you were <span className="emphasize">{(youFFd /enemiesFFd).toFixed(1)}x</span> more likely to give up than your enemies
                </h2>)
            }

            <div style={{ position: 'relative', height: '90px' }}>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}