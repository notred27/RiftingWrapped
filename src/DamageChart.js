// PieChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

function DamageChart({damage}){
  // Example data for the pie chart
  const data = {
    labels: ['Physical', 'True', 'Magic'], 
    datasets: [
      {
        label: 'Votes',
        data: [damage[0], damage[1], damage[2] ], 
        backgroundColor: ['#DD403A', '#FFFCE8', '#496DDB'],
        borderColor: ['#dd3511', '#dddddd', '#1193dd'], 
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
          label: (tooltipItem) => ` ${tooltipItem.raw.toLocaleString()} damage`, // Custom tooltip display (optional)
        },
      },
    },
  };

  return (

      <Pie data={data} options={options} />

  );
};

export default DamageChart;
