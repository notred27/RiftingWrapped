// HorizontalBarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { color } from 'chart.js/helpers';

// Register the necessary components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function HorizontalBarChart({champs, values}) {
  // Example data for the chart
  const data = {
    labels: champs,
    datasets: [
      {
        label: 'Games',
        data: values,
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Makes the bar chart horizontal
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        display: false,
      },

      y: {
        grid: {
            display: false, // Hide the grid lines
          },
          ticks: {
            fontColor:"#71816D",
            fontSize:20,

            display: true, // Keep the ticks visible
          },
          border: {
            display: false, // Hide the border (line)
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
    <Bar data={data} options={options} />
  );
};

export default HorizontalBarChart;
