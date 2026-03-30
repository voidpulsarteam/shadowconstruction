import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/db'

export async function GET() {
  try {
    const tokens = await query('SELECT * FROM tokens ORDER BY created_at DESC')
    return NextResponse.json(tokens)
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json({ error: 'Failed to load tokens' }, { status: 500 })
  }
}

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

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const updates = await request.json()

    // Clear existing tokens and insert new ones
    await query('DELETE FROM tokens')
    for (const token of updates) {
      await query(
        'INSERT INTO tokens (token, type, expires_at) VALUES (?, ?, ?)',
        [token.token, token.type, token.expires_at]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating tokens:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}