<script lang="ts">
	import { browser } from "$app/environment"
	import { page } from "$app/stores"

	export let type: string = "website"
	export let title: string
	export let description: string
	export let img: string =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/logo.png"
	export let keywords = "OldSchool, RuneScape, OSRS, 2007, Color, Bot, Wasp, Scripts"
	export let author = "Torwent"
	export let robots = "all"
</script>

<!-- SEO tags -->
<title>
	{#if browser}
		{"WaspScripts" + (title != "" ? " - " + title : "")}
	{:else}
		{title === ""
			? "WaspScripts - 2007 OSRS Colour Bot"
			: title + " - 2007 OSRS Colour Bot | WaspScripts"}
	{/if}
</title>

<meta name="description" content={description} />
<meta name="keywords" content={keywords} />
<meta name="author" content={author} />

<!-- OpenGraph tags -->
<meta property="og:type" content={type} />
{#if title === ""}
	<meta property="og:title" content="WaspScripts" />
{:else}
	<meta property="og:title" content={title} />
{/if}
<meta property="og:url" content={"https://waspscripts.com" + $page.url.pathname} />
<meta property="og:image" content={img} />
<meta property="og:description" content={description} />

<!-- Twitter tags -->
<meta name="twitter:card" content="summary" />
{#if title === ""}
	<meta name="twitter:title" content="WaspScripts" />
{:else}
	<meta name="twitter:title" content="{title} - WaspScripts" />
{/if}
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={img} />
<meta name="robots" content={robots} />
