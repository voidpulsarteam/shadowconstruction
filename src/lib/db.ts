import fs from 'fs'
import path from 'path'
import vm from 'vm'
import sqlite3 from 'sqlite3'
import bcrypt from 'bcryptjs'

const dbPath = path.join(process.cwd(), 'data', 'app.db')
const DEFAULT_PASSWORD = 'Password123!'

let db: sqlite3.Database | null = null
let initialized = false
let initializationPromise: Promise<void> | null = null

function escapeSql(value: string) {
  return value.replace(/'/g, "''")
}

function getDatabaseConnection(): sqlite3.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    db = new sqlite3.Database(dbPath)
  }
  return db
}

export async function initializeDatabase() {
  if (initialized) {
    return
  }

  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = new Promise<void>((resolve, reject) => {
    const connection = getDatabaseConnection()

    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        role TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        expires_at TEXT,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        year TEXT,
        variant TEXT,
        liveries TEXT,
        colors TEXT
      );
      CREATE TABLE IF NOT EXISTS wiki_pages (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT
      );
      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY,
        employee TEXT,
        startTime TEXT,
        endTime TEXT,
        breaks TEXT,
        status TEXT,
        totalDuration INTEGER,
        moderationStats TEXT
      );
    `

    connection.exec(schema, (schemaError) => {
      if (schemaError) {
        reject(schemaError)
        return
      }

      connection.all('PRAGMA table_info(tokens)', (pragmaError, columns: Array<{ name: string }>) => {
        if (pragmaError) {
          reject(pragmaError)
          return
        }

        const hasCreatedAt = columns.some((column) => column.name === 'created_at')
        if (!hasCreatedAt) {
          connection.exec('ALTER TABLE tokens ADD COLUMN created_at TEXT', (alterError) => {
            if (alterError) {
              reject(alterError)
              return
            }
            seedData(connection, resolve, reject)
          })
          return
        }

        seedData(connection, resolve, reject)
      })
    })

    function seedData(connection: sqlite3.Database, resolve: () => void, reject: (reason?: unknown) => void) {
      try {
        const usersFilePath = path.join(process.cwd(), 'data', 'users.json')
        const siteFilePath = path.join(process.cwd(), 'data', 'site.json')
        const shiftsFilePath = path.join(process.cwd(), 'data', 'shifts.json')
        const tokensFilePath = path.join(process.cwd(), 'data', 'tokens.json')
        const wikiFilePath = path.join(process.cwd(), 'data', 'wiki.json')
        const vehiclesFilePath = path.join(process.cwd(), 'data', 'vehicles.js')

        const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8')) as Array<{ username: string; passwordHash: string; role: string }>
        const siteData = JSON.parse(fs.readFileSync(siteFilePath, 'utf8'))
        const shiftsData = JSON.parse(fs.readFileSync(shiftsFilePath, 'utf8'))
        const tokensData = JSON.parse(fs.readFileSync(tokensFilePath, 'utf8'))
        const wikiData = JSON.parse(fs.readFileSync(wikiFilePath, 'utf8'))
        const vehiclesText = fs.readFileSync(vehiclesFilePath, 'utf8')
        const vehiclesSandbox: { module: { exports: unknown }; exports: unknown } = { module: { exports: undefined }, exports: undefined }
        vm.runInNewContext(vehiclesText, vehiclesSandbox, { filename: vehiclesFilePath })
        const vehiclesData = Array.isArray(vehiclesSandbox.module.exports)
          ? vehiclesSandbox.module.exports as Array<any>
          : Array.isArray(vehiclesSandbox.exports)
            ? vehiclesSandbox.exports as Array<any>
            : []

        const seedStatements = [
          `DELETE FROM tokens;`,
          `DELETE FROM site_settings;`,
          `DELETE FROM vehicles;`,
          `DELETE FROM wiki_pages;`,
          `DELETE FROM shifts;`,
          ...usersData.map((user) => {
            const safeUsername = escapeSql(user.username)
            const safeRole = escapeSql(user.role)
            const safeHash = escapeSql(user.passwordHash)
            return `INSERT INTO users (username, passwordHash, role) VALUES ('${safeUsername}', '${safeHash}', '${safeRole}') ON CONFLICT(username) DO UPDATE SET passwordHash = excluded.passwordHash, role = excluded.role;`
          }),
          `INSERT INTO site_settings (id, data) VALUES ('main', '${escapeSql(JSON.stringify(siteData))}');`,
          ...shiftsData.map((shift: any) => {
            const safeId = escapeSql(shift.id)
            const safeEmployee = escapeSql(shift.employee)
            const safeStartTime = escapeSql(shift.startTime)
            const safeEndTime = escapeSql(shift.endTime)
            const safeBreaks = escapeSql(JSON.stringify(shift.breaks))
            const safeStatus = escapeSql(shift.status)
            const safeModerationStats = escapeSql(JSON.stringify(shift.moderationStats))
            return `INSERT INTO shifts (id, employee, startTime, endTime, breaks, status, totalDuration, moderationStats) VALUES ('${safeId}', '${safeEmployee}', '${safeStartTime}', '${safeEndTime}', '${safeBreaks}', '${safeStatus}', ${shift.totalDuration ?? 0}, '${safeModerationStats}') ON CONFLICT(id) DO UPDATE SET employee = excluded.employee, startTime = excluded.startTime, endTime = excluded.endTime, breaks = excluded.breaks, status = excluded.status, totalDuration = excluded.totalDuration, moderationStats = excluded.moderationStats;`
          }),
          ...tokensData.map((token: any) => {
            const safeToken = escapeSql(token.token)
            const safeType = escapeSql(token.type)
            const safeExpiresAt = escapeSql(token.expires_at)
            return `INSERT INTO tokens (token, type, expires_at, created_at) VALUES ('${safeToken}', '${safeType}', '${safeExpiresAt}', '${new Date().toISOString()}') ON CONFLICT(token) DO UPDATE SET type = excluded.type, expires_at = excluded.expires_at, created_at = COALESCE(excluded.created_at, tokens.created_at);`
          }),
          ...wikiData.pages.map((page: any) => {
            const safeId = escapeSql(page.id)
            const safeTitle = escapeSql(page.title)
            const safeContent = escapeSql(page.content)
            return `INSERT INTO wiki_pages (id, title, content) VALUES ('${safeId}', '${safeTitle}', '${safeContent}') ON CONFLICT(id) DO UPDATE SET title = excluded.title, content = excluded.content;`
          }),
          ...vehiclesData.map((vehicle: any) => {
            const safeName = escapeSql(vehicle.name)
            const safeYear = escapeSql(vehicle.year ?? '')
            const safeVariant = escapeSql(vehicle.variant ?? '')
            const safeLiveries = escapeSql(JSON.stringify(vehicle.liveries || []))
            const safeColors = escapeSql(JSON.stringify(vehicle.colors || []))
            return `INSERT INTO vehicles (name, year, variant, liveries, colors) VALUES ('${safeName}', '${safeYear}', '${safeVariant}', '${safeLiveries}', '${safeColors}');`
          })
        ].join('\n')

        connection.exec(seedStatements, (seedError) => {
          if (seedError) {
            reject(seedError)
            return
          }

          initialized = true
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    }
  })

  return initializationPromise
}

void initializeDatabase()

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  await initializeDatabase()

  const connection = getDatabaseConnection()
  return new Promise<any[]>((resolve, reject) => {
    connection.all(sql, params, (error, rows) => {
      if (error) {
        reject(error)
        return
      }
      resolve(rows as any[])
    })
  })
}

export async function closePool() {
  if (db) {
    await new Promise<void>((resolve, reject) => {
      db?.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })
    db = null
    initialized = false
    initializationPromise = null
  }
}