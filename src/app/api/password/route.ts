import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user')?.value

    if (!userCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let user
    try {
      user = JSON.parse(userCookie)
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Get user from database
    const users = await query('SELECT * FROM users WHERE username = ?', [user.username])
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const dbUser = users[0]

    const isValid = bcrypt.compareSync(currentPassword, dbUser.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 })
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    await query('UPDATE users SET passwordHash = ? WHERE username = ?', [hashedPassword, user.username])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}