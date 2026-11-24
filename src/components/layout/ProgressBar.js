export default function ProgressBar({ total, current }) {
    return (
        <div className="progress-bar">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="progress-segment">
                    <div
                        className="progress-fill"
                        style={{ transform: `scaleX(${i <= current ? 1 : 0})` }}
                    />
                </div>
            ))}
        </div>
    );
}