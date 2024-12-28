// HorizontalBarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Register the necessary components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function CalanderGraph({dates}) {
  // Example data for the chart
  const data = {
    labels: [""],
    datasets: [
      {
        label: "January",
        data: [dates[0]],
        backgroundColor: '#292f56',
        borderColor: '#292f56',
        borderWidth: 1,
        stack:"t1",
      },

      {
        label: "February",
        data: [dates[1]],
        backgroundColor: '#3b3562',
        borderColor: '#3b3562',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: "March",
        data: [dates[2]],
        backgroundColor: '#4f3b6d',
        borderColor: '#4f3b6d',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: "April",
        data: [dates[3]],
        backgroundColor: '#644075',
        borderColor: '#644075',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: "May",
        data: [dates[4]],
        backgroundColor: '#79447c',
        borderColor: '#79447c',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: "June",
        data: [dates[5]],
        backgroundColor: '#8f4880',
        borderColor: '#8f4880',
        borderWidth: 1,
        stack:"t1",

      },

      {
        label: "July",
        data: [dates[6]],
        backgroundColor: '#a44d83',
        borderColor: '#a44d83',
        borderWidth: 1,
        stack:"t1",

      },
      {
        label: "August",
        data: [dates[7]],
        backgroundColor: '#b85283',
        borderColor: '#b85283',
        borderWidth: 1,
        stack:"t1",

      },
      {
        label: "September",
        data: [dates[8]],
        backgroundColor: '#cc5980',
        borderColor: '#cc5980',
        borderWidth: 1,
        stack:"t1",

      },
      {
        label: "October",
        data: [dates[9]],
        backgroundColor: '#dd627c',
        borderColor: '#dd627c',
        borderWidth: 1,
        stack:"t1",

      },
      {
        label: "November",
        data: [dates[10]],
        backgroundColor: '#ed6c77',
        borderColor: '#ed6c77',
        borderWidth: 1,
        stack:"t1",

      },
      {
        label: "December",
        data: [dates[11]],
        backgroundColor: '#fa7970',
        borderColor: '#fa7970',
        borderWidth: 1,
        stack:"t1",

      },
    ],
  };

  const options = {
    indexAxis: 'y', // Makes the bar chart horizontal
    responsive: true,
    aspectRatio: 7, // Control the aspect ratio
    barThickness:100,

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
          

      },

    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
              label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw.toLocaleString()} days`, 
            },
          },
    },
    // elements: {
    //     bar: {
    //       barThickness: 10, // Adjust the thickness of the bars (default is 'auto')
    //       categoryPercentage: 0.5, // Adjust the space between bars in the same category
    //       barPercentage: .50, // Controls the space between bars (increase to make bars thinner)
    //     }
    //   }
    
  };

  return (
    <div style={{width:"80vw", marginLeft:"50px"}}>

      <Bar data={data} options={options} />

    </div>
  );
};

export default CalanderGraph;
