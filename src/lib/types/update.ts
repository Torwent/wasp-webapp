import { unlink } from "fs/promises"
import { writeFile } from "fs/promises"
import { join } from "path"

const url =
	"https://db.waspscripts.com/api/v1/projects/default/types/typescript?included_schemas=public%2C%20storage"
const outputPath = join(__dirname, "supabase.ts")

console.log(outputPath)

try {
	await unlink(outputPath)
	console.log("Old types file deleted successfully")
} catch (err) {
	console.error("Error deleting old types file:", err)
}

try {
	const response = await fetch(url, {
		headers: {
			accept: "application/json",
			authorization:
				"Basic " +
				Buffer.from(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASS}`).toString(
					"base64"
				)
		}
	})

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`)
	}

	const json = await response.json()
	const tsCode = json.types
	await writeFile(outputPath, tsCode)

	console.log(`Types file updated!`)
} catch (err) {
	console.error("Error:", err)
}
