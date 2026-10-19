import { useEffect, useRef, useState } from 'react';
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

// For bubbles too small to fit the full name (the summary card on phones).
const SHORT_LABELS = {
  'Void Grubs': 'Grubs', Dragons: 'Drakes', Towers: 'Towers', Inhibitors: 'Inhibs',
  Atakhans: 'Atakhan', Heralds: 'Herald', Barons: 'Barons',
};
// Bubbles at least this big get a name; full names from NAME_FULL_R up.
const NAME_MIN_R = 16;
const NAME_FULL_R = 24;

const WIDTH = 400;
const HEIGHT = 320;

/**
 * `fill`: grow to fill the parent's free space (the summary card's grid cell)
 * instead of holding a fixed aspect ratio, and lay the bubbles out at the
 * box's real pixel size. Scaling a fixed 400x320 layout down into a small
 * cell left it floating in empty space with ~4px labels.
 */
export default function ObjectiveBubbleChart({ objectives, fill = false }) {
  const containerRef = useRef(null);
  const [box, setBox] = useState(null);   // fill mode: the container's size

  useEffect(() => {
    if (!fill || !containerRef.current) return;
    const el = containerRef.current;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setBox(prev => (prev && Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1)
          ? prev
          : { w: Math.round(width), h: Math.round(height) });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fill]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (fill && !box) return;
    containerRef.current.innerHTML = '';
    const width = fill ? box.w : WIDTH;
    const height = fill ? box.h : HEIGHT;

    const entries = Object.entries(OBJECTIVE_LABELS)
      .map(([key, name]) => ({ name, value: objectives[key] || 0 }))
      .filter(d => d.value > 0);

    if (entries.length === 0) return;

    // Same "highlight the top one" treatment as the bar charts. (This used to
    // pick colours from the OS light/dark setting even though the site is
    // always dark, so light-mode visitors got a different, washed-out chart.)
    const topValue = d3.max(entries, d => d.value);
    const bubbleFill = d => (d.data.value === topValue ? theme.accent : theme.surface2);
    const stroke = d => (d.data.value === topValue ? theme.accent : 'rgba(255, 255, 255, 0.16)');

    const root = d3
      .pack()
      .size([width - 8, height - 8])
      .padding(6)(d3.hierarchy({ children: entries }).sum(d => d.value));

    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('role', 'img')
      .attr('aria-label', 'Bubble chart of objectives secured, sized by count');

    // Out of flow, so the drawing can never change the box it was sized to.
    if (fill) svg.style('position', 'absolute').style('inset', 0);

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
      .attr('fill', bubbleFill)
      .attr('stroke', stroke)
      .attr('stroke-width', 1);

    node
      .filter(d => d.r >= NAME_MIN_R)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('fill', d => (d.data.value === topValue ? 'rgba(255, 255, 255, 0.85)' : theme.textMuted))
      .style('font-family', theme.fontBody)
      .style('font-size', d => `${Math.max(d.r >= NAME_FULL_R ? 10 : 9, Math.min(14, d.r / 3.2))}px`)
      .style('font-weight', 500)
      .text(d => (d.r >= NAME_FULL_R ? d.data.name : SHORT_LABELS[d.data.name] || d.data.name));

    node
      .filter(d => d.r >= 9)   // too small to hold a number; the tooltip still has it
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.r >= NAME_MIN_R ? '1em' : '0.35em'))
      .attr('fill', theme.text)
      .style('font-family', theme.fontBody)
      .style('font-size', d => `${Math.max(d.r >= NAME_FULL_R ? 10 : 9, Math.min(15, d.r / 2.8))}px`)
      .style('font-weight', 600)
      .text(d => d.data.value.toLocaleString());
  }, [objectives, fill, box]);

  // The SVG scales via its viewBox, so the container only needs to hold the
  // chart's aspect ratio. A fixed HEIGHT here made this 320px tall even when
  // rendered into a ~130px-wide column on the summary card, which set the row
  // height for the whole grid.
  return (
    <div
      ref={containerRef}
      style={fill
        ? { flex: '1 1 0', minHeight: 0, width: '100%', position: 'relative' }
        : {
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