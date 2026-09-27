import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

import { theme } from './chartTheme.js';

ChartJS.register(Tooltip, Legend, BarElement, CategoryScale, LinearScale);

/** How many games ended with N kills vs N deaths. Kills/deaths keep the same
 *  colours they have on the heatmaps and everywhere else. */
function KDAgraph({ kills = [], deaths = [] }) {
  const largest = Math.max(kills.length, deaths.length);
  const labels = Array.from({ length: largest }, (_, i) => i);

  const bar = { borderRadius: 3, maxBarThickness: 18, categoryPercentage: 0.8, barPercentage: 0.9 };

  const data = {
    labels,
    datasets: [
      { label: 'Kills', data: kills, backgroundColor: theme.kills, ...bar },
      { label: 'Deaths', data: deaths, backgroundColor: theme.deaths, ...bar },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { display: false },
        border: { color: theme.grid },
        ticks: { autoSkip: true, maxRotation: 0 },
        title: { display: true, text: 'Kills / deaths in a game', color: theme.axis },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        ticks: { precision: 0, maxTicksLimit: 5 },
        title: { display: true, text: 'Games', color: theme.axis },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { color: theme.text, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10, boxHeight: 10, padding: 12 },
      },
      tooltip: {
        callbacks: {
          title: (items) => `${items[0].label} kills / deaths`,
          label: (item) => ` ${item.dataset.label}: ${item.raw.toLocaleString()} games`,
        },
      },
    },
  };

  return (
    <div className="kda-chart" style={{ position: 'relative', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default KDAgraph;
