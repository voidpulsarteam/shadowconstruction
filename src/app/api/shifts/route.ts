import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const shiftsFilePath = path.join(process.cwd(), 'data', 'shifts.json')

export async function GET() {
  try {
    const shiftsData = fs.readFileSync(shiftsFilePath, 'utf8')
    const shifts = JSON.parse(shiftsData)
    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return NextResponse.json({ error: 'Failed to load shifts data' }, { status: 500 })
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

    // Allow admin, manager, and staff to manage shifts
    if (!['admin', 'manager', 'staff'].includes(user.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const updates = await request.json()

    // Write shifts data to file
    fs.writeFileSync(shiftsFilePath, JSON.stringify(updates, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating shifts:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}