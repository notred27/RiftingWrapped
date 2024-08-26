import logo from './images/penguin.png';

function App() {
  return (
    <div className="App" style ={{display:"flex", flexDirection:"column", verticalAlign:"center", alignItems:"center"}}>
      <img src={logo} style={{width:"20%"}}></img>
      <br/>
      <h3>Enter Account ID To Start!</h3>
      <input type = "text"></input>
    </div>
  );
}

export default App;