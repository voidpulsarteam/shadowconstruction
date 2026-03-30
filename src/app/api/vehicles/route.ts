import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { authenticateServer, authenticateUser } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check if server token authentication
    const isServerAuthenticated = await authenticateServer(request)
    const user = await authenticateUser(request)

    if (!isServerAuthenticated && !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // If server authenticated, allow access
    // If user authenticated, check role for admin operations (but GET is read-only)
    const vehicles = await query('SELECT * FROM vehicles ORDER BY name')
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Failed to load vehicles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const updates = await request.json()

    // Clear existing vehicles and insert new ones
    await query('DELETE FROM vehicles')
    for (const vehicle of updates) {
      await query(
        'INSERT INTO vehicles (name, year, variant, liveries, colors) VALUES (?, ?, ?, ?, ?)',
        [vehicle.name, vehicle.year, vehicle.variant || '', JSON.stringify(vehicle.liveries), JSON.stringify(vehicle.colors)]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating vehicles:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}