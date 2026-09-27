import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js';

import { ROLE_COLORS, ROLE_COLOR_UNPLAYED, ROLE_ORDER } from '../../resources/roles.js';
import { theme } from './chartTheme.js';

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

    // Scale with the chart so the label fits the small donut on the summary card.
    const size = Math.min(right - left, bottom - top);
    ctx.font = `700 ${Math.max(12, Math.round(size / 5.5))}px ${theme.fontBody}`;
    ctx.fillStyle = theme.text;
    ctx.fillText(percentLabel, centerX, centerY - Math.max(6, size / 16));

    ctx.font = `600 ${Math.max(9, Math.round(size / 12))}px ${theme.fontBody}`;
    ctx.fillStyle = theme.textMuted;
    ctx.fillText(roleLabel, centerX, centerY + Math.max(10, size / 9));

    ctx.restore();
  },
};
ChartJS.register(centerLabelPlugin);

export default function RoleGraph({ roles, maxSize = 140 }) {
  // Draw slices in fixed lane order (not sorted by games) so neighbouring
  // colours are always the pairs the palette was validated for.
  const ordered = ROLE_ORDER.map(label => roles.find(r => r.label === label)).filter(Boolean);
  const labels = ordered.map(role => role.label);
  const dataValues = ordered.map(role => role.games);
  const winCounts = ordered.map(role => role.wins);
  const backgroundColors = labels.map(label => ROLE_COLORS[label] || ROLE_COLOR_UNPLAYED);

  const totalGames = dataValues.reduce((sum, g) => sum + g, 0);
  const topRole = ordered.reduce((max, r) => (r.games > (max?.games ?? -1) ? r : max), null);
  const topPercent = totalGames > 0 && topRole ? Math.round((topRole.games / totalGames) * 100) : 0;

  const data = {
    labels,
    datasets: [
      {
        label: 'Games',
        data: dataValues,
        backgroundColor: backgroundColors,
        // 2px background-coloured gap between slices
        borderColor: theme.bg,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    centerText: {
      percentLabel: totalGames > 0 ? `${topPercent}%` : '',
      roleLabel: topRole?.label?.toUpperCase() || '',
    },
    plugins: {
      legend: { display: false }, // custom legend rendered by PositionBreakdown instead
      tooltip: {
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
    <div style={{ position: 'relative', width: '100%', maxWidth: `${maxSize}px`, aspectRatio: '1 / 1', flexShrink: 0 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}