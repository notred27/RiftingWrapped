import React, { useEffect, useRef, useState } from 'react';
import h337 from 'heatmap.js';

const CANVAS_SIZE = 300;
const GAME_MAP_SIZE = 15000;

export default function DualHeatmapOverlay({ puuid }) {
  const killContainerRef = useRef(null);
  const deathContainerRef = useRef(null);
  const killHeatmapRef = useRef(null);
  const deathHeatmapRef = useRef(null);
  const [mapData, setMapData] = useState(null);

  // Fetch match events
  useEffect(() => {
    fetch(`/mapEvents/${puuid}`)
      .then(res => res.json())
      .then(data => setMapData(data));
  }, [puuid]);


  // Initialize both heatmaps
  useEffect(() => {
    if (!killContainerRef.current || !deathContainerRef.current) return;

    if (!killHeatmapRef.current) {
      killHeatmapRef.current = h337.create({
        container: killContainerRef.current,
        radius: 10,
        maxOpacity: 0.6,
        minOpacity: 0.3,
        blur: 0.85,
        gradient: {
          '.4': 'orange',
          '.6': 'red',
          '.9': 'darkred'
        }
      });
    }

    if (!deathHeatmapRef.current) {
      deathHeatmapRef.current = h337.create({
        container: deathContainerRef.current,
        radius: 10,
        maxOpacity: 0.6,
        minOpacity: 0.3,
        blur: 0.85,
        gradient: {
          '.4': 'lightblue',
          '.6': 'blue',
          '.9': 'darkblue'
        }
      });
    }
  }, []);

  // Populate heatmaps
  useEffect(() => {
    if (!mapData || !killHeatmapRef.current || !deathHeatmapRef.current) return;

    const scale = (pos) => ({
      x: Math.floor((pos.x / GAME_MAP_SIZE) * CANVAS_SIZE),
      y: Math.floor(CANVAS_SIZE - (pos.y / GAME_MAP_SIZE) * CANVAS_SIZE),
      value: 1
    });

    const killPoints = mapData.kills.map(scale);
    const deathPoints = mapData.deaths.map(scale);

    killHeatmapRef.current.setData({ max: 5, data: killPoints});
    deathHeatmapRef.current.setData({ max: 5, data: deathPoints });
  }, [mapData]);

  return (
    <div className='splitColumn' style={{textAlign:"center"}}>


      <div>
        <div
          ref={killContainerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <img
            src="https://wiki.leagueoflegends.com/en-us/images/thumb/Summoner%27s_Rift_Minimap.png/300px-Summoner%27s_Rift_Minimap.png?332ac"
            alt="Map"
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
          />
        </div>
        <h2>Kill Locations</h2>

      </div>


      <div>
        <div
          ref={deathContainerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <img
            src="https://wiki.leagueoflegends.com/en-us/images/thumb/Summoner%27s_Rift_Minimap.png/300px-Summoner%27s_Rift_Minimap.png?332ac"
            alt="Map"
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
          />
        </div>
        <h2>Death Locations</h2>

      </div>


    </div>
  );
}
