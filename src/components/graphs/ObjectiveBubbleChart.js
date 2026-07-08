import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

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

    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const colorScale = d3
      .scaleLinear()
      .domain([d3.min(entries, d => d.value), d3.max(entries, d => d.value)])
      .range(isDark ? ['#0F6E56', '#5DCAA5'] : ['#9FE1CB', '#0F6E56']);

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
      .attr('fill', d => colorScale(d.data.value));

    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('fill', '#04342C')
      .style('font-size', d => `${Math.max(10, Math.min(14, d.r / 3.2))}px`)
      .style('font-weight', 500)
      .text(d => d.data.name);

    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('fill', '#04342C')
      .style('font-size', d => `${Math.max(10, Math.min(15, d.r / 2.8))}px`)
      .style('font-weight', 600)
      .text(d => d.data.value.toLocaleString());
  }, [objectives]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', maxWidth: WIDTH, height: HEIGHT, margin: '0 auto', position: 'relative' }}
    />
  );
}