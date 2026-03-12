import { Client } from "pg"
import { loadEnv } from "@medusajs/framework/utils"

export default async function run() {
  loadEnv(process.env.NODE_ENV || 'development', process.cwd())

  const email = "sir.rob@holo.host"
  console.log(`Cleaning up MercurJS records for ${email}...`)
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    await client.connect()
    console.log(`✅ Connected to database.`)
    
    // 1. Delete the child records first to remove the Foreign Key constraint
    await client.query(`DELETE FROM "seller_onboarding" WHERE seller_id IN (SELECT id FROM "seller" WHERE email = $1)`, [email])
    console.log(`✅ Cleared 'seller_onboarding' constraints.`)

    // 2. Clear out any link tables just in case
    await client.query(`DELETE FROM "seller_seller_requests_request" WHERE seller_id IN (SELECT id FROM "seller" WHERE email = $1) OR request_id IN (SELECT id FROM "request" WHERE email = $1)`).catch(() => {})
    console.log(`✅ Cleared join table constraints.`)
    
    // 3. Now the database will allow us to delete the actual records!
    const sellerDel = await client.query(`DELETE FROM "seller" WHERE email = $1`, [email])
    console.log(`✅ Deleted ${sellerDel.rowCount} record(s) from 'seller' table.`)
    
    const reqDel = await client.query(`DELETE FROM "request" WHERE email = $1`, [email])
    console.log(`✅ Deleted ${reqDel.rowCount} record(s) from 'request' table.`)
    
  } catch (e: any) {
    console.error(`🔴 SQL Error: ${e.message}`)
  } finally {
    await client.end()
  }
}
