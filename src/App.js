import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Home from './pages/Home/Home.js';
import PlayerStats from './pages/User/PlayerStats.js';
import AddingPlayer from './pages/User/AddingPlayer.js';
import FAQ from './pages/FAQ/FAQ.js';
import KofiWidget from './components/KofiWidget.js';

function App() {
  return (
    <Router>
      <KofiWidget />

      <header className="siteHeader">
        <span style={{ display: "flex", gap: "5px" }}>
          <img src='/favicon-32x32.png' alt='rifting wrapped logo'></img>
          <div className="logo">
            Rifting Wrapped 2025
          </div>
        </span>
        <nav className="navMenu">
          <Link to="/">Home</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player/:puuid" element={<PlayerStats />} />
          <Route path="/addPlayer/:puuid" element={<AddingPlayer />} />
          <Route path="/about" element={<Home />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </main>

      <footer>
        <p id='FooterNote'>All data used in Rifting Wrapped comes from the public League of Legends matches a user has participated in. Rifting Wrapped isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p>
      </footer>

    </Router>
  );
}

export default App;
