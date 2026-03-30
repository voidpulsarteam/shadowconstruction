import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/db'

export async function GET() {
  try {
    const settings = await query('SELECT * FROM site_settings WHERE id = ?', ['main'])
    if (settings.length === 0) {
      return NextResponse.json({ status: {}, stats: {} })
    }
    return NextResponse.json(JSON.parse(settings[0].data))
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ error: 'Failed to load site data' }, { status: 500 })
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

    // Get current site data
    const currentSettings = await query('SELECT * FROM site_settings WHERE id = ?', ['main'])
    let site = { status: {}, stats: {} }
    if (currentSettings.length > 0) {
      site = JSON.parse(currentSettings[0].data)
    }

    // Update site data
    if (updates.status) {
      site.status = { ...site.status, ...updates.status }
    }
    if (updates.stats) {
      site.stats = { ...site.stats, ...updates.stats }
    }

    // Save to database
    await query(
      'INSERT INTO site_settings (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data=?',
      ['main', JSON.stringify(site), JSON.stringify(site)]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}