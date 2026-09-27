import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, BarElement, CategoryScale, LinearScale } from 'chart.js';

import { theme } from './chartTheme.js';
import { highlightColors } from '../../resources/theme.js';

ChartJS.register(Tooltip, BarElement, CategoryScale, LinearScale);

/** Draws each bar's value at its end (inside the bar if it would be clipped),
 *  so the chart needs no x axis. */
export const valueLabelPlugin = {
	id: 'valueLabel',
	afterDatasetsDraw(chart) {
		const { ctx, chartArea } = chart;
		const meta = chart.getDatasetMeta(0);
		const values = chart.data.datasets[0].data;

		ctx.save();
		ctx.font = `600 12px ${theme.fontBody}`;
		ctx.textBaseline = 'middle';
		ctx.fillStyle = theme.text;

		meta.data.forEach((bar, i) => {
			const label = Number(values[i]).toLocaleString();
			const labelWidth = ctx.measureText(label).width;
			if (bar.x + 6 + labelWidth <= chartArea.right) {
				ctx.textAlign = 'left';
				ctx.fillText(label, bar.x + 6, bar.y);
			} else {
				ctx.textAlign = 'right';
				ctx.fillText(label, bar.x - 6, bar.y);
			}
		});
		ctx.restore();
	},
};

/** Shared options for the ranked horizontal bar charts (champions, pings,
 *  time breakdown): top bar in accent, the rest muted, values labelled. */
export function rankedBarOptions(unit) {
	return {
		indexAxis: 'y',
		responsive: true,
		maintainAspectRatio: false,
		layout: { padding: { right: 36 } },
		scales: {
			x: { display: false, beginAtZero: true },
			y: {
				grid: { display: false },
				border: { display: false },
				ticks: { color: theme.text, font: { size: 12 } },
			},
		},
		plugins: {
			legend: { display: false },
			tooltip: {
				displayColors: false,
				callbacks: { label: (ctx) => `${Number(ctx.raw).toLocaleString()} ${unit}` },
			},
		},
	};
}

export function rankedBarData(labels, values) {
	return {
		labels,
		datasets: [{
			data: values,
			backgroundColor: highlightColors(values),
			borderRadius: 4,
			borderSkipped: 'start',
			barThickness: 16,
		}],
	};
}

function HorizontalBarChart({ champs, values }) {
	return (
		<div style={{ position: 'relative', height: `${champs.length * 28 + 8}px` }}>
			<Bar data={rankedBarData(champs, values)} options={rankedBarOptions('games')} plugins={[valueLabelPlugin]} />
		</div>
	);
}

export default HorizontalBarChart;
