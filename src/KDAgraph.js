// HorizontalBarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Register the necessary components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);



function KDAgraph({kills, deaths}) {

    const largest = Math.max(Math.max(...kills), Math.max(...deaths)) + 1
    const labels =  new Array(largest).fill(0).map((_, index) => index)

    const killHist = new Array(largest).fill(0)

    for(let i = 0; i < kills.length; i++) {
        killHist[kills[i]] += 1
    }

    const deathHist = new Array(largest).fill(0)

    for(let i = 0; i < deaths.length; i++) {
        deathHist[deaths[i]] += 1
    }

  // Example data for the chart
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Kills',
        data: killHist,
        backgroundColor: '#496DDB',
        borderColor: '#496DDB',
        borderWidth: 1,
      },
      {
        label: 'Deaths',
        data: deathHist,
        backgroundColor: '#DD403A',
        borderColor: '#DD403A',
        borderWidth: 1,
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
            text: 'Frequency of Kills / Deaths',  // Set the label for the x-axis
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

export default KDAgraph;
