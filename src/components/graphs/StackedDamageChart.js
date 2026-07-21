import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
ChartJS.register(BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale);

// Same three colors, used consistently anywhere physical/true/magic appears
const COLORS = {
  physical: '#D85A30',
  true: '#B4B2A9',
  magic: '#7F77DD',
};

function StackedDamageChart({ damageDealt = [0, 0, 0], damageTaken = [0, 0, 0] }) {
  const labels = ['Damage dealt', 'Damage taken'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Physical',
        data: [damageDealt[0], damageTaken[0]],
        backgroundColor: COLORS.physical,
        stack: 'stack1',
        barThickness: 22,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'True',
        data: [damageDealt[1], damageTaken[1]],
        backgroundColor: COLORS.true,
        stack: 'stack1',
        barThickness: 22,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Magic',
        data: [damageDealt[2], damageTaken[2]],
        backgroundColor: COLORS.magic,
        stack: 'stack1',
        barThickness: 22,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // Legend is drawn as custom HTML below the chart instead - see component return
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#141a21',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        padding: 8,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.x || 0;
            return `${label}: ${value.toLocaleString()} damage`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: '#898781',
          font: { size: 11 },
          callback: function (value) {
            if (value >= 1000000) return value / 1000000 + 'M';
            if (value >= 1000) return value / 1000 + 'K';
            return value;
          },
        },
        grid: { color: '#2c2c2a' },
      },
      y: {
        stacked: true,
        ticks: { color: '#FFFFFF', font: { size: 13 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div>
      <div style={{ position: 'relative', height: '160px' }}>
        <Bar data={data} options={options} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted-color)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS.physical, display: 'inline-block' }} />
          physical
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted-color)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS.true, display: 'inline-block' }} />
          true
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--fs-2xs)', color: 'var(--text-muted-color)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS.magic, display: 'inline-block' }} />
          magic
        </span>
      </div>
    </div>
  );
}

export default StackedDamageChart;