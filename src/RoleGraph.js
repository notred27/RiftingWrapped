// PieChart.js
import React from 'react';
import { Doughnut  } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

function RoleGraph({positions, wins}){
  // Example data for the pie chart
  const data = {
    labels: ['Top', 'Mid', 'Jungle', 'ADC', 'Support'], 
    datasets: [
      {
        label: 'Games',
        data: positions, 
        backgroundColor: ['#D5896F', '#DAB785', '#70A288','#04395E', '#031D44'],
        borderColor: ['#D5896F', '#DAB785', '#70A288','#04395E', '#031D44'], 
        borderWidth: 2,
      },
    ],
  };


  const options = {
    responsive: true, // Make the chart responsive
    plugins: {
      legend: {
        position: 'left', 
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => ` ${tooltipItem.raw.toLocaleString()} ${tooltipItem.raw === 1 ? "game" : "games"} (${wins[positions.indexOf(tooltipItem.raw)] } wins | ${tooltipItem.raw - wins[positions.indexOf(tooltipItem.raw)] } losses)` , // Custom tooltip display (optional)
        },
      },
    },
  };

  return (

      <Doughnut data={data} options={options} />

  );
};

export default RoleGraph;
