import { supabase } from "$lib/database/supabase"

const website = "https://waspscripts.com"

const loadScripts = async () => {
	const { data, error } = await supabase.from("scripts_public").select("title, id")

	if (error) return console.error(error)

	let result: string[] = []
	data.forEach((entry) => {
		result.push(encodeURI(entry.title) + "&amp;" + entry.id)
	})

	return result
}

const loadBlog = async () => {
	const { data, error } = await supabase.from("tutorials").select("title")

	if (error) return console.error(error)

	let result: string[] = []
	data.forEach((entry) => {
		result.push(encodeURI(entry.title))
	})

	return result
}

const buildLoc = async (loc: string) => {
	let data: string[] = []
	if (loc === "scripts") {
		data = (await loadScripts()) as string[]
	} else {
		data = (await loadBlog()) as string[]
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

export const GET = async () => {
	const scripts = await buildLoc("scripts")
	const blog = await buildLoc("blog")

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
      ${blog}
      <url>
        <loc>${website}/devs</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
    </urlset>`,
		{ headers: headers }
	)
}
