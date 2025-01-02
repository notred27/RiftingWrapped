import React from 'react';
import { uploadData } from 'aws-amplify/storage';


export default function PlayerDataUpload() {
    const [file, setFile] = React.useState();

    const handleChange = (event) => {
        setFile(event.target.files[0]);
    };

    return (
        <div >
            <input type="file" onChange={handleChange} />
            <button
                onClick={() => {
                    uploadData({
                        path: `player-data/${file.name}`,
                        data: file,
                    })

                    console.log("Successfully uploaded data")
                }
                }>
                Upload Player Data
            </button>

        </div>
    );
}