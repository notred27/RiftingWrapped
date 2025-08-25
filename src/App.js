import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import Home from './Home';
import PlayerStats from './PlayerStats';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player/:puuid" element={<PlayerStats />} />
        <Route path="/about" element={<Home />} />
        <Route path="/faq" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
