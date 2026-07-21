import { useEffect, useState } from "react";

function CalanderGraph({ dates }) {
  const [bars, setBars] = useState([]);

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const START_COLOR = "#292f56";
  const END_COLOR = "#fa7970";

  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function interpolateColor(hexA, hexB, t) {
    const a = [1, 3, 5].map(i => parseInt(hexA.slice(i, i + 2), 16));
    const b = [1, 3, 5].map(i => parseInt(hexB.slice(i, i + 2), 16));

    const rgb = a.map((v, i) => lerp(v, b[i], t));
    return `rgb(${rgb.join(",")})`;
  }

  useEffect(() => {
    if (!dates) return;

    const newBars = dates.map((value, i) => ({
      month: MONTHS[i],
      value,
      color: interpolateColor(
        START_COLOR,
        END_COLOR,
        i / (MONTHS.length - 1)
      ),
    }));

    setBars(newBars);
  }, [dates]);

  return (
    <div
  style={{
    display: "flex",
    alignItems: "flex-end", // Bars grow upward
    width: "100%",
    height: "180px",
    gap: "6px",
  }}
>
  {bars.map((bar) => (
    <div
      key={bar.month}
      style={{
        flex: 1, // Every month gets the same width
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        height:"100%"
      }}
    >
      {bar.value > 0? `${bar.value}` :""}
      <div
        title={`${bar.month}: ${bar.value} day${bar.value === 1 ? "" : "s"}`}
        style={{
          width: "100%",
          height: `${(bar.value / Math.max(...dates, 1)) * 100}%`,
          background: bar.color,
          borderRadius: "4px 4px 0 0",
          minHeight: bar.value > 0 ? "4px" : "0",
          transition: "height 0.3s ease",
        }}
      />
      <span
        style={{
          marginTop: "6px",
          fontSize: "var(--fs-2xs)",
        }}
      >
        {bar.month.slice(0, 3)}
      </span>
    </div>
  ))}
</div>
  );
}

export default CalanderGraph;