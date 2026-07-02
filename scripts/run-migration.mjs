import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'migrate-add-payment.sql'), 'utf8')

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined }
})

await client.connect()
console.log('Connected to DB')

try {
  await client.query(sql)
  console.log('✅ Migration applied successfully!')
} catch (err) {
  console.error('❌ Migration error:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
