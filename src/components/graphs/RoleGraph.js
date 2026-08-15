import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js';

import { ROLE_COLORS, ROLE_COLOR_UNPLAYED } from '../../resources/roles.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

// Center-of-donut text plugin: draws the dominant role's % and name in the hole
const centerLabelPlugin = {
  id: 'centerLabel',
  afterDraw(chart) {
    const { ctx, chartArea } = chart;
    const { top, bottom, left, right } = chartArea;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    const { percentLabel, roleLabel } = chart.config.options.centerText || {};
    if (!percentLabel) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '600 22px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(percentLabel, centerX, centerY - 8);

    ctx.font = '400 11px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText(roleLabel, centerX, centerY + 12);

    ctx.restore();
  },
};
ChartJS.register(centerLabelPlugin);

export default function RoleGraph({ roles }) {
  const labels = roles.map(role => role.label);
  const dataValues = roles.map(role => role.games);
  const winCounts = roles.map(role => role.wins);
  const backgroundColors = labels.map(label => ROLE_COLORS[label] || ROLE_COLOR_UNPLAYED);

  const totalGames = dataValues.reduce((sum, g) => sum + g, 0);
  const topRole = roles.reduce((max, r) => (r.games > (max?.games ?? -1) ? r : max), null);
  const topPercent = totalGames > 0 && topRole ? Math.round((topRole.games / totalGames) * 100) : 0;

  const data = {
    labels,
    datasets: [
      {
        label: 'Games',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    centerText: {
      percentLabel: `${topPercent}%`,
      roleLabel: topRole?.label?.toUpperCase() || '',
    },
    plugins: {
      legend: { display: false }, // custom legend rendered by PositionBreakdown instead
      tooltip: {
        backgroundColor: '#141a21',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        padding: 8,
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const games = dataValues[index];
            const wins = winCounts[index];
            const losses = games - wins;
            return ` ${games.toLocaleString()} ${games === 1 ? 'game' : 'games'} (${wins} wins | ${losses} losses)`;
          },
        },
      },
    },
  };

  // Square, but allowed to shrink below 140px - this also renders inside the
  // summary card's ~122px grid column, where a fixed 140px overflowed.
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '140px', aspectRatio: '1 / 1' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}