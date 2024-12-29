import React from 'react';
import { uploadData } from 'aws-amplify/storage';

import { downloadData } from 'aws-amplify/storage';




export default function TodoList() {
  const [file, setFile] = React.useState();

  const handleChange = (event) => {
    setFile(event.target.files[0]);
  };


  async function getFile() {
    console.log("Fetching")
    try {
      const downloadResult = await downloadData({
        path: "player-data/MrWarwickWide_match_data.json"
      }).result;
      const text = await downloadResult.body.json();
      // Alternatively, you can use `downloadResult.body.blob()`
      // or `downloadResult.body.json()` get read body in Blob or JSON format.
      console.log('Succeed: ', text);
    } catch (error) {
      console.log('Error : ', error);
    }

  }



  return (
    <div>
      <input type="file" onChange={handleChange} />
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
      </button>

      <button onClick={getFile}>Get file</button>
    </div>
  );
}