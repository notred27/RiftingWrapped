import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const TEXT_COLOR = '#FFFCE8';
const GRID_COLOR = 'rgba(255, 252, 232, 0.08)';

function KDAgraph({ kills, deaths }) {
  const largest = Math.max(kills.length, deaths.length);
  const labels = new Array(largest).fill(0).map((_, index) => index);

  const data = {
    labels,
    datasets: [
      {
        label: 'Kills',
        data: kills,
        backgroundColor: '#fa7970',
        borderRadius: 4,
        maxBarThickness: 28,
      },
      {
        label: 'Deaths',
        data: deaths,
        backgroundColor: '#5b63a6',
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          color: GRID_COLOR,
        },
        ticks: {
          color: TEXT_COLOR,
          font: { size: 12 },
        },
        title: {
          display: true,
          text: 'Number of Kills / Deaths',
          font: { size: 14, weight: '600' },
          color: TEXT_COLOR,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: GRID_COLOR,
        },
        border: {
          display: false,
        },
        ticks: {
          color: TEXT_COLOR,
          font: { size: 12 },
        },
        title: {
          display: true,
          text: 'Number of Games',
          font: { size: 14, weight: '600' },
          color: TEXT_COLOR,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: TEXT_COLOR,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          padding: 16,
          font: { size: 13 },
        },
      },
      tooltip: {
        backgroundColor: '#1a1d33',
        titleColor: TEXT_COLOR,
        bodyColor: TEXT_COLOR,
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.dataset.label}: ${tooltipItem.raw.toLocaleString()} games`,
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', height: '320px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default KDAgraph;