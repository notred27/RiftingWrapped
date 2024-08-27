import { useState } from 'react';
import logo from './images/penguin.png';

function App() {
  const [puuid, setPuuid] = useState("")

  function get_puuid(){
    // Get user data from the input
    const name = document.getElementById("name_entry").value;
  
    // Only send request if both the username and tag are included
    if(name.indexOf("#") === -1) {
      setPuuid("Error: Please include your tagline (username#xxxx)")

    } else {
      let n = name.split("#")

      // Set up the payload for the request
      const formData = new FormData();
      formData.append('name', n[0]);
      formData.append('id', n[1]);

      // Fetch from the flask server
      fetch("http://localhost:5000/user", {method:'POST', body:formData})
      .then(res => res.json())  // Wait for the promise to resolve
      .then(data => {           // Process the data with from the JSON object
          setPuuid(data.puuid)

      })
      .catch((error) => console.log(error))
    }
  }


  return (
    <div className="App" style ={{display:"flex", flexDirection:"column", verticalAlign:"center", alignItems:"center"}}>
      <img src={logo} style={{width:"20%"}}></img>
      <br/>
      <h3>Enter Account ID To Start!</h3>
      <input type = "text" id = "name_entry"></input>
      <button onClick={get_puuid}>Go!</button>
      <h3>{puuid}</h3>

    </div>
  );
}

export default App;