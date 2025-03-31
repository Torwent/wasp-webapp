<script lang="ts">
	import { page } from "$app/state"

	let {
		title,
		description,
		keywords = undefined,
		author = "Torwent",
		img = "/multi-color-logo.png"
	} = $props()

	const basekeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour, Bot, Botting, Wasp, Scripts, WaspScripts, Simba, Open, Source, OpenSource"
</script>

<svelte:head>
	<title>{title} - WaspScripts</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords ? basekeywords + ", " + keywords : basekeywords} />
	<meta name="author" content={author} />
	<meta name="robots" content="all" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content={img} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={description} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={img} />
</svelte:head>
