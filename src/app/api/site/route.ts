import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const sitePath = path.join(process.cwd(), 'data/site.json')
const usersPath = path.join(process.cwd(), 'data/users.json')

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersPath, 'utf8'))
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'))
    return NextResponse.json(site)
  } catch {
    return NextResponse.json({ error: 'Failed to load site data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await request.cookies
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const users = readUsers()
    const user = users.find((u: any) => u.session === sessionCookie)

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const updates = await request.json()
    const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'))

    // Update site data
    if (updates.status) {
      site.status = { ...site.status, ...updates.status }
    }
    if (updates.stats) {
      site.stats = { ...site.stats, ...updates.stats }
    }

    fs.writeFileSync(sitePath, JSON.stringify(site, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}