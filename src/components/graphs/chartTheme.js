import { Chart as ChartJS, Tooltip, Legend } from 'chart.js';

import { theme } from '../../resources/theme.js';

/*
 * Chart.js defaults shared by every canvas chart, so fonts, axis ink, grid
 * lines and tooltips match without each chart restating them. Imported for its
 * side effect by each chart module (keeps chart.js out of the main bundle).
 */
// Registered here so their default option objects exist before we set them.
ChartJS.register(Tooltip, Legend);

ChartJS.defaults.font.family = theme.fontBody;
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = theme.axis;
ChartJS.defaults.borderColor = theme.grid;
ChartJS.defaults.animation.duration = 500;

const tooltip = ChartJS.defaults.plugins.tooltip;
tooltip.backgroundColor = theme.surface2;
tooltip.titleColor = theme.text;
tooltip.bodyColor = theme.text;
tooltip.borderColor = 'rgba(255, 255, 255, 0.12)';
tooltip.borderWidth = 1;
tooltip.padding = 10;
tooltip.cornerRadius = 8;
tooltip.displayColors = true;
tooltip.boxPadding = 4;

export { theme };
