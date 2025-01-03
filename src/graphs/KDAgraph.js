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
        backgroundColor: '#fa7970',
        borderColor: '#fa7970',
        borderWidth: 1,
      },
      {
        label: 'Deaths',
        data: deathHist,
        backgroundColor: '#292f56',
        borderColor: '#292f56',
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
            color: '#FFFCE8',  // Axis label color
          },
      },

      y: {
        grid: {
            display: false, // Hide the grid lines
          },
          ticks: {
            fontColor:"#FFFCE8",
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
            color: '#FFFCE8',  // Axis label color
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
