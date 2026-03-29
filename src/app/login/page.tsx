'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    let data
    try {
      data = await res.json()
    } catch {
      data = { error: 'Server error' }
    }
    if (res.ok && data.success) {
      router.push('/dashboard')
    } else {
      setError(data.error || 'Login failed')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0c0e0f', color: '#edeae3' }}>
      <form onSubmit={handleSubmit} style={{ background: '#1a1d1f', padding: '40px', borderRadius: '8px', border: '1px solid #2a2d30' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        {error && <p style={{ color: '#d94f2b', textAlign: 'center' }}>{error}</p>}
        <div style={{ marginBottom: '15px' }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', background: '#131618', border: '1px solid #2a2d30', color: '#edeae3' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', background: '#131618', border: '1px solid #2a2d30', color: '#edeae3' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#f5c400', color: '#0c0e0f', border: 'none', cursor: 'pointer' }}>Login</button>
      </form>
    </div>
  )
}