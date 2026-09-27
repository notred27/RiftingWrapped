import { Bar } from 'react-chartjs-2';

import { rankedBarData, rankedBarOptions, valueLabelPlugin } from './ChampGraph.js';

export default function FFGraph({ youFFd, enemiesFFd }) {
    return (
        <div style={{ position: 'relative', height: '72px' }}>
            <Bar
                data={rankedBarData(["You surrendered", "Enemies surrendered"], [youFFd, enemiesFFd])}
                options={rankedBarOptions('games')}
                plugins={[valueLabelPlugin]}
            />
        </div>
    );
}
