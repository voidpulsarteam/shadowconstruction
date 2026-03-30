import mysql from 'mysql2/promise'

const dbConfig = {
  host: '109.123.245.229',
  port: 3306,
  user: 'u2_Dh91QN9xqo',
  password: 'i^ZBKn77^eok6Xjd4wCtoY^h',
  database: 's2_shadowconstruction',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const connection = await getPool().getConnection()
  try {
    const [rows] = await connection.execute(sql, params)
    return rows as any[]
  } finally {
    connection.release()
  }
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}