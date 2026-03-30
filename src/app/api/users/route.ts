import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

export async function GET() {
  try {
    const usersData = fs.readFileSync(usersFilePath, 'utf8')
    const users = JSON.parse(usersData)
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to load users data' }, { status: 500 })
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

    const { action, username, password, role, targetUsername, userId } = await request.json()

    // Read current users
    const usersData = fs.readFileSync(usersFilePath, 'utf8')
    let users = JSON.parse(usersData)

    if (action === 'create') {
      // Check if user already exists
      if (users.find((u: any) => u.username === username)) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Add new user
      users.push({
        username,
        passwordHash: hashedPassword,
        role
      })

    } else if (action === 'update') {
      // Update user role - can use either username or userId
      let userIndex = -1;
      if (targetUsername) {
        userIndex = users.findIndex((u: any) => u.username === targetUsername)
      } else if (userId) {
        // For now, assume userId is the username (since we don't have actual IDs)
        userIndex = users.findIndex((u: any) => u.username === userId)
      }

      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      users[userIndex].role = role

    } else if (action === 'delete') {
      // Remove user (don't allow deleting self or last admin)
      let targetUser;
      if (targetUsername) {
        targetUser = users.find((u: any) => u.username === targetUsername)
      } else if (userId) {
        targetUser = users.find((u: any) => u.username === userId)
      }

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (targetUser.username === user.username) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
      }

      const adminCount = users.filter((u: any) => u.role === 'admin').length

      if (targetUser.role === 'admin' && adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last admin account' }, { status: 400 })
      }

      users = users.filter((u: any) => u.username !== targetUser.username)
    }

    // Write updated users
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating users:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}