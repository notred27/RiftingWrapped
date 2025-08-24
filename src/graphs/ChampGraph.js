import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';


ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function HorizontalBarChart({ champs, values }) {
  const data = {
    labels: champs,
    datasets: [
      {
        label: 'Games',
        data: values,
        backgroundColor: ["#fa7970", "#ea6a78", "#d65e7e", "#bf5582", "#a64e83", "#8c4880", "#72437a", "#583d71", "#403665", "#292f56"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        display: false,
      },

      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#fffce8",
          fontSize: 20,

          display: true,
        },
        border: {
          display: false,
        },

      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Most Played Champions',
        position: 'bottom',
        color: '#fffce8',
        font: {
          size: 15,
          weight: 'bold',
        },
        padding: {
          top: 2,
          bottom: 0
        }
      },
    }

  };

  return (
    <Bar data={data} options={options} />
  );
};

export default HorizontalBarChart;
