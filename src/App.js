import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import Home from './Home';
import PlayerStats from './PlayerStats';
import AddingPlayer from './AddingPlayer.js';
import FAQAccordion from './FAQAccordion.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player/:puuid" element={<PlayerStats />} />
        <Route path="/addPlayer/:puuid" element={<AddingPlayer />} />
        <Route path="/about" element={<Home />} />
        <Route path="/faq" element={<FAQAccordion />} />
      </Routes>
    </Router>
  );
}

export default App;
