import { render } from 'preact';
// import '@picocss/pico'; // Replacing PicoCSS with Tailwind
import './frontend/styles/tailwind.css';
import App from './frontend/App';

render(<App />, document.getElementById('app'));
