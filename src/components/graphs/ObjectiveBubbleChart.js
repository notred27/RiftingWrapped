import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { theme } from '../../resources/theme.js';

const OBJECTIVE_LABELS = {
  voidGrubs: 'Void Grubs',
  dragons: 'Dragons',
  towers: 'Towers',
  inhibitors: 'Inhibitors',
  atakhan: 'Atakhans',
  riftHeralds: 'Heralds',
  barons: 'Barons',
};

const WIDTH = 400;
const HEIGHT = 320;

export default function ObjectiveBubbleChart({ objectives }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const entries = Object.entries(OBJECTIVE_LABELS)
      .map(([key, name]) => ({ name, value: objectives[key] || 0 }))
      .filter(d => d.value > 0);

    if (entries.length === 0) return;

    // Same "highlight the top one" treatment as the bar charts. (This used to
    // pick colours from the OS light/dark setting even though the site is
    // always dark, so light-mode visitors got a different, washed-out chart.)
    const topValue = d3.max(entries, d => d.value);
    const fill = d => (d.data.value === topValue ? theme.accent : theme.surface2);
    const stroke = d => (d.data.value === topValue ? theme.accent : 'rgba(255, 255, 255, 0.16)');

    const root = d3
      .pack()
      .size([WIDTH - 8, HEIGHT - 8])
      .padding(6)(d3.hierarchy({ children: entries }).sum(d => d.value));

    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('role', 'img')
      .attr('aria-label', 'Bubble chart of objectives secured, sized by count');

    const node = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x + 4},${d.y + 4})`);

    node
      .append('title') // native browser tooltip on hover
      .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

    node
      .append('circle')
      .attr('r', d => d.r)
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', 1);

    node
      .filter(d => d.r >= 24)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('fill', d => (d.data.value === topValue ? 'rgba(255, 255, 255, 0.85)' : theme.textMuted))
      .style('font-family', theme.fontBody)
      .style('font-size', d => `${Math.max(10, Math.min(14, d.r / 3.2))}px`)
      .style('font-weight', 500)
      .text(d => d.data.name);

    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.r >= 24 ? '1em' : '0.35em'))
      .attr('fill', theme.text)
      .style('font-family', theme.fontBody)
      .style('font-size', d => `${Math.max(10, Math.min(15, d.r / 2.8))}px`)
      .style('font-weight', 600)
      .text(d => d.data.value.toLocaleString());
  }, [objectives]);

  // The SVG scales via its viewBox, so the container only needs to hold the
  // chart's aspect ratio. A fixed HEIGHT here made this 320px tall even when
  // rendered into a ~130px-wide column on the summary card, which set the row
  // height for the whole grid.
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: WIDTH,
        aspectRatio: `${WIDTH} / ${HEIGHT}`,
        maxHeight: HEIGHT,
        margin: '0 auto',
        position: 'relative',
      }}
    />
  );
}