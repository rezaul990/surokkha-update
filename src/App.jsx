import './App.css'
import KistiSurokkha from './pages/KistiSurokkha'

function App() {
  return (
    <div className="container">
      <header>
        <div className="header-titles">
          <div className="header-logo">W</div>
          <div>
            <h1>Walton Plaza – Kisti Surokkha Dashboard</h1>
            <div className="subtitle">Card Status · A/C Created · Printed · Delivered</div>
          </div>
        </div>
        <div className="header-meta">
          <span className="live-dot"></span>
          Real-time Data
        </div>
      </header>

      <KistiSurokkha />

      <footer>
        <span className="legend-item"><span className="legend-chip good"></span> ≥100% On Target</span>
        <span className="legend-item"><span className="legend-chip warn"></span> 80–99% Near Target</span>
        <span className="legend-item"><span className="legend-chip bad"></span> &lt;80% Below Target</span>
      </footer>
    </div>
  )
}

export default App
