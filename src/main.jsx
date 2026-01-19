import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'      // Admin (já tem o Auth dentro)
import Cliente from './Cliente.jsx' // Novo componente

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota da Psicóloga (Protegida pelo seu App.jsx) */}
        <Route path="/" element={<App />} />
        
        {/* Rota do Paciente (Pública) */}
        <Route path="/agendar" element={<Cliente />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)