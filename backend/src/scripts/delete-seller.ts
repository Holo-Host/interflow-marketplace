import { Modules } from "@medusajs/framework/utils"
import { Client } from "pg"

export default async function run({ container }) {
  const userModule = container.resolve(Modules.USER)
  const authModule = container.resolve(Modules.AUTH)

  const email = "sir.rob@holo.host"
  console.log(`Starting deletion process for ${email}...`)

  // 1. Delete the User Profile
  const users = await userModule.listUsers({ email })
  if (users.length > 0) {
    await userModule.deleteUsers(users.map(u => u.id))
    console.log(`✅ Deleted Medusa User profile.`)
  }

  // 2. Delete the Auth Identity
  const identities = await authModule.listAuthIdentities()
  const idsToDelete = identities
    .filter(i => JSON.stringify(i).includes(email))
    .map(i => i.id)

  if (idsToDelete.length > 0) {
    await authModule.deleteAuthIdentities(idsToDelete)
    console.log(`✅ Deleted Auth Identity.`)
  }

  // 3. Delete MercurJS Custom Records via Direct Postgres Connection
  console.log(`Connecting directly to the database for MercurJS cleanup...`)
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for cloud databases like Northflank
  })
  
  try {
    await client.connect()
    
    await client.query(`DELETE FROM "seller" WHERE email = $1`, [email])
    console.log(`✅ Deleted MercurJS Seller record.`)
    
    await client.query(`DELETE FROM "request" WHERE email = $1`, [email])
    console.log(`✅ Deleted MercurJS Registration Request.`)
    
  } catch (e) {
    console.log(`⚠️ Note: SQL cleanup skipped or tables not found.`)
  } finally {
    await client.end()
  }

  console.log("🎉 Deletion complete! You should be able to register again.")
}
