import { useState, useEffect } from "react"


export default function PlayerLookup({ setData, setId }) {
    const [puuid, setPuuid] = useState("")
    const count = 20  //   Number of games to fetch (limited to 20/sec, 100/2min)


    // Get matches when a valid user is entered
    useEffect(() => {
        if (puuid !== "") {

            //   Fetch from the flask server
            fetch(`http://localhost:5000/user/${puuid}/${count}`) // Get user's x most recent draft games
            .then(res => res.json())  // Wait for the promise to resolve

            .then(data => {           // Process the data with from the JSON object

                const matchList = []  // Temp list of matches for batched request
                if (data.length !== 0) {

                    const fetchPromises = data.map(matchId =>
                        fetch(`http://localhost:5000/match/${matchId}`)
                        .then(res => res.json())  // Wait for the promise to resolve
                        .then(matches => {
                            matchList.push(matches);  // Add the fetched data to matchList
                        })
                    );

                    // Wait till all promises are resolved, then update useState with this data
                    Promise.all(fetchPromises)
                    .then(() => { setData(matchList); }) // Update the match list
                    .catch(error => { console.error('Error with fetch:', error); });
                }

            })

            .catch((error) => console.error("Error obtaining match history:", error))
        }
    }, [puuid])


    // Fetch puuid through flask server and Riot API
    function get_puuid() {
        // Get user data from the input
        const name = document.getElementById("name_entry").value;

        // Only send request if both the username and tag are included
        if (name.indexOf("#") !== -1) {
            let n = name.split("#")

            // Set up the payload for the request
            const formData = new FormData();
            formData.append('name', n[0]);
            formData.append('id', n[1]);

            // Fetch from the flask server
            fetch("http://localhost:5000/puuid", { method: 'POST', body: formData })
            .then(res => {
                if (res["status"] === 200) { // Only continue if the status is ok
                    return res.json();
                }

            })  // Wait for the promise to resolve
            .then(data => {           // Process the data with from the JSON object
                setPuuid(data.puuid)
                setId(data.puuid)

            })
            .catch((error) => console.log("Error obtaining puuid:", error))
        }
    }

    return (
        <div>
            <h3>Enter Your Account ID To Start!</h3>
            <input type="text" id="name_entry" placeholder={"username#tagline"}></input>
            <button onClick={get_puuid}>Go!</button>
            <h4>(Using data from past {count} matches)</h4>
        </div>
    )
}