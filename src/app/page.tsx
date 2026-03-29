import fs from 'fs'
import path from 'path'

function getSiteData() {
  const sitePath = path.join(process.cwd(), 'data/site.json')
  return JSON.parse(fs.readFileSync(sitePath, 'utf8'))
}

export default function Home() {
  const site = getSiteData()

  return (
    <div>
      <nav>
        <a href="/" className="nav-logo">
          <div className="nav-logo-icon">S</div>
          <span className="nav-logo-text">SHADOW <span>CONST</span></span>
          <span className="nav-badge">ER:LC</span>
        </a>
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#roles">Roles</a></li>
          <li><a href="#rules">Rules</a></li>
          <li><a href="#ranks">Ranks</a></li>
          <li><a href="/wiki" className="nav-wiki">📖 Wiki</a></li>
          <li><a href="/fleet" className="nav-wiki">🚛 Fleet</a></li>
          <li><a href="#discord" className="nav-join">Join Us</a></li>
        </ul>
      </nav>

      <section id="hero">
        <div className="hero-grid-bg"></div>
        <p className="hero-tag">Emergency Response: Liberty County — Roleplay Group</p>
        <h1>
          SHADOW
          <span className="line-yellow">CONSTRUCTION</span>
          <span className="line-dim">LIBERTY COUNTY</span>
        </h1>
        <p className="hero-sub">Liberty County's most immersive <strong>construction roleplay experience</strong> on Roblox ER:LC. Build the city, play the crew, live the role.</p>
        <div className="hero-buttons">
          <a href="#discord" className="btn-yellow">🔨 Join the Crew</a>
          <a href="/wiki" className="btn-outline">📖 View Wiki</a>
        </div>
        <div className="hero-status">
          <div className="status-card">
            <div className={`status-dot ${site.status.group === 'ACTIVE' ? '' : 'orange'}`}></div>
            <div className="status-text">GROUP STATUS: <span className="status-val">{site.status.group}</span></div>
          </div>
          <div className="status-card">
            <div className="status-dot orange"></div>
            <div className="status-text">SESSIONS: <span className="status-val">{site.status.sessions}</span></div>
          </div>
          <div className="status-card">
            <div className={`status-dot ${site.status.applications === 'OPEN' ? '' : 'orange'}`}></div>
            <div className="status-text">APPLICATIONS: <span className="status-val">{site.status.applications}</span></div>
          </div>
        </div>
        <div className="hero-caution"></div>
      </section>

      {/* Add other sections as needed */}
    </div>
  )
}
