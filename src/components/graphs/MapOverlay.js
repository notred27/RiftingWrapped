import { useEffect, useRef, useState } from 'react';
import h337 from 'heatmap.js';
import { useStatsResources } from "./../../resources/UserResourceContext.js";

const GAME_MAP_SIZE = 15000;

const TYPE_CONFIG = {
    kills: {
        label: "Kill Locations",
        ariaLabel: "Heatmap of player's kill locations",
        gradient: { '.4': '#F2A65A', '.6': '#D85A30', '.9': '#8C3210' },
    },
    deaths: {
        label: "Death Locations",
        ariaLabel: "Heatmap of player's death locations",
        gradient: { '.4': '#8FB8E8', '.6': '#378ADD', '.9': '#1A4E85' },
    },
};

export default function HeatmapOverlay({ type = 'kills' }) {
    const { mapEvents } = useStatsResources();
    const mapData = mapEvents.read();

    const containerRef = useRef(null);
    const heatmapRef = useRef(null);
    const [size, setSize] = useState(null);

    const config = TYPE_CONFIG[type] || TYPE_CONFIG.kills;

    // Measure the container and re-measure whenever it resizes (grid column
    // width changes at the mobile breakpoint, window resize, etc.)
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            // Container is a forced square (aspect-ratio: 1 in CSS), so width === height
            const next = Math.round(Math.min(width, height));
            if (next > 0) setSize(next);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);


    useEffect(() => {
        if (!containerRef.current || !size) return;

        containerRef.current.innerHTML = '';
        heatmapRef.current = h337.create({
            container: containerRef.current,
            radius: Math.max(4, Math.round(size * 0.033)), // scales with container, ~10px at 300px
            maxOpacity: 0.6,
            minOpacity: 0.3,
            blur: 0.85,
            gradient: config.gradient,
        });

        if (mapData) {
            const scale = (pos) => ({
                x: Math.floor((pos.x / GAME_MAP_SIZE) * size),
                y: Math.floor(size - (pos.y / GAME_MAP_SIZE) * size),
                value: 1,
            });
            const points = (type === 'kills' ? mapData.kills : mapData.deaths).map(scale);
            heatmapRef.current.setData({ max: 5, data: points });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size, config.gradient]);


    useEffect(() => {
        if (!mapData || !heatmapRef.current || !size) return;

        const scale = (pos) => ({
            x: Math.floor((pos.x / GAME_MAP_SIZE) * size),
            y: Math.floor(size - (pos.y / GAME_MAP_SIZE) * size),
            value: 1,
        });
        const points = (type === 'kills' ? mapData.kills : mapData.deaths).map(scale);
        heatmapRef.current.setData({ max: 5, data: points });
    }, [mapData, type, size]);

    return (
        <div className="kill-detail-map" style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", aspectRatio: "1 / 1" }}>

                <img
                    src="https://wiki.leagueoflegends.com/en-us/images/thumb/Summoner%27s_Rift_Minimap.png/300px-Summoner%27s_Rift_Minimap.png?332ac"
                    alt="Map"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, objectFit: 'cover' }}
                />
                <div
                    role="img"
                    aria-label={config.ariaLabel}
                    ref={containerRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        pointerEvents: 'none',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        width: "100%", height: "100%",
                    }}
                >
                </div>
            </div>
            <p className="tableLabel">{config.label}</p>
        </div>
    );
}