import { query } from './db'
import { NextRequest } from 'next/server'

export async function authenticateServer(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    const tokens = await query('SELECT * FROM tokens WHERE token = ? AND (expires_at IS NULL OR expires_at > NOW())', [token])
    return tokens.length > 0
  } catch (error) {
    console.error('Token authentication error:', error)
    return false
  }
}

export async function authenticateUser(request: NextRequest): Promise<any | null> {
  const userCookie = request.cookies.get('user')?.value

  if (!userCookie) {
    return null
  }

  try {
    const user = JSON.parse(userCookie)
    // Verify user exists in database
    const users = await query('SELECT * FROM users WHERE username = ?', [user.username])
    return users.length > 0 ? user : null
  } catch {
    return null
  }
}