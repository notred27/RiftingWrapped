import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';


ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function TotalTimeGraph({times, labels}) {
  const data = {
    labels: [""],
    datasets: [
      {
        label: labels[0],
        data: [times[0]],
        backgroundColor: '#292f56',
        borderColor: '#292f56',
        borderWidth: 1,
        stack:"t1",
      },

      {
        label: labels[1],
        data: [times[1]],
        backgroundColor: '#4c3a6b',
        borderColor: '#4c3a6b',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[2],
        data: [times[2]],
        backgroundColor: '#72437a',
        borderColor: '#72437a',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[3],
        data: [times[3]],
        backgroundColor: '#994b82',
        borderColor: '#994b82',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[4],
        data: [times[4]],
        backgroundColor: '#bf5582',
        borderColor: '#bf5582',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[5],
        data: [times[5]],
        backgroundColor: '#e0637c',
        borderColor: '#e0637c',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[6],
        data: [times[6]],
        backgroundColor: '#fa7970',
        borderColor: '#fa7970',
        borderWidth: 1,
        stack:"t1",

      },
    ],
  };

  const options = {
    indexAxis: 'y', 
    responsive: true,
    aspectRatio: 7, 
    barThickness:100,

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
            fontColor:"#71816D",
            fontSize:20,

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
        }
    }
    
  };

  return (
    <div style={{width:"80vw"}}>

    <Bar data={data} options={options} />

    </div>
  );
};

export default TotalTimeGraph;
