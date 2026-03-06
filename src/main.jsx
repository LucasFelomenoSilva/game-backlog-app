import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext' // Importe o ThemeProvider

createRoot(document.getElementById('root')).render(
  // Remova a tag <StrictMode>
  <ThemeProvider>
    <App />
  </ThemeProvider>
)