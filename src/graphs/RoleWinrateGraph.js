// HorizontalBarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import 'chartjs-plugin-datalabels'


// Register the necessary components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);



function RoleWinrateGraph({wins, allGames}) {

  // Example data for the chart
  const data = {
    labels: ['Top', 'Mid', 'Jungle', 'ADC', 'Support'], 
    datasets: [
      {
        label: 'Wins',
        data: wins,
        backgroundColor: '#496DDB',
        borderColor: '#496DDB',
        borderWidth: 1,
        stack:"g1",
      },
      {
        label: 'Losses',
        data: [allGames[0] - wins[0],allGames[1] - wins[1],allGames[2] - wins[2],allGames[3] - wins[3],allGames[4] - wins[4]],
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
        stack:"g1",

      },
    ],
  };

  const options = {
    indexAxis: 'x', // Makes the bar chart horizontal
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        display: true,

        title: {
            display: true,
            text: 'Wins/Losses Per Role',  // Set the label for the x-axis
            font: {
              size: 16,
            },
            color: '#71816D',  // Axis label color
          },
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

          title: {
            display: true,
            text: 'Number of Games',  // Set the label for the x-axis
            font: {
              size: 16,
            },
            color: '#71816D',  // Axis label color
          },

      }
    },

    plugins: {
        legend: {
            position: 'top', 
          },

    }
    
  };

  return (
    <Bar data={data} options={options} />
  );
};

export default RoleWinrateGraph;
