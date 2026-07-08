import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const ACCENT = '#D4537E'; // top ping only
const MUTED = '#3a3a37';  // every other ping

function PingGraph({ pings, labels }) {
  // Sort descending so the most-used ping is always first/top and gets the accent color
  const sorted = labels
    .map((label, i) => ({ label, value: pings[i] }))
    .sort((a, b) => b.value - a.value);

  const data = {
    labels: sorted.map(d => d.label),
    datasets: [
      {
        label: 'Pings',
        data: sorted.map(d => d.value),
        backgroundColor: sorted.map((_, i) => (i === 0 ? ACCENT : MUTED)),
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: '#2c2c2a' },
        ticks: { color: '#898781', font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#fffce8', font: { size: 12 } },
      },
    },
    plugins: {
      legend: { display: false }, // labels sit on the axis instead - no color-matching needed
      tooltip: {
        backgroundColor: '#1a1a19',
        titleColor: '#fffce8',
        bodyColor: '#fffce8',
        padding: 8,
        callbacks: {
          label: (tooltipItem) => ` ${tooltipItem.raw.toLocaleString()} pings`,
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', height: `${sorted.length * 32 + 40}px` }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default PingGraph;