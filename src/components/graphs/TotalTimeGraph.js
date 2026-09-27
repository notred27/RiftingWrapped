import { Bar } from 'react-chartjs-2';

import { rankedBarData, rankedBarOptions, valueLabelPlugin } from './ChampGraph.js';

/** Where some of the player's hours went, largest first. (Was a 7-slice
 *  doughnut whose slices were too similar in colour and size to read.) */
function TotalTimeGraph({ times, labels }) {
  const sorted = labels
    .map((label, i) => ({ label, value: times[i] || 0 }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{ position: 'relative', height: `${sorted.length * 28 + 8}px` }}>
      <Bar
        data={rankedBarData(sorted.map(d => d.label), sorted.map(d => d.value))}
        options={rankedBarOptions('hrs')}
        plugins={[valueLabelPlugin]}
      />
    </div>
  );
}

export default TotalTimeGraph;
