import type { SupabaseClient } from "@supabase/supabase-js"
import { encodeSEO } from "$lib/utils"
import type { IScriptCard } from "$lib/backend/types"

const website = "https://waspscripts.com"

const loadScripts = async (supabase: SupabaseClient) => {
	const { data, error } = await supabase
		.from("scripts_public")
		.select(`title,	scripts_protected (author)`)
		.order("title", { ascending: true })

	if (error) return console.error("scripts_public SELECT failed:" + error.message)

	const scriptData = data as unknown as IScriptCard[]

	let result: string[] = []
	scriptData.forEach((script) => {
		result.push(encodeSEO(script.title + " by " + script.scripts_protected.author))
	})

	return result
}

const loadTutorials = async (supabase: SupabaseClient) => {
	const { data, error } = await supabase.from("tutorials").select("title, author")

	if (error) return console.error("tutorials SELECT failed: " + error.message)

	let result: string[] = []
	data.forEach((post) => {
		result.push(encodeSEO(post.title + " by " + post.author))
	})

	return result
}

const buildLoc = async (supabase: SupabaseClient, loc: string) => {
	let data: string[] = []
	if (loc === "scripts") {
		data = (await loadScripts(supabase)) as string[]
	} else {
		data = (await loadTutorials(supabase)) as string[]
	}

	let result: string = ""

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

export const GET = async ({ locals: { supabase } }) => {
	const scripts = await buildLoc(supabase, "scripts")
	const tutorials = await buildLoc(supabase, "tutorials")

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
        <loc>${website}/premium</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>      
      <url>
        <loc>${website}/faq</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>     
      <url>
        <loc>${website}/blog</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      ${tutorials}
      <url>
        <loc>${website}/devs</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
    </urlset>`,
		{ headers: headers }
	)
}
