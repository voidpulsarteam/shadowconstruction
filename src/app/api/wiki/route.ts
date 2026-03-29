import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { cookies } from 'next/headers'

const wikiPath = path.join(process.cwd(), 'data/wiki.json')
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
    const wiki = JSON.parse(fs.readFileSync(wikiPath, 'utf8'))
    return NextResponse.json(wiki)
  } catch {
    return NextResponse.json({ error: 'Failed to load wiki data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
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
    fs.writeFileSync(wikiPath, JSON.stringify(updates, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}