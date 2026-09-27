import { Bar } from 'react-chartjs-2';

import { rankedBarData, rankedBarOptions, valueLabelPlugin } from './ChampGraph.js';

function PingGraph({ pings, labels }) {
  // Sorted descending so the most-used ping sits on top in the accent colour.
  const sorted = labels
    .map((label, i) => ({ label, value: pings[i] || 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{ position: 'relative', height: `${sorted.length * 28 + 8}px` }}>
      <Bar
        data={rankedBarData(sorted.map(d => d.label), sorted.map(d => d.value))}
        options={rankedBarOptions('pings')}
        plugins={[valueLabelPlugin]}
      />
    </div>
  );
}

export default PingGraph;
