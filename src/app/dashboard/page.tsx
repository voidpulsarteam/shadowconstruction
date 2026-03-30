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
  id?: number
  name: string
  year: string
  variant: string
  liveries: string | { slot: string; id: string }[]
  colors: string | { role: string; hex: string }[]
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
  id: number
  token: string
  type: string
  expires_at: string | null
  created_at: string
}

interface UserManagement {
  username: string
  role: string
  created_at?: string
  last_login?: string
}

type UserRole = 'admin' | 'manager' | 'staff' | 'employee'

interface Shift {
  id: string
  employee: string
  startTime: string | null
  endTime: string | null
  breaks: Array<{
    startTime: string
    endTime: string | null
    duration: number
  }>
  status: 'active' | 'on_break' | 'completed'
  totalDuration: number
  moderationStats: {
    warnings: number
    kicks: number
    bans: number
    bolos: number
    notes: number
    modcalls: number
    vehicleChecks: number
    memberChecks: number
    commandsUsed: number
  }
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
  const [shifts, setShifts] = useState<Shift[]>([])
  const [shiftsData, setShiftsData] = useState<Shift[]>([])
  const [shiftsMessage, setShiftsMessage] = useState('')
  const [currentShift, setCurrentShift] = useState<Shift | null>(null)
  const [currentBreak, setCurrentBreak] = useState<{startTime: string} | null>(null)
  const [allUsers, setAllUsers] = useState<UserManagement[]>([])
  const [usersMessage, setUsersMessage] = useState('')
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'employee' as UserRole })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, siteRes, vehiclesRes, wikiRes, tokensRes, shiftsRes, usersRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/site'),
          fetch('/api/vehicles'),
          fetch('/api/wiki'),
          fetch('/api/tokens'),
          fetch('/api/shifts'),
          fetch('/api/users')
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
        const shiftsDataFetched = await shiftsRes.json()
        const usersDataFetched = await usersRes.json()

        const vehiclesDataParsed = vehiclesDataFetched.map((v: any) => ({
          ...v,
          liveries: typeof v.liveries === 'string' ? JSON.parse(v.liveries) : v.liveries,
          colors: typeof v.colors === 'string' ? JSON.parse(v.colors) : v.colors
        }))

        setUser(userData)
        setSite(siteDataFetched)
        setVehicles(vehiclesDataFetched)
        setWiki(wikiDataFetched)
        setTokens(tokensDataFetched)
        setShifts(shiftsDataFetched)
        setSiteData(siteDataFetched) // For editing
        setWikiData(wikiDataFetched)
        setVehiclesData(vehiclesDataParsed)
        setTokensData(tokensDataFetched)
        setShiftsData(shiftsDataFetched)
        setAllUsers(usersDataFetched)
        setSelectedWikiPage('home') // Initialize selected page

        // Find current user's active shift
        const activeShift = shiftsDataFetched.find((shift: Shift) =>
          shift.employee === userData.username &&
          (shift.status === 'active' || shift.status === 'on_break')
        )
        setCurrentShift(activeShift || null)

        // Find current break if on break
        if (activeShift && activeShift.status === 'on_break') {
          const currentBreakData = activeShift.breaks.find((b: any) => !b.endTime)
          setCurrentBreak(currentBreakData ? { startTime: currentBreakData.startTime } : null)
        } else {
          setCurrentBreak(null)
        }
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

  const handleShiftsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftsData)
      })
      const data = await res.json()
      if (res.ok) {
        setShiftsMessage('Shifts updated successfully')
        setShifts(shiftsData)
      } else {
        setShiftsMessage(data.error || 'Failed to update shifts')
      }
    } catch (err) {
      setShiftsMessage('Error updating shifts')
    }
  }

  const handleStartShift = async () => {
    if (!user) return

    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      employee: user.username,
      startTime: new Date().toISOString(),
      endTime: null,
      breaks: [],
      status: 'active',
      totalDuration: 0,
      moderationStats: {
        warnings: 0,
        kicks: 0,
        bans: 0,
        bolos: 0,
        notes: 0,
        modcalls: 0,
        vehicleChecks: 0,
        memberChecks: 0,
        commandsUsed: 0
      }
    }

    const updatedShifts = [...shiftsData, newShift]
    setShiftsData(updatedShifts)
    setCurrentShift(newShift)

    try {
      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedShifts)
      })
      setShifts(updatedShifts)
    } catch (err) {
      console.error('Error starting shift:', err)
    }
  }

  const handleEndShift = async () => {
    if (!currentShift) return

    const endTime = new Date().toISOString()
    const startTime = new Date(currentShift.startTime!)
    const totalDuration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000 / 60) // minutes

    // Calculate break time
    const breakTime = currentShift.breaks.reduce((total, breakItem) => {
      if (breakItem.endTime) {
        return total + breakItem.duration
      }
      return total
    }, 0)

    const updatedShift = {
      ...currentShift,
      endTime,
      status: 'completed' as const,
      totalDuration: totalDuration - breakTime
    }

    const updatedShifts = shiftsData.map(shift =>
      shift.id === currentShift.id ? updatedShift : shift
    )

    setShiftsData(updatedShifts)
    setCurrentShift(null)
    setCurrentBreak(null)

    try {
      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedShifts)
      })
      setShifts(updatedShifts)
    } catch (err) {
      console.error('Error ending shift:', err)
    }
  }

  const handleStartBreak = async () => {
    if (!currentShift) return

    const breakStart = new Date().toISOString()
    setCurrentBreak({ startTime: breakStart })

    const updatedShift = {
      ...currentShift,
      status: 'on_break' as const,
      breaks: [...currentShift.breaks, { startTime: breakStart, endTime: null, duration: 0 }]
    }

    const updatedShifts = shiftsData.map(shift =>
      shift.id === currentShift.id ? updatedShift : shift
    )

    setShiftsData(updatedShifts)
    setCurrentShift(updatedShift)

    try {
      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedShifts)
      })
      setShifts(updatedShifts)
    } catch (err) {
      console.error('Error starting break:', err)
    }
  }

  const handleEndBreak = async () => {
    if (!currentShift || !currentBreak) return

    const breakEnd = new Date().toISOString()
    const breakDuration = Math.floor((new Date(breakEnd).getTime() - new Date(currentBreak.startTime).getTime()) / 1000 / 60) // minutes

    const updatedBreaks = currentShift.breaks.map(breakItem =>
      !breakItem.endTime ? { ...breakItem, endTime: breakEnd, duration: breakDuration } : breakItem
    )

    const updatedShift = {
      ...currentShift,
      status: 'active' as const,
      breaks: updatedBreaks
    }

    const updatedShifts = shiftsData.map(shift =>
      shift.id === currentShift.id ? updatedShift : shift
    )

    setShiftsData(updatedShifts)
    setCurrentShift(updatedShift)
    setCurrentBreak(null)

    try {
      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedShifts)
      })
      setShifts(updatedShifts)
    } catch (err) {
      console.error('Error ending break:', err)
    }
  }

  const handleForceEndShift = async (shiftId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) return

    const shiftToEnd = shiftsData.find(s => s.id === shiftId)
    if (!shiftToEnd) return

    const endTime = new Date().toISOString()
    const startTime = new Date(shiftToEnd.startTime!)
    const totalDuration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000 / 60)

    const breakTime = shiftToEnd.breaks.reduce((total, breakItem) => total + breakItem.duration, 0)

    const updatedShift = {
      ...shiftToEnd,
      endTime,
      status: 'completed' as const,
      totalDuration: totalDuration - breakTime
    }

    const updatedShifts = shiftsData.map(shift =>
      shift.id === shiftId ? updatedShift : shift
    )

    setShiftsData(updatedShifts)

    // Update current shift if it was the user's own shift
    if (currentShift && currentShift.id === shiftId) {
      setCurrentShift(null)
      setCurrentBreak(null)
    }

    try {
      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedShifts)
      })
      setShifts(updatedShifts)
    } catch (err) {
      console.error('Error force ending shift:', err)
    }
  }

  const handleCreateUser = async (username: string, password: string, role: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', username, password, role })
      })
      const data = await res.json()
      if (res.ok) {
        setUsersMessage('User created successfully')
        // Refresh users list
        const usersRes = await fetch('/api/users')
        const updatedUsers = await usersRes.json()
        setAllUsers(updatedUsers)
      } else {
        setUsersMessage(data.error || 'Failed to create user')
      }
    } catch (err) {
      setUsersMessage('Error creating user')
    }
  }

  const handleUpdateUserRole = async (targetUsername: string, role: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', targetUsername, role })
      })
      const data = await res.json()
      if (res.ok) {
        setUsersMessage('User role updated successfully')
        // Refresh users list
        const usersRes = await fetch('/api/users')
        const updatedUsers = await usersRes.json()
        setAllUsers(updatedUsers)
      } else {
        setUsersMessage(data.error || 'Failed to update user role')
      }
    } catch (err) {
      setUsersMessage('Error updating user role')
    }
  }

  const handleDeleteUser = async (targetUsername: string) => {
    if (!confirm(`Are you sure you want to delete user "${targetUsername}"?`)) return

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', targetUsername })
      })
      const data = await res.json()
      if (res.ok) {
        setUsersMessage('User deleted successfully')
        // Refresh users list
        const usersRes = await fetch('/api/users')
        const updatedUsers = await usersRes.json()
        setAllUsers(updatedUsers)
      } else {
        setUsersMessage(data.error || 'Failed to delete user')
      }
    } catch (err) {
      setUsersMessage('Error deleting user')
    }
  }

  const handleVehiclesUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const vehiclesToSend = vehiclesData.map(({ id, ...v }) => v)
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiclesToSend)
      })
      const data = await res.json()
      if (res.ok) {
        setVehiclesMessage('Vehicles updated successfully')
        // Refresh the data
        const vehiclesRes = await fetch('/api/vehicles')
        const newVehicles = await vehiclesRes.json()
        setVehicles(newVehicles)
        const parsedVehicles = newVehicles.map((v: any) => ({
          ...v,
          liveries: typeof v.liveries === 'string' ? JSON.parse(v.liveries) : v.liveries,
          colors: typeof v.colors === 'string' ? JSON.parse(v.colors) : v.colors
        }))
        setVehiclesData(parsedVehicles)
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

  const totalSlots = vehicles.reduce((s, v) => {
    const liveries = typeof v.liveries === 'string' ? JSON.parse(v.liveries) : v.liveries
    return s + liveries.length
  }, 0)

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">SHADOW CONSTRUCTION</div>
          <div className="sidebar-subtitle">Admin Dashboard</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">OVERVIEW</div>
            <a
              href="#"
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('overview') }}
            >
              📊 Dashboard
            </a>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">MANAGEMENT</div>
            <a
              href="#"
              className={`nav-item ${activeTab === 'fleet' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('fleet') }}
            >
              🚛 Fleet
            </a>
            <a
              href="#"
              className={`nav-item ${activeTab === 'wiki' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('wiki') }}
            >
              📖 Wiki
            </a>
            <a
              href="#"
              className={`nav-item ${activeTab === 'shifts' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('shifts') }}
            >
              📅 Shifts
            </a>
            {(user?.role === 'admin') && (
              <a
                href="#"
                className={`nav-item ${activeTab === 'site' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('site') }}
              >
                ⚙️ Site Settings
              </a>
            )}
          </div>

          {(user?.role === 'admin') && (
            <div className="nav-section">
              <div className="nav-section-title">ADMIN</div>
              <a
                href="#"
                className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('users') }}
              >
                👥 User Management
              </a>
            </div>
          )}

          {(user?.role === 'admin') && (
            <div className="nav-section">
              <div className="nav-section-title">SECURITY</div>
              <a
                href="#"
                className={`nav-item ${activeTab === 'tokens' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('tokens') }}
              >
                🔑 API Tokens
              </a>
              <a
                href="#"
                className={`nav-item ${activeTab === 'server-tokens' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('server-tokens') }}
              >
                🖥️ Server Tokens
              </a>
              <a
                href="#"
                className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('password') }}
              >
                🔒 Password
              </a>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">Dashboard</div>
          <div className="user-info">
            <span>Welcome, {user.username}</span>
            <button className="btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="tab-content">
          {activeTab === 'overview' && site && (
              <div className="page">
                <div className="page-header">
                  <h2>Dashboard Overview</h2>
                  <p>Monitor your Shadow Construction operations</p>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-value">{site.stats.members}</div>
                      <div className="stat-label">Members</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🎮</div>
                    <div className="stat-content">
                      <div className="stat-value">{site.stats.sessions}</div>
                      <div className="stat-label">Sessions</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-content">
                      <div className="stat-value">{site.stats.discord}</div>
                      <div className="stat-label">Discord</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                      <div className="stat-value">{site.stats.rank}</div>
                      <div className="stat-label">Rank</div>
                    </div>
                  </div>
                </div>

                <div className="overview-section">
                  <h3>Site Status</h3>
                  <div className="status-grid">
                    <div className="status-item">
                      <span className="status-label">Group Status:</span>
                      <span className="status-value">{site.status.group}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Sessions:</span>
                      <span className="status-value">{site.status.sessions}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Applications:</span>
                      <span className="status-value">{site.status.applications}</span>
                    </div>
                  </div>
                </div>

                <div className="overview-section">
                  <h3>Fleet Summary</h3>
                  <div className="fleet-summary">
                    <div className="summary-item">
                      <div className="summary-value">{vehicles.length}</div>
                      <div className="summary-label">Vehicles</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-value">{totalSlots}</div>
                      <div className="summary-label">Livery Slots</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fleet' && (
              <div className="page">
                <div className="page-header">
                  <h2>Fleet Management</h2>
                  <p>Manage your vehicle fleet and livery configurations</p>
                </div>

                <div className="fleet-overview">
                  <div className="overview-card">
                    <div className="card-icon">🚛</div>
                    <div className="card-content">
                      <div className="card-value">{vehicles.length}</div>
                      <div className="card-label">Total Vehicles</div>
                    </div>
                  </div>
                  <div className="overview-card">
                    <div className="card-icon">🎨</div>
                    <div className="card-content">
                      <div className="card-value">{totalSlots}</div>
                      <div className="card-label">Livery Slots</div>
                    </div>
                  </div>
                </div>

                <div className="fleet-list">
                  <h3>Vehicle Inventory</h3>
                  <div className="vehicle-grid">
                    {vehicles.map((v) => {
                      const liveries = typeof v.liveries === 'string' ? JSON.parse(v.liveries) : v.liveries
                      return (
                        <div key={v.id} className="vehicle-item">
                          <div className="vehicle-header">
                            <h4>{v.name}</h4>
                            <span className="vehicle-year">{v.year}</span>
                          </div>
                          <div className="vehicle-meta">
                            <span className="meta-item">{liveries.length} livery slots</span>
                            {v.variant && <span className="meta-item">{v.variant}</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="page">
                <div className="page-header">
                  <h2>Change Password</h2>
                  <p>Update your account password</p>
                </div>

                <div className="form-container">
                  <form onSubmit={handlePasswordChange} className="settings-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <button type="submit" className="primary-btn">Update Password</button>
                  </form>
                  {passwordMessage && (
                    <div className={`message ${passwordMessage.includes('success') ? 'success' : 'error'}`}>
                      {passwordMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="tab-content">
                <div className="content-header">
                  <h1>Change Password</h1>
                  <p>Update your account password</p>
                </div>

                <div className="settings-form">
                  <div className="form-section">
                    <div className="form-group">
                      <label htmlFor="current-password">Current Password</label>
                      <input
                        id="current-password"
                        type="password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-password">New Password</label>
                      <input
                        id="new-password"
                        type="password"
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" onClick={handlePasswordChange}>
                      Update Password
                    </button>
                  </div>
                </div>

                {passwordMessage && (
                  <div className={`message ${passwordMessage.includes('success') ? 'success' : 'error'}`}>
                    {passwordMessage}
                  </div>
                )}
              </div>
            )}

      {activeTab === 'site' && siteData && (
        <div className="tab-content">
          <div className="content-header">
            <h1>Site Settings</h1>
            <p>Manage your site's configuration and statistics</p>
          </div>

          <div className="settings-form">
            <div className="form-section">
              <h2>Status Configuration</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="site-group">Group</label>
                  <input
                    id="site-group"
                    type="text"
                    value={siteData.status.group}
                    onChange={(e) => setSiteData({
                      ...siteData,
                      status: {...siteData.status, group: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="site-sessions">Sessions</label>
                  <input
                    id="site-sessions"
                    type="text"
                    value={siteData.status.sessions}
                    onChange={(e) => setSiteData({
                      ...siteData,
                      status: {...siteData.status, sessions: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="site-applications">Applications</label>
                  <input
                    id="site-applications"
                    type="text"
                    value={siteData.status.applications}
                    onChange={(e) => setSiteData({
                      ...siteData,
                      status: {...siteData.status, applications: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Statistics</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="site-members">Members</label>
                  <input
                    id="site-members"
                    type="text"
                    value={siteData.stats.members}
                    onChange={(e) => setSiteData({
                      ...siteData,
                      stats: {...siteData.stats, members: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="site-stats-sessions">Sessions</label>
                  <input
                    id="site-stats-sessions"
                    type="text"
                    value={siteData.stats.sessions}
                    onChange={(e) => setSiteData({
                      ...siteData,
                      stats: {...siteData.stats, sessions: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="site-discord">Discord</label>
                  <input
                    id="site-discord"
                    type="text"
                    value={siteData.stats.discord}
                    onChange={(e) => setSiteData({
                      ...siteData,
                      stats: {...siteData.stats, discord: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="site-rank">Rank</label>
                  <input
                    id="site-rank"
                    type="text"
                    value={siteData.stats.rank}
                    onChange={(e) => setSiteData({
                      ...siteData,
                      stats: {...siteData.stats, rank: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" onClick={handleSiteUpdate}>
                Update Site Settings
              </button>
            </div>
          </div>

          {siteMessage && (
            <div className={`message ${siteMessage.includes('success') ? 'success' : 'error'}`}>
              {siteMessage}
            </div>
          )}
        </div>
      )}

      {activeTab === 'wiki' && wikiData && (
        <div className="tab-content">
          <div className="content-header">
            <h1>Wiki Editor</h1>
            <p>Create and manage your wiki pages</p>
          </div>

          <div className="wiki-editor">
            <div className="form-section">
              <h2>Page Management</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="wiki-page-select">Select Page</label>
                  <select
                    id="wiki-page-select"
                    value={selectedWikiPage}
                    onChange={(e) => setSelectedWikiPage(e.target.value)}
                  >
                    {wikiData.pages.map((page) => (
                      <option key={page.id} value={page.id}>{page.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="wiki-page-title">Page Title</label>
                  <input
                    id="wiki-page-title"
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
              </div>
            </div>

            <div className="form-section">
              <h2>Content</h2>
              <div className="form-group">
                <label htmlFor="wiki-content">Content (Markdown)</label>
                <textarea
                  id="wiki-content"
                  value={wikiData.pages.find(p => p.id === selectedWikiPage)?.content || ''}
                  onChange={(e) => {
                    const newPages = wikiData.pages.map(p =>
                      p.id === selectedWikiPage ? { ...p, content: e.target.value } : p
                    )
                    setWikiData({ ...wikiData, pages: newPages })
                  }}
                  rows={20}
                  className="code-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <div className="action-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    const newId = `page-${Date.now()}`
                    const newPage = { id: newId, title: 'New Page', content: '# New Page\n\nContent here.' }
                    setWikiData({ ...wikiData, pages: [...wikiData.pages, newPage] })
                    setSelectedWikiPage(newId)
                  }}
                >
                  Add Page
                </button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    if (wikiData.pages.length > 1) {
                      const newPages = wikiData.pages.filter(p => p.id !== selectedWikiPage)
                      setWikiData({ ...wikiData, pages: newPages })
                      setSelectedWikiPage(newPages[0].id)
                    }
                  }}
                  disabled={wikiData.pages.length <= 1}
                >
                  Remove Page
                </button>
              </div>
              <button type="submit" className="btn-primary" onClick={handleWikiUpdate}>
                Update Wiki
              </button>
            </div>
          </div>

          {wikiMessage && (
            <div className={`message ${wikiMessage.includes('success') ? 'success' : 'error'}`}>
              {wikiMessage}
            </div>
          )}
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
              {(typeof vehicle.liveries === 'string' ? JSON.parse(vehicle.liveries) : vehicle.liveries).map((livery: any, liveryIndex: number) => (
                <div key={liveryIndex} className="livery-item">
                  <input
                    type="text"
                    placeholder="Slot"
                    value={livery.slot}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      const liveries = typeof newVehicles[vehicleIndex].liveries === 'string' ? JSON.parse(newVehicles[vehicleIndex].liveries) : newVehicles[vehicleIndex].liveries;
                      liveries[liveryIndex].slot = e.target.value;
                      newVehicles[vehicleIndex].liveries = liveries;
                      setVehiclesData(newVehicles);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="ID"
                    value={livery.id}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      const liveries = typeof newVehicles[vehicleIndex].liveries === 'string' ? JSON.parse(newVehicles[vehicleIndex].liveries) : newVehicles[vehicleIndex].liveries;
                      liveries[liveryIndex].id = e.target.value;
                      newVehicles[vehicleIndex].liveries = liveries;
                      setVehiclesData(newVehicles);
                    }}
                  />
                  <button className="remove-btn" onClick={() => {
                    const newVehicles = [...vehiclesData];
                    const liveries = typeof newVehicles[vehicleIndex].liveries === 'string' ? JSON.parse(newVehicles[vehicleIndex].liveries) : newVehicles[vehicleIndex].liveries;
                    liveries.splice(liveryIndex, 1);
                    newVehicles[vehicleIndex].liveries = liveries;
                    setVehiclesData(newVehicles);
                  }}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={() => {
                const newVehicles = [...vehiclesData];
                const liveries = typeof newVehicles[vehicleIndex].liveries === 'string' ? JSON.parse(newVehicles[vehicleIndex].liveries) : newVehicles[vehicleIndex].liveries;
                liveries.push({ slot: 'New Slot', id: '' });
                newVehicles[vehicleIndex].liveries = liveries;
                setVehiclesData(newVehicles);
              }}>Add Livery</button>
              <h4>Colors</h4>
              {(typeof vehicle.colors === 'string' ? JSON.parse(vehicle.colors) : vehicle.colors).map((color: any, colorIndex: number) => (
                <div key={colorIndex} className="color-item">
                  <input
                    type="text"
                    placeholder="Role"
                    value={color.role}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      const colors = typeof newVehicles[vehicleIndex].colors === 'string' ? JSON.parse(newVehicles[vehicleIndex].colors) : newVehicles[vehicleIndex].colors;
                      colors[colorIndex].role = e.target.value;
                      newVehicles[vehicleIndex].colors = colors;
                      setVehiclesData(newVehicles);
                    }}
                  />
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => {
                      const newVehicles = [...vehiclesData];
                      const colors = typeof newVehicles[vehicleIndex].colors === 'string' ? JSON.parse(newVehicles[vehicleIndex].colors) : newVehicles[vehicleIndex].colors;
                      colors[colorIndex].hex = e.target.value;
                      newVehicles[vehicleIndex].colors = colors;
                      setVehiclesData(newVehicles);
                    }}
                  />
                  <button className="remove-btn" onClick={() => {
                    const newVehicles = [...vehiclesData];
                    const colors = typeof newVehicles[vehicleIndex].colors === 'string' ? JSON.parse(newVehicles[vehicleIndex].colors) : newVehicles[vehicleIndex].colors;
                    colors.splice(colorIndex, 1);
                    newVehicles[vehicleIndex].colors = colors;
                    setVehiclesData(newVehicles);
                  }}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={() => {
                const newVehicles = [...vehiclesData];
                const colors = typeof newVehicles[vehicleIndex].colors === 'string' ? JSON.parse(newVehicles[vehicleIndex].colors) : newVehicles[vehicleIndex].colors;
                colors.push({ role: 'New Role', hex: '#000000' });
                newVehicles[vehicleIndex].colors = colors;
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
          <div className="content-header">
            <h1>API Tokens</h1>
            <p>Manage your API token configuration</p>
          </div>

          <div className="settings-form">
            <div className="form-section">
              <h2>Token Configuration</h2>
              <div className="form-group">
                <label htmlFor="tokens-json">Tokens Data (JSON)</label>
                <textarea
                  id="tokens-json"
                  value={JSON.stringify(tokensData, null, 2)}
                  onChange={(e) => {
                    try {
                      setTokensData(JSON.parse(e.target.value))
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={10}
                  className="code-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" onClick={handleTokensUpdate}>
                Update Tokens
              </button>
            </div>
          </div>

          {tokensMessage && (
            <div className={`message ${tokensMessage.includes('success') ? 'success' : 'error'}`}>
              {tokensMessage}
            </div>
          )}
        </div>
      )}

      {activeTab === 'server-tokens' && tokens && (
        <div className="tab-content">
          <div className="content-header">
            <h1>Server Tokens</h1>
            <p>Manage active server tokens for API access</p>
          </div>

          <div className="tokens-section">
            <div className="tokens-grid">
              {tokens.filter((t: Token) => t.type === 'server').map((token: Token) => (
                <div key={token.id} className="token-card">
                  <div className="token-header">
                    <div className="token-value">
                      <code>{token.token}</code>
                    </div>
                    <button
                      className="btn-danger btn-small"
                      onClick={async () => {
                        if (confirm('Are you sure you want to revoke this token?')) {
                          try {
                            await fetch('/api/tokens', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(tokens.filter((t: Token) => t.id !== token.id))
                            })
                            // Refresh tokens
                            const res = await fetch('/api/tokens')
                            const newTokens = await res.json()
                            setTokens(newTokens)
                            setTokensData(newTokens)
                          } catch (error) {
                            console.error('Error revoking token:', error)
                          }
                        }
                      }}
                    >
                      Revoke
                    </button>
                  </div>
                  <div className="token-details">
                    <div className="token-detail">
                      <span className="label">Created:</span>
                      <span>{new Date(token.created_at).toLocaleString()}</span>
                    </div>
                    <div className="token-detail">
                      <span className="label">Expires:</span>
                      <span>{token.expires_at ? new Date(token.expires_at).toLocaleString() : 'Never'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {tokens.filter((t: Token) => t.type === 'server').length === 0 && (
              <div className="empty-state">
                <p>No server tokens found. Generate your first token to get started.</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  const res = await fetch('/api/server-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serverId: 'server-' + Date.now(), secret: 'temp-secret' })
                  })
                  const data = await res.json()
                  if (res.ok) {
                    alert(`New server token generated: ${data.token}`)
                    // Refresh tokens
                    const tokensRes = await fetch('/api/tokens')
                    const newTokens = await tokensRes.json()
                    setTokens(newTokens)
                    setTokensData(newTokens)
                  } else {
                    alert('Failed to generate token: ' + data.error)
                  }
                } catch (error) {
                  console.error('Error generating token:', error)
                  alert('Failed to generate token')
                }
              }}
            >
              Generate New Server Token
            </button>
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="tab-content">
          <div className="content-header">
            <h1>Shift Management</h1>
            <p>Manage your moderation shifts and track activity</p>
          </div>

          {/* Current Shift Status */}
          <div className="shift-status-panel">
            <div className="current-shift-info">
              <div className="shift-user">
                <div className="user-avatar">
                  <span>{user?.username?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="user-details">
                  <div className="user-name">{user?.username}</div>
                  <div className="user-role">{user?.role}</div>
                </div>
              </div>

              <div className="shift-controls">
                {!currentShift && (
                  <button className="btn-primary shift-btn" onClick={handleStartShift}>
                    Start Shift
                  </button>
                )}

                {currentShift && currentShift.status === 'active' && (
                  <>
                    <button className="btn-secondary shift-btn" onClick={handleStartBreak}>
                      Start Break
                    </button>
                    <button className="btn-danger shift-btn" onClick={handleEndShift}>
                      End Shift
                    </button>
                  </>
                )}

                {currentShift && currentShift.status === 'on_break' && (
                  <button className="btn-success shift-btn" onClick={handleEndBreak}>
                    End Break
                  </button>
                )}
              </div>
            </div>

            {currentShift && (
              <div className="shift-timer">
                <div className="timer-display">
                  <div className="timer-label">
                    {currentShift.status === 'on_break' ? 'On Break' : 'Shift Active'}
                  </div>
                  <div className="timer-value">
                    {(() => {
                      const start = new Date(currentShift.startTime!)
                      const now = new Date()
                      const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60)

                      // Subtract break time
                      const breakTime = currentShift.breaks.reduce((total, breakItem) => {
                        if (breakItem.endTime) {
                          return total + breakItem.duration
                        } else if (currentBreak) {
                          // Current break in progress
                          const currentBreakDuration = Math.floor((now.getTime() - new Date(currentBreak.startTime).getTime()) / 1000 / 60)
                          return total + currentBreakDuration
                        }
                        return total
                      }, 0)

                      const activeMinutes = diff - breakTime
                      const hours = Math.floor(activeMinutes / 60)
                      const minutes = activeMinutes % 60
                      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Shifts */}
          <div className="active-shifts-section">
            <h2>Active Shifts</h2>
            <div className="active-shifts-grid">
              {shiftsData
                .filter(shift => shift.status === 'active' || shift.status === 'on_break')
                .map(shift => (
                  <div key={shift.id} className="active-shift-card">
                    <div className="shift-user-info">
                      <div className="user-avatar">
                        <span>{shift.employee.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="user-details">
                        <div className="user-name">{shift.employee}</div>
                        <div className={`shift-status ${shift.status}`}>
                          {shift.status === 'on_break' ? 'On Break' : 'Active'}
                        </div>
                      </div>
                    </div>

                    <div className="shift-time">
                      Started: {new Date(shift.startTime!).toLocaleTimeString()}
                    </div>

                    {(user?.role === 'admin' || user?.role === 'manager') && shift.employee !== user?.username && (
                      <button
                        className="btn-danger btn-small"
                        onClick={() => handleForceEndShift(shift.id)}
                      >
                        Force End
                      </button>
                    )}
                  </div>
                ))}

              {shiftsData.filter(shift => shift.status === 'active' || shift.status === 'on_break').length === 0 && (
                <div className="no-active-shifts">
                  <p>No active shifts</p>
                </div>
              )}
            </div>
          </div>

          {/* Shift History */}
          <div className="shift-history-section">
            <h2>Shift History</h2>
            <div className="shift-history-controls">
              <select className="period-select">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="shift-history-grid">
              {shiftsData
                .filter(shift => shift.status === 'completed')
                .sort((a, b) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime())
                .map(shift => (
                  <div key={shift.id} className="shift-history-card">
                    <div className="shift-summary">
                      <div className="shift-employee">{shift.employee}</div>
                      <div className="shift-duration">
                        {Math.floor(shift.totalDuration / 60)}h {shift.totalDuration % 60}m
                      </div>
                      <div className="shift-date">
                        {new Date(shift.startTime!).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="shift-stats">
                      <div className="stat-item">
                        <span className="stat-label">Warnings:</span>
                        <span className="stat-value">{shift.moderationStats.warnings}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Kicks:</span>
                        <span className="stat-value">{shift.moderationStats.kicks}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Bans:</span>
                        <span className="stat-value">{shift.moderationStats.bans}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Modcalls:</span>
                        <span className="stat-value">{shift.moderationStats.modcalls}</span>
                      </div>
                    </div>

                    <div className="shift-breaks">
                      {shift.breaks.length > 0 && (
                        <div className="breaks-summary">
                          Breaks: {shift.breaks.length} ({shift.breaks.reduce((total, b) => total + b.duration, 0)}m total)
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {shiftsData.filter(shift => shift.status === 'completed').length === 0 && (
                <div className="no-history">
                  <p>No completed shifts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && allUsers && (
        <div className="tab-content">
          <div className="content-header">
            <h1>User Management</h1>
            <p>Create and manage staff accounts with role-based permissions</p>
          </div>

          <div className="user-management-section">
            {/* Add New User Form */}
            <div className="add-user-form">
              <h2>Add New User</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="new-username">Username</label>
                  <input
                    id="new-username"
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Enter username"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-password">Password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-role">Role</label>
                  <select
                    id="new-role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                  >
                    <option value="employee">Employee</option>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleCreateUser(newUser.username, newUser.password, newUser.role)}
                  disabled={!newUser.username || !newUser.password}
                >
                  Create User
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="users-list">
              <h2>Current Users ({allUsers.length})</h2>
              <div className="users-grid">
                {allUsers.map((userItem) => (
                  <div key={userItem.username} className="user-card">
                    <div className="user-header">
                      <div className="user-info">
                        <div className="user-name">{userItem.username}</div>
                        <div className={`user-role role-${userItem.role}`}>
                          {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                        </div>
                      </div>
                      <div className="user-actions">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleUpdateUserRole(userItem.username, e.target.value as UserRole)}
                          className="role-select"
                        >
                          <option value="employee">Employee</option>
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleDeleteUser(userItem.username)}
                          disabled={userItem.username === user?.username}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="user-details">
                      <div className="user-detail">
                        <span className="label">Created:</span>
                        <span>{userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                      <div className="user-detail">
                        <span className="label">Last Login:</span>
                        <span>{userItem.last_login ? new Date(userItem.last_login).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                    <div className="role-permissions">
                      <div className="permissions-title">Permissions:</div>
                      <div className="permissions-list">
                        {userItem.role === 'admin' && (
                          <>
                            <span key="admin-full" className="permission-tag">Full Access</span>
                            <span key="admin-users" className="permission-tag">User Management</span>
                            <span key="admin-system" className="permission-tag">System Settings</span>
                          </>
                        )}
                        {userItem.role === 'manager' && (
                          <>
                            <span key="manager-shifts" className="permission-tag">Shift Management</span>
                            <span key="manager-team" className="permission-tag">Team Monitoring</span>
                            <span key="manager-reports" className="permission-tag">Reports</span>
                          </>
                        )}
                        {userItem.role === 'staff' && (
                          <>
                            <span key="staff-clock" className="permission-tag">Shift Clock</span>
                            <span key="staff-break" className="permission-tag">Break Management</span>
                            <span key="staff-reports" className="permission-tag">Basic Reports</span>
                          </>
                        )}
                        {userItem.role === 'employee' && (
                          <>
                            <span key="employee-clock" className="permission-tag">Shift Clock</span>
                            <span key="employee-basic" className="permission-tag">Basic Access</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {usersMessage && (
            <div className={`message ${usersMessage.includes('success') ? 'success' : 'error'}`}>
              {usersMessage}
            </div>
          )}
        </div>
      )}

        </div>
      </main>
    </div>
  )
}