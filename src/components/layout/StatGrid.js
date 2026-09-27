
/** Row of small stat tiles: [{ label, value }]. */
export default function StatGrid({ items = [], columns }) {
	const colCount = columns || items.length || 1;

	return (
		<div className="subsection-row" style={{ '--cols': colCount }}>
			{items.map((item, i) => (
				<div className="subsection" key={item.label ?? i}>
					<p className="subsection__label">{item.label}</p>
					<p className="subsection__value">{item.value}</p>
				</div>
			))}
		</div>
	);
}
