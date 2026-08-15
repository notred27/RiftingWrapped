
export default function StatGrid({ items = [], columns }) {
	const colCount = columns || items.length || 1;

	return (
		<div className="subsection-row" style={{ '--cols': colCount }}>
			{items.map((item, i) => (
				<div className="subsection" key={item.label ?? i}>
					<p className="subtitle">{item.label}</p>
					<h1 className="emphasize-md">
						{item.value}
					</h1>
				</div>
			))}
		</div>
	);
}