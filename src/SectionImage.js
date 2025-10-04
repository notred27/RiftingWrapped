

export default function SectionImage({ imgUrl, offset }) {
    return (
        <div className="sectionImageContainer">
            <img
                src={imgUrl}
                alt={`Banner Splash`}
                style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transform: `translateY(-${offset}%)`,
                    height: 'auto',
                    zIndex: 0,
                    display: 'block',
                    margin: 'auto',
                    maxWidth: '100vw',
                }}
                loading="lazy"
            />

            {/* Left gradient overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '15%',
                    height: '100%',
                    background: 'linear-gradient(to right, #0d1317, transparent)',
                    pointerEvents: 'none',
                }}
            />

            {/* Right gradient overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '15%',
                    height: '100%',
                    background: 'linear-gradient(to left, #0d1317, transparent)',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

