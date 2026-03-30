import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const { serverId, secret } = await request.json()

  if (!serverId || !secret) {
    return NextResponse.json({ error: 'Server ID and secret are required' }, { status: 400 })
  }

  try {
    // For now, we'll use a simple server authentication
    // In production, you'd have a servers table with serverId and hashed secrets
    // For this demo, accept any serverId/secret combination and generate a token

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex')

    // Store the token (in production, associate with serverId)
    await query(
      'INSERT INTO tokens (token, type, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [token, 'server']
    )

    return NextResponse.json({ token, expiresIn: '24 hours' })
  } catch (error) {
    console.error('Server login error:', error)
    return NextResponse.json({ error: 'Server authentication failed' }, { status: 500 })
  }
}