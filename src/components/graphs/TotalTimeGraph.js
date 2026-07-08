import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const COLORS = ['#292f56', '#4c3a6b', '#72437a', '#994b82', '#bf5582', '#e0637c', '#fa7970'];

function TotalTimeGraph({ times, labels }) {
  const data = {
    labels,
    datasets: [
      {
        data: times,
        backgroundColor: COLORS,
        borderColor: '#131013',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#71816D', boxWidth: 12, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw} hrs`,
        },
      },
    },
  };

  return (
    <div style={{ width: '360px', margin: '0 auto' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export default TotalTimeGraph;