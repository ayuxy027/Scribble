import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './GamePage.tsx'
import './styles/Globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
