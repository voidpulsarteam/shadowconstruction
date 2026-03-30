import fs from 'fs'
import path from 'path'

function getSiteData() {
  const sitePath = path.join(process.cwd(), 'data/site.json')
  return JSON.parse(fs.readFileSync(sitePath, 'utf8'))
}

export default function Home() {
  const site = getSiteData()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-pattern"></div>
        <div className="hero-bg-gradient"></div>

        <nav className="main-nav">
          <div className="nav-container">
            <a href="/" className="nav-logo">
              <div className="logo-icon">
                <span className="logo-text">SHADOW</span>
                <span className="logo-accent">CONSTRUCTION</span>
              </div>
              <div className="logo-badge">ER:LC</div>
            </a>

            <div className="nav-links">
              <a href="#about" className="nav-link">About</a>
              <a href="#services" className="nav-link">Services</a>
              <a href="#team" className="nav-link">Team</a>
              <a href="#careers" className="nav-link">Careers</a>
              <a href="/wiki" className="nav-link nav-wiki">
                <span className="link-icon">📖</span>
                Wiki
              </a>
              <a href="/fleet" className="nav-link nav-fleet">
                <span className="link-icon">🚛</span>
                Fleet
              </a>
              <a href="/dashboard" className="nav-link nav-dashboard">
                <span className="link-icon">⚙️</span>
                Dashboard
              </a>
            </div>

            <div className="nav-cta">
              <a href="#join" className="btn-primary">
                <span className="btn-icon">🔨</span>
                Join Crew
              </a>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-icon">⚡</span>
              Emergency Response: Liberty County
            </div>

            <h1 className="hero-title">
              Building Liberty County,
              <span className="title-accent">One Shift at a Time</span>
            </h1>

            <p className="hero-subtitle">
              Liberty County's premier construction roleplay experience. Join our crew of skilled builders,
              engineers, and project managers in the most immersive construction simulation on Roblox ER:LC.
            </p>

            <div className="hero-actions">
              <a href="#join" className="btn-primary btn-large">
                <span className="btn-icon">👷</span>
                Start Your Career
              </a>
              <a href="/wiki" className="btn-secondary btn-large">
                <span className="btn-icon">📚</span>
                Learn More
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="construction-scene">
              <div className="building-silhouette">
                <div className="crane">
                  <div className="crane-arm"></div>
                  <div className="crane-hook"></div>
                </div>
                <div className="building-structure">
                  <div className="building-floor"></div>
                  <div className="building-floor"></div>
                  <div className="building-floor"></div>
                  <div className="building-floor active"></div>
                </div>
              </div>
              <div className="construction-worker">
                <div className="worker-helmet">⛑️</div>
                <div className="worker-body"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">{site.stats.members}</div>
            <div className="stat-label">Active Crew Members</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{site.stats.sessions}</div>
            <div className="stat-label">Sessions Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{site.stats.discord}</div>
            <div className="stat-label">Discord Members</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">#{site.stats.rank}</div>
            <div className="stat-label">Liberty County Rank</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">About Shadow Construction</h2>
            <p className="section-subtitle">Building the future of Liberty County, one project at a time</p>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <div className="card-icon">🏗️</div>
              <h3>Expert Craftsmanship</h3>
              <p>Our team of skilled builders and engineers brings years of experience to every project, ensuring quality and precision in all our work.</p>
            </div>

            <div className="about-card">
              <div className="card-icon">⚡</div>
              <h3>Rapid Response</h3>
              <p>Available 24/7 for emergency construction needs, maintenance, and urgent repairs throughout Liberty County.</p>
            </div>

            <div className="about-card">
              <div className="card-icon">🤝</div>
              <h3>Community Focused</h3>
              <p>We work closely with local authorities and businesses to maintain and improve the infrastructure that keeps Liberty County running.</p>
            </div>

            <div className="about-card">
              <div className="card-icon">🎯</div>
              <h3>Quality Assurance</h3>
              <p>Every project undergoes rigorous quality control to ensure it meets the highest standards and safety requirements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">Comprehensive construction solutions for Liberty County</p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-header">
                <div className="service-icon">🏢</div>
                <h3>Commercial Construction</h3>
              </div>
              <p>Office buildings, retail spaces, and commercial facilities built to the highest standards.</p>
              <ul className="service-features">
                <li>Project management</li>
                <li>Structural engineering</li>
                <li>Interior finishing</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-header">
                <div className="service-icon">🏠</div>
                <h3>Residential Development</h3>
              </div>
              <p>Homes and residential complexes designed for comfort, safety, and modern living.</p>
              <ul className="service-features">
                <li>Custom home building</li>
                <li>Renovation services</li>
                <li>Property development</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-header">
                <div className="service-icon">🛣️</div>
                <h3>Infrastructure</h3>
              </div>
              <p>Roads, bridges, and public infrastructure that keeps Liberty County connected.</p>
              <ul className="service-features">
                <li>Road construction</li>
                <li>Bridge building</li>
                <li>Utility installation</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-header">
                <div className="service-icon">🔧</div>
                <h3>Maintenance & Repairs</h3>
              </div>
              <p>Emergency repairs and ongoing maintenance to keep properties safe and functional.</p>
              <ul className="service-features">
                <li>Emergency response</li>
                <li>Structural repairs</li>
                <li>Preventive maintenance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Leadership Team</h2>
            <p className="section-subtitle">Meet the experienced professionals leading our operations</p>
          </div>

          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">
                <span className="avatar-icon">👔</span>
              </div>
              <div className="member-info">
                <h3>Project Director</h3>
                <p className="member-role">Chief Executive Officer</p>
                <p className="member-bio">Oversees all major construction projects and ensures operational excellence across all sites.</p>
              </div>
            </div>

            <div className="team-member">
              <div className="member-avatar">
                <span className="avatar-icon">⚙️</span>
              </div>
              <div className="member-info">
                <h3>Operations Manager</h3>
                <p className="member-role">Head of Operations</p>
                <p className="member-bio">Manages daily operations, coordinates crews, and ensures project timelines are met.</p>
              </div>
            </div>

            <div className="team-member">
              <div className="member-avatar">
                <span className="avatar-icon">📐</span>
              </div>
              <div className="member-info">
                <h3>Senior Engineer</h3>
                <p className="member-role">Lead Engineer</p>
                <p className="member-bio">Designs structural solutions and ensures all projects meet safety and building codes.</p>
              </div>
            </div>

            <div className="team-member">
              <div className="member-avatar">
                <span className="avatar-icon">🛡️</span>
              </div>
              <div className="member-info">
                <h3>Safety Officer</h3>
                <p className="member-role">Safety Coordinator</p>
                <p className="member-bio">Ensures all work sites maintain the highest safety standards and protocols.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="careers-section">
        <div className="section-container">
          <div className="careers-content">
            <div className="careers-text">
              <h2>Join Our Team</h2>
              <p>Be part of Liberty County's most respected construction company. We offer competitive pay, comprehensive training, and opportunities for advancement.</p>

              <div className="career-positions">
                <div className="position">
                  <h4>Construction Worker</h4>
                  <p>Entry-level position for those looking to start a career in construction.</p>
                </div>
                <div className="position">
                  <h4>Equipment Operator</h4>
                  <p>Operate heavy machinery and specialized construction equipment.</p>
                </div>
                <div className="position">
                  <h4>Project Manager</h4>
                  <p>Lead construction teams and oversee project execution from start to finish.</p>
                </div>
              </div>
            </div>

            <div className="careers-visual">
              <div className="hard-hat">
                <span className="hat-icon">⛑️</span>
              </div>
              <div className="career-stats">
                <div className="career-stat">
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Job Satisfaction</span>
                </div>
                <div className="career-stat">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support Available</span>
                </div>
                <div className="career-stat">
                  <span className="stat-number">100+</span>
                  <span className="stat-label">Projects Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join" className="join-section">
        <div className="section-container">
          <div className="join-content">
            <h2>Ready to Join the Crew?</h2>
            <p>Take the first step towards an exciting career in construction. Join Shadow Construction and help build the future of Liberty County.</p>

            <div className="join-steps">
              <div className="join-step">
                <div className="step-number">1</div>
                <h4>Apply</h4>
                <p>Submit your application through our Discord server</p>
              </div>
              <div className="join-step">
                <div className="step-number">2</div>
                <h4>Interview</h4>
                <p>Meet with our recruitment team</p>
              </div>
              <div className="join-step">
                <div className="step-number">3</div>
                <h4>Training</h4>
                <p>Complete our comprehensive training program</p>
              </div>
              <div className="join-step">
                <div className="step-number">4</div>
                <h4>Start Building</h4>
                <p>Begin your career with Shadow Construction</p>
              </div>
            </div>

            <div className="join-cta">
              <a href="#discord" className="btn-primary btn-xl">
                <span className="btn-icon">💬</span>
                Join Our Discord
              </a>
              <a href="/wiki" className="btn-secondary btn-xl">
                <span className="btn-icon">📖</span>
                Read the Wiki
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="logo-icon">
                <span className="logo-text">SHADOW</span>
                <span className="logo-accent">CONSTRUCTION</span>
              </div>
              <div className="logo-badge">ER:LC</div>
            </div>

            <div className="footer-links">
              <div className="footer-section">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#services">Services</a>
                <a href="#team">Team</a>
                <a href="#careers">Careers</a>
              </div>

              <div className="footer-section">
                <h4>Resources</h4>
                <a href="/wiki">Wiki</a>
                <a href="/fleet">Fleet</a>
                <a href="/dashboard">Dashboard</a>
                <a href="#rules">Rules</a>
              </div>

              <div className="footer-section">
                <h4>Connect</h4>
                <a href="#discord">Discord</a>
                <a href="#roblox">Roblox</a>
                <a href="#support">Support</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Shadow Construction Co. | Liberty County, ER:LC Roleplay Group</p>
            <div className="footer-status">
              <span className={`status-indicator ${site.status.group === 'ACTIVE' ? 'active' : 'maintenance'}`}></span>
              <span>Status: {site.status.group}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
