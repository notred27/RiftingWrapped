
export default function StatGrid({ items = [], columns }) {
	const colCount = columns || items.length || 1;

	return (
		<div className="subsection-row" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
			{items.map((item, i) => (
				<div className="subsection" style={{ textAlign: "center" }} key={item.label ?? i}>
					<p className="subtitle">{item.label}</p>
					<h1 className="emphasize-md">
						{item.value}
					</h1>
				</div>
			))}
		</div>
	);
}