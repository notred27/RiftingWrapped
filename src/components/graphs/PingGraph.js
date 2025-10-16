import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

function PingGraph({ pings, labels }) {
  const data = {
    labels: labels,
    datasets: [
      {
        data: pings,
        backgroundColor: ["#fa7970", "#ea6a78", "#d65e7e", "#bf5582", "#a64e83", "#8c4880", "#72437a", "#583d71", "#403665", "#292f56"],
        borderWidth: 2,
        borderColor : "#1a0a1fff"
      },
    ],
  };


  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => ` ${tooltipItem.raw.toLocaleString()} pings`
        },
      },
    },
  };

  return (
    <Doughnut data={data} options={options} />
  );
};

export default PingGraph;
