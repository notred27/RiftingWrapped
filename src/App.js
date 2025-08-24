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
      </Routes>
    </Router>
  );
}

export default App;
