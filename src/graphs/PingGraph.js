// PieChart.js
import React from 'react';
import { Doughnut  } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

function PingGraph({pings, labels}){
  // Example data for the pie chart
  const data = {
    labels: labels, 
    datasets: [
      {
        data: pings, 
        backgroundColor: ["#C1292E","#96C9DC","#449DD1","#138A36","#C6ECAE","#D5C7BC","#FFC100","#F06C9B"],
        borderWidth: 0,
      },
    ],
  };


  const options = {
    responsive: true, // Make the chart responsive
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
