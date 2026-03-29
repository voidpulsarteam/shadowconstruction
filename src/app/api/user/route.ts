import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const userCookie = request.cookies.get('user')
  if (!userCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  try {
    const user = JSON.parse(userCookie.value)
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
}