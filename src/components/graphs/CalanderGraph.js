const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Days played per month. Same "highlight the top one" treatment as the other
 * single-series bar charts: the busiest month in accent, the rest muted, with
 * values labelled directly so no axis is needed.
 */
function CalanderGraph({ dates = [] }) {
  const max = Math.max(...dates, 1);
  const topIndex = dates.indexOf(Math.max(...dates));

  return (
    <div className="month-chart" role="img" aria-label={`Days played per month: ${MONTHS.map((m, i) => `${m} ${dates[i] || 0}`).join(', ')}`}>
      {MONTHS.map((month, i) => {
        const value = dates[i] || 0;
        const isTop = i === topIndex && value > 0;
        return (
          <div className="month-chart__col" key={month} title={`${month}: ${value} day${value === 1 ? "" : "s"}`}>
            <div className="month-chart__track">
              <span className={`month-chart__value${isTop ? " is-top" : ""}`}>{value > 0 ? value : ""}</span>
              {/* 85% leaves headroom for the value label above the tallest bar */}
              <div
                className={`month-chart__bar${isTop ? " is-top" : ""}`}
                style={{ height: `${(value / max) * 85}%` }}
              />
            </div>
            <span className="month-chart__label">{month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default CalanderGraph;
