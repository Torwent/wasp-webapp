<script lang="ts">
	import { page } from "$app/stores"
	import { CodeBlock } from "@skeletonlabs/skeleton"
	export let data

	const { message } = data

	const headTitle = "Changing Email - WaspScripts"
	const headDescription = "Changing email for waspscripts.com"
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, "
	const headAuthor = "Torwent"
	const headImage = "/multi-color-logo.png"
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<meta name="author" content={headAuthor} />
	<meta name="robots" content="noindex" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={headTitle} />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={headImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<main class="container mx-auto my-44 max-w-2xl flex-grow">
	<h3 class="my-4 flex font-bold">Email update message:</h3>
	<p class="my-16">{message}</p>
	<p class="my-16">Make sure you click the confirmation link on both emails 😁</p>
</main>
