import React from 'react';
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  PointElement,
  LinearScale,
  Title,
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';

ChartJS.register(PointElement, LinearScale, Title, Tooltip, Legend);

const ObjectiveBubbleChart = ({ objectives }) => {
  // Convert objective frequencies to bubble data


  const maxObjective = Math.max(
    objectives.barons || 0,
    objectives.dragons || 0,
    objectives.riftHeralds || 0,
    objectives.voidGrubs || 0,
    objectives.atakhan || 0,
    objectives.towers || 0,
    objectives.inhibitors || 0
  );

  const scale = 200 / maxObjective;

  const data = {
    datasets: [
      {
        label: 'Objectives Taken',
        data: [
          { x: 1, y: 1, r: objectives.barons * scale || 1, label: 'Baron' },
          { x: 1, y: 1, r: objectives.dragons * scale || 1, label: 'Dragon' },
          { x: 1, y: 1, r: objectives.riftHeralds * scale || 1, label: 'Herald' },
          { x: 1, y: 1, r: objectives.voidGrubs * scale || 1, label: 'Void Grubs' },
          { x: 1, y: 1, r: objectives.atakhan * scale || 1, label: 'Atakhan' },
          { x: 1, y: 1, r: objectives.towers * scale || 1, label: 'Towers' },
          { x: 1, y: 1, r: objectives.inhibitors * scale || 1, label: 'Inhibitors' },

        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: '#4bc0c0',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: { display: false },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => {
            const obj = context.raw;
            return `${obj.label}: ${Math.round(obj.r / scale)}`;
          }
        }
      }
    }
  };

  return (
    <div style={{ width: 400, height: 400, position: "relative" }}>
      <Bubble data={data} options={options} />

      <div style={{
        position: 'absolute',
        top: 10,
        right: 0,
        background: '#0c1b36e6',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        <div>{objectives.voidGrubs} Void Grubs</div>
        <div>{objectives.riftHeralds} Heralds</div>
        <div>{objectives.barons} Barons</div>

        <div>{objectives.dragons} Dragons</div>

        <div>{objectives.atakhan} Atakhans</div>

        <div>{objectives.towers} Towers</div>
        <div>{objectives.inhibitors} Inhibitors</div>
      </div>
    </div>
  );

};

export default ObjectiveBubbleChart;
