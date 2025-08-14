import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

function RoleGraph({ roles }) {
  const labels = roles.map(role => role.label);
  const dataValues = roles.map(role => role.games);
  const winCounts = roles.map(role => role.wins);

  // Role-specific colors
  const roleColors = {
    Top: '#D5896F',
    Mid: '#DAB785',
    Jungle: '#70A288',
    ADC: '#04395E',
    Support: '#031D44',
  };

  const backgroundColors = labels.map(label => roleColors[label] || '#999');

  const data = {
    labels,
    datasets: [
      {
        label: 'Games',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'left',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const games = dataValues[index];
            const wins = winCounts[index];
            const losses = games - wins;
            return ` ${games.toLocaleString()} ${games === 1 ? 'game' : 'games'} (${wins} wins | ${losses} losses)`;
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

export default RoleGraph;
