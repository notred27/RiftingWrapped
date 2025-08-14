// StackedBarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(BarElement, Title, Tooltip, Legend, CategoryScale, LinearScale);

function StackedDamageChart({ damageDealt = [0, 0, 0], damageTaken = [0, 0, 0], chartTitle = 'Damage Breakdown' }) {
  const labels = ['Damage Dealt', 'Damage Taken'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Physical',
        data: [damageDealt[0], damageTaken[0]],
        backgroundColor: '#fa7970',
        stack: 'stack1',
        barThickness: 15,
      },
      {
        label: 'True',
        data: [damageDealt[1], damageTaken[1]],
        backgroundColor: '#FFFCE8',
        stack: 'stack1',
        barThickness: 15,
      },
      {
        label: 'Magic',
        data: [damageDealt[2], damageTaken[2]],
        backgroundColor: '#292f56',
        stack: 'stack1',
        barThickness: 15,
      },
    ],
  };

  const options = {
  indexAxis: 'y',  // horizontal bars
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#fffce8',
        font: {
          size: 14,
        },
      },
    },
    title: {
      display: true,
      position: "bottom",
      text: chartTitle,
      color: '#fffce8',
      font: {
        size: 15,
        weight: 'bold',
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = context.parsed.x || 0;  // x axis for horizontal
          const category = context.label || '';
          return `${category} - ${label}: ${value.toLocaleString()} damage`;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      ticks: {
        color: '#fffce8',
        callback: function(value) {
          if (value >= 1000000) {
            return (value / 1000000) + 'M';
          } else if (value >= 1000) {
            return (value / 1000) + 'K';
          }
          return value;
        }
      },
      grid: {
        color: '#333',
      },
    },
    y: {
      stacked: true,
      ticks: {
        color: '#fffce8',
        font: {
          size: 14,
        },
      },
      grid: {
       display: false,

      },
    },
  },
};


  return <Bar data={data} options={options} />;
}

export default StackedDamageChart;
