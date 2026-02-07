import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
config()

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  await sql`DELETE FROM publicaciones`
  console.log("Publicaciones borradas")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
