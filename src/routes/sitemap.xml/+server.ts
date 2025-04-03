import type { SupabaseClient } from "@supabase/supabase-js"
import { encodeSEO } from "$lib/utils"
import type { ScripterProfile } from "$lib/types/collection"
import { tutorialsPromise } from "$lib/server/tutorials.server"
import { getPublishedScripts } from "$lib/server/scripts.server"
import type { Database } from "$lib/types/supabase"

const website = "https://waspscripts.com"

const getScripts = async () => {
	const scripts = await getPublishedScripts()

	const result: string[] = []
	scripts.forEach((script) => {
		result.push(script.url ?? "")
	})

	return result
}

const getTutorials = async () => {
	const tutorials = await tutorialsPromise

	const result: string[] = []
	tutorials.forEach((tutorial) => {
		result.push(encodeSEO(tutorial.title + " by " + tutorial.username))
	})

	return result
}

const getScripters = async (supabase: SupabaseClient<Database>) => {
	const { data, error } = await supabase
		.schema("profiles")
		.from("scripters")
		.select("profiles (username)")
		.overrideTypes<ScripterProfile[]>()

	if (error) return console.error("developers SELECT failed: " + error.message)

	const result: string[] = []
	data.forEach((developer) => {
		result.push(encodeSEO(developer.profiles.username))
	})

	return result
}

const buildLoc = async (supabase: SupabaseClient<Database>, loc: string) => {
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
		result += `
      <url>
        <loc>${website}/${loc}/${el}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
`
	})

	return result
}

export const GET = async ({ locals: { supabaseServer } }) => {
	const promises = await Promise.all([
		buildLoc(supabaseServer, "scripts"),
		buildLoc(supabaseServer, "tutorials"),
		buildLoc(supabaseServer, "developers")
	])
	const scripts = promises[0]
	const tutorials = promises[1]
	const scripters = promises[2]

	const headers = {
		"Cache-Control": "max-age=0, s-maxage=3600",
		"Content-Type": "application/xml"
	}
	return new Response(
		`<?xml version="1.0" encoding="UTF-8" ?>
    <urlset
      xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="https://www.w3.org/1999/xhtml"
      xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
    >
      <url>
        <loc>${website}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      <url>
        <loc>${website}/setup</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      <url>
        <loc>${website}/scripts</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      ${scripts}
      <url>
        <loc>${website}/stats</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      <url>
        <loc>${website}/subscriptions</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      <url>
        <loc>${website}/faq</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      <url>
        <loc>${website}/tutorials</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      ${tutorials}
      <url>
        <loc>${website}/scripters</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      ${scripters}
	  <url>
        <loc>${website}/legal/user_terms_of_service</loc>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
      </url>
	  <url>
        <loc>${website}/legal/scripter_terms_of_service</loc>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
      </url>
	  <url>
        <loc>${website}/legal/privacy_policy</loc>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
      </url>
    </urlset>`,
		{ headers: headers }
	)
}
