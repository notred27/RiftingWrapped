import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  CategoryScale,
  LinearScale,
} from 'chart.js';

import { theme } from './chartTheme.js';

ChartJS.register(BarElement, Tooltip, CategoryScale, LinearScale);

const abbreviate = (value) => {
  if (value >= 1000000) return `${Math.round(value / 100000) / 10}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return value;
};

function StackedDamageChart({ damageDealt = [0, 0, 0], damageTaken = [0, 0, 0] }) {
  // One colour per damage type, used everywhere physical/true/magic appears.
  const series = [
    { label: 'Physical', color: theme.physical, values: [damageDealt[0], damageTaken[0]] },
    { label: 'True', color: theme.trueDmg, values: [damageDealt[1], damageTaken[1]] },
    { label: 'Magic', color: theme.magic, values: [damageDealt[2], damageTaken[2]] },
  ];

  const data = {
    labels: ['Dealt', 'Taken'],
    datasets: series.map((s) => ({
      label: s.label,
      data: s.values,
      backgroundColor: s.color,
      // 2px surface-coloured gap between stacked segments
      borderColor: theme.bg,
      borderWidth: { right: 2 },
      borderSkipped: false,
      borderRadius: 4,
      stack: 'damage',
      barThickness: 28,
    })),
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${(context.parsed.x || 0).toLocaleString()} damage`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { callback: abbreviate, maxTicksLimit: 6 },
        border: { display: false },
      },
      y: {
        stacked: true,
        ticks: { color: theme.text, font: { size: 13, weight: '600' } },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  return (
    <div>
      <div style={{ position: 'relative', height: '150px' }}>
        <Bar data={data} options={options} />
      </div>
      <ul className="chart-legend" aria-label="Damage types">
        {series.map((s) => (
          <li key={s.label}><span className="chart-legend__swatch" style={{ background: s.color }} />{s.label}</li>
        ))}
      </ul>
    </div>
  );
}

export default StackedDamageChart;
