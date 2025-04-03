import type { SupabaseClient } from "@supabase/supabase-js"
import { encodeSEO } from "$lib/utils"
import type { ScripterProfile } from "$lib/types/collection"
import type { Database } from "$lib/types/supabase"
import { getPublishedScripts } from "$lib/server/scripts.server"
import { tutorialsPromise } from "$lib/server/tutorials.server"

const website = "https://waspscripts.com"

const getScripts = async () => {
	const scripts = await getPublishedScripts()

	const result: string[] = []
	scripts.forEach((script) => {
		result.push(
			`[${script.title} by ${script.protected.username}](${website + "/scripts/" + script.url}): ${script.description}`
		)
	})

	return result
}

const getTutorials = async () => {
	const tutorials = await tutorialsPromise
	const result: string[] = []
	tutorials.forEach((tutorial) => {
		result.push(
			`[${tutorial.title} by ${tutorial.username}](${website}/tutorials/${tutorial.url}): ${tutorial.description}`
		)
	})
	return result
}

const getScripters = async (supabase: SupabaseClient<Database>) => {
	const { data, error } = await supabase
		.schema("profiles")
		.from("scripters")
		.select("description, url, profiles (username)")
		.overrideTypes<ScripterProfile[]>()

	if (error) return console.error("developers SELECT failed: " + error.message)

	const result: string[] = []
	data.forEach((developer) =>
		result.push(
			`[${encodeSEO(developer.profiles.username)}](${website + "/scripters/" + encodeSEO(developer.url)})${developer.description ? ": " + developer.description : ""}`
		)
	)
	return result
}

const getLoc = async (supabase: SupabaseClient<Database>, loc: string) => {
	let data: string[] = []
	if (loc === "scripts") {
		data = (await getScripts()) as string[]
	} else if (loc === "tutorials") {
		data = (await getTutorials()) || []
	} else {
		data = (await getScripters(supabase)) || []
	}

	let result = ""
	data.forEach((el) => {
		result += `- ${el}\r\n`
	})

	return result
}

export const GET = async ({ locals: { supabaseServer } }) => {
	const promises = await Promise.all([
		getLoc(supabaseServer, "scripts"),
		getLoc(supabaseServer, "tutorials"),
		getLoc(supabaseServer, "developers")
	])
	const scripts = promises[0]
	const tutorials = promises[1]
	const scripters = promises[2]

	const headers = {
		"Cache-Control": "max-age=0, s-maxage=3600",
		"Content-Type": "text/markdown"
	}
	return new Response(
		`# WaspScripts

> WaspScripts is a OSRS (OldSchool RuneScape) botting platform built on top of Simba and SRL.

- Everything is open source, from Simba itself, to the libraries to the scripts.
- Extremely advanced computer vision systems, everything uses colour only to function.
- You can use your computer while botting and bot on multiple clients through remote input.

For setup instructions you visit the setup [page](${website}/setup)

## Docs

- [Simba](https://villavu.github.io/Simba/): Simba documentation
- [SRL-T](https://Torwent.github.io/SRL-T/): SRL-T documentation
- [WaspLib](https://Torwent.github.io/WaspLib/): SRL-T documentation
- [SRL-T](https://api.waspscripts.com/docs): Stats API documentation
- [Map](https://map.waspscripts.com/): Interactive OSRS map

## Scripts

- [Scripts](${website}/scripts): All available scripts on the website
${scripts}

## Stats

WaspScripts Stats can be found on the following [page](${website}/stats).

## Subscriptions

Subscriptions for WaspScripts can be managed on the [subscriptions page](${website}/subscriptions).

## FAQ

Find the solution to your problem in our [FAQ](${website}/faq).

## Tutorials

Learn programming and how you can make your own runescape colour bots.

- [Tutorials](${website}/tutorials): All tutorials
${tutorials}

## Scripters

People behind this project.

- [Scripters](${website}/scripters)
${scripters}

## Legal

### Terms and Conditions

Learn about the [terms and conditions](${website}/legal/scripter_terms_of_service) of WaspScripts.

### Privacy Policy

Learn about the [privacy policy](${website}/legal/privacy_policy) of WaspScripts.
`,
		{ headers: headers }
	)
}
