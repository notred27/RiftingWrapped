// HorizontalBarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Register the necessary components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function TotalTimeGraph({times, labels}) {
  // Example data for the chart
  const data = {
    labels: [""],
    datasets: [
      {
        label: labels[0],
        data: [times[0]],
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
        stack:"t1",
      },

      {
        label: labels[1],
        data: [times[1]],
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[2],
        data: [times[2]],
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[3],
        data: [times[3]],
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[4],
        data: [times[4]],
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[5],
        data: [times[5]],
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: labels[6],
        data: [times[6]],
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
        stack:"t1",

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

export default TotalTimeGraph;
