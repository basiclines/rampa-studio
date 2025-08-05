import { createRoot } from 'react-dom/client'
import AmplitudeTracker from './utilities/AmplitudeTracker.ts'

import App from './App.tsx'
import './index.css'


async function initAmplitude() {
  AmplitudeTracker.init()
}

function initDOM() {
  createRoot(document.getElementById("root")!).render(<App />);
}


function init() {
  initAmplitude()
  initDOM()
}

init();