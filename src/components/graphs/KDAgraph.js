import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';


ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);


function KDAgraph({kills, deaths}) {
    const largest = Math.max(kills.length, deaths.length) 
    const labels =  new Array(largest).fill(0).map((_, index) => index)

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Kills',
        data: kills,
        backgroundColor: '#fa7970',
        borderColor: '#fa7970',
        borderWidth: 1,
      },
      {
        label: 'Deaths',
        data: deaths,
        backgroundColor: '#292f56',
        borderColor: '#292f56',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'x',
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        display: true,

        title: {
            display: true,
            text: 'Frequency of Kills / Deaths',
            font: {
              size: 16,
            },
            color: '#FFFCE8',
          },
      },

      y: {
        grid: {
            display: false,
          },
          ticks: {
            fontColor:"#FFFCE8",
            fontSize:20,

            display: true,
          },
          border: {
            display: false,
          },

          title: {
            display: true,
            text: 'Number of Games',
            font: {
              size: 16,
            },
            color: '#FFFCE8',
          },

      }
    },
    plugins: {
        legend: {
            position: 'top', 
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => `${tooltipItem.raw.toLocaleString()} games`, 
            },
          },
    }
    
  };

  return (
    <Bar data={data} options={options} />
  );
};

export default KDAgraph;
