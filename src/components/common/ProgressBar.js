export default function ProgressBar({ total, current }) {
    return (
        <div className="progress-bar">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="progress-segment">
                    <div
                        className="progress-fill"
                        style={{ width: i < current ? '100%' : i === current ? '100%' : '0%' }}
                    />
                </div>
            ))}
        </div>
    );
}