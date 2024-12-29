import React from 'react';
// import { uploadData } from 'aws-amplify/storage';

import { downloadData } from 'aws-amplify/storage';




export default function PlayerDataStorage({setData, playerName, puuid}) {
  const [file, setFile] = React.useState();

  // const handleChange = (event) => {
  //   setFile(event.target.files[0]);
  // };


  async function getFile() {
    console.log("Fetching")
    try {
      const downloadResult = await downloadData({
        path: `player-data/${playerName}_match_data.json`
      }).result;

      const text = await downloadResult.body.text();

      setData(puuid, JSON.parse(text));
    } catch (error) {
      console.log('Error : ', error);
    }

  }



  return (
    <div >
      {/* <input type="file" onChange={handleChange} />
      <button
        onClick={() => {
          uploadData({
            path: `player-data/${file.name}`,
            data: file,
          })

          console.log("Done")
        }
      }>
        Upload
      </button> */}

      <button onClick={getFile}>{playerName}</button>
    </div>
  );
}