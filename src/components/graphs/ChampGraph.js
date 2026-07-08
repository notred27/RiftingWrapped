import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const MUTED = '#3a3a37';
const ACCENT = '#d4537e';
const TEXT_COLOR = '#fffce8';
const GRID_COLOR = 'rgba(255, 252, 232, 0.12)';

const valueLabelPlugin = {
	id: 'valueLabel',
	afterDatasetsDraw(chart) {
		const { ctx } = chart;
		const meta = chart.getDatasetMeta(0);
		const values = chart.data.datasets[0].data;

		ctx.save();
		ctx.font = '600 12px sans-serif';
		ctx.fillStyle = TEXT_COLOR;
		ctx.textBaseline = 'middle';

		meta.data.forEach((bar, i) => {
			ctx.fillText(values[i], bar.x + 6, bar.y);
		});
		ctx.restore();
	},
};

function HorizontalBarChart({ champs, values }) {
	const maxIndex = values.indexOf(Math.max(...values));
	const maxValue = Math.max(...values);

	const data = {
		labels: champs,
		datasets: [
			{
				label: 'Games',
				data: values,
				backgroundColor: values.map((_, i) => (i === maxIndex ? ACCENT : MUTED)),
				borderWidth: 0,
				borderRadius: 4,
				barThickness: 16,
			},
		],
	};

	const options = {
		indexAxis: 'y',
		responsive: true,
		maintainAspectRatio: false,
		layout: {
			padding: {
				right: 24,
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				display: true,
				// whole-number ticks only, and don't overcrowd small ranges
				ticks: {
					color: TEXT_COLOR,
					font: { size: 11 },
					stepSize: Math.max(1, Math.ceil(maxValue / 6)),
					precision: 0,
				},
				grid: {
					color: GRID_COLOR,
				},
				border: {
					display: false,
				},
			},
			y: {
				grid: {
					display: false,
				},
				ticks: {
					color: TEXT_COLOR,
					font: {
						size: 12,
					},
					display: true,
				},
				border: {
					display: false,
				},
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: true,
				text: 'Most played champions',
				position: 'bottom',
				color: TEXT_COLOR,
				font: {
					size: 15,
					weight: 'bold',
				},
				padding: {
					top: 8,
					bottom: 0,
				},
			},
			tooltip: {
				backgroundColor: '#1a1a19',
				titleColor: TEXT_COLOR,
				bodyColor: TEXT_COLOR,
				padding: 8,
				callbacks: {
					label: (ctx) => `${ctx.raw} games`,
				},
			},
		},
	};

	return (
		<div style={{ position: 'relative', height: `${champs.length * 32 + 40}px`, zIndex: "2" }}>
			<Bar data={data} options={options} plugins={[valueLabelPlugin]} />
		</div>
	);
}

export default HorizontalBarChart;