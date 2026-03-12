import { Client } from "pg"
import { loadEnv } from "@medusajs/framework/utils"

export default async function run() {
  loadEnv(process.env.NODE_ENV || 'development', process.cwd())

  const email = "sir.rob@holo.host"
  console.log(`Hunting down the final request record for ${email}...`)
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    await client.connect()
    
    // This clever query searches EVERY column (even JSON data) for your email
    const reqDel = await client.query(`
      DELETE FROM "request" 
      WHERE id IN (
        SELECT id FROM "request" r WHERE r::text ILIKE $1
      )
    `, [`%${email}%`])
    
    console.log(`✅ Deleted ${reqDel.rowCount} leftover record(s) from the 'request' table.`)
    
  } catch (e: any) {
    console.error(`🔴 SQL Error: ${e.message}`)
  } finally {
    await client.end()
  }
}
