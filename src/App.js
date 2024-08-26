import logo from './images/penguin.png';

function App() {

  function get_puid(){
    console.log()

    const name = document.getElementById("name_entry").value;

    if(name.indexOf("#") === -1) {
      console.log("Please include your tagline (#xxxx)")
    } else {
      let n = name.split("#")

      // header = 

      // API endpoint, move to flask to avoid CORS
      fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${n[0]}/${n[1]}?api_key=${process.env.REACT_APP_API_KEY}`, {
        method:"GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
          "Origin": "https://developer.riotgames.com"
      }
      })
    }
  }


  return (
    <div className="App" style ={{display:"flex", flexDirection:"column", verticalAlign:"center", alignItems:"center"}}>
      <img src={logo} style={{width:"20%"}}></img>

      <br/>
      <h3>Enter Account ID To Start!</h3>
      <input type = "text" id = "name_entry"></input>
      <button onClick={get_puid}>Go!</button>

      <h3>ENV: {process.env.REACT_APP_API_KEY}</h3>
    </div>
  );
}

export default App;