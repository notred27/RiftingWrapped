// HorizontalBarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

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
        backgroundColor: ["#fa7970", "#ea6a78", "#d65e7e", "#bf5582", "#a64e83", "#8c4880", "#72437a", "#583d71", "#403665", "#292f56"],
        borderWidth: 0,
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
            color:"#edece5",
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
