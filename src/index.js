import ReactDOM from 'react-dom/client';
import App from './App';

import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<HelmetProvider>
		<Router>
			<App />
		</Router>
	</HelmetProvider>
);
