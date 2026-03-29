import fs from 'fs'
import path from 'path'
import './fleet.css'

function getVehiclesData() {
  const vehiclesPath = path.join(process.cwd(), 'data/vehicles.json')
  return JSON.parse(fs.readFileSync(vehiclesPath, 'utf8'))
}

export default function Fleet() {
  const vehicles = getVehiclesData()
  const totalSlots = vehicles.reduce((s: number, v: any) => s + v.liveries.length, 0)

  return (
    <div id="site">
      <nav className="topnav">
        <a href="/" className="topnav-back">← Home</a>
        <div className="topnav-divider"></div>
        <a href="/" className="topnav-logo">SHADOW <span>CONSTRUCTION</span></a>
        <span className="topnav-label">FLEET REF</span>
        <a href="/wiki" className="topnav-wiki-link">📖 Wiki</a>
      </nav>

      <header className="site-header">
        <div className="header-inner">
          <div className="header-text">
            <div className="header-eyebrow">// Internal Reference Document</div>
            <div className="header-title">SHADOW <span className="grad">CONSTRUCTION</span></div>
            <div className="header-subtitle">Fleet Livery Reference Sheet — All Vehicles</div>
          </div>
          <div className="header-stats">
            <div className="hstat">
              <div className="hstat-num">{vehicles.length}</div>
              <div className="hstat-label">Vehicles</div>
            </div>
            <div className="hstat">
              <div className="hstat-num">{totalSlots}</div>
              <div className="hstat-label">Livery Slots</div>
            </div>
          </div>
        </div>
        <div className="header-bar"></div>
      </header>

      <main className="content">
        <div className="sec-head">
          <div className="sec-tag">// Vehicle Fleet</div>
          <div className="sec-line"></div>
        </div>

        <div className="vehicles-grid">
          {vehicles.map((vehicle: any, index: number) => (
            <div key={index} className="vehicle-card">
              <div className="card-num">{index + 1}</div>
              <div className="card-head">
                <div className="vehicle-name">{vehicle.name}</div>
                <div className="vehicle-meta">
                  <span className="meta-pill year">{vehicle.year}</span>
                  {vehicle.variant && <span className="meta-pill variant">{vehicle.variant}</span>}
                </div>
              </div>
              <div className="card-body">
                <table className="livery-table">
                  <tbody>
                    {vehicle.liveries.map((livery: any, lIndex: number) => (
                      <tr key={lIndex}>
                        <td>
                          <span className={`slot-badge ${livery.slot.toLowerCase().includes('left') ? 'left' : livery.slot.toLowerCase().includes('right') ? 'right' : 'back'}`}>
                            {livery.slot}
                          </span>
                        </td>
                        <td>
                          <span className="livery-id">{livery.id}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {vehicle.colors && vehicle.colors.length > 0 && (
                <div className="card-colors">
                  {vehicle.colors.map((color: any, cIndex: number) => (
                    <div key={cIndex} className="color-chip">
                      <div className="chip-swatch" style={{ backgroundColor: color.hex }}></div>
                      <div className="chip-label">{color.role}</div>
                      <div className="chip-value">{color.hex}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}