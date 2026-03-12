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
