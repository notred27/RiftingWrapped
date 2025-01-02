import React from 'react';
import { downloadData } from 'aws-amplify/storage';


export default function PlayerDataStorage({ setData, playerName, puuid }) {

  async function getPlayerData() {
    console.log("Fetching data for", playerName)
    try {
      const downloadResult = await downloadData({
        path: `player-data/${playerName}_match_data.json`
      }).result;

      const text = await downloadResult.body.text();

      setData(puuid, JSON.parse(text));
    } catch (error) {
      console.log('Error retrieving from S3 bucket:', error);
    }

  }

  return (
    <div >
      <button onClick={getPlayerData}>{playerName}</button>
    </div>
  );
}