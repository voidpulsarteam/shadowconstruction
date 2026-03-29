'use client'

import { useEffect, useState } from 'react'
import './dashboard.css'

interface User {
  username: string
  role: string
}

interface Site {
  status: {
    group: string
    sessions: string
    applications: string
  }
  stats: {
    members: string
    sessions: string
    discord: string
    rank: string
  }
}

interface Vehicle {
  name: string
  year: string
  variant: string
  liveries: { slot: string; id: string }[]
  colors: { role: string; hex: string }[]
}

interface WikiPage {
  id: string
  title: string
  content: string
}

interface Wiki {
  pages: WikiPage[]
}

interface Token {
  id: string
  name: string
  created: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [site, setSite] = useState<Site | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [wiki, setWiki] = useState<Wiki | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [passwordData, setPasswordData] = useState({ current: '', new: '' })
  const [siteData, setSiteData] = useState<Site | null>(null)
  const [wikiData, setWikiData] = useState<Wiki | null>(null)
  const [selectedWikiPage, setSelectedWikiPage] = useState<string>('home')
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>([])
  const [tokensData, setTokensData] = useState<Token[]>([])
  const [passwordMessage, setPasswordMessage] = useState('')
  const [siteMessage, setSiteMessage] = useState('')
  const [wikiMessage, setWikiMessage] = useState('')
  const [vehiclesMessage, setVehiclesMessage] = useState('')
  const [tokensMessage, setTokensMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, siteRes, vehiclesRes, wikiRes, tokensRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/site'),
          fetch('/api/vehicles'),
          fetch('/api/wiki'),
          fetch('/api/tokens')
        ])

        if (!userRes.ok) {
          setError('Not authenticated')
          return
        }

        const userData = await userRes.json()
        const siteDataFetched = await siteRes.json()
        const vehiclesDataFetched = await vehiclesRes.json()
        const wikiDataFetched = await wikiRes.json()
        const tokensDataFetched = await tokensRes.json()

        setUser(userData)
        setSite(siteDataFetched)
        setVehicles(vehiclesDataFetched)
        setWiki(wikiDataFetched)
        setTokens(tokensDataFetched)
        setSiteData(siteDataFetched) // For editing
        setWikiData(wikiDataFetched)
        setVehiclesData(vehiclesDataFetched)
        setTokensData(tokensDataFetched)
        setSelectedWikiPage('home') // Initialize selected page
      } catch (err) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordMessage('Password changed successfully')
        setPasswordData({ current: '', new: '' })
      } else {
        setPasswordMessage(data.error || 'Failed to change password')
      }
    } catch (err) {
      setPasswordMessage('Error changing password')
    }
  }

  const handleSiteUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteData)
      })
      const data = await res.json()
      if (res.ok) {
        setSiteMessage('Site updated successfully')
        setSite(siteData) // Update local state
      } else {
        setSiteMessage(data.error || 'Failed to update site')
      }
    } catch (err) {
      setSiteMessage('Error updating site')
    }
  }

  const handleWikiUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wikiData)
      })
      const data = await res.json()
      if (res.ok) {
        setWikiMessage('Wiki updated successfully')
        setWiki(wikiData)
      } else {
        setWikiMessage(data.error || 'Failed to update wiki')
      }
    } catch (err) {
      setWikiMessage('Error updating wiki')
    }
  }

  const handleVehiclesUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiclesData)
      })
      const data = await res.json()
      if (res.ok) {
        setVehiclesMessage('Vehicles updated successfully')
        setVehicles(vehiclesData)
      } else {
        setVehiclesMessage(data.error || 'Failed to update vehicles')
      }
    } catch (err) {
      setVehiclesMessage('Error updating vehicles')
    }
  }

  const handleTokensUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokensData)
      })
      const data = await res.json()
      if (res.ok) {
        setTokensMessage('Tokens updated successfully')
        setTokens(tokensData)
      } else {
        setTokensMessage(data.error || 'Failed to update tokens')
      }
    } catch (err) {
      setTokensMessage('Error updating tokens')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !user) {
    return <div>{error || 'Please log in'}</div>
  }

  const totalSlots = vehicles.reduce((s, v) => s + v.liveries.length, 0)

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <p>Welcome, {user.username} ({user.role})</p>
      
      <nav>
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'fleet' ? 'active' : ''} onClick={() => setActiveTab('fleet')}>Fleet</button>
        <button className={activeTab === 'password' ? 'active' : ''} onClick={() => setActiveTab('password')}>Password</button>
        <button className={activeTab === 'site' ? 'active' : ''} onClick={() => setActiveTab('site')}>Site</button>
        <button className={activeTab === 'tokens' ? 'active' : ''} onClick={() => setActiveTab('tokens')}>Tokens</button>
        <button className={activeTab === 'wiki' ? 'active' : ''} onClick={() => setActiveTab('wiki')}>Wiki</button>
      </nav>

      {activeTab === 'overview' && site && (
        <div className="tab-content">
          <h2>Site Status</h2>
          <p>Group: {site.status.group}</p>
          <p>Sessions: {site.status.sessions}</p>
          <p>Applications: {site.status.applications}</p>
          <h2>Stats</h2>
          <p>Members: {site.stats.members}</p>
          <p>Sessions: {site.stats.sessions}</p>
          <p>Discord: {site.stats.discord}</p>
          <p>Rank: {site.stats.rank}</p>
        </div>
      )}

      {activeTab === 'fleet' && (
        <div>
          <h2>Fleet Management</h2>
          <p>Total Vehicles: {vehicles.length}</p>
          <p>Total Slots: {totalSlots}</p>
          <ul>
            {vehicles.map((v, i) => (
              <li key={i}>{v.name} - {v.liveries.length} slots</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="tab-content">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password:</label>
              <input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                required
              />
            </div>
            <button type="submit">Change Password</button>
          </form>
          {passwordMessage && <p className={`message ${passwordMessage.includes('success') ? 'success' : 'error'}`}>{passwordMessage}</p>}
        </div>
      )}

      {activeTab === 'site' && siteData && (
        <div className="tab-content">
          <h2>Site Settings</h2>
          <form onSubmit={handleSiteUpdate}>
            <h3>Status</h3>
            <div className="form-group">
              <label>Group:</label>
              <input
                type="text"
                value={siteData.status.group}
                onChange={(e) => setSiteData({
                  ...siteData,
                  status: {...siteData.status, group: e.target.value}
                })}
              />
            </div>
            <div className="form-group">
              <label>Sessions:</label>
              <input
                type="text"
                value={siteData.status.sessions}
                onChange={(e) => setSiteData({
                  ...siteData,
                  status: {...siteData.status, sessions: e.target.value}
                })}
              />
            </div>
            <div className="form-group">
              <label>Applications:</label>
              <input
                type="text"
                value={siteData.status.applications}
                onChange={(e) => setSiteData({
                  ...siteData,
                  status: {...siteData.status, applications: e.target.value}
                })}
              />
            </div>
            <h3>Stats</h3>
            <div className="form-group">
              <label>Members:</label>
              <input
                type="text"
                value={siteData.stats.members}
                onChange={(e) => setSiteData({
                  ...siteData,
                  stats: {...siteData.stats, members: e.target.value}
                })}
              />
            </div>
            <div className="form-group">
              <label>Sessions:</label>
              <input
                type="text"
                value={siteData.stats.sessions}
                onChange={(e) => setSiteData({
                  ...siteData,
                  stats: {...siteData.stats, sessions: e.target.value}
                })}
              />
            </div>
            <div className="form-group">
              <label>Discord:</label>
              <input
                type="text"
                value={siteData.stats.discord}
                onChange={(e) => setSiteData({
                  ...siteData,
                  stats: {...siteData.stats, discord: e.target.value}
                })}
              />
            </div>
            <div className="form-group">
              <label>Rank:</label>
              <input
                type="text"
                value={siteData.stats.rank}
                onChange={(e) => setSiteData({
                  ...siteData,
                  stats: {...siteData.stats, rank: e.target.value}
                })}
              />
            </div>
            <button type="submit">Update Site</button>
          </form>
          {siteMessage && <p className={`message ${siteMessage.includes('success') ? 'success' : 'error'}`}>{siteMessage}</p>}
        </div>
      )}

      {activeTab === 'wiki' && wikiData && (
        <div className="tab-content">
          <h2>Wiki Editor</h2>
          <div className="form-group">
            <label>Select Page:</label>
            <select
              value={selectedWikiPage}
              onChange={(e) => setSelectedWikiPage(e.target.value)}
            >
              {wikiData.pages.map((page) => (
                <option key={page.id} value={page.id}>{page.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Page Title:</label>
            <input
              type="text"
              value={wikiData.pages.find(p => p.id === selectedWikiPage)?.title || ''}
              onChange={(e) => {
                const newPages = wikiData.pages.map(p =>
                  p.id === selectedWikiPage ? { ...p, title: e.target.value } : p
                )
                setWikiData({ ...wikiData, pages: newPages })
              }}
            />
          </div>
          <div className="form-group">
            <label>Content (Markdown):</label>
            <textarea
              value={wikiData.pages.find(p => p.id === selectedWikiPage)?.content || ''}
              onChange={(e) => {
                const newPages = wikiData.pages.map(p =>
                  p.id === selectedWikiPage ? { ...p, content: e.target.value } : p
                )
                setWikiData({ ...wikiData, pages: newPages })
              }}
              rows={20}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button className="add-btn" onClick={() => {
              const newId = `page-${Date.now()}`
              const newPage = { id: newId, title: 'New Page', content: '# New Page\n\nContent here.' }
              setWikiData({ ...wikiData, pages: [...wikiData.pages, newPage] })
              setSelectedWikiPage(newId)
            }}>Add Page</button>
            <button className="remove-btn" onClick={() => {
              if (wikiData.pages.length > 1) {
                const newPages = wikiData.pages.filter(p => p.id !== selectedWikiPage)
                setWikiData({ ...wikiData, pages: newPages })
                setSelectedWikiPage(newPages[0].id)
              }
            }}>Remove Page</button>
          </div>
          <button onClick={handleWikiUpdate}>Update Wiki</button>
          {wikiMessage && <p className={`message ${wikiMessage.includes('success') ? 'success' : 'error'}`}>{wikiMessage}</p>}
        </div>
      )}

      {activeTab === 'fleet' && vehiclesData && (
        <div className="tab-content">
          <h2>Fleet Management</h2>
          <div style={{ marginBottom: '20px' }}>
            <button className="add-btn" onClick={() => {
              const newVehicle = {
                name: 'New Vehicle',
                year: '',
                variant: '',
                liveries: [{ slot: 'Slot1', id: '' }],
                colors: [{ role: 'Primary', hex: '#000000' }]
              };
              setVehiclesData([...vehiclesData, newVehicle]);
            }}>Add Vehicle</button>
          </div>
          {vehiclesData.map((vehicle, vehicleIndex) => (
            <div key={vehicleIndex} className="vehicle-card">
              <div className="vehicle-header">
                <h3>Vehicle {vehicleIndex + 1}</h3>
                <button className="remove-btn" onClick={() => {
                  setVehiclesData(vehiclesData.filter((_, i) => i !== vehicleIndex));
                }}>Remove</button>
              </div>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={vehicle.name}
                  onChange={(e) => {
                    const newVehicles = [...vehiclesData];
                    newVehicles[vehicleIndex].name = e.target.value;
                    setVehiclesData(newVehicles);
                  }}
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Year:</label>
                  <input
                    type="text"
                    value={vehicle.year}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      newVehicles[vehicleIndex].year = e.target.value;
                      setVehiclesData(newVehicles);
                    }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Variant:</label>
                  <input
                    type="text"
                    value={vehicle.variant}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      newVehicles[vehicleIndex].variant = e.target.value;
                      setVehiclesData(newVehicles);
                    }}
                  />
                </div>
              </div>
              <h4>Liveries</h4>
              {vehicle.liveries.map((livery, liveryIndex) => (
                <div key={liveryIndex} className="livery-item">
                  <input
                    type="text"
                    placeholder="Slot"
                    value={livery.slot}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      newVehicles[vehicleIndex].liveries[liveryIndex].slot = e.target.value;
                      setVehiclesData(newVehicles);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="ID"
                    value={livery.id}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      newVehicles[vehicleIndex].liveries[liveryIndex].id = e.target.value;
                      setVehiclesData(newVehicles);
                    }}
                  />
                  <button className="remove-btn" onClick={() => {
                    const newVehicles = [...vehiclesData];
                    newVehicles[vehicleIndex].liveries.splice(liveryIndex, 1);
                    setVehiclesData(newVehicles);
                  }}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={() => {
                const newVehicles = [...vehiclesData];
                newVehicles[vehicleIndex].liveries.push({ slot: 'New Slot', id: '' });
                setVehiclesData(newVehicles);
              }}>Add Livery</button>
              <h4>Colors</h4>
              {vehicle.colors.map((color, colorIndex) => (
                <div key={colorIndex} className="color-item">
                  <input
                    type="text"
                    placeholder="Role"
                    value={color.role}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      newVehicles[vehicleIndex].colors[colorIndex].role = e.target.value;
                      setVehiclesData(newVehicles);
                    }}
                  />
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      newVehicles[vehicleIndex].colors[colorIndex].hex = e.target.value;
                      setVehiclesData(newVehicles);
                    }}
                  />
                  <button className="remove-btn" onClick={() => {
                    const newVehicles = [...vehiclesData];
                    newVehicles[vehicleIndex].colors.splice(colorIndex, 1);
                    setVehiclesData(newVehicles);
                  }}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={() => {
                const newVehicles = [...vehiclesData];
                newVehicles[vehicleIndex].colors.push({ role: 'New Role', hex: '#000000' });
                setVehiclesData(newVehicles);
              }}>Add Color</button>
            </div>
          ))}
          <button onClick={handleVehiclesUpdate}>Update Vehicles</button>
          {vehiclesMessage && <p className={`message ${vehiclesMessage.includes('success') ? 'success' : 'error'}`}>{vehiclesMessage}</p>}
        </div>
      )}

      {activeTab === 'tokens' && tokensData && (
        <div className="tab-content">
          <h2>API Tokens</h2>
          <form onSubmit={handleTokensUpdate}>
            <div className="form-group">
              <label>Tokens Data (JSON):</label>
              <textarea
                value={JSON.stringify(tokensData, null, 2)}
                onChange={(e) => {
                  try {
                    setTokensData(JSON.parse(e.target.value))
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={10}
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </div>
            <button type="submit">Update Tokens</button>
          </form>
          {tokensMessage && <p className={`message ${tokensMessage.includes('success') ? 'success' : 'error'}`}>{tokensMessage}</p>}
        </div>
      )}
    </div>
  )
}